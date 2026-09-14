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
  buildDemoResult,
  buildDemoSummary,
  createDemoFlowState,
  currentDemoQuestion,
  demoDateToday,
  editDemoAnswer,
  formatDemoAnswer,
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

function completeQuestions(demo, initialState = createDemoFlowState(demo), answers = {}) {
  let state = initialState;
  for (let index = 0; index < demo.questions.length; index += 1) {
    const question = currentDemoQuestion(demo, state);
    assert.ok(question, `Pregunta ${index + 1} de ${demo.id}`);
    state = setDemoAnswer(state, question, answers[question.id] ?? answerFor(question), demo);
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

test("ecommerce adapta preguntas, resumen y resultado a las cuatro intenciones", () => {
  const demo = DEMOS_BY_SLUG.ecommerce;
  for (const [intent, priority, product, resultTitle] of [
    ["discover", ["price", "quality"], "Mochila de ejemplo", /ecommerce/i],
    ["compare", ["delivery"], "Dos mochilas de ejemplo", /ecommerce/i],
    ["track", "delivery-status", "PED-DEMO-2048", /envío/i],
    ["return", "damaged", "PED-DEMO-2048", /devolución/i],
  ]) {
    const state = completeQuestions(demo, undefined, { intent, priorities: priority, product });
    assert.equal(state.phase, FLOW_PHASES.REVIEW, intent);
    const summary = buildDemoSummary(demo, state);
    const productSummary = summary.find((item) => item.id === "product");
    const prioritySummary = summary.find((item) => item.id === "priorities");
    assert.equal(productSummary.value, product);
    if (intent === "track" || intent === "return") {
      assert.match(productSummary.label, /pedido/i);
      assert.match(prioritySummary.label, intent === "track" ? /envío/i : /devolución/i);
      assert.equal(prioritySummary.value, intent === "track" ? "Estado actual" : "Ha llegado dañado");
    } else {
      assert.match(productSummary.label, /producto/i);
      assert.match(prioritySummary.label, /importante/i);
      assert.equal(prioritySummary.value, intent === "discover" ? "Precio, Calidad o prestaciones" : "Entrega rápida");
    }
    const completed = advanceDemoFlow(demo, state);
    assert.equal(completed.phase, FLOW_PHASES.COMPLETE, intent);
    assert.match(buildDemoResult(demo, completed).title, resultTitle);
  }
});

test("cambiar de búsqueda a devolución solicita de nuevo los datos afectados y conserva el canal", () => {
  const demo = DEMOS_BY_SLUG.ecommerce;
  let state = completeQuestions(demo, undefined, {
    intent: "discover", product: "Mochila de ejemplo", priorities: ["price"], channel: "agent",
  });
  state = editDemoAnswer(demo, state, "intent");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "return", demo);
  assert.equal(state.answers.product, undefined);
  assert.equal(state.answers.priorities, undefined);
  assert.equal(state.answers.channel, "agent");

  state = advanceDemoFlow(demo, state);
  assert.equal(currentDemoQuestion(demo, state).id, "product");
  assert.equal(state.editingFromReview, true);
  assert.match(state.notice, /cambio afecta/i);
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "PED-DEMO-2048", demo);
  state = advanceDemoFlow(demo, state);
  assert.equal(currentDemoQuestion(demo, state).id, "priorities");
  assert.equal(currentDemoQuestion(demo, state).type, "single");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "damaged", demo);
  state = advanceDemoFlow(demo, state);

  assert.equal(state.phase, FLOW_PHASES.REVIEW);
  assert.equal(state.editingSnapshot, null);
  assert.equal(state.notice, "");
  assert.equal(buildDemoSummary(demo, state).find((item) => item.id === "priorities").value, "Ha llegado dañado");
  assert.match(buildDemoResult(demo, state).title, /devolución/i);
});

test("cambiar de seguimiento a devolución conserva la referencia pero exige un motivo nuevo", () => {
  const demo = DEMOS_BY_SLUG.ecommerce;
  let state = completeQuestions(demo, undefined, {
    intent: "track", product: "PED-DEMO-2048", priorities: "delivery-date",
  });
  state = editDemoAnswer(demo, state, "intent");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "return", demo);
  assert.equal(state.answers.product, "PED-DEMO-2048");
  assert.equal(state.answers.priorities, undefined);
  state = advanceDemoFlow(demo, state);
  assert.equal(currentDemoQuestion(demo, state).id, "priorities");
});

