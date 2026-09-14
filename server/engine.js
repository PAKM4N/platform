import {
  SERVICES,
  SERVICE_ORDER,
  SERVICES_BY_SLUG,
  calculateEstimate,
  initialValues,
} from "../src/service-models.js";

const CHAT_FIELDS = {
  vehicles: ["vehicleType", "days", "pickup", "transmission", "insurance"],
  bicycles: ["bikeType", "bikeCount", "days", "routeType", "protection"],
  workshop: ["brand", "model", "job", "symptoms", "urgency"],
  moving: [
    "originPostcode",
    "destinationPostcode",
    "rooms",
    "distance",
    "packing",
  ],
  cleaning: ["propertyType", "area", "cleanType", "condition", "windows"],
  painting: ["propertyType", "area", "rooms", "condition", "ceilings"],
  renovation: ["propertyType", "area", "scope", "quality", "startWindow"],
};

const SERVICE_TERMS = {
  vehicles: ["vehiculo", "vehiculos", "coche", "coches", "alquiler coche"],
  bicycles: ["bicicleta", "bicicletas", "bici", "bicis"],
  workshop: ["taller", "reparacion", "mecanico", "coche averiado"],
  moving: ["mudanza", "mudanzas", "traslado"],
  cleaning: ["limpieza", "limpiar"],
  painting: ["pintura", "pintar", "pintor"],
  renovation: ["reforma", "reformas", "reformar"],
};

const DEFAULT_WORDS = [
  "por defecto",
  "me da igual",
  "no lo se",
  "no se",
  "siguiente",
];

const YES_WORDS = ["si", "vale", "correcto", "incluido", "incluir", "si incluir", "si incluido"];
const NO_WORDS = ["no", "sin", "ninguno", "ninguna", "excluir", "no incluir", "no incluido"];
const START_WORDS = ["hola", "buenas", "empezar", "comenzar", "start"];

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesTerm(message, term) {
  const normalizedMessage = ` ${normalize(message)} `;
  const normalizedTerm = ` ${normalize(term)} `;
  return normalizedMessage.includes(normalizedTerm);
}

function serviceFromPage(pagePath = "") {
  const slug = String(pagePath).split("?")[0].split("/").filter(Boolean)[0];
  return SERVICES_BY_SLUG[slug]?.id || null;
}

function serviceFromMessage(message = "") {
  for (const serviceId of SERVICE_ORDER) {
    if (SERVICE_TERMS[serviceId].some((term) => includesTerm(message, term))) {
      return serviceId;
    }
  }
  return null;
}

function serviceChoices() {
  return SERVICE_ORDER.map((serviceId) => SERVICES[serviceId].shortName);
}

function serviceSelectionReply() {
  return {
    message:
      "Soy la demo real de Mercamicro. Puedo preparar una estimación orientativa de vehículos, bicicletas, taller, mudanzas, limpieza, pintura o reformas. ¿Qué servicio quieres probar?",
    quickReplies: serviceChoices(),
  };
}

function selectedFields(serviceId) {
  const wanted = new Set(CHAT_FIELDS[serviceId]);
  return SERVICES[serviceId].fields.filter((field) => wanted.has(field.id));
}

function numberWithUnit(value, suffix = "") {
  if (!suffix) return String(value);
  const separator = /^[ªº%]/.test(suffix) ? "" : " ";
  return `${value}${separator}${suffix}`;
}

function questionLabel(field) {
  const unitLabels = { "est.": "estancias", "uds.": "unidades" };
  const unit = unitLabels[field.suffix] || field.suffix;
  return field.type === "number" && field.suffix
    ? `${field.label} (${unit})`
    : field.label;
}

function questionForField(field, index, total) {
  let detail = "";
  let quickReplies = [];

  if (field.type === "select") {
    const options = field.options.map(([, label], optionIndex) =>
      `${optionIndex + 1}. ${label}`,
    );
    detail = `\n${options.join("\n")}`;
    quickReplies = field.options.slice(0, 6).map(([, label]) => label);
  } else if (field.type === "checkbox") {
    detail = " Responde sí o no.";
    quickReplies = ["Sí", "No"];
  } else if (field.type === "number") {
    const bounds = [
      Number.isFinite(field.min)
        ? `mínimo ${numberWithUnit(field.min, field.suffix)}`
        : "",
      Number.isFinite(field.max)
        ? `máximo ${numberWithUnit(field.max, field.suffix)}`
        : "",
    ].filter(Boolean);
    const range = bounds.join(" · ");
    detail = bounds.length
      ? ` Rango admitido: ${range}${/[.!?]$/.test(range) ? "" : "."}`
      : "";
  }

  return {
    message: `Pregunta ${index + 1} de ${total}: ${questionLabel(field)}.${detail}`,
    quickReplies,
  };
}

