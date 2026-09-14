"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "./router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Braces,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Gauge,
  Info,
  ListChecks,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  SERVICES,
  SERVICE_ORDER,
  calculateEstimate,
  initialValues,
} from "./service-models";

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function Brand({ href = "/", tag = "demo" }) {
  return (
    <Link className="brand" to={href} aria-label="Mercamicro, volver al inicio">
      <span className="brand-logo" aria-hidden="true">
        <img src="/mercamicro-logo.jpg" alt="" />
      </span>
      <span className="brand-name">mercamicro</span>
      <span className="demo-tag">{tag}</span>
    </Link>
  );
}

function Header({ onOpenDemo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav
          className={menuOpen ? "nav-links is-open" : "nav-links"}
          aria-label="Navegación principal"
        >
          <a href="#sectores" onClick={() => setMenuOpen(false)}>
            Modelos
          </a>
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
            Qué entrega
          </a>
          <button
            className="button button-dark nav-cta"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenDemo();
            }}
          >
            Abrir calculadora
            <ArrowRight size={16} />
          </button>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function FormulaCard() {
  return (
    <div className="formula-card" aria-label="Ejemplo del modelo de cálculo">
      <div className="formula-head">
        <span>MATRIZ DE PRECIO / 07</span>
        <Braces size={17} />
      </div>
      <div className="formula-body">
        <div>
          <small>01</small>
          <span>tarifa base</span>
          <strong>alcance × unidad</strong>
        </div>
        <div>
          <small>02</small>
          <span>condiciones</span>
          <strong>coeficientes</strong>
        </div>
        <div>
          <small>03</small>
          <span>complementos</span>
          <strong>partidas</strong>
        </div>
      </div>
      <div className="formula-result">
        <span>salida</span>
        <strong>rango estimado + desglose</strong>
      </div>
    </div>
  );
}

function Hero({ onOpenDemo }) {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Sistema de presupuestación configurable
        </div>
        <h1>
          Antes del precio,
          <br />
          <em>las preguntas correctas.</em>
        </h1>
        <p className="hero-lead">
          Siete recorridos de reserva pensados desde las variables reales de cada
          servicio. El cliente entiende la cifra; el negocio recibe una solicitud
          utilizable.
        </p>
        <div className="hero-actions">
          <button
            className="button button-primary button-large"
            type="button"
            onClick={onOpenDemo}
          >
            Configurar un caso
            <ArrowRight size={18} />
          </button>
          <a className="text-link" href="#sectores">
            Revisar los modelos
            <ArrowDown size={16} />
          </a>
        </div>
        <div className="hero-trust" aria-label="Características">
          <span>
            <Check size={14} /> Reglas por sector
          </span>
          <span>
            <Check size={14} /> Desglose auditable
          </span>
          <span>
            <Check size={14} /> Datos no persistentes
          </span>
        </div>
      </div>
      <div className="hero-visual" aria-label="Servicios configurados">
        <span className="hero-plate-index">A / 07</span>
        <div className="hero-image-wrap">
          <img
            src="/sectors/reformas.png"
            alt="Coche, cajas, herramientas, material de limpieza y pintura"
          />
        </div>
        <FormulaCard />
        <div className="visual-note">
          <span>CASO DE ESTUDIO</span>
          <strong>Una interfaz · siete lógicas de negocio</strong>
        </div>
      </div>
    </section>
  );
}

function SectorCard({ service, index, onSelect }) {
  const Icon = service.icon;

  return (
    <button
      className="sector-card"
      type="button"
      onClick={() => onSelect(service.id)}
      style={{
        "--service-color": service.accent,
        "--service-tint": service.tint,
      }}
    >
      <span className="card-number">MODELO / 0{index + 1}</span>
      <span className="sector-icon">
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <span className="sector-title">{service.name}</span>
      <span className="sector-description">{service.description}</span>
      <span className="sector-variables">
        {service.factors.map((factor) => (
          <i key={factor}>{factor}</i>
        ))}
      </span>
      <span className="sector-bottom">
        <span>
          {service.ruleCount} reglas · {service.from}
        </span>
        <span className="sector-arrow">
          <ArrowRight size={17} />
        </span>
      </span>
    </button>
  );
}