test("inmobiliaria diferencia búsquedas y valoraciones en todas las operaciones", () => {
  const demo = DEMOS_BY_SLUG.inmobiliaria;
  for (const operation of ["buy", "rent", "sell", "valuation"]) {
    const valuation = operation === "sell" || operation === "valuation";
    const state = completeQuestions(demo, undefined, {
      operation, nextStep: valuation ? "estimate" : "list",
    });
    assert.equal(state.phase, FLOW_PHASES.REVIEW, operation);
    const summary = buildDemoSummary(demo, state).find((item) => item.id === "nextStep");
    assert.equal(summary.value, valuation ? "Recibir una valoración orientativa" : "Ver propiedades");
    assert.match(summary.label, valuation ? /valoración/i : /siguiente paso/i);
    assert.match(buildDemoResult(demo, state).title, valuation ? /valoración/i : /búsqueda/i);
    assert.equal(advanceDemoFlow(demo, state).phase, FLOW_PHASES.COMPLETE, operation);
  }
});

test("cambiar la operación inmobiliaria conserva el inmueble y la zona pero revisa el siguiente paso", () => {
  const demo = DEMOS_BY_SLUG.inmobiliaria;
  let state = completeQuestions(demo, undefined, {
    operation: "buy", property: "house", area: "Centro de ejemplo", nextStep: "list",
  });
  state = editDemoAnswer(demo, state, "operation");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "sell", demo);
  assert.equal(state.answers.property, "house");
  assert.equal(state.answers.area, "Centro de ejemplo");
  assert.equal(state.answers.nextStep, undefined);
  state = advanceDemoFlow(demo, state);
  assert.equal(currentDemoQuestion(demo, state).id, "nextStep");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "property-visit", demo);
  state = advanceDemoFlow(demo, state);
  assert.equal(state.phase, FLOW_PHASES.REVIEW);
  assert.equal(buildDemoSummary(demo, state).find((item) => item.id === "nextStep").value, "Concertar una visita al inmueble");
});

test("cancelar una edición restaura también las respuestas borradas por un cambio de recorrido", () => {
  const demo = DEMOS_BY_SLUG.ecommerce;
  const original = completeQuestions(demo, undefined, {
    intent: "discover", product: "Mochila de ejemplo", priorities: ["price", "quality"],
  });
  let state = editDemoAnswer(demo, original, "intent");
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "return", demo);
  state = advanceDemoFlow(demo, state);
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "PED-DEMO-2048", demo);
  state = advanceDemoFlow(demo, state);
  state = setDemoAnswer(state, currentDemoQuestion(demo, state), "damaged", demo);
  state = goBackDemoFlow(demo, state);

  assert.equal(state.phase, FLOW_PHASES.REVIEW);
  assert.deepEqual(state.answers, original.answers);
  assert.deepEqual(buildDemoSummary(demo, state), buildDemoSummary(demo, original));
  assert.equal(state.editingSnapshot, null);
  assert.equal(state.editingFromReview, false);
  assert.equal(state.notice, "");
  assert.equal(state.error, "");

  state = editDemoAnswer(demo, state, "priorities");
  state = toggleDemoAnswer(state, currentDemoQuestion(demo, state), "price", demo);
  state = goBackDemoFlow(demo, state);
  assert.deepEqual(state.answers, original.answers, "Cancelar una multiselección tampoco modifica la copia original");
});

test("volver desde resultado y revisión recorre las preguntas sin repetir el último paso", () => {
  const demo = DEMOS_BY_SLUG.reservas;
  const original = completeQuestions(demo);
  let state = advanceDemoFlow(demo, original);
  for (let round = 0; round < 2; round += 1) {
    state = goBackDemoFlow(demo, state);
    assert.equal(state.phase, FLOW_PHASES.REVIEW);
    state = goBackDemoFlow(demo, state);
    assert.equal(state.currentIndex, demo.questions.length - 1);
    for (let index = demo.questions.length - 2; index >= 0; index -= 1) {
      state = goBackDemoFlow(demo, state);
      assert.equal(state.currentIndex, index);
      assert.deepEqual(state.history, Array.from({ length: index }, (_, item) => item));
    }
    state = goBackDemoFlow(demo, state);
    assert.equal(state.currentIndex, 0);
    assert.deepEqual(state.answers, original.answers);
    for (let index = 0; index < demo.questions.length; index += 1) state = advanceDemoFlow(demo, state);
    assert.equal(state.phase, FLOW_PHASES.REVIEW);
    state = advanceDemoFlow(demo, state);
  }
  assert.equal(state.phase, FLOW_PHASES.COMPLETE);
});

