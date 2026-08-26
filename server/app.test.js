import assert from "node:assert/strict";
import test from "node:test";
import { buildServer } from "./app.js";
import { MemoryStore } from "./storage/memory-store.js";

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
