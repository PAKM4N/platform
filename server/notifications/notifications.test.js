import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadLeadNotificationSettings } from "./config.js";
import { createNotificationDispatcher } from "./dispatcher.js";
import { createSmtpNotifier } from "./smtp-notifier.js";
import { MemoryStore } from "../storage/memory-store.js";

function payload() {
  return {
    reference: "MM-1234ABCD",
    submittedAt: "2026-08-28T10:00:00.000Z",
    contact: {
      name: "Ana <script>alert(1)</script>",
      company: "Ejemplo & Hijos",
      email: "ana@example.com",
      phone: "+34 600 000 000",
      observations: "Primera línea\nSegunda línea",
    },
    answers: {
      interaction: "ai",
      hosting: "managed",
      websiteScope: "existing",
    },
    selectedServices: [{ id: "quotes", label: "Preparar presupuestos" }],
    selectedChannels: [{ id: "web", label: "Web" }],
    selectedExtras: [{ id: "documents", label: "Generación de PDF" }],
    quote: {
      package: { name: "Asistente IA", variant: "Web" },
      implementation: { total: 1_580, from: false },
      monthly: { total: 69, from: false },
      quoteOnlyItems: [],
      externalConsumptions: ["OpenAI"],
    },
  };
}

test("el adaptador SMTP escapa HTML y bloquea accesos a ficheros y URL", async () => {
  const messages = [];
  const notifier = createSmtpNotifier(
    {
      from: "Mercamicro <presupuestos@mercamicro.es>",
      recipients: { sales: "ventas@mercamicro.es" },
    },
    {
      transporter: {
        sendMail: async (message) => {
          messages.push(message);
          return { messageId: "smtp-123" };
        },
      },
    },
  );

  const result = await notifier.send({ id: "job-1", targetKey: "sales", payload: payload() });

  assert.equal(result.messageId, "smtp-123");
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, "ventas@mercamicro.es");
  assert.equal(messages[0].disableFileAccess, true);
  assert.equal(messages[0].disableUrlAccess, true);
  assert.equal(messages[0].messageId, "<job-1@notifications.mercamicro.es>");
  assert.match(messages[0].html, /Ana &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(messages[0].html, /Ana <script>/);
  assert.match(messages[0].text, /Implantación SIN IVA: 1\.580\s?€/);
});

test("el dispatcher acepta target_key de Postgres y marca el trabajo como enviado", async () => {
  const calls = [];
  const marked = [];
  const store = {
    claimNotificationJobs: async () => [
      {
        id: "job-2",
        channel: "email",
        target_key: "sales",
        payload: payload(),
        attempts: 1,
      },
    ],
    markNotificationSent: async (value) => marked.push(value),
    markNotificationFailed: async () => assert.fail("no debe marcar fallo"),
  };
  const dispatcher = createNotificationDispatcher({
    store,
    notifiers: {
      email: {
        send: async (value) => {
          calls.push(value);
          return { messageId: "provider-2" };
        },
      },
    },
    logger: false,
  });

  await dispatcher.dispatchPending();

  assert.equal(calls[0].targetKey, "sales");
  assert.deepEqual(marked, [{ id: "job-2", providerMessageId: "provider-2" }]);
});

test("el dispatcher reintenta sin persistir mensajes de error potencialmente sensibles", async () => {
  const failures = [];
  const store = {
    claimNotificationJobs: async () => [
      { id: "job-3", channel: "email", target_key: "sales", payload: payload(), attempts: 2 },
    ],
    markNotificationSent: async () => assert.fail("no debe marcar envío"),
    markNotificationFailed: async (value) => failures.push(value),
  };
  const dispatcher = createNotificationDispatcher({
    store,
    notifiers: {
      email: {
        send: async () => {
          const error = new Error("falló para ana@example.com con una credencial");
          error.code = "ESMTP";
          throw error;
        },
      },
    },
    logger: false,
    now: () => 1_000,
    baseDelayMs: 100,
  });

  await dispatcher.dispatchPending();

  assert.equal(failures.length, 1);
  assert.equal(failures[0].dead, false);
  assert.equal(failures[0].error, "Error:ESMTP");
  assert.equal(failures[0].nextAttemptAt.getTime(), 1_200);
  assert.doesNotMatch(failures[0].error, /ana|credencial/i);
});

test("MemoryStore recupera trabajos cuyo lock quedó abandonado", async () => {
  const store = new MemoryStore();
  const lead = {
    id: "97a05f56-cf56-4cbd-b686-604381ecb40a",
    tenantSlug: "tenant",
    submissionId: "e6b47e15-3a3b-446f-a474-144077b66a5c",
    quote: {},
  };
  await store.saveCompletedLead({
    lead,
    notificationJobs: [{ channel: "email", targetKey: "sales", payload: {} }],
  });
  const [first] = await store.claimNotificationJobs({ limit: 1 });
  const job = store.notificationJobs.get(first.id);
  job.lockedAt = Date.now() - 11 * 60 * 1_000;

  const [recovered] = await store.claimNotificationJobs({ limit: 1 });

  assert.equal(recovered.id, first.id);
  assert.equal(recovered.attempts, 2);
});

test("la configuración SMTP obtiene credenciales solo desde ficheros", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "mercamicro-smtp-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const usernameFile = path.join(directory, "username");
  const passwordFile = path.join(directory, "password");
  await writeFile(usernameFile, "smtp-user\n", { mode: 0o600 });
  await writeFile(passwordFile, "smtp-password\n", { mode: 0o600 });

  const settings = await loadLeadNotificationSettings({
    LEAD_NOTIFICATIONS_ENABLED: "true",
    LEAD_SMTP_HOST: "smtp.example.com",
    LEAD_EMAIL_FROM: "presupuestos@example.com",
    LEAD_EMAIL_TO: "ventas@example.com",
    LEAD_SMTP_USERNAME_FILE: usernameFile,
    LEAD_SMTP_PASSWORD_FILE: passwordFile,
  });

  assert.equal(settings.enabled, true);
  assert.equal(settings.smtp.username, "smtp-user");
  assert.equal(settings.smtp.password, "smtp-password");
  assert.equal(settings.smtp.requireTLS, true);
  assert.equal(settings.smtp.secure, false);
});

test("la configuración activada falla cerrada si SMTP está incompleto", async () => {
  await assert.rejects(
    loadLeadNotificationSettings({ LEAD_NOTIFICATIONS_ENABLED: "true" }),
    /falta LEAD_SMTP_HOST/i,
  );
});
