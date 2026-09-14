import nodemailer from "nodemailer";
import { SINGLE_EMAIL_PATTERN } from "../lead-submission.js";
import {
  HOSTING_OPTIONS,
  INTERACTION_OPTIONS,
  WEBSITE_SCOPE_OPTIONS,
} from "../../src/project-catalog.js";

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: true,
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labels(values, fallback = "Ninguno") {
  const result = (Array.isArray(values) ? values : [])
    .map((value) => value?.label || value?.id || value)
    .filter(Boolean)
    .join(" · ");
  return result || fallback;
}

function optionLabel(options, value) {
  return options.find(({ id }) => id === value)?.label || "Por definir";
}

function quoteAmount(amount = {}) {
  if (!Number.isFinite(amount.total) || amount.total < 0) return "Pendiente de valoración";
  return `${amount.from ? "Desde " : ""}${euro.format(amount.total)}`;
}

function monthlyAmount(payload) {
  if (payload.answers?.hosting === "own") return "Alojamiento propio · no incluido";
  return quoteAmount(payload.quote?.monthly);
}

function htmlTable(rows) {
  const content = rows.map(([label, value]) =>
    '<tr><th align="left" style="width:34%;padding:12px 8px;border-bottom:1px solid #e4e9f0;vertical-align:top;font-size:14px;font-weight:600">' +
    `${escapeHtml(label)}</th>` +
    '<td style="padding:12px 8px;border-bottom:1px solid #e4e9f0;vertical-align:top;font-size:15px;overflow-wrap:anywhere">' +
    `${escapeHtml(value ?? "").replaceAll("\n", "<br>")}</td></tr>`,
  ).join("");
  return `<table role="table" style="border-collapse:collapse;width:100%;max-width:760px">${content}</table>`;
}

function renderMessage(payload) {
  const { contact = {}, quote = {} } = payload;
  const implementation = quote.implementation || {};
  const packageName = [quote.package?.name, quote.package?.variant].filter(Boolean).join(" · ");
  const services = labels(payload.selectedServices, "Por definir");
  const channels = labels(payload.selectedChannels, "Por definir");
  const extras = labels(payload.selectedExtras, "Sin extras adicionales");
  const quoteOnly = labels(quote.quoteOnlyItems, "Ninguna");
  const external = labels(quote.externalConsumptions, "Ninguno");
  const observations = contact.observations || "Sin observaciones";
  const submittedAt = new Date(payload.submittedAt).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const answers = payload.answers || {};

  const rows = [
    ["Referencia", payload.reference],
    ["Fecha", submittedAt],
    ["Nombre", contact.name],
    ["Empresa", contact.company || "No indicada"],
    ["Email", contact.email],
    ["Teléfono", contact.phone || "No indicado"],
    ["Solución recomendada", packageName],
    ["Necesidades", services],
    ["Canales", channels],
    ["Extras", extras],
    ["Interacción", optionLabel(INTERACTION_OPTIONS, answers.interaction)],
    ["Alojamiento", optionLabel(HOSTING_OPTIONS, answers.hosting)],
    ["Alcance web", optionLabel(WEBSITE_SCOPE_OPTIONS, answers.websiteScope)],
    ["Implantación SIN IVA", quoteAmount(implementation)],
    ["Coste mensual SIN IVA", monthlyAmount(payload)],
    ["Pendiente de valoración", quoteOnly],
    ["Posibles consumos externos", external],
    ["Observaciones", observations],
  ];

  const text = [
    "Nueva solicitud de presupuesto completada",
    "",
    ...rows.map(([label, value]) => `${label}: ${value ?? ""}`),
  ].join("\n");
  return {
    text,
    html:
      '<div style="font-family:Arial,sans-serif;color:#17202a;line-height:1.5">' +
      "<h1>Nueva solicitud de presupuesto completada</h1>" +
      '<p><strong>Todos los importes son SIN IVA.</strong></p>' +
      htmlTable(rows) +
      "</div>",
  };
}