function Sectors({ onSelect }) {
  return (
    <section className="section sectors-section" id="sectores">
      <div className="section-heading">
        <div>
          <span className="kicker">Biblioteca de modelos</span>
          <h2>No es el mismo formulario con otro icono.</h2>
        </div>
        <div className="section-side-note">
          <span>07 sectores</span>
          <span>83 variables posibles</span>
          <span>01 motor común</span>
        </div>
      </div>
      <div className="sector-grid">
        {SERVICE_ORDER.map((id, index) => (
          <SectorCard
            key={id}
            service={SERVICES[id]}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function Progress({ step, service, onChange }) {
  const labels = [
    service.steps[1].label,
    service.steps[2].label,
    service.steps[3].label,
    "Estimación",
  ];

  return (
    <div className="progress-wrap">
      <div className="progress-labels" aria-label={`Paso ${step} de 4`}>
        {labels.map((label, index) => {
          const number = index + 1;
          return (
            <button
              type="button"
              disabled={number > step}
              onClick={() => onChange(number)}
              aria-current={number === step ? "step" : undefined}
              key={label}
              className={
                number === step ? "active" : number < step ? "done" : ""
              }
            >
              <i>{number < step ? <Check size={13} /> : number}</i>
              {label}
            </button>
          );
        })}
      </div>
      <div className="progress-track">
        <span style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>
    </div>
  );
}

function Field({ field, value, onChange, error }) {
  const inputId = `field-${field.id}`;

  if (field.type === "checkbox") {
    return (
      <label
        className={`check-field ${value ? "is-checked" : ""} ${
          field.width === "full" ? "full-field" : ""
        }`}
        htmlFor={inputId}
      >
        <span>
          <strong>{field.label}</strong>
          <small>{field.helper}</small>
        </span>
        <span className="switch-control">
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(field.id, event.target.checked)}
          />
          <i />
        </span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="field full-field" htmlFor={inputId}>
        <span>{field.label}</span>
        <textarea
          id={inputId}
          rows="4"
          maxLength={500}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.id, event.target.value)}
        />
      </label>
    );
  }

  return (
    <label
      className={`field ${field.width === "full" ? "full-field" : ""}`}
      htmlFor={inputId}
    >
      <span>{field.label}{field.type === "date" && <small> (opcional)</small>}</span>
      <div className="input-wrap">
        {field.type === "select" ? (
          <>
            <select
              id={inputId}
              value={value}
              onChange={(event) => onChange(field.id, event.target.value)}
            >
              {field.options.map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </>
        ) : (
          <>
            <input
              id={inputId}
              type={field.type}
              value={value}
              min={field.type === "date" ? new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) : field.min}
              max={field.max}
              step={/m²|m³|km/.test(field.suffix || "") ? "any" : 1}
              maxLength={160}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : undefined}
              placeholder={field.placeholder}
              onChange={(event) => {
                if (field.type === "number") {
                  const nextValue = event.target.value;
                  onChange(
                    field.id,
                    nextValue === ""
                      ? ""
                      : nextValue,
                  );
                } else {
                  onChange(field.id, event.target.value);
                }
              }}
            />
            {field.suffix && <b>{field.suffix}</b>}
          </>
        )}
      </div>
      {error && <small className="sector-field-error" id={`${inputId}-error`}>{error}</small>}
      {field.id === "distance" && <small className="field-help">Distancia aproximada: los códigos postales no calculan la ruta.</small>}
    </label>
  );
}

function ContactFields({ contact, onChange }) {
  const fields = [
    {
      id: "name",
      label: "Nombre y apellidos",
      icon: UserRound,
      type: "text",
      placeholder: "Nombre de contacto",
    },
    {
      id: "company",
      label: "Empresa (opcional)",
      icon: FileText,
      type: "text",
      placeholder: "Razón social",
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      type: "email",
      placeholder: "nombre@empresa.com",
    },
    {
      id: "phone",
      label: "Teléfono",
      icon: Phone,
      type: "tel",
      placeholder: "600 000 000",
    },
    {
      id: "postcode",
      label: "Código postal",
      icon: MapPin,
      type: "text",
      placeholder: "28001",
    },
  ];

  return (
    <details className="contact-area">
      <summary>Probar también los datos de contacto <span>Opcional · usa datos ficticios</span></summary>
      <div className="subheading">
        <div>
          <span className="section-count">B</span>
          <div>
            <h3>Así sería la recogida de contacto</h3>
            <p>Puedes dejar todo vacío. Estos datos no se envían a nadie.</p>
          </div>
        </div>
        <span className="privacy-note">
          <ShieldCheck size={15} /> Solo demostración
        </span>
      </div>
      <div className="contact-grid">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <label
              className="field"
              key={field.id}
              htmlFor={`contact-${field.id}`}
            >
              <span>{field.label}</span>
              <div className="input-wrap icon-input">
                <Icon size={17} />
                <input
                  id={`contact-${field.id}`}
                  type={field.type}
                  autoComplete="off"
                  maxLength={160}
                  value={contact[field.id]}
                  placeholder={field.placeholder}
                  onChange={(event) => onChange(field.id, event.target.value)}
                />
              </div>
            </label>
          );
        })}
        <label className="field" htmlFor="contact-channel">
          <span>Canal preferido</span>
          <div className="input-wrap">
            <select
              id="contact-channel"
              value={contact.channel}
              onChange={(event) => onChange("channel", event.target.value)}
            >
              <option value="email">Email</option>
              <option value="phone">Llamada</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </div>
        </label>
      </div>
      <label className="field full-field" htmlFor="contact-notes">
        <span>
          Observaciones <small>(opcional)</small>
        </span>
        <textarea
          id="contact-notes"
          rows="4"
          maxLength={500}
          value={contact.notes}
          placeholder="Restricciones de acceso, flexibilidad de fechas, necesidades especiales…"
          onChange={(event) => onChange("notes", event.target.value)}
        />
      </label>
    </details>
  );
}