function newState(serviceId = null) {
  if (!serviceId) {
    return { phase: "select-service", serviceId: null, fieldIndex: 0, values: {} };
  }

  return {
    phase: "collecting",
    serviceId,
    fieldIndex: 0,
    values: initialValues(SERVICES[serviceId]),
  };
}

function parseSelect(field, message) {
  const normalized = normalize(message);
  const noMatch = {
    ok: false,
    reason: "Elige una sola opción: puedes escribir su nombre o su número de la lista.",
  };
  if (!normalized) return noMatch;

  // Keep signs and decimal separators intact when interpreting an option number.
  const numberedChoice = String(message).trim().match(/^(?:(?:la\s+)?opci[oó]n\s+)?([1-9]\d*)$/i);
  if (numberedChoice) {
    const index = Number(numberedChoice[1]) - 1;
    return field.options[index]
      ? { ok: true, value: field.options[index][0] }
      : noMatch;
  }

  if (!/[a-z]/.test(normalized)) return noMatch;

  const candidate = normalized
    .replace(/^(?:(?:quiero|prefiero|elijo|escojo)(?: la opcion)?|me gustaria(?: la opcion)?)\s+/, "")
    .replace(/^(?:la opcion|la|el|un|una)\s+/, "")
    .replace(/\s+por favor$/, "");
  const exactMatches = field.options.filter(([value, label]) =>
    candidate === normalize(value) || candidate === normalize(label),
  );
  if (exactMatches.length === 1) return { ok: true, value: exactMatches[0][0] };
  if (exactMatches.length > 1) return noMatch;

  const meaningfulWord = candidate.split(" ").some((word) =>
    word.length > 2 && !["del", "los", "las", "una", "con", "sin", "para", "por", "hasta", "tipo", "opcion"].includes(word),
  );
  if (!meaningfulWord) return noMatch;

  // A short label fragment is useful, but shared fragments need clarification.
  const matches = field.options.filter(([, label]) => includesTerm(label, candidate));
  return matches.length === 1
    ? { ok: true, value: matches[0][0] }
    : noMatch;
}

function parseNumber(field, message) {
  const input = String(message).trim()
    .replace(/^(?:unos?|unas?|aproximadamente|aprox\.?|alrededor de)\s+/i, "");
  const match = input.match(/^([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+))\s*(.*?)$/u);
  const unitAliases = {
    "días": ["dia", "dias"],
    "uds.": ["ud", "uds", "unidad", "unidades"],
    "est.": ["est", "estancia", "estancias", "habitacion", "habitaciones"],
    "m²": ["m2", "m²", "metro cuadrado", "metros cuadrados"],
    "km": ["km", "kilometro", "kilometros"],
  };
  const countAliases = {
    bikeCount: ["bicicleta", "bicicletas", "bici", "bicis"],
    windows: ["ventana", "ventanas"],
    rooms: ["estancia", "estancias", "habitacion", "habitaciones"],
  };
  const units = [field.suffix || "", ...(unitAliases[field.suffix] || []), ...(countAliases[field.id] || [])];
  const normalizeUnit = (unit) => String(unit).normalize("NFKC").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\.$/, "").replace(/\s+/g, " ").trim();
  const validUnit = match && (!match[2] || units.some((unit) => normalizeUnit(unit) === normalizeUnit(match[2])));
  if (!match || !validUnit) {
    const unit = field.suffix ? ` en ${field.suffix}` : "";
    return { ok: false, reason: `Necesito una cifra${unit} para continuar. Escribe un único valor, sin intervalos ni otras cantidades.` };
  }

  const value = Number(match[1].replace(",", "."));
  const allowsDecimals = ["m²", "m³", "m", "km", "km/día", "h"].includes(field.suffix);
  if (!Number.isFinite(value)) {
    return { ok: false, reason: "Escribe una cifra válida para continuar." };
  }
  if (!allowsDecimals && !Number.isInteger(value)) {
    return { ok: false, reason: `Necesito un número entero${field.suffix ? ` en ${field.suffix}` : ""}, sin decimales.` };
  }
  if (Number.isFinite(field.min) && value < field.min) {
    return {
      ok: false,
      reason: `El mínimo para este campo es ${numberWithUnit(field.min, field.suffix)}.`,
    };
  }
  if (Number.isFinite(field.max) && value > field.max) {
    return {
      ok: false,
      reason: `El máximo para este campo es ${numberWithUnit(field.max, field.suffix)}.`,
    };
  }
  return { ok: true, value };
}

function parseCheckbox(message) {
  const normalized = normalize(message).replace(/ por favor$/, "").replace(/ gracias$/, "");
  if (YES_WORDS.includes(normalized)) {
    return { ok: true, value: true };
  }
  if (NO_WORDS.includes(normalized)) {
    return { ok: true, value: false };
  }
  return { ok: false, reason: "Respóndeme sí o no para continuar." };
}

