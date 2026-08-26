import assert from "node:assert/strict";
import test from "node:test";
import { initialBotState, replyToMessage } from "./engine.js";

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
