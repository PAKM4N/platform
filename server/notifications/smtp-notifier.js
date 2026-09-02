import nodemailer from "nodemailer";

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

function renderMessage(payload) {
  const { contact = {}, quote = {} } = payload;
  const implementation = quote.implementation || {};
  const monthly = quote.monthly || {};
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
    ["Teléfono", contact.phone],
    ["Solución recomendada", packageName],
    ["Necesidades", services],
    ["Canales", channels],
    ["Extras", extras],
    ["Interacción", answers.interaction],
    ["Alojamiento", answers.hosting],
    ["Alcance web", answers.websiteScope],
    ["Implantación SIN IVA", `${implementation.from ? "Desde " : ""}${euro.format(implementation.total || 0)}`],
    ["Coste mensual SIN IVA", `${monthly.from ? "Desde " : ""}${euro.format(monthly.total || 0)}`],
    ["Pendiente de valoración", quoteOnly],
    ["Posibles consumos externos", external],
    ["Observaciones", observations],
  ];

  const text = [
    "Nueva solicitud de presupuesto completada",
    "",
    ...rows.map(([label, value]) => `${label}: ${value ?? ""}`),
  ].join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd;vertical-align:top">${escapeHtml(label)}</th>` +
        `<td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(value ?? "").replaceAll("\n", "<br>")}</td></tr>`,
    )
    .join("");

  return {
    text,
    html:
      '<div style="font-family:Arial,sans-serif;color:#17202a;line-height:1.5">' +
      "<h1>Nueva solicitud de presupuesto completada</h1>" +
      '<p><strong>Todos los importes son SIN IVA.</strong></p>' +
      `<table style="border-collapse:collapse;width:100%;max-width:760px">${htmlRows}</table>` +
      "</div>",
  };
}

function renderCustomerMessage(payload) {
  const { contact = {}, quote = {} } = payload;
  const implementation = quote.implementation || {};
  const monthly = quote.monthly || {};
  const packageName = [quote.package?.name, quote.package?.variant].filter(Boolean).join(" · ");
  const rows = [
    ["Referencia", payload.reference],
    ["Solución recomendada", packageName || "Por definir"],
    ["Necesidades", labels(payload.selectedServices, "Por definir")],
    ["Canales", labels(payload.selectedChannels, "Por definir")],
    ["Extras", labels(payload.selectedExtras, "Sin extras adicionales")],
    [
      "Implantación SIN IVA",
      `${implementation.from ? "Desde " : ""}${euro.format(implementation.total || 0)}`,
    ],
    [
      "Coste mensual SIN IVA",
      `${monthly.from ? "Desde " : ""}${euro.format(monthly.total || 0)}`,
    ],
    ["Pendiente de valoración", labels(quote.quoteOnlyItems, "Ninguna")],
    ["Posibles consumos externos", labels(quote.externalConsumptions, "Ninguno")],
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
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px;border-bottom:1px solid #ddd;vertical-align:top">${escapeHtml(label)}</th>` +
        `<td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(value ?? "")}</td></tr>`,
    )
    .join("");

  return {
    text,
    html:
      '<div style="font-family:Arial,sans-serif;color:#17202a;line-height:1.5">' +
      `<p>Hola ${escapeHtml(contact.name || "")},</p>` +
      "<h1>Hemos recibido tu solicitud de presupuesto</h1>" +
      "<p>Este es el resumen de la estimación que has preparado en Mercamicro.</p>" +
      '<p><strong>Todos los importes son SIN IVA.</strong></p>' +
      `<table style="border-collapse:collapse;width:100%;max-width:760px">${htmlRows}</table>` +
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
      const content = customerCopy ? renderCustomerMessage(payload) : renderMessage(payload);
      const messageKey = String(id).replace(/[^A-Za-z0-9._-]/g, "").slice(0, 120) || "unknown";
      const result = await transport.sendMail({
        from: settings.from,
        to: recipient,
        replyTo: customerCopy
          ? settings.customerReplyTo
          : { name: payload.contact.name, address: payload.contact.email },
        subject: customerCopy
          ? `Hemos recibido tu solicitud ${payload.reference} · Mercamicro`
          : `Nueva solicitud de presupuesto ${payload.reference}`,
        messageId: `<${messageKey}@notifications.mercamicro.es>`,
        text: content.text,
        html: content.html,
        headers: { "X-Mercamicro-Notification-Id": id },
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      return { messageId: result.messageId || "" };
    },
  };
}

export const smtpNotifierInternals = { escapeHtml, renderMessage, renderCustomerMessage };
