import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  CHANNEL_OPTIONS,
  EXTRA_OPTIONS,
  HOSTING_OPTIONS,
  INTERACTION_OPTIONS,
  NEED_OPTIONS,
  PROJECT_CATALOG_VERSION,
  WEBSITE_SCOPE_OPTIONS,
} from "../../src/project-catalog.js";
import {
  automaticProjectExtraIds,
  calculateProjectQuote,
  normalizeProjectAnswers,
} from "../../src/project-pricing.js";

const STORAGE_KEY = "mercamicro-project-configurator-v1";
const STORAGE_TTL = 2 * 60 * 60 * 1000;
const LAST_QUESTION_STEP = 5;
const REVIEW_STEP = 6;

const STEPS = [
  {
    id: "needs",
    eyebrow: "Objetivo",
    title: "¿Qué necesitas resolver?",
    hint: "Puedes marcar varias necesidades. Las usaremos para configurar la solución.",
  },
  {
    id: "interaction",
    eyebrow: "Funcionamiento",
    title: "¿Cómo debería trabajar la solución?",
    hint: "Describe el comportamiento que necesitas, sin preocuparte por el nombre técnico.",
  },
  {
    id: "channel",
    eyebrow: "Canales",
    title: "¿Dónde quieres atender a tus clientes?",
    hint: "Elige el canal o combinación principal para la primera versión.",
  },
  {
    id: "extras",
    eyebrow: "Funciones e integraciones",
    title: "¿Qué más debe poder hacer?",
    hint: "Selecciona solo lo necesario ahora. Podrás ampliar la solución después.",
  },
  {
    id: "websiteScope",
    eyebrow: "Web",
    title: "¿Necesitas también la web?",
    hint: "Una landing o web completa se estudia contigo y se presenta como presupuesto personalizado.",
  },
  {
    id: "hosting",
    eyebrow: "Alojamiento",
    title: "¿Cómo quieres alojar la solución?",
    hint: "La cuota mensual se calcula por separado de la implantación.",
  },
];

const STEP_INDEX = Object.fromEntries(STEPS.map(({ id }, index) => [id, index]));

const DEFAULT_ANSWERS = {
  needs: [],
  channel: "web",
  interaction: "rules",
  extras: [],
  hosting: "managed",
  websiteScope: "existing",
};

const DEFAULT_CONTACT = {
  name: "",
  company: "",
  email: "",
  phone: "",
  observations: "",
  website: "",
};

const HOSTING_CHOICES = HOSTING_OPTIONS.map((option) =>
  option.id === "local-ai"
    ? {
        ...option,
        description: "Infraestructura dedicada para mantener el modelo en un entorno propio.",
      }
    : option,
);

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: true,
});

function freshAnswers() {
  return { ...DEFAULT_ANSWERS, needs: [], extras: [] };
}

function createSubmissionId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof window.crypto?.getRandomValues === "function") {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    const isCurrent =
      saved?.catalogVersion === PROJECT_CATALOG_VERSION &&
      Number.isFinite(saved?.savedAt) &&
      Date.now() - saved.savedAt < STORAGE_TTL;

    if (isCurrent && saved?.answers && Number.isInteger(saved.step)) {
      return {
        answers: normalizeProjectAnswers(saved.answers),
        step: Math.min(REVIEW_STEP, Math.max(0, saved.step)),
      };
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // El almacenamiento es opcional; la interfaz funciona también sin él.
    }
  }
  return { answers: freshAnswers(), step: 0 };
}

