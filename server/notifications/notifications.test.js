import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadLeadNotificationSettings } from "./config.js";
import { createNotificationDispatcher } from "./dispatcher.js";
import { createSmtpNotifier, smtpNotifierInternals } from "./smtp-notifier.js";
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

test("la copia del cliente usa su email y responde al buzón comercial", async () => {
  const messages = [];
  const notifier = createSmtpNotifier(
    {
      from: "Mercamicro Presupuestos <monitorizacion@mercamicro.es>",
      recipients: { sales: "presupuestos@mercamicro.es" },
      customerReplyTo: "presupuestos@mercamicro.es",
    },
    {
      transporter: {
        sendMail: async (message) => {
          messages.push(message);
          return { messageId: "smtp-customer-123" };
        },
      },
    },
  );

  await notifier.send({ id: "job-customer-1", targetKey: "customer", payload: payload() });

  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0].to, { address: "ana@example.com" });
  assert.equal(messages[0].replyTo, "presupuestos@mercamicro.es");
  assert.match(messages[0].subject, /Hemos recibido tu solicitud MM-1234ABCD/);
  assert.match(messages[0].text, /estimación es orientativa/i);
  assert.match(messages[0].text, /no constituye una oferta vinculante/i);
  assert.match(messages[0].html, /Ana &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(messages[0].html, /Ana <script>/);
  assert.match(messages[0].text, /Tus comentarios: Primera línea\nSegunda línea/);
  assert.equal(messages[0].headers["Auto-Submitted"], "auto-generated");
});

test("los correos muestran etiquetas legibles y no presentan hosting propio como gratuito", () => {
  const lead = payload();
  lead.answers.hosting = "own";
  lead.quote.monthly.total = 0;
  for (const render of [smtpNotifierInternals.renderMessage, smtpNotifierInternals.renderCustomerMessage]) {
    const message = render(lead);
    assert.match(message.text, /Interacción: Entender preguntas escritas con lenguaje natural/);
    assert.match(message.text, /Alcance web: Ya tengo una web donde integrarlo/);
    assert.match(message.text, /Coste mensual SIN IVA: Alojamiento propio · no incluido/);
    assert.doesNotMatch(message.text, /Coste mensual SIN IVA: 0/);
  }
});

test("un precio no disponible se muestra pendiente de valoración en ambas copias", () => {
  const lead = payload();
  lead.quote.implementation.total = null;
  delete lead.quote.monthly.total;
  for (const render of [smtpNotifierInternals.renderMessage, smtpNotifierInternals.renderCustomerMessage]) {
    const message = render(lead);
    assert.match(message.text, /Implantación SIN IVA: Pendiente de valoración/);
    assert.match(message.text, /Coste mensual SIN IVA: Pendiente de valoración/);
    assert.doesNotMatch(message.text, /SIN IVA: 0/);
  }
});

test("la copia del cliente rechaza listas de destinatarios antes de usar SMTP", async () => {
  const notifier = createSmtpNotifier(
    { from: "presupuestos@example.com", recipients: { sales: "ventas@example.com" } },
    { transporter: { sendMail: async () => assert.fail("no debe enviar") } },
  );
  for (const email of ["ana@example.com,bob@example.com", "ana@example.com\r\nBcc: bob@example.com"]) {
    const lead = payload();
    lead.contact.email = email;
    await assert.rejects(
      notifier.send({ id: "bad-recipient", targetKey: "customer", payload: lead }),
      /notification_customer_email_invalid/,
    );
  }
});

test("el fallo de una copia no impide entregar la otra ni duplica el envío correcto", async () => {
  const store = new MemoryStore();
  await store.saveCompletedLead({
    lead: { id: "lead-id", tenantSlug: "tenant", submissionId: "submission-id", quote: {} },
    notificationJobs: ["customer", "sales"].map((targetKey) => ({ channel: "email", targetKey, payload: payload() })),
  });
  const sent = [];
  const dispatcher = createNotificationDispatcher({
    store, logger: false,
    notifiers: { email: { send: async (job) => {
      if (job.targetKey === "customer") throw new Error("customer_unavailable");
      sent.push(job.id);
      return { messageId: "internal-ok" };
    } } },
  });
  await dispatcher.dispatchPending();
  await dispatcher.dispatchPending();
  assert.equal(sent.length, 1);
  const jobs = [...store.notificationJobs.values()];
  assert.equal(jobs.find((job) => job.targetKey === "sales").status, "sent");
  assert.equal(jobs.find((job) => job.targetKey === "customer").status, "retry");
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
    LEAD_CUSTOMER_COPY_ENABLED: "true",
    LEAD_SMTP_USERNAME_FILE: usernameFile,
    LEAD_SMTP_PASSWORD_FILE: passwordFile,
  });

  assert.equal(settings.enabled, true);
  assert.equal(settings.smtp.username, "smtp-user");
  assert.equal(settings.smtp.password, "smtp-password");
  assert.equal(settings.smtp.requireTLS, true);
  assert.equal(settings.smtp.secure, false);
  assert.equal(settings.smtp.customerReplyTo, "ventas@example.com");
  assert.equal(settings.customerCopyEnabled, true);
});

test("la configuración activada falla cerrada si SMTP está incompleto", async () => {
  await assert.rejects(
    loadLeadNotificationSettings({ LEAD_NOTIFICATIONS_ENABLED: "true" }),
    /falta LEAD_SMTP_HOST/i,
  );
});

test("SMTP rechaza TLS opcional y el destino reservado de copia del cliente", async () => {
  const valid = {
    LEAD_NOTIFICATIONS_ENABLED: "true",
    LEAD_SMTP_HOST: "smtp.example.com",
    LEAD_EMAIL_FROM: "presupuestos@example.com",
    LEAD_EMAIL_TO: "ventas@example.com",
  };
  await assert.rejects(
    loadLeadNotificationSettings({ ...valid, LEAD_NOTIFICATION_TARGET_KEY: "customer" }),
    /customer está reservado/,
  );
  await assert.rejects(
    loadLeadNotificationSettings({ ...valid, LEAD_SMTP_SECURE: "false", LEAD_SMTP_REQUIRE_TLS: "false" }),
    /SMTP requiere TLS/,
  );
});
