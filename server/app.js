import { readFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { initialBotState, replyToMessage } from "./engine.js";
import { registerProjectLeadRoutes } from "./project-leads.js";
import { TENANT, hostWithoutPort, isAllowedHost } from "./tenant-config.js";

function constantTimeEqual(left = "", right = "") {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

async function readOptionalSecret(filePath, fallback = "") {
  if (!filePath) return fallback;
  return (await readFile(filePath, "utf8")).trim();
}

function requestHost(request) {
  return hostWithoutPort(request.headers["x-forwarded-host"] || request.headers.host);
}

function conversationMetadata(body) {
  return {
    pagePath: String(body.pagePath || "/").slice(0, 500),
    locale: String(body.locale || "es").slice(0, 20),
  };
}

function keyboardFor(quickReplies = []) {
  if (!quickReplies.length) return undefined;
  const rows = [];
  for (let index = 0; index < quickReplies.length; index += 2) {
    rows.push(quickReplies.slice(index, index + 2).map((text) => ({ text })));
  }
  return { keyboard: rows, resize_keyboard: true, one_time_keyboard: true };
}

async function telegramSendMessage({ token, chatId, text, quickReplies }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: keyboardFor(quickReplies),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`Telegram rechazó la respuesta con estado ${response.status}`);
  }
}

export async function buildServer({
  store,
  logger = true,
  telegram = {},
  projectLeads = {},
  beforeStoreClose = async () => {},
}) {
  const app = Fastify({
    logger:
      logger === false
        ? false
        : {
            level: process.env.LOG_LEVEL || "info",
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.x-telegram-bot-api-secret-token",
                "telegram.token",
              ],
              censor: "[redacted]",
            },
          },
    trustProxy: true,
    bodyLimit: 32 * 1024,
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  });
  await app.register(cors, {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      try {
        callback(null, isAllowedHost(new URL(origin).hostname));
      } catch {
        callback(null, false);
      }
    },
    methods: ["POST", "OPTIONS"],
  });
  await app.register(rateLimit, {
    global: false,
    hook: "onRequest",
  });

  app.addHook("onClose", async () => {
    await beforeStoreClose();
    await store.close();
  });

  app.get("/health", async (_request, reply) => {
    const storage = await store.health();
    return reply.send({ ok: storage.ok, storage: storage.mode });
  });

  await registerProjectLeadRoutes(app, { store, ...projectLeads });

  app.post(
    "/api/chat/messages",
    {
      config: { rateLimit: { max: 24, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["message"],
          properties: {
            conversationId: { type: "string", format: "uuid" },
            message: { type: "string", minLength: 1, maxLength: 2000 },
            pagePath: { type: "string", maxLength: 500 },
            locale: { type: "string", maxLength: 20 },
            website: { type: "string", maxLength: 200 },
          },
        },
      },
    },
    async (request, reply) => {
      if (!isAllowedHost(requestHost(request))) {
        return reply.code(421).send({ error: "host_not_allowed" });
      }
      if (request.body.website) {
        return reply.code(400).send({ error: "invalid_request" });
      }

      const pagePath = request.body.pagePath || "/";
      const conversation = await store.getOrCreateConversation({
        id: request.body.conversationId,
        tenantSlug: TENANT.slug,
        botSlug: TENANT.botSlug,
        channel: "web",
        initialState: initialBotState(pagePath),
        metadata: conversationMetadata(request.body),
      });

      await store.addMessage({
        conversationId: conversation.id,
        role: "user",
        content: request.body.message,
        metadata: conversationMetadata(request.body),
      });

      const response = replyToMessage({
        state: conversation.state,
        message: request.body.message,
        pagePath,
      });

      await store.addMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: response.message,
        metadata: { engine: "guided-rules-v1" },
      });
      await store.saveState(conversation.id, response.state);

      if (response.completed) {
        await store.saveEstimate({
          conversationId: conversation.id,
          tenantSlug: TENANT.slug,
          serviceId: response.state.serviceId,
          values: response.state.values,
          estimate: response.estimate,
        });
      }

      return reply.send({
        conversationId: conversation.id,
        message: response.message,
        quickReplies: response.quickReplies || [],
        estimate: response.estimate || null,
        completed: Boolean(response.completed),
      });
    },
  );

  const telegramEnabled = telegram.enabled ?? TENANT.telegram.enabled;
  const telegramToken = telegram.token ?? (await readOptionalSecret(
    process.env.TELEGRAM_BOT_TOKEN_FILE,
    process.env.TELEGRAM_BOT_TOKEN || "",
  ));
  const telegramSecret = telegram.secret ?? (await readOptionalSecret(
    process.env.TELEGRAM_WEBHOOK_SECRET_FILE,
    process.env.TELEGRAM_WEBHOOK_SECRET || "",
  ));
  const sendTelegram = telegram.sendMessage || telegramSendMessage;

  app.post(
    "/api/telegram/:tenantSlug/:botSlug/webhook",
    { config: { rateLimit: false } },
    async (request, reply) => {
      if (
        !telegramEnabled ||
        request.params.tenantSlug !== TENANT.slug ||
        request.params.botSlug !== TENANT.botSlug ||
        !telegramToken ||
        !telegramSecret
      ) {
        return reply.code(404).send({ ok: false });
      }

      const suppliedSecret = request.headers["x-telegram-bot-api-secret-token"];
      if (!constantTimeEqual(suppliedSecret, telegramSecret)) {
        return reply.code(401).send({ ok: false });
      }

      const update = request.body || {};
      const telegramMessage = update.message;
      if (!Number.isSafeInteger(update.update_id)) {
        return reply.code(400).send({ ok: false });
      }

      const claimed = await store.claimUpdate({
        tenantSlug: TENANT.slug,
        botSlug: TENANT.botSlug,
        updateId: update.update_id,
      });
      if (!claimed) return reply.send({ ok: true, duplicate: true });

      if (
        !telegramMessage?.text ||
        telegramMessage.chat?.type !== "private" ||
        !telegramMessage.chat?.id
      ) {
        return reply.send({ ok: true, ignored: true });
      }

      const externalId = String(telegramMessage.chat.id);
      const conversation = await store.getOrCreateConversation({
        tenantSlug: TENANT.slug,
        botSlug: TENANT.botSlug,
        channel: "telegram",
        externalId,
        initialState: initialBotState("/"),
        metadata: {
          telegramUserId: String(telegramMessage.from?.id || ""),
          languageCode: String(telegramMessage.from?.language_code || "").slice(0, 20),
        },
      });

      await store.addMessage({
        conversationId: conversation.id,
        role: "user",
        content: telegramMessage.text,
        metadata: { telegramMessageId: telegramMessage.message_id },
      });

      const response = replyToMessage({
        state: conversation.state,
        message: telegramMessage.text,
        pagePath: "/",
      });

      await store.addMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: response.message,
        metadata: { engine: "guided-rules-v1" },
      });
      await store.saveState(conversation.id, response.state);

      if (response.completed) {
        await store.saveEstimate({
          conversationId: conversation.id,
          tenantSlug: TENANT.slug,
          serviceId: response.state.serviceId,
          values: response.state.values,
          estimate: response.estimate,
        });
      }

      await sendTelegram({
        token: telegramToken,
        chatId: telegramMessage.chat.id,
        text: response.message,
        quickReplies: response.quickReplies || [],
      });

      return reply.send({ ok: true });
    },
  );

  return app;
}