function renderCustomerMessage(payload) {
  const { contact = {}, quote = {} } = payload;
  const implementation = quote.implementation || {};
  const answers = payload.answers || {};
  const packageName = [quote.package?.name, quote.package?.variant].filter(Boolean).join(" · ");
  const rows = [
    ["Referencia", payload.reference],
    ["Solución recomendada", packageName || "Por definir"],
    ["Necesidades", labels(payload.selectedServices, "Por definir")],
    ["Canales", labels(payload.selectedChannels, "Por definir")],
    ["Extras", labels(payload.selectedExtras, "Sin extras adicionales")],
    ["Interacción", optionLabel(INTERACTION_OPTIONS, answers.interaction)],
    ["Alojamiento", optionLabel(HOSTING_OPTIONS, answers.hosting)],
    ["Alcance web", optionLabel(WEBSITE_SCOPE_OPTIONS, answers.websiteScope)],
    [
      "Implantación SIN IVA",
      quoteAmount(implementation),
    ],
    [
      "Coste mensual SIN IVA",
      monthlyAmount(payload),
    ],
    ["Pendiente de valoración", labels(quote.quoteOnlyItems, "Ninguna")],
    ["Posibles consumos externos", labels(quote.externalConsumptions, "Ninguno")],
    ...(contact.observations ? [["Tus comentarios", contact.observations]] : []),
  ];
  const disclaimer =
    "Esta estimación es orientativa y no constituye una oferta vinculante. " +
    "Revisaremos la información antes de confirmar el alcance, los plazos y el precio final.";
  const text = [
    `Hola ${contact.name || ""},`,
    "",
    "Hemos recibido tu solicitud de presupuesto en Mercamicro.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value ?? ""}`),
    "",
    disclaimer,
    "",
    "Si quieres añadir algún detalle, responde directamente a este correo.",
    "",
    "Gracias,",
    "Mercamicro",
  ].join("\n");
  return {
    text,
    html:
      '<div style="font-family:Arial,sans-serif;color:#17202a;line-height:1.6;max-width:760px;margin:auto;padding:20px 12px">' +
      '<p style="color:#2453c6;font-weight:700;font-size:18px;letter-spacing:1px">MERCAMICRO</p>' +
      `<p>Hola ${escapeHtml(contact.name || "")},</p>` +
      '<h1 style="font-size:28px;line-height:1.2;letter-spacing:-0.5px">Tu presupuesto orientativo</h1>' +
      "<p>Hemos recibido tu solicitud de presupuesto.</p>" +
      "<p>Este es el resumen de la estimación que has preparado en Mercamicro.</p>" +
      '<p><strong>Todos los importes son SIN IVA.</strong></p>' +
      htmlTable(rows) +
      `<p style="margin-top:24px">${escapeHtml(disclaimer)}</p>` +
      "<p>Si quieres añadir algún detalle, responde directamente a este correo.</p>" +
      "<p>Gracias,<br>Mercamicro</p>" +
      "</div>",
  };
}

export function createSmtpNotifier(settings, { transporter } = {}) {
  const transport =
    transporter ||
    nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      requireTLS: settings.requireTLS,
      auth: settings.username
        ? { user: settings.username, pass: settings.password }
        : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true,
      tls: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    });

  return {
    async send({ id, targetKey, payload }) {
      const customerCopy = targetKey === "customer";
      const recipient = customerCopy
        ? String(payload?.contact?.email || "").trim()
        : settings.recipients[targetKey];
      if (!recipient) throw new Error("notification_target_not_configured");
      if (customerCopy && !SINGLE_EMAIL_PATTERN.test(recipient)) {
        throw new Error("notification_customer_email_invalid");
      }
      const content = customerCopy ? renderCustomerMessage(payload) : renderMessage(payload);
      const messageKey = String(id).replace(/[^A-Za-z0-9._-]/g, "").slice(0, 120) || "unknown";
      const result = await transport.sendMail({
        from: settings.from,
        to: customerCopy ? { address: recipient } : recipient,
        replyTo: customerCopy
          ? settings.customerReplyTo
          : { name: payload.contact.name, address: payload.contact.email },
        subject: customerCopy
          ? `Hemos recibido tu solicitud ${payload.reference} · Mercamicro`
          : `Nueva solicitud de presupuesto ${payload.reference}`,
        messageId: `<${messageKey}@notifications.mercamicro.es>`,
        text: content.text,
        html: content.html,
        headers: {
          "X-Mercamicro-Notification-Id": id,
          "Auto-Submitted": "auto-generated",
          "X-Auto-Response-Suppress": "All",
        },
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      return { messageId: result.messageId || "" };
    },
  };
}

export const smtpNotifierInternals = { escapeHtml, renderMessage, renderCustomerMessage };
