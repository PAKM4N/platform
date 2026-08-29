import { buildServer } from "./app.js";
import { loadLeadNotificationSettings } from "./notifications/config.js";
import { createNotificationDispatcher } from "./notifications/dispatcher.js";
import { createSmtpNotifier } from "./notifications/smtp-notifier.js";
import { MemoryStore } from "./storage/memory-store.js";
import { PostgresStore } from "./storage/postgres-store.js";

const notificationSettings = await loadLeadNotificationSettings();
const storageMode = process.env.STORAGE_MODE || "memory";
const store = storageMode === "postgres" ? new PostgresStore() : new MemoryStore();

await store.initialize();
let notificationDispatcher;
const app = await buildServer({
  store,
  projectLeads: {
    notificationChannels: notificationSettings.enabled ? notificationSettings.channels : [],
    notificationTargetKey: notificationSettings.targetKey,
  },
  beforeStoreClose: async () => notificationDispatcher?.stop(),
});

if (notificationSettings.enabled) {
  notificationDispatcher = createNotificationDispatcher({
    store,
    notifiers: {
      email: createSmtpNotifier(notificationSettings.smtp),
    },
    logger: app.log,
    ...notificationSettings.dispatcher,
  });
}

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  notificationDispatcher?.start();

  let closing = false;
  const close = async (signal) => {
    if (closing) return;
    closing = true;
    app.log.info({ signal }, "Cerrando el servicio de forma ordenada.");
    try {
      await app.close();
    } catch (error) {
      app.log.error(error);
      process.exitCode = 1;
    }
  };
  process.once("SIGTERM", () => void close("SIGTERM"));
  process.once("SIGINT", () => void close("SIGINT"));
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}
