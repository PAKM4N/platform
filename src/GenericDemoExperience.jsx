import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheckBig,
  Clock3,
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
  buildDemoResult,
  buildDemoSummary,
  createDemoFlowState,
  currentDemoQuestion,
  demoDateToday,
  editDemoAnswer,
  goBackDemoFlow,
  restartDemoFlow,
  setDemoAnswer,
  toggleDemoAnswer,
} from "./demo-flow-engine";
import { iconForDemo } from "./demo-icons";
import { Link } from "./router";

function QuestionInput({ question, value, error, onChange, onToggle }) {
  const describedBy = `demo-question-hint${error ? " demo-question-error" : ""}`;
  if (question.type === "single" || question.type === "multi") {
    const selectedValues = new Set(
      question.type === "multi" && Array.isArray(value) ? value : [value],
    );
    return (
      <fieldset
        className={`generic-demo-options is-${question.type}`}
        aria-describedby={describedBy}
      >
        <legend className="demo-visually-hidden">{question.label}</legend>
        {question.options.map((option) => {
          const selected = selectedValues.has(option.value);
          return (
            <label
              className={`generic-demo-option${selected ? " is-selected" : ""}`}
              key={option.value}
            >
              <input
                type={question.type === "single" ? "radio" : "checkbox"}
                name={`demo-${question.id}`}
                value={option.value}
                checked={selected}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                onChange={() => question.type === "multi" ? onToggle(option.value) : onChange(option.value)}
              />
              <span className="generic-demo-option-marker" aria-hidden="true">
                {selected ? <Check size={15} /> : null}
              </span>
              <span>{option.label}</span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  if (question.type === "text") {
    return (
      <div className="generic-demo-text-field">
        <textarea
          className="generic-demo-textarea"
          aria-label={question.label}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          rows="4"
          maxLength={question.maxLength ?? 500}
          value={value || ""}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="generic-demo-field-meta">{(value || "").length} / {question.maxLength ?? 500} caracteres</span>
      </div>
    );
  }

  return (
    <div>
      <label className="generic-demo-input">
        <span>{question.type === "date" ? "Fecha de ejemplo" : "Cantidad"}</span>
        <span>
          <input
            aria-label={question.label}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            type={question.type}
            inputMode={question.type === "number" ? "numeric" : undefined}
            step={question.type === "number" ? (question.integer ? 1 : "any") : undefined}
            value={value ?? ""}
            min={question.type === "date" ? (question.minDate === "today" ? demoDateToday() : question.minDate) : question.min}
            max={question.type === "date" ? question.maxDate : question.max}
            onChange={(event) => onChange(event.target.value)}
          />
          {question.suffix && <b>{question.suffix}</b>}
        </span>
      </label>
      {question.type === "date" && (
        <div className="generic-demo-date-shortcuts" aria-label="Fechas rápidas">
          {[[0, "Hoy"], [1, "Mañana"], [7, "En una semana"]].map(([days, label]) => {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + days);
            const dateValue = demoDateToday(nextDate);
            return <button type="button" aria-pressed={value === dateValue} key={days} onClick={() => onChange(dateValue)}>{label}</button>;
          })}
        </div>
      )}
    </div>
  );
}

function FlowQuestion({ demo, state, setState, headingRef }) {
  const question = currentDemoQuestion(demo, state);
  const value = state.answers[question.id];
  const selectedCount = Array.isArray(value) ? value.length : 0;

  return (
    <form className="generic-demo-question-form" noValidate onSubmit={(event) => {
      event.preventDefault();
      setState((current) => advanceDemoFlow(demo, current));
    }}>
      <div className="generic-demo-message">
        <small>
          PREGUNTA {String(state.currentIndex + 1).padStart(2, "0")} / {String(demo.questions.length).padStart(2, "0")}
          {!question.required && <span className="generic-demo-optional">Opcional</span>}
        </small>
        <h2 ref={headingRef} tabIndex="-1">{question.label}</h2>
        <p id="demo-question-hint">{question.hint}</p>
      </div>

      {state.notice && <p className="generic-demo-notice" role="status">{state.notice}</p>}

      <QuestionInput
        question={question}
        value={value}
        error={state.error}
        onChange={(nextValue) =>
          setState((current) => setDemoAnswer(current, question, nextValue, demo))
        }
        onToggle={(nextValue) =>
          setState((current) => toggleDemoAnswer(current, question, nextValue, demo))
        }
      />

      {question.type === "multi" && <p className="generic-demo-field-meta" aria-live="polite">{selectedCount ? `${selectedCount} ${selectedCount === 1 ? "opción seleccionada" : "opciones seleccionadas"}` : question.required ? "Selecciona al menos una opción." : "Puedes continuar sin seleccionar servicios adicionales."}</p>}
      {state.error && <p id="demo-question-error" className="generic-demo-error" role="alert">{state.error}</p>}

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
            <LockKeyhole size={14} /> Sin registro ni envío de datos
          </span>
        )}
        <button
          className="generic-demo-button is-primary"
          type="submit"
        >
          {state.editingFromReview
            ? "Guardar y revisar"
            : state.currentIndex === demo.questions.length - 1
              ? "Revisar respuestas"
              : "Continuar"}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}

function FlowReview({ demo, state, setState, headingRef }) {
  const summary = buildDemoSummary(demo, state);
  return (
    <>
      <div className="generic-demo-message is-review">
        <small>UN ÚLTIMO VISTAZO</small>
        <h2 ref={headingRef} tabIndex="-1">¿Está todo como quieres?</h2>
        <p>Revisa tus respuestas o modifica cualquier detalle antes de ver el resultado de ejemplo.</p>
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
          Ver resultado de ejemplo <ArrowRight size={17} />
        </button>
      </div>
    </>
  );
}

function FlowComplete({ demo, state, setState, headingRef }) {
  const result = buildDemoResult(demo, state);
  const summary = buildDemoSummary(demo, state);
  return (
    <div className="generic-demo-complete">
      <span className="generic-demo-complete-icon"><CircleCheckBig size={30} /></span>
      <small>ASÍ TERMINARÍA LA CONVERSACIÓN</small>
      <h2 ref={headingRef} tabIndex="-1">{result.title}</h2>
      <p>{result.description}</p>
      <span className="generic-demo-result-status">
        <Sparkles size={16} /> {result.status}
      </span>
      <details className="generic-demo-result-summary" open>
        <summary>Tus respuestas de ejemplo <span>{summary.length} datos</span></summary>
        <dl>{summary.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
      </details>
      <div className="generic-demo-next-steps">
        <small>EL SIGUIENTE PASO EN TU NEGOCIO</small>
        {result.nextSteps.map((step, index) => (
          <span key={step}><i>{index + 1}</i>{step}</span>
        ))}
      </div>
      <div className="generic-demo-result-cta">
        <strong>¿Te imaginas esto en tu negocio?</strong>
        <p>Podemos adaptar las preguntas, conectar tu agenda y dar el salto de esta prueba a tu web.</p>
        <a href="https://presupuestos.mercamicro.es">Quiero un asistente así <ArrowRight size={17} /></a>
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
        <h2>Otra forma de facilitarle el día a tus clientes.</h2>
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
  const [confirmRestart, setConfirmRestart] = useState(false);
  const headingRef = useRef(null);
  const previousView = useRef(`${state.phase}:${state.currentIndex}`);
  const Icon = iconForDemo(demo.icon);
  const legacyLinks = demo.legacyLinks || [];
  const category = DEMO_CATEGORIES.find((item) => item.id === demo.category);
  const progress = useMemo(() => {
    if (state.phase === FLOW_PHASES.COMPLETE) return 100;
    if (state.phase === FLOW_PHASES.REVIEW) return 92;
    return (state.currentIndex / (demo.questions.length + 1)) * 100;
  }, [demo.questions.length, state.currentIndex, state.phase]);

  useEffect(() => {
    const view = `${state.phase}:${state.currentIndex}`;
    if (previousView.current !== view) {
      headingRef.current?.focus({ preventScroll: true });
      const panel = headingRef.current?.closest(".generic-demo-panel");
      if (panel && (panel.getBoundingClientRect().top < 60 || panel.getBoundingClientRect().top > window.innerHeight * 0.55)) {
        panel.scrollIntoView({ block: "start", behavior: "auto" });
      }
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
          <Link to="/#biblioteca-demos" aria-label="Volver a la biblioteca de demos"><ArrowLeft size={16} /> Biblioteca de demos</Link>
          {legacyLinks.map(({ path, label }) => (
            <Link to={path} key={path}>{label}</Link>
          ))}
        </nav>
      </header>

      <main id="contenido-principal" tabIndex={-1}>
        <section className="generic-demo-hero">
          <div className="generic-demo-hero-copy">
            <span className="generic-demo-hero-icon"><Icon size={27} /></span>
            <span className="portal-eyebrow">{demo.eyebrow}</span>
            <h1>{demo.name}</h1>
            <p>{demo.description}</p>
            <div className="generic-demo-tags">
              {demo.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
            </div>
            <a className="generic-demo-start-link" href="#probar-demo">Empezar la prueba <ArrowRight size={17} /></a>
          </div>
          <div className="generic-demo-hero-facts">
            <span><Clock3 size={18} /><small>Solo un minuto</small><strong>{demo.questions.length} preguntas sencillas</strong></span>
            <span><RotateCcw size={18} /><small>A tu ritmo</small><strong>Puedes cambiar respuestas</strong></span>
            <span><LockKeyhole size={18} /><small>Sin registro</small><strong>Usa datos de ejemplo</strong></span>
          </div>
        </section>

        <section className="generic-demo-workspace" id="probar-demo" aria-label={`Demo interactiva de ${demo.name}`}>
          <aside className="generic-demo-guide">
            <span className="generic-demo-guide-icon"><Icon size={24} /></span>
            <small>{category.label}</small>
            <h2>Ponte en el lugar de tu cliente.</h2>
            <p>
              Responde como lo haría alguien que visita tu web. En un minuto
              tendrás una solicitud clara, sin llamadas ni idas y vueltas.
            </p>
            <ol>
              <li aria-current={state.phase === FLOW_PHASES.QUESTIONS ? "step" : undefined} className={state.phase === FLOW_PHASES.QUESTIONS ? "active" : "done"}>
                <i>1</i><span><strong>Cuéntanos qué necesitas</strong><small>{demo.questions.length} preguntas breves</small></span>
              </li>
              <li aria-current={state.phase === FLOW_PHASES.REVIEW ? "step" : undefined} className={state.phase === FLOW_PHASES.REVIEW ? "active" : state.phase === FLOW_PHASES.COMPLETE ? "done" : ""}>
                <i>2</i><span><strong>Revisa los detalles</strong><small>Cambia lo que quieras</small></span>
              </li>
              <li aria-current={state.phase === FLOW_PHASES.COMPLETE ? "step" : undefined} className={state.phase === FLOW_PHASES.COMPLETE ? "active" : ""}>
                <i>3</i><span><strong>Descubre el resultado</strong><small>Una solicitud bien preparada</small></span>
              </li>
            </ol>
          </aside>

          <div className="generic-demo-panel">
            <div className="generic-demo-panel-topbar">
              <span><Icon size={20} /><i /></span>
              <p><strong>Tu asistente de ejemplo</strong><small>Prueba interactiva · sin operaciones reales</small></p>
              <button
                type="button"
                onClick={() => {
                  if (Object.keys(state.answers).length) setConfirmRestart(true);
                  else setState(restartDemoFlow(demo));
                }}
                aria-label="Reiniciar demostración"
                aria-expanded={confirmRestart}
              ><RotateCcw size={18} /></button>
            </div>
            {confirmRestart && <div className="generic-demo-restart-prompt" role="group" aria-label="Confirmar reinicio">
              <p><strong>¿Empezar de nuevo?</strong> Se borrarán las respuestas de esta prueba.</p>
              <button className="generic-demo-button is-secondary" type="button" onClick={() => setConfirmRestart(false)}>Seguir con mi prueba</button>
              <button className="generic-demo-button is-primary" type="button" onClick={() => { setState(restartDemoFlow(demo)); setConfirmRestart(false); }}>Sí, reiniciar</button>
            </div>}
            <div className="generic-demo-progress" role="progressbar" aria-label="Progreso de la demostración" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={state.phase === FLOW_PHASES.COMPLETE ? "Demostración completada" : state.phase === FLOW_PHASES.REVIEW ? "Revisión de respuestas" : `Pregunta ${state.currentIndex + 1} de ${demo.questions.length}`}>
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
