import assert from "node:assert/strict";
import test from "node:test";
import { engineInternals, initialBotState, replyToMessage } from "./engine.js";
import { SERVICES } from "../src/service-models.js";

function turn(state, message, pagePath = "/") {
  return replyToMessage({ state, message, pagePath });
}

test("selecciona limpieza y completa una estimación guiada", () => {
  let response = turn(null, "Quiero probar limpieza");
  assert.equal(response.state.serviceId, "cleaning");
  assert.equal(response.state.fieldIndex, 0);

  for (const answer of ["Oficina", "120", "Limpieza a fondo", "Uso normal", "8"]) {
    response = turn(response.state, answer);
  }

  assert.equal(response.completed, true);
  assert.equal(response.state.phase, "complete");
  assert.ok(response.estimate.rangeMin > 0);
  assert.ok(response.estimate.rangeMax > response.estimate.rangeMin);
});

test("usa la ruta para iniciar la conversación del sector", () => {
  const state = initialBotState("/presupuesto-de-mudanza");
  const response = turn(state, "28001", "/presupuesto-de-mudanza");

  assert.equal(response.state.serviceId, "moving");
  assert.equal(response.state.values.originPostcode, "28001");
  assert.match(response.message, /Código postal de destino/i);
});

test("incluye la unidad en las preguntas y validaciones numéricas", () => {
  let response = turn(initialBotState("/presupuesto-de-mudanza"), "28001");
  response = turn(response.state, "46001");
  assert.match(response.message, /Estancias con mobiliario \(estancias\)/i);

  response = turn(response.state, "4");
  assert.match(response.message, /Distancia estimada \(km\)/i);
  assert.match(response.message, /mínimo 1 km/i);

  response = turn(response.state, "bastante lejos");
  assert.match(response.message, /Necesito una cifra en km/i);
});

test("un saludo abre la primera pregunta sin consumirla", () => {
  const state = initialBotState("/presupuesto-de-pintura");
  const response = turn(state, "Hola", "/presupuesto-de-pintura");

  assert.equal(response.state.fieldIndex, 0);
  assert.match(response.message, /Tipo de inmueble/i);
});

test("mantiene la pregunta cuando la cifra no es válida", () => {
  let response = turn(null, "bicicletas");
  response = turn(response.state, "Urbana");
  response = turn(response.state, "muchas");

  assert.equal(response.state.fieldIndex, 1);
  assert.match(response.message, /Necesito una cifra/i);
});

test("reinicia una conversación completada", () => {
  const response = turn(
    {
      phase: "complete",
      serviceId: "painting",
      fieldIndex: 5,
      values: {},
      estimate: { rangeMin: 1, rangeMax: 2 },
    },
    "otro presupuesto",
    "/",
  );

  assert.equal(response.state.phase, "select-service");
  assert.equal(response.state.serviceId, null);
});

function stateAtField(serviceId, fieldId) {
  const state = initialBotState(`/${SERVICES[serviceId].slug}`);
  state.fieldIndex = engineInternals.selectedFields(serviceId).findIndex((field) => field.id === fieldId);
  assert.ok(state.fieldIndex >= 0, `${serviceId}.${fieldId} debe ser un campo del chat`);
  return state;
}

test("todas las opciones guiadas aceptan su etiqueta completa y su valor exacto", () => {
  for (const serviceId of Object.keys(SERVICES)) {
    for (const field of engineInternals.selectedFields(serviceId).filter((item) => item.type === "select")) {
      for (const [value, label] of field.options) {
        for (const answer of [value, label]) {
          const response = turn(stateAtField(serviceId, field.id), answer);
          assert.equal(response.state.values[field.id], value, `${serviceId}.${field.id}: ${answer}`);
          assert.equal(response.state.fieldIndex, stateAtField(serviceId, field.id).fieldIndex + 1);
        }
      }
    }
  }
});