function EstimateSidebar({ service, estimate, step, answeredFields }) {
  const Icon = service.icon;
  return (
    <aside className="estimate-sidebar">
      <div className="summary-service">
        <span style={{ background: service.tint, color: service.accent }}>
          <Icon size={21} />
        </span>
        <div>
          <small>Tu simulación</small>
          <strong>{service.name}</strong>
        </div>
        <span className="model-code">
          {service.id.slice(0, 3).toUpperCase()}-{service.ruleCount}
        </span>
      </div>
      <div className="estimate-value">
        <span>Rango {step === 4 ? "calculado" : "provisional"}</span>
        <strong>
          {euro.format(estimate.rangeMin)} – {euro.format(estimate.rangeMax)}
        </strong>
        <small>IVA incluido · se actualiza con cada respuesta</small>
      </div>
      <div className="sidebar-metrics">
        <div>
          <Gauge size={15} />
          <span>
            <small>Opciones del servicio</small>
            <strong>
              {answeredFields} / {service.fields.length}
            </strong>
          </span>
        </div>
        <div>
          <ListChecks size={15} />
          <span>
            <small>Prueba sin registro</small>
            <strong>Datos de ejemplo</strong>
          </span>
        </div>
      </div>
      <div className="summary-label">DESGLOSE ACTUAL</div>
      <div className="summary-lines">
        {estimate.lines.slice(0, 7).map((line) => (
          <div key={line.label}>
            <span>{line.label}</span>
            <strong>{euro.format(line.amount)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span>Base antes de IVA</span>
        <strong>{euro.format(estimate.subtotal)}</strong>
      </div>
      <div className="summary-note">
        <Info size={17} />
        <span>
          <strong>Por qué mostramos un rango</strong>
          La cifra final depende de disponibilidad, revisión profesional y datos
          que requieren comprobación.
        </span>
      </div>
    </aside>
  );
}

function FinalEstimate({ service, estimate, contact, onRestart, onNotify, headingRef }) {
  const Icon = service.icon;
  const ref = `APR-${service.id.slice(0, 3).toUpperCase()}-${String(
    Math.round(estimate.total),
  ).padStart(4, "0")}`;

  return (
    <div className="final-result">
      <div className="result-top">
        <span className="success-icon">
          <CircleCheck size={26} />
        </span>
        <div>
          <span className="kicker">Estimación preparada</span>
          <h2 ref={headingRef} tabIndex={-1}>Este sería tu presupuesto orientativo.</h2>
          <p>
            Comprueba el desglose y prueba a cambiar las opciones para comparar.
            Es una simulación: no has contratado ni reservado ningún servicio.
          </p>
        </div>
      </div>
      <div className="result-ticket">
        <div className="ticket-head">
          <span className="ticket-service" style={{ color: service.accent }}>
            <Icon size={22} />
            {service.name}
          </span>
          <span className="reference">{ref}</span>
        </div>
        <div className="ticket-price">
          <span>Rango orientativo</span>
          <strong>
            {euro.format(estimate.rangeMin)} – {euro.format(estimate.rangeMax)}
          </strong>
          <small>IVA incluido · sujeto a validación profesional</small>
        </div>
        <div className="ticket-lines">
          {estimate.lines.map((line) => (
            <div key={line.label}>
              <span>
                <Check size={14} /> {line.label}
              </span>
              <strong>{euro.format(line.amount)}</strong>
            </div>
          ))}
          <div>
            <span>IVA (21 %)</span>
            <strong>{euro.format(estimate.tax)}</strong>
          </div>
        </div>
        <div className="ticket-footer">
          <span>
            <Clock3 size={16} /> Disponibilidad por confirmar
          </span>
          <span>
            <BadgeCheck size={16} /> Estimación sin compromiso
          </span>
        </div>
      </div>
      <div className="result-contact">
        <div>
          <small>Ejemplo de solicitud</small>
          <strong>{contact.name || "Cliente de demostración"}</strong>
          <span>{contact.email || "email@ejemplo.com"}</span>
        </div>
        <button className="button button-primary" type="button" onClick={onNotify}>
          Simular envío
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="result-actions">
        <button className="text-button" type="button" onClick={onRestart}>
          <ArrowLeft size={16} />
          Modificar solicitud
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => window.print()}
        >
          <Download size={16} />
          Guardar resumen
        </button>
      </div>
      <a className="sector-project-link" href="https://presupuestos.mercamicro.es/#configurador">
        Quiero un simulador así para mi negocio <ArrowRight size={18} />
      </a>
    </div>
  );
}

export function Estimator({
  activeId,
  setActiveId,
  estimatorRef,
  standalone = false,
}) {
  const service = SERVICES[activeId];
  const [step, setStep] = useState(1);
  const [valuesByService, setValuesByService] = useState(() =>
    Object.fromEntries(
      SERVICE_ORDER.map((id) => [id, initialValues(SERVICES[id])]),
    ),
  );
  const [contact, setContact] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    postcode: "",
    channel: "email",
    notes: "",
  });
  const [toast, setToast] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const headingRef = useRef(null);
  const previousStep = useRef(step);
  const values = valuesByService[activeId];
  const estimate = useMemo(
    () => calculateEstimate(activeId, values),
    [activeId, values],
  );
  const answeredFields = service.fields.filter((field) => {
    const value = values[field.id];
    return value !== "" && value !== false && value !== 0;
  }).length;

  useEffect(() => {
    setStep(1);
    setFieldErrors({});
    setToast(false);
  }, [activeId]);

  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus({ preventScroll: true });
    previousStep.current = step;
  }, [step]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const changeValue = (fieldId, value) => {
    setFieldErrors((current) => ({ ...current, [fieldId]: "" }));
    setValuesByService((current) => ({
      ...current,
      [activeId]: { ...current[activeId], [fieldId]: value },
    }));
  };

  const goToStep = (nextStep) => {
    if (nextStep > step) {
      const errors = {};
      for (const field of service.fields.filter((item) => item.step === step)) {
        const value = values[field.id];
        if (field.type === "number" && (String(value).trim() === "" || !Number.isFinite(Number(value)))) {
          errors[field.id] = "Introduce una cantidad para calcular el presupuesto.";
        } else if (field.type === "number" && (Number(value) < field.min || Number(value) > field.max)) {
          errors[field.id] = `Introduce un valor entre ${field.min} y ${field.max}.`;
        } else if (field.type === "number" && !/m²|m³|km/.test(field.suffix || "") && !Number.isInteger(Number(value))) {
          errors[field.id] = "Introduce un número entero.";
        } else if (field.type === "date" && value && value < new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)) {
          errors[field.id] = "Elige hoy o una fecha futura, o deja la fecha vacía.";
        } else if (/postcode/i.test(field.id) && value && !/^(?:0[1-9]|[1-4][0-9]|5[0-2])[0-9]{3}$/.test(String(value).trim())) {
          errors[field.id] = "Introduce un código postal español de 5 cifras, o deja el campo vacío.";
        }
      }
      setFieldErrors(errors);
      if (Object.keys(errors).length) {
        window.requestAnimationFrame(() => document.getElementById(`field-${Object.keys(errors)[0]}`)?.focus());
        return;
      }
    }
    setFieldErrors({});
    setStep(Math.min(4, Math.max(1, nextStep)));
    estimatorRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  };

  const notify = () => {
    setToast(true);
  };

  const StepIcon =
    step === 1
      ? ClipboardList
      : step === 2
        ? SlidersHorizontal
        : CalendarDays;

  return (
    <section
      className={`estimator-section ${standalone ? "is-standalone" : ""}`}
      id="calculadora"
      ref={estimatorRef}
    >
      <div className="estimator-heading-row">
        <div className="estimator-intro">
          <span className="kicker">
            {standalone ? "Tu presupuesto, paso a paso" : "Laboratorio de cálculo"}
          </span>
          <h2>
            {standalone
              ? service.question
              : "Prueba una solicitud con detalle."}
          </h2>
          <p>
            {standalone
              ? "Empieza con los valores de ejemplo y ajústalos a tu caso. Verás cómo cambia el precio, sin registro ni datos personales."
              : "Cada recorrido conserva su lógica, pero comparte el mismo sistema de salida y revisión."}
          </p>
        </div>
        <dl className="estimator-spec">
          <div>
            <dt>Recorrido</dt>
            <dd>4 etapas</dd>
          </div>
          <div>
            <dt>Duración</dt>
            <dd>2–3 minutos</dd>
          </div>
          <div>
            <dt>Salida</dt>
            <dd>Rango + partidas</dd>
          </div>
        </dl>
      </div>
      {!standalone && (
        <div
          className="service-tabs"
          role="tablist"
          aria-label="Tipo de presupuesto"
        >
          {SERVICE_ORDER.map((id, index) => {
            const tabService = SERVICES[id];
            const Icon = tabService.icon;
            return (
              <button
                key={id}
                className={id === activeId ? "service-tab active" : "service-tab"}
                type="button"
                role="tab"
                aria-selected={id === activeId}
                onClick={() => setActiveId?.(id)}
              >
                <small>0{index + 1}</small>
                <Icon size={18} />
                <span>{tabService.shortName}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="estimator-shell">
        <div className="estimator-main">
          <Progress step={step} service={service} onChange={goToStep} />
          {step < 4 ? (
            <form noValidate onSubmit={(event) => { event.preventDefault(); goToStep(step + 1); }}>
              <div className="form-heading">
                <span
                  className="form-icon"
                  style={{ background: service.tint, color: service.accent }}
                >
                  <StepIcon size={23} />
                </span>
                <div>
                  <span>
                    SECCIÓN A · 0{step} / 03
                  </span>
                  <h2 ref={headingRef} tabIndex={-1}>{service.steps[step].title}</h2>
                  <p>{service.steps[step].description}</p>
                </div>
              </div>
              <div className="field-section-label">
                <span>A</span>
                <strong>Información del servicio</strong>
                <small>
                  {
                    service.fields.filter((field) => field.step === step)
                      .length
                  }{" "}
                  campos
                </small>
              </div>
              <div className="fields-grid">
                {service.fields
                  .filter((field) => field.step === step)
                  .map((field) => (
                    <Field
                      key={field.id}
                      field={field}
                      value={values[field.id]}
                      onChange={changeValue}
                      error={fieldErrors[field.id]}
                    />
                  ))}
              </div>
              {step === 3 && (
                <ContactFields
                  contact={contact}
                  onChange={(fieldId, value) =>
                    setContact((current) => ({
                      ...current,
                      [fieldId]: value,
                    }))
                  }
                />
              )}
              <div className="form-actions">
                {step > 1 ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => goToStep(step - 1)}
                  >
                    <ArrowLeft size={17} />
                    Volver
                  </button>
                ) : (
                  <span className="form-hint">
                    <Info size={14} />
                    Valores de ejemplo: puedes cambiarlos todos.
                  </span>
                )}
                <button
                  className="button button-primary"
                  type="submit"
                >
                  {step === 3 ? "Calcular estimación" : "Continuar"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          ) : (
            <FinalEstimate
              service={service}
              estimate={estimate}
              contact={contact}
              onRestart={() => goToStep(1)}
              onNotify={notify}
              headingRef={headingRef}
            />
          )}
        </div>
        <EstimateSidebar
          service={service}
          estimate={estimate}
          step={step}
          answeredFields={answeredFields}
        />
      </div>
      <div
        className={toast ? "toast is-visible" : "toast"}
        role="status"
        aria-live="polite"
      >
        <span>
          <Check size={17} />
        </span>
        <div>
          <strong>Simulación completada</strong>
          <small>
            Has probado el paso de envío. Esta demo no envía correos ni crea reservas.
          </small>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const items = [
    {
      number: "01",
      icon: ClipboardList,
      title: "Un briefing que se puede trabajar",
      text: "La solicitud llega ordenada por alcance, condiciones, extras y contacto.",
    },
    {
      number: "02",
      icon: SlidersHorizontal,
      title: "Una cifra que se puede explicar",
      text: "Cada suplemento aparece como partida y cada coeficiente tiene un motivo.",
    },
    {
      number: "03",
      icon: Send,
      title: "Un siguiente paso inequívoco",
      text: "Validar, solicitar una visita o confirmar la reserva sin rehacer preguntas.",
    },
  ];

  return (
    <section className="how-section" id="como-funciona">
      <div className="how-copy">
        <span className="kicker light">Salida operativa</span>
        <h2>La demo termina donde empieza el trabajo comercial.</h2>
        <p>
          La interfaz no sustituye la revisión profesional. La prepara: reduce
          intercambios, hace visible la lógica del precio y deja claro qué falta por
          validar.
        </p>
        <span className="how-code">OUTPUT / LEAD QUALIFIED</span>
      </div>
      <div className="how-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.number}>
              <span>{item.number}</span>
              <Icon size={21} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ onOpenDemo }) {
  return (
    <footer>
      <div className="footer-cta">
        <span className="kicker">Siguiente iteración</span>
        <h2>Tarifas, zonas, marca y disponibilidad pueden ser las tuyas.</h2>
        <button
          className="button button-primary button-large"
          type="button"
          onClick={onOpenDemo}
        >
          Volver al laboratorio
          <ArrowRight size={18} />
        </button>
      </div>
      <div className="footer-bottom">
        <Brand />
        <span>PoC de presupuestación · {new Date().getFullYear()}</span>
        <span>Versión de estudio / datos de ejemplo</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeService, setActiveService] = useState("vehicles");
  const estimatorRef = useRef(null);

  const openDemo = (serviceId = activeService) => {
    setActiveService(serviceId);
    window.setTimeout(() => {
      estimatorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <>
      <Header onOpenDemo={() => openDemo()} />
      <main>
        <Hero onOpenDemo={() => openDemo()} />
        <Sectors onSelect={openDemo} />
        <Estimator
          activeId={activeService}
          setActiveId={setActiveService}
          estimatorRef={estimatorRef}
        />
        <HowItWorks />
      </main>
      <Footer onOpenDemo={() => openDemo()} />
    </>
  );
}
