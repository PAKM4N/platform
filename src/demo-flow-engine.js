export const FLOW_PHASES = {
  QUESTIONS: "questions",
  REVIEW: "review",
  COMPLETE: "complete",
};

export function createDemoFlowState(demo) {
  if (!demo?.id || !demo.questions?.length) {
    throw new Error("No se puede iniciar una demo sin configuración válida.");
  }

  return {
    demoId: demo.id,
    configVersion: 1,
    phase: FLOW_PHASES.QUESTIONS,
    currentIndex: 0,
    answers: {},
    history: [],
    editingFromReview: false,
    editingSnapshot: null,
    notice: "",
    error: "",
  };
}

export function currentDemoQuestion(demo, state) {
  if (state.phase !== FLOW_PHASES.QUESTIONS) return null;
  return resolveDemoQuestions(demo, state.answers)[state.currentIndex] || null;
}

function matchesAnswers(when, answers) {
  return Object.entries(when).every(([id, values]) =>
    (Array.isArray(values) ? values : [values]).includes(answers[id]),
  );
}

export function resolveDemoQuestions(demo, answers = {}) {
  return demo.questions.map((question) => ({
    ...question,
    ...question.variants?.find((variant) => matchesAnswers(variant.when, answers)),
  }));
}

export function buildDemoResult(demo, state) {
  return {
    ...demo.result,
    ...demo.result.variants?.find((variant) => matchesAnswers(variant.when, state.answers)),
  };
}

export function demoDateToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

export function validateDemoAnswer(question, value) {
  if (!question) return { valid: false, error: "La pregunta no existe." };

  if (question.type === "multi") {
    const selections = Array.isArray(value) ? [...new Set(value)] : [];
    const minimum = question.minSelections ?? (question.required ? 1 : 0);
    if (selections.length < minimum) {
      return {
        valid: false,
        error: minimum === 1 ? "Selecciona al menos una opción." : `Selecciona al menos ${minimum} opciones.`,
      };
    }
    const allowed = new Set(question.options.map((option) => option.value));
    if (selections.some((selection) => !allowed.has(selection))) {
      return { valid: false, error: "Hay una opción que no pertenece a esta pregunta." };
    }
    return { valid: true, error: "" };
  }

  if (question.type === "single") {
    if (!question.required && !value) return { valid: true, error: "" };
    const allowed = new Set(question.options.map((option) => option.value));
    return allowed.has(value)
      ? { valid: true, error: "" }
      : { valid: false, error: "Selecciona una de las opciones disponibles." };
  }

  if (question.type === "number") {
    if (!normalizeText(value)) {
      if (!question.required) return { valid: true, error: "" };
      return { valid: false, error: "Indica una cantidad para continuar." };
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return { valid: false, error: "Introduce una cifra válida." };
    }
    if (question.integer && !Number.isInteger(numericValue)) {
      return { valid: false, error: "Introduce una cantidad entera, sin decimales." };
    }
    if (Number.isFinite(question.min) && numericValue < question.min) {
      return { valid: false, error: `El valor mínimo es ${question.min}.` };
    }
    if (Number.isFinite(question.max) && numericValue > question.max) {
      return { valid: false, error: `El valor máximo es ${question.max}.` };
    }
    return { valid: true, error: "" };
  }

  if (question.type === "date") {
    const normalized = normalizeText(value);
    if (!question.required && !normalized) return { valid: true, error: "" };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return { valid: false, error: "Selecciona una fecha para continuar." };
    }
    const [year, month, day] = normalized.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;
    if (!isRealDate) return { valid: false, error: "Selecciona una fecha válida." };
    const minimum = question.minDate === "today" ? demoDateToday() : question.minDate;
    if (minimum && normalized < minimum) {
      return { valid: false, error: "Elige hoy o una fecha posterior." };
    }
    if (question.maxDate && normalized > question.maxDate) {
      return { valid: false, error: "La fecha está fuera del periodo disponible." };
    }
    return { valid: true, error: "" };
  }

  const normalized = normalizeText(value);
  if (!question.required && !normalized) return { valid: true, error: "" };
  const minimum = question.minLength ?? (question.required ? 1 : 0);
  if (normalized.length > (question.maxLength ?? 500)) {
    return { valid: false, error: `Usa un máximo de ${question.maxLength ?? 500} caracteres.` };
  }
  return normalized.length >= minimum
    ? { valid: true, error: "" }
    : { valid: false, error: "Añade un poco más de información para continuar." };
}

export function setDemoAnswer(state, question, value, demo) {
  if (!question?.id) return state;
  const answers = { ...state.answers, [question.id]: value };
  if (demo) {
    const before = resolveDemoQuestions(demo, state.answers);
    const after = resolveDemoQuestions(demo, answers);
    after.forEach((item, index) => {
      if (item.id !== question.id && before[index].when !== item.when &&
          (item.type === "text" || !validateDemoAnswer(item, answers[item.id]).valid)) {
        delete answers[item.id];
      }
    });
  }
  return {
    ...state,
    answers,
    error: "",
  };
}

