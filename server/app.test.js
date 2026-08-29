import assert from "node:assert/strict";
import test from "node:test";
import { buildServer } from "./app.js";
import { MemoryStore } from "./storage/memory-store.js";

const validProjectLead = {
  submissionId: "7fd467a2-3312-4f8a-9cc8-8f68fc9cae30",
  answers: {
    needs: ["quotes"],
    channel: "whatsapp",
    interaction: "ai",
    extras: ["documents"],
    hosting: "managed",
    websiteScope: "existing",
  },
  contact: {
    name: "Ana García",
    company: "Ejemplo SL",
    email: "ANA@EXAMPLE.COM",
    phone: "+34 600 000 000",
    observations: "Necesitamos lanzarlo este trimestre.",
    website: "",
  },
  pagePath: "/",
  locale: "es-ES",
};

async function testServer() {
  const store = new MemoryStore();
  await store.initialize();
  return buildServer({ store, logger: false });
}

test("atiende mensajes web y conserva la conversación", async (t) => {
  const app = await testServer();
  t.after(() => app.close());

  const first = await app.inject({
    method: "POST",
    url: "/api/chat/messages",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: { message: "limpieza", pagePath: "/" },
  });
  assert.equal(first.statusCode, 200);
  const firstBody = first.json();
  assert.match(firstBody.message, /cinco datos clave/i);
  assert.ok(firstBody.conversationId);

  const second = await app.inject({
    method: "POST",
    url: "/api/chat/messages",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: {
      conversationId: firstBody.conversationId,
      message: "Oficina",
      pagePath: "/",
    },
  });
  assert.equal(second.statusCode, 200);
  assert.match(second.json().message, /Superficie/i);
});

test("rechaza hosts que no pertenecen al tenant", async (t) => {
  const app = await testServer();
  t.after(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/api/chat/messages",
    headers: { host: "otro-cliente.example" },
    payload: { message: "hola" },
  });

  assert.equal(response.statusCode, 421);
});

test("Telegram exige el secreto y no duplica updates", async (t) => {
  const sent = [];
  const store = new MemoryStore();
  await store.initialize();
  const app = await buildServer({
    store,
    logger: false,
    telegram: {
      enabled: true,
      token: "token-de-prueba",
      secret: "secreto-de-prueba",
      sendMessage: async (message) => sent.push(message),
    },
  });
  t.after(() => app.close());

  const payload = {
    update_id: 1001,
    message: {
      message_id: 10,
      text: "/start",
      chat: { id: 99, type: "private" },
      from: { id: 99, language_code: "es" },
    },
  };
  const url =
    "/api/telegram/mercamicro-presupuestos/asistente-presupuestos/webhook";

  const unauthorized = await app.inject({ method: "POST", url, payload });
  assert.equal(unauthorized.statusCode, 401);

  const headers = { "x-telegram-bot-api-secret-token": "secreto-de-prueba" };
  const accepted = await app.inject({ method: "POST", url, headers, payload });
  assert.equal(accepted.statusCode, 200);
  assert.equal(sent.length, 1);

  const duplicate = await app.inject({ method: "POST", url, headers, payload });
  assert.equal(duplicate.statusCode, 200);
  assert.equal(duplicate.json().duplicate, true);
  assert.equal(sent.length, 1);
});

test("guarda un lead completado y recalcula el presupuesto en el servidor", async (t) => {
  const store = new MemoryStore();
  await store.initialize();
  const app = await buildServer({
    store,
    logger: false,
    projectLeads: { notificationChannels: ["email"] },
  });
  t.after(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: validProjectLead,
  });

  assert.equal(response.statusCode, 202);
  const body = response.json();
  assert.equal(body.accepted, true);
  assert.match(body.reference, /^MM-[A-F0-9]{8}$/);
  assert.equal(body.quote.package.id, "ai-whatsapp");
  assert.equal(body.quote.implementation.total, 2_370);
  assert.equal(body.quote.monthly.total, 69);
  assert.equal(body.quote.taxIncluded, false);

  assert.equal(store.leads.size, 1);
  assert.equal(store.notificationJobs.size, 1);
  const [lead] = store.leads.values();
  assert.equal(lead.contact.name, "Ana García");
  assert.equal(lead.contact.email, "ana@example.com");
  assert.equal(lead.contact.phone, "+34 600 000 000");
  assert.equal(lead.contact.observations, "Necesitamos lanzarlo este trimestre.");
  assert.equal(lead.implementationCents, 237_000);
  assert.equal(lead.monthlyCents, 6_900);
  assert.equal(lead.totalExVatCents, 237_000);
});

test("un reintento con el mismo submissionId no duplica lead ni notificación", async (t) => {
  const store = new MemoryStore();
  await store.initialize();
  const app = await buildServer({
    store,
    logger: false,
    projectLeads: { notificationChannels: ["email"] },
  });
  t.after(() => app.close());
  const request = {
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: validProjectLead,
  };

  const first = await app.inject(request);
  const duplicate = await app.inject(request);

  assert.equal(first.statusCode, 202);
  assert.equal(duplicate.statusCode, 202);
  assert.equal(duplicate.json().reference, first.json().reference);
  assert.equal(store.leads.size, 1);
  assert.equal(store.notificationJobs.size, 1);
});

test("rechaza propiedades y valores manipulados sin persistir datos", async (t) => {
  const store = new MemoryStore();
  await store.initialize();
  const app = await buildServer({ store, logger: false });
  t.after(() => app.close());

  const topLevelPrice = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: { ...validProjectLead, implementationTotal: 1 },
  });
  const answerPrice = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: {
      ...validProjectLead,
      submissionId: "4c0b0ab1-0bc6-4839-a5de-45aee78cf51d",
      answers: { ...validProjectLead.answers, package: "custom" },
    },
  });
  const invalidEnum = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: {
      ...validProjectLead,
      submissionId: "80859de4-3791-48b4-ada1-978402828b52",
      answers: { ...validProjectLead.answers, channel: "gratis" },
    },
  });

  assert.equal(topLevelPrice.statusCode, 400);
  assert.equal(answerPrice.statusCode, 400);
  assert.equal(invalidEnum.statusCode, 400);
  assert.equal(store.leads.size, 0);
  assert.equal(store.notificationJobs.size, 0);
});

test("el endpoint comercial limita host y bloquea el honeypot", async (t) => {
  const store = new MemoryStore();
  await store.initialize();
  const app = await buildServer({ store, logger: false });
  t.after(() => app.close());

  const wrongHost = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "demos.mercamicro.es" },
    payload: validProjectLead,
  });
  const honeypot = await app.inject({
    method: "POST",
    url: "/api/project-leads",
    headers: { host: "presupuestos.mercamicro.es" },
    payload: {
      ...validProjectLead,
      submissionId: "193491a1-2116-426b-b1fb-5f5052818872",
      contact: { ...validProjectLead.contact, website: "https://spam.example" },
    },
  });

  assert.equal(wrongHost.statusCode, 421);
  assert.equal(honeypot.statusCode, 400);
  assert.equal(store.leads.size, 0);
});

test("detiene trabajos antes de cerrar la persistencia", async () => {
  const order = [];
  const store = new MemoryStore();
  store.close = async () => order.push("store");
  const app = await buildServer({
    store,
    logger: false,
    beforeStoreClose: async () => order.push("dispatcher"),
  });

  await app.close();
  assert.deepEqual(order, ["dispatcher", "store"]);
});
