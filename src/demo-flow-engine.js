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
    error: "",
  };
}

export function currentDemoQuestion(demo, state) {
  if (state.phase !== FLOW_PHASES.QUESTIONS) return null;
  return demo.questions[state.currentIndex] || null;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

export function validateDemoAnswer(question, value) {
  if (!question) return { valid: false, error: "La pregunta no existe." };

  if (question.type === "multi") {
    const selections = Array.isArray(value) ? value : [];
    const minimum = question.minSelections || (question.required ? 1 : 0);
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
    const allowed = new Set(question.options.map((option) => option.value));
    return allowed.has(value)
      ? { valid: true, error: "" }
      : { valid: false, error: "Selecciona una de las opciones disponibles." };
  }

  if (question.type === "number") {
    if (value === "" || value === null || value === undefined) {
      return { valid: false, error: "Indica una cantidad para continuar." };
    }
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return { valid: false, error: "Introduce una cifra válida." };
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return { valid: false, error: "Selecciona una fecha para continuar." };
    }
    const [year, month, day] = normalized.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;
    return isRealDate
      ? { valid: true, error: "" }
      : { valid: false, error: "Selecciona una fecha válida." };
  }

  const normalized = normalizeText(value);
  const minimum = question.minLength || (question.required ? 1 : 0);
  return normalized.length >= minimum
    ? { valid: true, error: "" }
    : { valid: false, error: "Añade un poco más de información para continuar." };
}

export function setDemoAnswer(state, question, value) {
  if (!question?.id) return state;
  return {
    ...state,
    answers: { ...state.answers, [question.id]: value },
    error: "",
  };
}

export function toggleDemoAnswer(state, question, value) {
  const current = Array.isArray(state.answers[question.id])
    ? state.answers[question.id]
    : [];
  const next = current.includes(value)
    ? current.filter((selection) => selection !== value)
    : [...current, value];
  return setDemoAnswer(state, question, next);
}

export function advanceDemoFlow(demo, state) {
  if (state.phase === FLOW_PHASES.COMPLETE) return state;

  if (state.phase === FLOW_PHASES.REVIEW) {
    return {
      ...state,
      phase: FLOW_PHASES.COMPLETE,
      editingFromReview: false,
      error: "",
    };
  }

  const question = currentDemoQuestion(demo, state);
  const validation = validateDemoAnswer(question, state.answers[question?.id]);
  if (!validation.valid) return { ...state, error: validation.error };

  if (state.editingFromReview || state.currentIndex >= demo.questions.length - 1) {
    return {
      ...state,
      phase: FLOW_PHASES.REVIEW,
      editingFromReview: false,
      history: [...state.history, state.currentIndex],
      error: "",
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    history: [...state.history, state.currentIndex],
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
      error: "",
    };
  }

  if (state.editingFromReview) {
    return {
      ...state,
      phase: FLOW_PHASES.REVIEW,
      editingFromReview: false,
      error: "",
    };
  }

  const history = state.history.slice(0, -1);
  const previousIndex = state.history.at(-1);
  return {
    ...state,
    currentIndex: Number.isInteger(previousIndex)
      ? previousIndex
      : Math.max(0, state.currentIndex - 1),
    history,
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
      .join(", ") || "—";
  }
  if (question.type === "number") {
    if (value === "" || value === undefined) return "—";
    return `${value}${question.suffix ? ` ${question.suffix}` : ""}`;
  }
  if (question.type === "date" && value) {
    const [year, month, day] = String(value).split("-");
    return year && month && day ? `${day}/${month}/${year}` : String(value);
  }
  return normalizeText(value) || "—";
}

export function buildDemoSummary(demo, state) {
  return demo.questions.map((question) => ({
    id: question.id,
    label: question.label,
    value: formatDemoAnswer(question, state.answers[question.id]),
  }));
}