function parseField(field, message) {
  if (DEFAULT_WORDS.includes(normalize(message))) {
    return { ok: true, value: field.default };
  }

  if (field.type === "select") return parseSelect(field, message);
  if (field.type === "number") return parseNumber(field, message);
  if (field.type === "checkbox") return parseCheckbox(message);

  const value = String(message).trim();
  if (!value) return { ok: false, reason: "Necesito una respuesta para continuar." };
  return { ok: true, value: value.slice(0, 500) };
}

function summaryReply(serviceId, estimate) {
  const service = SERVICES[serviceId];
  const mainLines = estimate.lines
    .slice(0, 4)
    .map((line) => `• ${line.label}: ${euro.format(line.amount)}`)
    .join("\n");

  return [
    `Estimación preparada para ${service.name.toLowerCase()}: ${euro.format(estimate.rangeMin)} – ${euro.format(estimate.rangeMax)} (IVA incluido).`,
    mainLines,
    "Es una horquilla de demostración y requiere validación profesional. Puedes revisar y completar todos los detalles en el simulador.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function initialBotState(pagePath = "") {
  return newState(serviceFromPage(pagePath));
}

export function replyToMessage({ state, message, pagePath = "" }) {
  const cleanMessage = String(message || "").trim().slice(0, 2000);
  const normalizedMessage = normalize(cleanMessage);

  if (!cleanMessage) {
    return { ...serviceSelectionReply(), state: state || newState() };
  }

  if (["reiniciar", "empezar de nuevo", "otro presupuesto"].includes(normalizedMessage)) {
    const nextState = newState(serviceFromPage(pagePath));
    if (!nextState.serviceId) {
      return { ...serviceSelectionReply(), state: nextState };
    }
    const fields = selectedFields(nextState.serviceId);
    return {
      message: `Empezamos de nuevo con ${SERVICES[nextState.serviceId].name.toLowerCase()}.\n\n${questionForField(fields[0], 0, fields.length).message}`,
      quickReplies: questionForField(fields[0], 0, fields.length).quickReplies,
      state: nextState,
    };
  }

  let nextState = state?.phase ? structuredClone(state) : initialBotState(pagePath);

  if (!nextState.serviceId || nextState.phase === "select-service") {
    const serviceId = serviceFromMessage(cleanMessage) || serviceFromPage(pagePath);
    if (!serviceId) {
      return { ...serviceSelectionReply(), state: newState() };
    }

    nextState = newState(serviceId);
    const fields = selectedFields(serviceId);
    const question = questionForField(fields[0], 0, fields.length);
    return {
      message: `Perfecto: probaremos ${SERVICES[serviceId].name.toLowerCase()}. Usaré cinco datos clave y el resto quedará con valores estándar de la demo.\n\n${question.message}`,
      quickReplies: question.quickReplies,
      state: nextState,
    };
  }

  if (nextState.phase === "complete") {
    return {
      message:
        "Ese presupuesto ya está preparado. Escribe «otro presupuesto» para reiniciar o elige otra demo desde la web.",
      quickReplies: ["Otro presupuesto"],
      state: nextState,
      estimate: nextState.estimate,
    };
  }

  const fields = selectedFields(nextState.serviceId);
  if (
    nextState.fieldIndex === 0 &&
    START_WORDS.some((word) => includesTerm(cleanMessage, word))
  ) {
    const question = questionForField(fields[0], 0, fields.length);
    return { ...question, state: nextState };
  }

  const currentField = fields[nextState.fieldIndex];
  const parsed = parseField(currentField, cleanMessage);

  if (!parsed.ok) {
    const question = questionForField(currentField, nextState.fieldIndex, fields.length);
    return {
      message: `${parsed.reason}\n\n${question.message}`,
      quickReplies: question.quickReplies,
      state: nextState,
    };
  }

  nextState.values[currentField.id] = parsed.value;
  nextState.fieldIndex += 1;

  if (nextState.fieldIndex < fields.length) {
    const question = questionForField(
      fields[nextState.fieldIndex],
      nextState.fieldIndex,
      fields.length,
    );
    return { ...question, state: nextState };
  }

  const estimate = calculateEstimate(nextState.serviceId, nextState.values);
  nextState.phase = "complete";
  nextState.estimate = {
    subtotal: estimate.subtotal,
    tax: estimate.tax,
    total: estimate.total,
    rangeMin: estimate.rangeMin,
    rangeMax: estimate.rangeMax,
    lines: estimate.lines,
  };

  return {
    message: summaryReply(nextState.serviceId, nextState.estimate),
    quickReplies: ["Otro presupuesto"],
    state: nextState,
    estimate: nextState.estimate,
    completed: true,
  };
}

export const engineInternals = {
  normalize,
  serviceFromMessage,
  serviceFromPage,
  selectedFields,
};
