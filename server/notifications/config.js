import { readFile } from "node:fs/promises";

const SUPPORTED_CHANNELS = new Set(["email"]);

async function readSecret(filePath) {
  if (!filePath) return "";
  return (await readFile(filePath, "utf8")).trim();
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Valor booleano no válido: ${value}`);
}

function notificationChannels(value = "email") {
  const channels = [...new Set(String(value).split(",").map((item) => item.trim()).filter(Boolean))];
  if (!channels.length || channels.some((channel) => !SUPPORTED_CHANNELS.has(channel))) {
    throw new Error("LEAD_NOTIFICATION_CHANNELS contiene un canal no configurado.");
  }
  return channels;
}

function portValue(value, fallback) {
  const port = Number(value || fallback);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error("LEAD_SMTP_PORT no es válido.");
  }
  return port;
}

function integerValue(name, value, fallback, minimum, maximum) {
  const number = Number(value || fallback);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${name} no es válido.`);
  }
  return number;
}

export async function loadLeadNotificationSettings(env = process.env) {
  const enabled = booleanValue(env.LEAD_NOTIFICATIONS_ENABLED, false);
  const channels = notificationChannels(env.LEAD_NOTIFICATION_CHANNELS);
  const targetKey = String(env.LEAD_NOTIFICATION_TARGET_KEY || "sales").trim();

  const dispatcher = {
    pollIntervalMs: integerValue(
      "LEAD_NOTIFICATION_POLL_INTERVAL_MS",
      env.LEAD_NOTIFICATION_POLL_INTERVAL_MS,
      5_000,
      250,
      60_000,
    ),
    batchSize: integerValue(
      "LEAD_NOTIFICATION_BATCH_SIZE",
      env.LEAD_NOTIFICATION_BATCH_SIZE,
      10,
      1,
      100,
    ),
    maxAttempts: integerValue(
      "LEAD_NOTIFICATION_MAX_ATTEMPTS",
      env.LEAD_NOTIFICATION_MAX_ATTEMPTS,
      5,
      1,
      20,
    ),
  };

  if (!enabled) {
    return { enabled, channels, targetKey, customerCopyEnabled: false, dispatcher };
  }

  const customerCopyEnabled = booleanValue(env.LEAD_CUSTOMER_COPY_ENABLED, false);

  const secure = booleanValue(env.LEAD_SMTP_SECURE, false);
  const smtp = {
    host: String(env.LEAD_SMTP_HOST || "").trim(),
    port: portValue(env.LEAD_SMTP_PORT, secure ? 465 : 587),
    secure,
    requireTLS: booleanValue(env.LEAD_SMTP_REQUIRE_TLS, !secure),
    from: String(env.LEAD_EMAIL_FROM || "").trim(),
    recipients: {
      [targetKey]: String(env.LEAD_EMAIL_TO || "").trim(),
    },
    customerReplyTo: String(env.LEAD_EMAIL_TO || "").trim(),
    username: await readSecret(env.LEAD_SMTP_USERNAME_FILE),
    password: await readSecret(env.LEAD_SMTP_PASSWORD_FILE),
  };

  if (!smtp.host || !smtp.from || !smtp.recipients[targetKey]) {
    throw new Error(
      "Las notificaciones están activadas pero falta LEAD_SMTP_HOST, LEAD_EMAIL_FROM o LEAD_EMAIL_TO.",
    );
  }
  if (Boolean(smtp.username) !== Boolean(smtp.password)) {
    throw new Error("El usuario y la contraseña SMTP deben configurarse conjuntamente mediante secretos.");
  }

  return { enabled, channels, targetKey, customerCopyEnabled, dispatcher, smtp };
}