function MultiOptions({ options, selected, locked = [], onToggle, label = "Opciones disponibles" }) {
  return (
    <div className="configurator-options is-multi" role="group" aria-label={label}>
      {options.map((option) => {
        const isLocked = locked.includes(option.id);
        const active = selected.includes(option.id) || isLocked;
        return (
          <button
            type="button"
            className={[active ? "selected" : "", isLocked ? "is-automatic" : ""].filter(Boolean).join(" ")}
            aria-pressed={active}
            disabled={isLocked}
            key={option.id}
            onClick={() => onToggle(option.id)}
          >
            <span className="configurator-option-check">{active && <Check size={15} />}</span>
            <span>
              <strong>{option.label}</strong>
              {option.description && <small>{option.description}</small>}
              {isLocked && <small>Incluido por uno de tus objetivos</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SingleOptions({ options, selected, onSelect, label = "Selecciona una opción" }) {
  return (
    <div className="configurator-options" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          role="radio"
          className={selected === option.id ? "selected" : ""}
          aria-checked={selected === option.id}
          key={option.id}
          onClick={() => onSelect(option.id)}
        >
          <span>
            <strong>{option.label}</strong>
            {option.description && <small>{option.description}</small>}
          </span>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>
  );
}

function QuoteTotals({ quote }) {
  return (
    <div className="quote-totals">
      <div>
        <span>Implantación</span>
        <strong>{quote.implementation.from ? "Desde " : ""}{euro.format(quote.implementation.total)}</strong>
        <small>Pago único por la puesta en marcha</small>
      </div>
      <div>
        <span>Coste mensual</span>
        <strong>{quote.monthly.from ? "Desde " : ""}{quote.monthly.total ? euro.format(quote.monthly.total) : "0 €"}</strong>
        <small>{quote.monthly.label}</small>
      </div>
      <p><b>SIN IVA</b><span>Todos los importes de implantación y mantenimiento excluyen el IVA.</span></p>
    </div>
  );
}

function QuoteBreakdown({ quote }) {
  const automaticIds = automaticProjectExtraIds(quote.answers.needs);

  return (
    <div className="quote-breakdown">
      <div className="quote-breakdown-heading">
        <strong>Desglose de implantación</strong>
        <span>Importe sin IVA</span>
      </div>
      <div className="quote-breakdown-line">
        <span>
          <b>{quote.package.name}</b>
          <small>{quote.package.variant}</small>
        </span>
        <strong>{quote.package.from ? "Desde " : ""}{euro.format(quote.implementation.base)}</strong>
      </div>
      {quote.extras.map((extra) => (
        <div className="quote-breakdown-line" key={extra.id}>
          <span>
            <b>{extra.label}</b>
            <small>{automaticIds.includes(extra.id) ? "Incluido automáticamente por tus objetivos" : "Opción seleccionada"}</small>
          </span>
          <strong>{extra.from ? "Desde " : "+"}{euro.format(extra.implementation)}</strong>
        </div>
      ))}
      {quote.quoteOnlyItems.map((item) => (
        <div className="quote-breakdown-line is-quote-only" key={item}>
          <span>
            <b>{item}</b>
            <small>Se definirá según contenidos, páginas y alcance</small>
          </span>
          <strong>Presupuesto personalizado</strong>
        </div>
      ))}
      <div className="quote-breakdown-line is-recurring">
        <span>
          <b>{quote.monthly.label}</b>
          <small>Coste recurrente separado de la implantación</small>
        </span>
        <strong>{quote.monthly.from ? "Desde " : ""}{quote.monthly.total ? euro.format(quote.monthly.total) + "/mes" : "No incluido"}</strong>
      </div>
    </div>
  );
}

function QuoteSummary({ quote, onEdit, compact = false }) {
  const interaction = INTERACTION_OPTIONS.find(({ id }) => id === quote.answers.interaction);
  const automaticIds = automaticProjectExtraIds(quote.answers.needs);
  const automaticLabels = quote.extras
    .filter(({ id }) => automaticIds.includes(id))
    .map(({ label }) => label);

  return (
    <div className={"quote-summary" + (compact ? " is-compact" : "")}>
      <div className="quote-summary-heading">
        <span><Sparkles size={18} /> Solución recomendada</span>
        <strong>{quote.package.name}</strong>
        <small>{quote.package.variant}</small>
      </div>

      <div className="quote-summary-rows">
        <div>
          <span>Objetivos</span>
          <p>{quote.needs.map(({ label }) => label).join(" · ") || "Por definir"}</p>
          {onEdit && <button type="button" aria-label="Editar objetivos" onClick={() => onEdit("needs")}><Pencil size={14} /> Editar</button>}
        </div>
        <div>
          <span>Funcionamiento</span>
          <p>{interaction?.label || "Por definir"}</p>
          {onEdit && <button type="button" aria-label="Editar funcionamiento" onClick={() => onEdit("interaction")}><Pencil size={14} /> Editar</button>}
        </div>
        <div>
          <span>Canales</span>
          <p>{quote.channel?.label || "Web"}</p>
          {onEdit && <button type="button" aria-label="Editar canales" onClick={() => onEdit("channel")}><Pencil size={14} /> Editar</button>}
        </div>
        <div>
          <span>Web y entorno</span>
          <p>{quote.websiteScope?.label}{quote.quoteOnlyItems.length ? " · Presupuesto personalizado" : ""}</p>
          {onEdit && <button type="button" aria-label="Editar web y entorno" onClick={() => onEdit("websiteScope")}><Pencil size={14} /> Editar</button>}
        </div>
        <div className="is-wide">
          <span>Opciones y extras</span>
          <p>{quote.extras.map(({ label }) => label).join(" · ") || "Sin extras adicionales"}</p>
          {!!automaticLabels.length && (
            <small>Se han añadido por tus objetivos: {automaticLabels.join(" · ")}. Si cambias esos objetivos, el cálculo también se actualizará.</small>
          )}
          {onEdit && <button type="button" aria-label="Editar opciones y extras" onClick={() => onEdit("extras")}><Pencil size={14} /> Editar</button>}
        </div>
        <div>
          <span>Alojamiento</span>
          <p>{quote.monthly.label}</p>
          {onEdit && <button type="button" aria-label="Editar alojamiento" onClick={() => onEdit("hosting")}><Pencil size={14} /> Editar</button>}
        </div>
      </div>

      <QuoteBreakdown quote={quote} />
      <QuoteTotals quote={quote} />

      <div className="external-costs-note">
        <strong>Posibles consumos externos no incluidos</strong>
        <p>Se facturan por el proveedor correspondiente y dependen del uso real:</p>
        <ul>
          {quote.externalConsumptions.map((consumption) => <li key={consumption}>{consumption}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function ProjectConfigurator() {
  const initial = useMemo(loadProgress, []);
  const [step, setStep] = useState(initial.step);
  const [answers, setAnswers] = useState(initial.answers);
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [editingReview, setEditingReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const submissionId = useRef(null);
  const focusTarget = useRef(null);
  const shouldFocus = useRef(false);
  const quote = useMemo(() => calculateProjectQuote(answers), [answers]);
  const lockedExtras = useMemo(() => automaticProjectExtraIds(answers.needs), [answers.needs]);

  useEffect(() => {
    if (submitted) return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          catalogVersion: PROJECT_CATALOG_VERSION,
          savedAt: Date.now(),
          answers,
          step,
        }),
      );
    } catch {
      // El progreso temporal es una mejora opcional, no un requisito para continuar.
    }
  }, [answers, step, submitted]);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    focusTarget.current?.focus({ preventScroll: true });
  }, [step]);

  const toggle = (field, id) => {
    setAnswers((current) => ({
      ...current,
      [field]: current[field].includes(id)
        ? current[field].filter((value) => value !== id)
        : [...current[field], id],
    }));
  };

  const select = (field, value) => {
    setAnswers((current) => {
      if (field === "interaction" && value === "form") {
        return {
          ...current,
          interaction: value,
          channel: "web",
          websiteScope: current.websiteScope === "none" ? "existing" : current.websiteScope,
        };
      }
      if (field === "channel" && value.includes("web") && current.websiteScope === "none") {
        return { ...current, channel: value, websiteScope: "existing" };
      }
      return { ...current, [field]: value };
    });
  };

  const canContinue = step !== STEP_INDEX.needs || answers.needs.length > 0;

  const moveTo = (nextStep) => {
    const target = Math.min(REVIEW_STEP, Math.max(0, nextStep));
    shouldFocus.current = true;
    setStep(target);
    setSubmitError("");
    window.setTimeout(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      document.getElementById("calculadora")?.scrollIntoView({ behavior, block: "start" });
    }, 20);
  };

  const editStep = (stepId) => {
    setEditingReview(true);
    moveTo(STEP_INDEX[stepId]);
  };

  const finishStep = () => {
    if (editingReview) {
      setEditingReview(false);
      moveTo(REVIEW_STEP);
      return;
    }
    moveTo(step + 1);
  };

  const reset = () => {
    setAnswers(freshAnswers());
    setContact({ ...DEFAULT_CONTACT });
    setEditingReview(false);
    setSubmitted(null);
    setSubmitError("");
    submissionId.current = null;
    setStep(0);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Sin efecto si el navegador no permite almacenamiento temporal.
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    submissionId.current ||= createSubmissionId();

    try {
      const response = await fetch("/api/project-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId.current,
          answers,
          contact,
          pagePath: window.location.pathname,
          locale: navigator.language || "es",
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "submit_failed");
      setSubmitted(result);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // El envío ya se completó; un bloqueo del almacenamiento no cambia el resultado.
      }
    } catch {
      setSubmitError("No hemos podido enviar la solicitud. Tus respuestas siguen guardadas para que puedas intentarlo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="budget-estimator project-configurator is-complete" id="calculadora" aria-label="Presupuestador de proyecto">
        <div className="estimator-topbar">
          <span className="estimator-avatar"><Bot size={22} /></span>
          <span><strong>Solicitud recibida</strong><small><i /> Presupuesto guardado</small></span>
        </div>
        <div className="configurator-complete">
          <span className="configurator-success"><CircleCheck size={30} /></span>
          <small>REFERENCIA {submitted.reference}</small>
          <h3>Ya tenemos la información necesaria.</h3>
          <p>Revisaremos el alcance y contactaremos contigo utilizando los datos indicados.</p>
          <QuoteSummary quote={submitted.quote || quote} compact />
          <button type="button" className="configurator-reset" onClick={reset}>
            <RefreshCcw size={16} /> Preparar otra solicitud
          </button>
        </div>
      </section>
    );
  }

  const currentStep = STEPS[step];
  const channelChoices = answers.interaction === "form"
    ? CHANNEL_OPTIONS.filter(({ id }) => id === "web")
    : CHANNEL_OPTIONS;
  const websiteScopeChoices = answers.channel.includes("web")
    ? WEBSITE_SCOPE_OPTIONS.filter(({ id }) => id !== "none")
    : WEBSITE_SCOPE_OPTIONS;

  return (
    <section className="budget-estimator project-configurator" id="calculadora" aria-label="Presupuestador de proyecto">
      <div className="estimator-topbar">
        <span className="estimator-avatar"><Bot size={22} /></span>
        <span><strong>Presupuestador guiado</strong><small><i /> Cálculo orientativo · sin IVA</small></span>
        <span className="configurator-step-count">{Math.min(step + 1, 7)} / 7</span>
      </div>
      <div className="estimator-progress" aria-hidden="true">
        <i style={{ transform: "scaleX(" + step / REVIEW_STEP + ")" }} />
      </div>

      {step < REVIEW_STEP ? (
        <div className="configurator-body">
          {(step > 0 || editingReview) && (
            <button
              type="button"
              className="estimator-back"
              onClick={() => {
                if (editingReview) {
                  setEditingReview(false);
                  moveTo(REVIEW_STEP);
                } else {
                  moveTo(step - 1);
                }
              }}
            >
              <ArrowLeft size={17} /> {editingReview ? "Volver al resumen" : "Respuesta anterior"}
            </button>
          )}
          <div className="assistant-message" ref={focusTarget} tabIndex="-1">
            <small>Paso {step + 1} · {currentStep.eyebrow}</small>
            <p>{currentStep.title}</p>
            <span>{currentStep.hint}</span>
          </div>

          {currentStep.id === "needs" && (
            <MultiOptions label={currentStep.title} options={NEED_OPTIONS} selected={answers.needs} onToggle={(id) => toggle("needs", id)} />
          )}
          {currentStep.id === "interaction" && (
            <SingleOptions label={currentStep.title} options={INTERACTION_OPTIONS} selected={answers.interaction} onSelect={(id) => select("interaction", id)} />
          )}
          {currentStep.id === "channel" && (
            <>
              {answers.interaction === "form" && (
                <p className="configurator-context-note">Un formulario se integra en la web, por eso este canal queda seleccionado automáticamente.</p>
              )}
              <SingleOptions label={currentStep.title} options={channelChoices} selected={answers.channel} onSelect={(id) => select("channel", id)} />
            </>
          )}
          {currentStep.id === "extras" && (
            <MultiOptions
              label={currentStep.title}
              options={EXTRA_OPTIONS}
              selected={answers.extras}
              locked={lockedExtras}
              onToggle={(id) => toggle("extras", id)}
            />
          )}
          {currentStep.id === "websiteScope" && (
            <SingleOptions label={currentStep.title} options={websiteScopeChoices} selected={answers.websiteScope} onSelect={(id) => select("websiteScope", id)} />
          )}
          {currentStep.id === "hosting" && (
            <SingleOptions label={currentStep.title} options={HOSTING_CHOICES} selected={answers.hosting} onSelect={(id) => select("hosting", id)} />
          )}

          <div className="configurator-actions">
            <small>
              {currentStep.id === "extras"
                ? "Las funciones marcadas como incluidas dependen de tus objetivos."
                : "Podrás modificar esta respuesta en el resumen."}
            </small>
            <button type="button" disabled={!canContinue} onClick={finishStep}>
              {editingReview
                ? "Guardar cambio"
                : step === LAST_QUESTION_STEP
                  ? "Revisar presupuesto"
                  : "Continuar"} <ArrowRight size={17} />
            </button>
          </div>
        </div>
      ) : (
        <form className="configurator-review" onSubmit={submit}>
          <div className="configurator-review-heading" ref={focusTarget} tabIndex="-1">
            <button type="button" className="estimator-back" onClick={() => moveTo(LAST_QUESTION_STEP)}>
              <ArrowLeft size={17} /> Volver
            </button>
            <small>Paso 7 · Revisión y contacto</small>
            <h3>Revisa el alcance antes de enviarlo.</h3>
            <p>Puedes editar cualquier bloque. Solo guardaremos la solicitud cuando pulses el botón final.</p>
          </div>

          <QuoteSummary quote={quote} onEdit={editStep} />

          <div className="configurator-contact">
            <div className="configurator-contact-heading">
              <span><Mail size={19} /></span>
              <div><strong>¿Con quién debemos revisar la propuesta?</strong><small>Pedimos estos datos únicamente al terminar el recorrido.</small></div>
            </div>
            <div className="configurator-contact-grid">
              <label htmlFor="project-contact-name">Nombre *</label>
              <input id="project-contact-name" name="name" required maxLength="120" autoComplete="name" value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} />

              <label htmlFor="project-contact-company">Empresa</label>
              <input id="project-contact-company" name="company" maxLength="160" autoComplete="organization" value={contact.company} onChange={(event) => setContact((current) => ({ ...current, company: event.target.value }))} />

              <label htmlFor="project-contact-email">Email *</label>
              <span className="configurator-input-with-icon"><Mail size={16} /><input id="project-contact-email" name="email" required type="email" maxLength="254" autoComplete="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} /></span>

              <label htmlFor="project-contact-phone">Teléfono *</label>
              <span className="configurator-input-with-icon"><Phone size={16} /><input id="project-contact-phone" name="phone" required type="tel" minLength="6" maxLength="40" autoComplete="tel" value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} /></span>

              <label className="is-full" htmlFor="project-contact-observations">Observaciones</label>
              <textarea className="is-full" id="project-contact-observations" name="observations" rows="4" maxLength="2000" value={contact.observations} onChange={(event) => setContact((current) => ({ ...current, observations: event.target.value }))} placeholder="Contexto, plazos o cualquier requisito que debamos conocer." />

              <label className="configurator-honeypot" aria-hidden="true" htmlFor="project-contact-website">Sitio web</label>
              <input className="configurator-honeypot" id="project-contact-website" name="website" tabIndex="-1" autoComplete="off" value={contact.website} onChange={(event) => setContact((current) => ({ ...current, website: event.target.value }))} />
            </div>
            <p className="configurator-privacy"><ShieldCheck size={17} /> Utilizaremos estos datos únicamente para revisar y responder a esta solicitud. No usamos cookies de analítica ni publicidad.</p>
            {submitError && <p className="configurator-error" role="alert">{submitError}</p>}
            <div className="configurator-submit-row">
              <span>
                <small>Implantación sin IVA</small>
                <strong>{quote.implementation.from ? "Desde " : ""}{euro.format(quote.implementation.total)}</strong>
              </span>
              <span>
                <small>Cuota mensual sin IVA</small>
                <strong>{quote.monthly.from ? "Desde " : ""}{euro.format(quote.monthly.total)}/mes</strong>
              </span>
              <button className="configurator-submit" type="submit" disabled={submitting}>
                {submitting ? <><LoaderCircle className="is-spinning" size={18} /> Enviando…</> : <>Enviar solicitud <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        </form>
      )}

      {step < REVIEW_STEP && (
        <p className="estimator-note">
          <Clock3 size={13} /> Tus selecciones se conservan durante dos horas en esta sesión. No guardamos datos de contacto.
        </p>
      )}
    </section>
  );
}
