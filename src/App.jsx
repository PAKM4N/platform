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

function Progress({ step, service }) {
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
            <span
              key={label}
              className={
                number === step ? "active" : number < step ? "done" : ""
              }
            >
              <i>{number < step ? <Check size={13} /> : number}</i>
              {label}
            </span>
          );
        })}
      </div>
      <div className="progress-track">
        <span style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>
    </div>
  );
}

function Field({ field, value, onChange }) {
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
      <span>{field.label}</span>
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
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              onChange={(event) => {
                if (field.type === "number") {
                  const nextValue = event.target.value;
                  onChange(
                    field.id,
                    nextValue === ""
                      ? ""
                      : Math.min(
                          field.max,
                          Math.max(field.min, Number(nextValue)),
                        ),
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
    <div className="contact-area">
      <div className="subheading">
        <div>
          <span className="section-count">B</span>
          <div>
            <h3>Datos para devolver la valoración</h3>
            <p>La demo procesa todo localmente: no guarda ni envía información.</p>
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
          value={contact.notes}
          placeholder="Restricciones de acceso, flexibilidad de fechas, necesidades especiales…"
          onChange={(event) => onChange("notes", event.target.value)}
        />
      </label>
    </div>
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
          <small>Modelo activo</small>
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
            <small>Variables informadas</small>
            <strong>
              {answeredFields} / {service.fields.length}
            </strong>
          </span>
        </div>
        <div>
          <ListChecks size={15} />
          <span>
            <small>Reglas disponibles</small>
            <strong>{service.ruleCount}</strong>
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

function FinalEstimate({ service, estimate, contact, onRestart, onNotify }) {
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
          <h2>Una cifra con contexto, no una promesa vacía.</h2>
          <p>
            El rango recoge las respuestas y reglas activas. Antes de aceptar, el
            proveedor puede validar los puntos que requieren comprobación.
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
            <Clock3 size={16} /> {service.timeline}
          </span>
          <span>
            <BadgeCheck size={16} /> Estimación sin compromiso
          </span>
        </div>
      </div>
      <div className="result-contact">
        <div>
          <small>Solicitud preparada para</small>
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
  }, [activeId]);

  const changeValue = (fieldId, value) => {
    setValuesByService((current) => ({
      ...current,
      [activeId]: { ...current[activeId], [fieldId]: value },
    }));
  };

  const goToStep = (nextStep) => {
    setStep(Math.min(4, Math.max(1, nextStep)));
    estimatorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const notify = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 3800);
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
              ? "Responde solo lo que afecta al servicio. Verás cómo cada decisión modifica el rango y su desglose."
              : "Cada recorrido conserva su lógica, pero comparte el mismo sistema de salida y revisión."}
          </p>
        </div>
        <dl className="estimator-spec">
          <div>
            <dt>Recorrido</dt>
            <dd>4 etapas</dd>
          </div>
          <div>
            <dt>Modelo activo</dt>
            <dd>{service.ruleCount} reglas</dd>
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
          <Progress step={step} service={service} />
          {step < 4 ? (
            <>
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
                  <h2>{service.steps[step].title}</h2>
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
                    Puedes cambiar de modelo sin perder los datos.
                  </span>
                )}
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => goToStep(step + 1)}
                >
                  {step === 3 ? "Calcular estimación" : "Continuar"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : (
            <FinalEstimate
              service={service}
              estimate={estimate}
              contact={contact}
              onRestart={() => goToStep(3)}
              onNotify={notify}
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
            En producción se enviaría la solicitud y se registraría el seguimiento.
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
