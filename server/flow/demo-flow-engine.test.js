import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_CATALOG,
  DEMOS_BY_SLUG,
  validateDemoCatalog,
} from "../../src/demo-catalog.js";
import {
  FLOW_PHASES,
  advanceDemoFlow,
  buildDemoSummary,
  createDemoFlowState,
  editDemoAnswer,
  goBackDemoFlow,
  restartDemoFlow,
  setDemoAnswer,
  toggleDemoAnswer,
  validateDemoAnswer,
} from "../../src/demo-flow-engine.js";

function answerFor(question) {
  if (question.type === "single") return question.options[0].value;
  if (question.type === "multi") return [question.options[0].value];
  if (question.type === "number") return question.min || 1;
  if (question.type === "date") return "2030-10-15";
  return "Dato de demostración";
}

function completeQuestions(demo, initialState = createDemoFlowState(demo)) {
  let state = initialState;
  for (const question of demo.questions) {
    state = setDemoAnswer(state, question, answerFor(question));
    state = advanceDemoFlow(demo, state);
  }
  return state;
}

test("el catálogo contiene exactamente los 18 tipos solicitados", () => {
  assert.equal(DEMO_CATALOG.length, 18);
  assert.equal(validateDemoCatalog(), true);
  assert.equal(new Set(DEMO_CATALOG.map((demo) => demo.id)).size, 18);
  assert.equal(new Set(DEMO_CATALOG.map((demo) => demo.slug)).size, 18);

  const expectedSlugs = [
    "reservas",
    "solicitud-presupuestos",
    "citas",
    "consulta-stock",
    "atencion-cliente-faq",
    "captacion-leads",
    "solicitud-informacion",
    "pedidos",
    "consulta-disponibilidad",
    "reserva-restaurante",
    "cita-taller",
    "citas-clinica-estetica-peluqueria",
    "alquiler",
    "inmobiliaria",
    "mudanzas",
    "servicio-tecnico",
    "ecommerce",
    "gestion-incidencias",
  ];
  assert.deepEqual(Object.keys(DEMOS_BY_SLUG), expectedSlugs);
});

test("todas las configuraciones pueden recorrer el motor hasta revisión y resultado", () => {
  for (const demo of DEMO_CATALOG) {
    let state = completeQuestions(demo);
    assert.equal(state.phase, FLOW_PHASES.REVIEW, demo.id);
    assert.equal(buildDemoSummary(demo, state).length, demo.questions.length);

    state = advanceDemoFlow(demo, state);
    assert.equal(state.phase, FLOW_PHASES.COMPLETE, demo.id);
  }
});

test("no avanza si la respuesta actual no es válida", () => {
  const demo = DEMOS_BY_SLUG["reserva-restaurante"];
  const state = advanceDemoFlow(demo, createDemoFlowState(demo));

  assert.equal(state.phase, FLOW_PHASES.QUESTIONS);
  assert.equal(state.currentIndex, 0);
  assert.match(state.error, /cantidad/i);
});

test("permite avanzar, retroceder y conservar respuestas", () => {
  const demo = DEMOS_BY_SLUG.reservas;
  let state = createDemoFlowState(demo);
  state = setDemoAnswer(state, demo.questions[0], "activity");
  state = advanceDemoFlow(demo, state);
  assert.equal(state.currentIndex, 1);

  state = setDemoAnswer(state, demo.questions[1], "2030-10-15");
  state = advanceDemoFlow(demo, state);
  assert.equal(state.currentIndex, 2);

  state = goBackDemoFlow(demo, state);
  assert.equal(state.currentIndex, 1);
  assert.equal(state.answers.preferredDate, "2030-10-15");
});

test("permite editar una respuesta desde el resumen sin perder las demás", () => {
  const demo = DEMOS_BY_SLUG["reserva-restaurante"];
  let state = completeQuestions(demo);
  const previousDate = state.answers.preferredDate;

  state = editDemoAnswer(demo, state, "diners");
  assert.equal(state.phase, FLOW_PHASES.QUESTIONS);
  assert.equal(state.editingFromReview, true);
  state = setDemoAnswer(state, demo.questions[0], 6);
  state = advanceDemoFlow(demo, state);

  assert.equal(state.phase, FLOW_PHASES.REVIEW);
  assert.equal(state.answers.diners, 6);
  assert.equal(state.answers.preferredDate, previousDate);
});

test("multiselección alterna valores y reiniciar elimina el progreso", () => {
  const demo = DEMOS_BY_SLUG.mudanzas;
  const question = demo.questions.find((item) => item.type === "multi");
  let state = createDemoFlowState(demo);

  state = toggleDemoAnswer(state, question, question.options[0].value);
  state = toggleDemoAnswer(state, question, question.options[1].value);
  assert.deepEqual(state.answers[question.id], [
    question.options[0].value,
    question.options[1].value,
  ]);
  state = toggleDemoAnswer(state, question, question.options[0].value);
  assert.deepEqual(state.answers[question.id], [question.options[1].value]);

  state = restartDemoFlow(demo);
  assert.deepEqual(state.answers, {});
  assert.equal(state.currentIndex, 0);
});

test("valida fechas reales y límites numéricos", () => {
  const restaurant = DEMOS_BY_SLUG["reserva-restaurante"];
  const diners = restaurant.questions[0];
  const preferredDate = restaurant.questions[1];

  assert.equal(validateDemoAnswer(diners, 0).valid, false);
  assert.equal(validateDemoAnswer(diners, 4).valid, true);
  assert.equal(validateDemoAnswer(preferredDate, "2030-02-30").valid, false);
  assert.equal(validateDemoAnswer(preferredDate, "2030-02-28").valid, true);
});