export function toggleDemoAnswer(state, question, value, demo) {
  const current = Array.isArray(state.answers[question.id])
    ? state.answers[question.id]
    : [];
  const next = current.includes(value)
    ? current.filter((selection) => selection !== value)
    : [...current, value];
  return setDemoAnswer(state, question, next, demo);
}

export function advanceDemoFlow(demo, state) {
  if (state.phase === FLOW_PHASES.COMPLETE) return state;

  if (state.phase === FLOW_PHASES.REVIEW) {
    const questions = resolveDemoQuestions(demo, state.answers);
    const invalidIndex = questions.findIndex((question) => !validateDemoAnswer(question, state.answers[question.id]).valid);
    if (invalidIndex >= 0) {
      const question = questions[invalidIndex];
      return {
        ...state,
        phase: FLOW_PHASES.QUESTIONS,
        currentIndex: invalidIndex,
        editingFromReview: true,
        editingSnapshot: { ...state.answers },
        error: validateDemoAnswer(question, state.answers[question.id]).error,
      };
    }
    return {
      ...state,
      phase: FLOW_PHASES.COMPLETE,
      editingFromReview: false,
      editingSnapshot: null,
      notice: "",
      error: "",
    };
  }

  const question = currentDemoQuestion(demo, state);
  const validation = validateDemoAnswer(question, state.answers[question?.id]);
  if (!validation.valid) return { ...state, error: validation.error };

  if (state.editingFromReview || state.currentIndex >= demo.questions.length - 1) {
    const questions = resolveDemoQuestions(demo, state.answers);
    const invalidIndex = questions.findIndex((item) => !validateDemoAnswer(item, state.answers[item.id]).valid);
    if (invalidIndex >= 0) {
      return {
        ...state,
        currentIndex: invalidIndex,
        notice: "Tu cambio afecta a esta respuesta. Revísala para completar el resumen.",
        error: "",
      };
    }
    return {
      ...state,
      phase: FLOW_PHASES.REVIEW,
      editingFromReview: false,
      editingSnapshot: null,
      notice: "",
      history: demo.questions.slice(0, -1).map((_, index) => index),
      error: "",
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    history: demo.questions.slice(0, state.currentIndex + 1).map((_, index) => index),
    notice: "",
    error: "",
  };
}

export function goBackDemoFlow(demo, state) {
  if (state.phase === FLOW_PHASES.COMPLETE) {
    return { ...state, phase: FLOW_PHASES.REVIEW, error: "" };
  }

  if (state.phase === FLOW_PHASES.REVIEW) {
    return {
      ...state,
      phase: FLOW_PHASES.QUESTIONS,
      currentIndex: Math.max(0, demo.questions.length - 1),
      editingFromReview: false,
      history: demo.questions.slice(0, -1).map((_, index) => index),
      notice: "",
      error: "",
    };
  }

  if (state.editingFromReview) {
    return {
      ...state,
      phase: FLOW_PHASES.REVIEW,
      answers: state.editingSnapshot || state.answers,
      editingFromReview: false,
      editingSnapshot: null,
      notice: "",
      error: "",
    };
  }

  const previousIndex = Math.max(0, state.currentIndex - 1);
  return {
    ...state,
    currentIndex: previousIndex,
    history: demo.questions.slice(0, previousIndex).map((_, index) => index),
    notice: "",
    error: "",
  };
}

export function editDemoAnswer(demo, state, questionId) {
  const index = demo.questions.findIndex((question) => question.id === questionId);
  if (index < 0) return state;
  return {
    ...state,
    phase: FLOW_PHASES.QUESTIONS,
    currentIndex: index,
    editingFromReview: true,
    editingSnapshot: state.editingSnapshot || { ...state.answers },
    notice: "",
    error: "",
  };
}

export function restartDemoFlow(demo) {
  return createDemoFlowState(demo);
}

export function formatDemoAnswer(question, value) {
  if (question.type === "single") {
    return question.options.find((option) => option.value === value)?.label || "—";
  }
  if (question.type === "multi") {
    const selected = new Set(Array.isArray(value) ? value : []);
    return question.options
      .filter((option) => selected.has(option.value))
      .map((option) => option.label)
      .join(", ") || (question.required ? "—" : "Ninguno");
  }
  if (question.type === "number") {
    if (value === "" || value === undefined || value === null) return "—";
    return `${Number(value).toLocaleString("es-ES")}${question.suffix ? ` ${question.suffix}` : ""}`;
  }
  if (question.type === "date" && value) {
    const [year, month, day] = String(value).split("-");
    return year && month && day ? `${day}/${month}/${year}` : String(value);
  }
  return normalizeText(value) || "—";
}

export function buildDemoSummary(demo, state) {
  return resolveDemoQuestions(demo, state.answers).map((question) => ({
    id: question.id,
    label: question.label,
    value: formatDemoAnswer(question, state.answers[question.id]),
  }));
}