test("la revisión no permite completar datos que han quedado inválidos", () => {
  const demo = DEMOS_BY_SLUG.ecommerce;
  const complete = completeQuestions(demo);
  const state = advanceDemoFlow(demo, { ...complete, answers: { ...complete.answers, product: "" } });
  assert.equal(state.phase, FLOW_PHASES.QUESTIONS);
  assert.equal(currentDemoQuestion(demo, state).id, "product");
  assert.ok(state.error);
});

test("mudanzas permite terminar sin extras y el resumen lo explica", () => {
  const demo = DEMOS_BY_SLUG.mudanzas;
  const extras = demo.questions.find((question) => question.id === "extras");
  assert.equal(validateDemoAnswer(extras, undefined).valid, true);
  assert.equal(validateDemoAnswer(extras, []).valid, true);
  assert.equal(validateDemoAnswer(extras, ["unknown"]).valid, false);
  const state = completeQuestions(demo, undefined, { extras: [] });
  assert.equal(state.phase, FLOW_PHASES.REVIEW);
  assert.equal(buildDemoSummary(demo, state).find((item) => item.id === "extras").value, "Ninguno");
  assert.equal(advanceDemoFlow(demo, state).phase, FLOW_PHASES.COMPLETE);
});

test("las multiselecciones cuentan opciones distintas y respetan el mínimo configurado", () => {
  const priorities = DEMOS_BY_SLUG.ecommerce.questions.find((question) => question.id === "priorities");
  assert.equal(validateDemoAnswer(priorities, []).valid, false);
  assert.equal(validateDemoAnswer({ ...priorities, minSelections: 2 }, ["price", "price"]).valid, false);
  assert.equal(validateDemoAnswer({ ...priorities, minSelections: 2 }, ["price", "quality"]).valid, true);
  assert.equal(validateDemoAnswer({ ...priorities, required: false, minSelections: 0 }, []).valid, true);
});

test("cantidades enteras rechazan decimales, espacios, valores no finitos y límites excedidos", () => {
  const diners = DEMOS_BY_SLUG["reserva-restaurante"].questions[0];
  for (const value of [" ", null, undefined, "abc", "Infinity", NaN, Infinity, 1.5, "2.5", diners.min - 1, diners.max + 1]) {
    assert.equal(validateDemoAnswer(diners, value).valid, false, String(value));
  }
  for (const value of [diners.min, diners.max, "4"]) {
    assert.equal(validateDemoAnswer(diners, value).valid, true, String(value));
  }
  assert.equal(validateDemoAnswer({ ...diners, required: false }, "").valid, true);
  assert.equal(validateDemoAnswer({ ...diners, integer: false }, "2.5").valid, true);
  assert.match(formatDemoAnswer({ ...diners, suffix: "personas" }, "04"), /^4 personas$/);
});

test("las fechas usan el día local, rechazan fechas pasadas y aplican límites inclusivos", () => {
  const preferredDate = DEMOS_BY_SLUG["reserva-restaurante"].questions[1];
  assert.equal(demoDateToday(new Date(2032, 0, 2, 23, 30)), "2032-01-02");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  assert.equal(validateDemoAnswer(preferredDate, demoDateToday(yesterday)).valid, false);
  assert.equal(validateDemoAnswer(preferredDate, demoDateToday()).valid, true);
  assert.equal(validateDemoAnswer({ ...preferredDate, required: false }, "").valid, true);

  const bounded = { ...preferredDate, minDate: "2032-02-28", maxDate: "2032-03-01" };
  for (const value of ["2032-02-28", "2032-02-29", "2032-03-01"]) {
    assert.equal(validateDemoAnswer(bounded, value).valid, true, value);
  }
  for (const value of ["2032-02-27", "2032-03-02", "2031-02-29", "2032-02-30", "2032-13-01", "2032-2-28"]) {
    assert.equal(validateDemoAnswer(bounded, value).valid, false, value);
  }
});