test("una elección inválida o ambigua no consume la pregunta ni modifica el valor", () => {
  const cases = [
    ["vehicles", "vehicleType", ["-1", "1.5", "1,5", "1 coche", "1 o 2", "0", "6", "...", "¿?", "---", "plazas", "económico o compacto", "no quiero compacto"]],
    ["bicycles", "bikeType", ["eléctrica", "urbana o montaña", "carre", "no sé si urbana o montaña"]],
    ["vehicles", "transmission", ["manual o automático", "no automático"]],
  ];
  for (const [serviceId, fieldId, answers] of cases) {
    const state = stateAtField(serviceId, fieldId);
    for (const answer of answers) {
      const response = turn(state, answer);
      assert.deepEqual(response.state, state, `${serviceId}.${fieldId}: ${answer}`);
      assert.match(response.message, /Elige una sola opción/);
      assert.ok(response.quickReplies.length > 0);
    }
  }
});

test("acepta números completos y fragmentos inequívocos de una opción", () => {
  const cases = [
    ["vehicles", "vehicleType", "2", "compact"],
    ["vehicles", "vehicleType", "la opción 3", "suv"],
    ["vehicles", "vehicleType", "Compacto", "compact"],
    ["vehicles", "vehicleType", "Quiero un compacto, por favor", "compact"],
    ["bicycles", "bikeType", "Prefiero una eléctrica urbana", "electric"],
    ["vehicles", "pickup", "centro", "city"],
  ];
  for (const [serviceId, fieldId, answer, expected] of cases) {
    const state = stateAtField(serviceId, fieldId);
    const response = turn(state, answer);
    assert.equal(response.state.values[fieldId], expected, answer);
    assert.equal(response.state.fieldIndex, state.fieldIndex + 1, answer);
  }
});

test("las cantidades discretas y días necesitan números enteros", () => {
  for (const [serviceId, fieldId] of [["bicycles", "bikeCount"], ["bicycles", "days"], ["vehicles", "days"], ["moving", "rooms"], ["cleaning", "windows"]]) {
    for (const answer of ["1.5", "2,5"]) {
      const state = stateAtField(serviceId, fieldId);
      const response = turn(state, answer);
      assert.deepEqual(response.state, state, `${serviceId}.${fieldId}: ${answer}`);
      assert.match(response.message, /número entero.*sin decimales/);
    }
  }
});

test("rechaza intervalos, múltiples cifras, unidades incorrectas y números incompletos", () => {
  for (const answer of ["2 o 3", "2-3", "2/3", "1e2", "2 bicicletas y 3 días", "2,5.0", "2 m²", "--2"]) {
    const state = stateAtField("bicycles", "bikeCount");
    const response = turn(state, answer);
    assert.deepEqual(response.state, state, answer);
    assert.match(response.message, /Escribe un único valor/);
  }
  const state = stateAtField("cleaning", "area");
  assert.deepEqual(turn(state, "120 m").state, state, "metros lineales no son metros cuadrados");
  assert.match(turn(state, "-120").message, /El mínimo/);
  assert.match(turn(state, "1201").message, /El máximo/);
});

test("admite cantidades con unidades y decimales de superficie o distancia", () => {
  const cases = [
    ["bicycles", "bikeCount", "4 bicicletas", 4],
    ["bicycles", "days", "3 días", 3],
    ["cleaning", "windows", "8 ventanas", 8],
    ["moving", "rooms", "4 estancias", 4],
    ["cleaning", "area", "120,5 m²", 120.5],
    ["painting", "area", "80.5 m2", 80.5],
    ["renovation", "area", "aproximadamente 95,5 metros cuadrados", 95.5],
    ["moving", "distance", "12.5 km", 12.5],
    ["moving", "distance", "12,5 kilómetros", 12.5],
  ];
  for (const [serviceId, fieldId, answer, expected] of cases) {
    const state = stateAtField(serviceId, fieldId);
    const response = turn(state, answer);
    assert.equal(response.state.values[fieldId], expected, answer);
    assert.equal(response.state.fieldIndex, state.fieldIndex + 1, answer);
  }
});

test("una negativa no añade un extra y las respuestas contradictorias piden aclaración", () => {
  const state = stateAtField("moving", "packing");
  for (const [answer, expected] of [["Sí", true], ["Sí, incluir", true], ["No", false], ["No incluir", false], ["No, por favor", false]]) {
    const response = turn(state, answer);
    assert.equal(response.state.values.packing, expected, answer);
    assert.equal(response.completed, true);
  }
  for (const answer of ["sí o no", "no sé si incluir", "no, sí", "no quiero incluir"]) {
    const response = turn(state, answer);
    assert.deepEqual(response.state, state, answer);
    assert.match(response.message, /sí o no/);
  }
});
