import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleCheckBig,
  ListChecks,
  LockKeyhole,
  Pencil,
  RefreshCcw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Brand } from "./App";
import { DEMO_CATALOG, DEMO_CATEGORIES } from "./demo-catalog";
import {
  FLOW_PHASES,
  advanceDemoFlow,
  buildDemoSummary,
  createDemoFlowState,
  currentDemoQuestion,
  editDemoAnswer,
  goBackDemoFlow,
  restartDemoFlow,
  setDemoAnswer,
  toggleDemoAnswer,
  validateDemoAnswer,
} from "./demo-flow-engine";
import { iconForDemo } from "./demo-icons";
import { Link } from "./router";

function QuestionInput({ question, value, onChange, onToggle }) {
  if (question.type === "single" || question.type === "multi") {
    const selectedValues = new Set(
      question.type === "multi" && Array.isArray(value) ? value : [value],
    );
    return (
      <div
        className={`generic-demo-options is-${question.type}`}
        role={question.type === "single" ? "radiogroup" : "group"}
        aria-label={question.label}
      >
        {question.options.map((option) => {
          const selected = selectedValues.has(option.value);
          return (
            <button
              type="button"
              className={selected ? "is-selected" : ""}
              role={question.type === "single" ? "radio" : undefined}
              aria-checked={question.type === "single" ? selected : undefined}
              aria-pressed={question.type === "multi" ? selected : undefined}
              onClick={() =>
                question.type === "multi"
                  ? onToggle(option.value)
                  : onChange(option.value)
              }
              key={option.value}
            >
              <span className="generic-demo-option-marker">
                {selected ? <Check size={15} /> : null}
              </span>
              <span>{option.label}</span>
              <ChevronRight size={17} />
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <textarea
        className="generic-demo-textarea"
        aria-label={question.label}
        rows="5"
        maxLength="500"
        value={value || ""}
        placeholder={question.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <label className="generic-demo-input">
      <span>{question.type === "date" ? "Selecciona una fecha" : "Introduce una cantidad"}</span>
      <span>
        <input
          aria-label={question.label}
          type={question.type}
          value={value ?? ""}
          min={
            question.type === "date"
              ? new Date().toISOString().slice(0, 10)
              : question.min
          }
          max={question.max}
          onChange={(event) => onChange(event.target.value)}
        />
        {question.suffix && <b>{question.suffix}</b>}
      </span>
    </label>
  );
}

function FlowQuestion({ demo, state, setState, headingRef }) {
  const question = currentDemoQuestion(demo, state);
  const value = state.answers[question.id];
  const validation = validateDemoAnswer(question, value);

  return (
    <>
      <div className="generic-demo-message">
        <small>
          PREGUNTA {String(state.currentIndex + 1).padStart(2, "0")} / {String(demo.questions.length).padStart(2, "0")}
        </small>
        <h2 ref={headingRef} tabIndex="-1">{question.label}</h2>
        <p>{question.hint}</p>
      </div>

      <QuestionInput
        question={question}
        value={value}
        onChange={(nextValue) =>
          setState((current) => setDemoAnswer(current, question, nextValue))
        }
        onToggle={(nextValue) =>
          setState((current) => toggleDemoAnswer(current, question, nextValue))
        }
      />

      {state.error && <p className="generic-demo-error" role="alert">{state.error}</p>}

      <div className="generic-demo-actions">
        {state.currentIndex > 0 || state.editingFromReview ? (
          <button
            className="generic-demo-button is-secondary"
            type="button"
            onClick={() => setState((current) => goBackDemoFlow(demo, current))}
          >
            <ArrowLeft size={17} />
            {state.editingFromReview ? "Cancelar edición" : "Anterior"}
          </button>
        ) : (
          <span className="generic-demo-local-note">
            <LockKeyhole size={14} /> Se procesa solo en este navegador
          </span>
        )}
        <button
          className="generic-demo-button is-primary"
          type="button"
          disabled={!validation.valid}
          onClick={() => setState((current) => advanceDemoFlow(demo, current))}
        >
          {state.editingFromReview
            ? "Guardar cambio"
            : state.currentIndex === demo.questions.length - 1
              ? "Revisar respuestas"
              : "Continuar"}
          <ArrowRight size={17} />
        </button>
      </div>
    </>
  );
}

function FlowReview({ demo, state, setState, headingRef }) {
  const summary = buildDemoSummary(demo, state);
  return (
    <>
      <div className="generic-demo-message is-review">
        <small>RESUMEN EDITABLE</small>
        <h2 ref={headingRef} tabIndex="-1">Comprueba las respuestas antes de terminar.</h2>
        <p>Nada se envía en esta demostración. Puedes modificar cualquier dato.</p>
      </div>
      <div className="generic-demo-summary">
        {summary.map((item, index) => (
          <div key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p><small>{item.label}</small><strong>{item.value}</strong></p>
            <button
              type="button"
              aria-label={`Modificar ${item.label}`}
              onClick={() =>
                setState((current) => editDemoAnswer(demo, current, item.id))
              }
            >
              <Pencil size={15} /> Modificar
            </button>
          </div>
        ))}
      </div>
      <div className="generic-demo-actions">
        <button
          className="generic-demo-button is-secondary"
          type="button"
          onClick={() => setState((current) => goBackDemoFlow(demo, current))}
        >
          <ArrowLeft size={17} /> Volver a la última pregunta
        </button>
        <button
          className="generic-demo-button is-primary"
          type="button"
          onClick={() => setState((current) => advanceDemoFlow(demo, current))}
        >
          Completar demostración <ArrowRight size={17} />
        </button>
      </div>
    </>
  );
}

function FlowComplete({ demo, state, setState, headingRef }) {
  return (
    <div className="generic-demo-complete">
      <span className="generic-demo-complete-icon"><CircleCheckBig size={30} /></span>
      <small>RECORRIDO COMPLETADO</small>
      <h2 ref={headingRef} tabIndex="-1">{demo.result.title}</h2>
      <p>{demo.result.description}</p>
      <span className="generic-demo-result-status">
        <Sparkles size={16} /> {demo.result.status}
      </span>
      <div className="generic-demo-next-steps">
        <small>QUÉ HARÍA UNA INTEGRACIÓN REAL</small>
        {demo.result.nextSteps.map((step, index) => (
          <span key={step}><i>{index + 1}</i>{step}</span>
        ))}
      </div>
      <div className="generic-demo-actions">
        <button
          className="generic-demo-button is-secondary"
          type="button"
          onClick={() => setState((current) => goBackDemoFlow(demo, current))}
        >
          <ArrowLeft size={17} /> Revisar respuestas
        </button>
        <button
          className="generic-demo-button is-primary"
          type="button"
          onClick={() => setState(restartDemoFlow(demo))}
        >
          <RefreshCcw size={17} /> Probar de nuevo
        </button>
      </div>
    </div>
  );
}

function RelatedDemos({ demo }) {
  const related = DEMO_CATALOG.filter(
    (candidate) => candidate.category === demo.category && candidate.id !== demo.id,
  ).slice(0, 3);

  return (
    <section className="generic-demo-related">
      <div>
        <span className="portal-eyebrow">MÁS RECORRIDOS</span>
        <h2>Prueba otra configuración del mismo motor.</h2>
      </div>
      <div>
        {related.map((candidate) => {
          const Icon = iconForDemo(candidate.icon);
          return (
            <Link to={`/demos/${candidate.slug}`} key={candidate.id}>
              <span style={{ background: candidate.tint, color: candidate.accent }}>
                <Icon size={20} />
              </span>
              <strong>{candidate.name}</strong>
              <ArrowRight size={17} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function GenericDemoExperience({ demo }) {
  const [state, setState] = useState(() => createDemoFlowState(demo));
  const headingRef = useRef(null);
  const previousView = useRef(`${state.phase}:${state.currentIndex}`);
  const Icon = iconForDemo(demo.icon);
  const legacyLinks = demo.legacyLinks || [];
  const category = DEMO_CATEGORIES.find((item) => item.id === demo.category);
  const progress = useMemo(() => {
    if (state.phase === FLOW_PHASES.COMPLETE) return 100;
    if (state.phase === FLOW_PHASES.REVIEW) return 92;
    return ((state.currentIndex + 1) / (demo.questions.length + 1)) * 100;
  }, [demo.questions.length, state.currentIndex, state.phase]);

  useEffect(() => {
    const view = `${state.phase}:${state.currentIndex}`;
    if (previousView.current !== view) {
      headingRef.current?.focus({ preventScroll: true });
      previousView.current = view;
    }
  }, [state.currentIndex, state.phase]);

  return (
    <div
      className="generic-demo-route"
      style={{ "--demo-accent": demo.accent, "--demo-tint": demo.tint }}
    >
      <header className="generic-demo-header">
        <Brand href="/" tag="demos" />
        <nav aria-label="Navegación de la demostración">
          <Link to="/"><ArrowLeft size={16} /> Biblioteca de demos</Link>
          {legacyLinks.map(({ path, label }) => (
            <Link to={path} key={path}>{label}</Link>
          ))}
        </nav>
      </header>

      <main>
        <section className="generic-demo-hero">
          <div className="generic-demo-hero-copy">
            <span className="generic-demo-hero-icon"><Icon size={27} /></span>
            <span className="portal-eyebrow">{demo.eyebrow}</span>
            <h1>{demo.name}</h1>
            <p>{demo.description}</p>
            <div className="generic-demo-tags">
              {demo.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
            </div>
          </div>
          <div className="generic-demo-hero-facts">
            <span><ListChecks size={18} /><small>Recorrido</small><strong>{demo.questions.length} preguntas</strong></span>
            <span><RotateCcw size={18} /><small>Navegación</small><strong>Editable</strong></span>
            <span><LockKeyhole size={18} /><small>Datos</small><strong>Solo demostración</strong></span>
          </div>
        </section>

        <section className="generic-demo-workspace" aria-label={`Demo interactiva de ${demo.name}`}>
          <aside className="generic-demo-guide">
            <span className="generic-demo-guide-icon"><Icon size={24} /></span>
            <small>DEMO CONFIGURABLE</small>
            <h2>Un motor.<br />Otra lógica de negocio.</h2>
            <p>
              Este recorrido usa la misma interfaz y navegación que las demás
              demos. Solo cambian su configuración, preguntas y resultado.
            </p>
            <ol>
              <li className={state.phase === FLOW_PHASES.QUESTIONS ? "active" : "done"}>
                <i>1</i><span><strong>Responder</strong><small>Datos necesarios</small></span>
              </li>
              <li className={state.phase === FLOW_PHASES.REVIEW ? "active" : state.phase === FLOW_PHASES.COMPLETE ? "done" : ""}>
                <i>2</i><span><strong>Revisar</strong><small>Resumen editable</small></span>
              </li>
              <li className={state.phase === FLOW_PHASES.COMPLETE ? "active" : ""}>
                <i>3</i><span><strong>Resolver</strong><small>Salida simulada</small></span>
              </li>
            </ol>
          </aside>

          <div className="generic-demo-panel">
            <div className="generic-demo-panel-topbar">
              <span><Icon size={20} /><i /></span>
              <p><strong>Asistente Mercamicro</strong><small>Demo interactiva · en línea</small></p>
              <button
                type="button"
                onClick={() => setState(restartDemoFlow(demo))}
                aria-label="Reiniciar demostración"
              ><RotateCcw size={18} /></button>
            </div>
            <div className="generic-demo-progress" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="generic-demo-panel-body">
              {state.phase === FLOW_PHASES.QUESTIONS && (
                <FlowQuestion demo={demo} state={state} setState={setState} headingRef={headingRef} />
              )}
              {state.phase === FLOW_PHASES.REVIEW && (
                <FlowReview demo={demo} state={state} setState={setState} headingRef={headingRef} />
              )}
              {state.phase === FLOW_PHASES.COMPLETE && (
                <FlowComplete demo={demo} state={state} setState={setState} headingRef={headingRef} />
              )}
            </div>
            <div className="generic-demo-panel-privacy">
              <LockKeyhole size={13} /> Esta prueba no guarda ni envía las respuestas.
            </div>
          </div>
        </section>

        <RelatedDemos demo={demo} />
      </main>

      <footer className="generic-demo-footer">
        <Brand href="/" />
        <span>Datos simulados · Sin operaciones reales</span>
        <a href="https://presupuestos.mercamicro.es">
          Cuéntanos tu caso <ArrowRight size={15} />
        </a>
      </footer>
    </div>
  );
}
