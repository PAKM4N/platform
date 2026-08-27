import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Braces,
  Check,
  ChevronRight,
  Clock3,
  Globe2,
  LayoutTemplate,
  MessagesSquare,
  RefreshCcw,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const DEMO_URL = "https://demos.mercamicro.es";

const CHATBOT_TYPES = [
  {
    id: "whatsapp-auto",
    label: "Respuestas automáticas de WhatsApp Business",
    implementation: "0–300 €",
    monthly: "0 €",
  },
  {
    id: "basic",
    label: "Chatbot básico con menús y reglas",
    implementation: "300–1.500 €",
    monthly: "30–250 €",
  },
  {
    id: "professional",
    label: "Chatbot profesional con bandeja de agentes",
    implementation: "1.000–5.000 €",
    monthly: "150–600 €",
  },
  {
    id: "ai",
    label: "Chatbot con inteligencia artificial",
    implementation: "2.500–10.000 €",
    monthly: "300–1.500 €",
  },
  {
    id: "ai-integrated",
    label: "Agente de IA conectado con CRM o ERP",
    implementation: "5.000–20.000 € o más",
    monthly: "600–3.000 € o más",
  },
  {
    id: "custom",
    label: "Desarrollo empresarial completamente a medida",
    implementation: "Presupuesto personalizado",
    monthly: "Presupuesto personalizado",
  },
];

const QUESTIONS = [
  {
    id: "type",
    text: "¿Qué tipo de solución se acerca más a lo que necesitas?",
    hint: "Elige una referencia. La ajustaremos contigo según el alcance real.",
    options: CHATBOT_TYPES.map(({ id, label }) => [id, label]),
  },
  {
    id: "website",
    text: "¿En qué entorno funcionará?",
    hint: "La web, si hay que crearla, se valora por separado del chatbot.",
    options: [
      ["whatsapp", "Solo WhatsApp; no necesito web"],
      ["existing", "En mi web actual"],
      ["landing", "En una landing nueva"],
      ["complete", "En una web completa nueva"],
    ],
  },
  {
    id: "goal",
    text: "¿Qué trabajo quieres que haga el chatbot?",
    hint: "Elige el objetivo principal; después podremos combinar funciones.",
    options: [
      ["support", "Responder consultas frecuentes"],
      ["leads", "Captar y cualificar contactos"],
      ["quotes", "Preparar presupuestos"],
      ["bookings", "Gestionar reservas o citas"],
    ],
  },
  {
    id: "channel",
    text: "¿Dónde debería atender a tus clientes?",
    hint: "Puedes empezar por un canal y ampliar después.",
    options: [
      ["web", "Página web"],
      ["whatsapp", "WhatsApp"],
      ["telegram", "Telegram"],
      ["multi", "Varios canales"],
    ],
  },
  {
    id: "integration",
    text: "¿Necesita conectarse con otras herramientas?",
    hint: "Por ejemplo, CRM, agenda, ERP, correo o una base de datos.",
    options: [
      ["none", "No, puede funcionar de forma independiente"],
      ["simple", "Sí, con una herramienta"],
      ["several", "Sí, con varios sistemas"],
      ["unknown", "No lo sé todavía"],
    ],
  },
];

function Brand() {
  return (
    <a className="budget-brand" href="#inicio" aria-label="Mercamicro, inicio">
      <img src="/mercamicro-logo.jpg" alt="" />
      <span>
        <strong>Mercamicro</strong>
        <small>Soluciones digitales a medida</small>
      </span>
    </a>
  );
}

function ProjectScope() {
  const stages = [
    ["01", "Estrategia y contenidos", "Objetivos, arquitectura y mensajes principales."],
    ["02", "Diseño UX/UI", "Prototipo responsive adaptado a tu marca."],
    ["03", "Desarrollo e integraciones", "Web, chatbot, analítica y conexiones necesarias."],
    ["04", "Lanzamiento y mejora", "Pruebas, despliegue y seguimiento de resultados."],
  ];

  return (
    <div className="project-scope">
      <div className="project-scope-heading">
        <small>ALCANCE HABITUAL</small>
        <strong>Web completa + asistente</strong>
      </div>
      <div className="project-scope-stages">
        {stages.map(([number, title, description]) => (
          <div className="project-scope-stage" key={number}>
            <span>{number}</span>
            <div>
              <b>{title}</b>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="project-scope-footer">
        <Check size={18} /> Una única experiencia, diseñada y construida de principio a fin.
      </div>
    </div>
  );
}

function Estimator({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const finished = step >= QUESTIONS.length;
  const result = CHATBOT_TYPES.find(({ id }) => id === answers.type) || CHATBOT_TYPES[0];
  const needsNewWebsite = answers.website === "landing" || answers.website === "complete";

  const choose = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    window.setTimeout(() => setStep((current) => current + 1), 120);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const goBack = () => {
    setStep((current) => Math.max(0, current - 1));
  };

  const question = QUESTIONS[step];

  return (
    <section className="budget-estimator" id="calculadora" aria-label="Estimador de proyecto">
      <div className="estimator-topbar">
        <span className="estimator-avatar"><Bot size={22} /></span>
        <span>
          <strong>Asistente de proyectos</strong>
          <small><i /> En línea · estimación orientativa</small>
        </span>
        {onClose && <button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>}
      </div>

      <div className="estimator-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${finished ? 1 : step / QUESTIONS.length})` }} />
      </div>

      <div className="estimator-body">
        {step > 0 && (
          <button type="button" className="estimator-back" onClick={goBack}>
            <ArrowLeft size={17} />
            {finished ? "Revisar respuestas" : "Respuesta anterior"}
          </button>
        )}
        {!finished ? (
          <>
            <div className="assistant-message">
              <small>Paso {step + 1} de {QUESTIONS.length}</small>
              <p>{question.text}</p>
              <span>{question.hint}</span>
            </div>
            <div className="estimator-options">
              {question.options.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  className={answers[question.id] === id ? "selected" : ""}
                  onClick={() => choose(question.id, id)}
                >
                  <span>{label}</span><ChevronRight size={17} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="estimator-result">
            <span className="result-icon"><Sparkles size={22} /></span>
            <small>REFERENCIA ORIENTATIVA</small>
            <h3>{result.label}</h3>
            <div className="result-prices">
              <span><small>Implantación</small><strong>{result.implementation}</strong></span>
              <span><small>Coste mensual</small><strong>{result.monthly}</strong></span>
            </div>
            <p>
              {needsNewWebsite
                ? "El diseño y desarrollo de la web se valoran por separado según su alcance."
                : "Confirmaremos funciones, canales e integraciones antes de preparar la propuesta cerrada."}
            </p>
            <div className="result-actions">
              <a href={DEMO_URL}>Ver una demo real <ArrowRight size={16} /></a>
              <button type="button" onClick={reset}><RefreshCcw size={15} /> Recalcular</button>
            </div>
          </div>
        )}
      </div>
      <p className="estimator-note"><ShieldCheck size={13} /> No envíes información personal o confidencial.</p>
    </section>
  );
}

export default function PresupuestosApp() {
  const [mobileEstimator, setMobileEstimator] = useState(false);

  const openEstimator = () => {
    setMobileEstimator(true);
    window.setTimeout(() => document.getElementById("calculadora")?.scrollIntoView({ behavior: "smooth" }), 20);
  };

  return (
    <div className="budget-site" id="inicio">
      <header className="budget-header">
        <Brand />
        <nav aria-label="Navegación principal">
          <a href="#solucion">Cómo funciona</a>
          <a href="#precios">Precios orientativos</a>
          <a href="#web-completa">Web completa</a>
          <a className="demo-link" href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
        </nav>
      </header>

      <main>
        <section className="budget-hero">
          <div className="budget-hero-copy">
            <span className="budget-eyebrow"><i /> DISEÑO WEB + AUTOMATIZACIÓN</span>
            <h1>Una web que explica bien. <em>Un bot que hace avanzar.</em></h1>
            <p>
              Diseñamos la web completa y el asistente que trabaja dentro de ella.
              Una experiencia coherente para presentar, atender, filtrar solicitudes,
              reservar y preparar presupuestos.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={openEstimator}>Orientar mi presupuesto <ArrowRight size={18} /></button>
              <a href={DEMO_URL}>Probar una demo real</a>
            </div>
            <div className="hero-proof">
              <span><Check size={15} /> Diseño y desarrollo propios</span>
              <span><Check size={15} /> Web y chatbot conectados</span>
              <span><Check size={15} /> Estimación sin compromiso</span>
            </div>
            <span className="hero-signature">MERCAMICRO · PROYECTOS DIGITALES A MEDIDA</span>
          </div>
          <div className={`hero-estimator ${mobileEstimator ? "is-visible" : ""}`}>
            <Estimator />
          </div>
        </section>

        <section className="pricing-section" id="precios">
          <div className="pricing-heading">
            <span className="budget-eyebrow"><i /> PRECIOS ORIENTATIVOS</span>
            <h2>Una referencia clara antes de definir el alcance.</h2>
            <p>El precio final depende de funciones, canales, integraciones y volumen de uso.</p>
          </div>
          <span className="pricing-scroll-hint">Desliza la tabla para comparar todos los importes →</span>
          <div className="pricing-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo de chatbot</th>
                  <th>Implantación orientativa</th>
                  <th>Coste mensual orientativo</th>
                </tr>
              </thead>
              <tbody>
                {CHATBOT_TYPES.map((type) => (
                  <tr key={type.id}>
                    <td data-label="Tipo de chatbot">{type.label}</td>
                    <td data-label="Implantación">{type.implementation}</td>
                    <td data-label="Coste mensual">{type.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pricing-note">Importes sin impuestos. Las licencias o consumos de terceros, si los hubiera, se detallan antes de contratar.</p>
        </section>

        <section className="solution-section" id="solucion">
          <div className="section-heading">
            <span className="budget-eyebrow">DEL PROBLEMA A UNA SOLUCIÓN ÚTIL</span>
            <h2>No añadimos un chat genérico. Diseñamos el recorrido completo.</h2>
          </div>
          <div className="solution-grid">
            <article>
              <span><MessagesSquare size={22} /></span><small>01</small>
              <h3>Entendemos el negocio</h3>
              <p>Ordenamos objetivos, preguntas, decisiones y excepciones antes de dibujar una sola pantalla.</p>
            </article>
            <article>
              <span><Workflow size={22} /></span><small>02</small>
              <h3>Diseñamos web y conversación</h3>
              <p>Contenido, interfaz y chatbot comparten una misma lógica para que el usuario nunca se pierda.</p>
            </article>
            <article>
              <span><Clock3 size={22} /></span><small>03</small>
              <h3>Conectamos, medimos y mejoramos</h3>
              <p>Integramos tus herramientas y usamos datos reales para decidir qué merece evolucionar.</p>
            </article>
          </div>
        </section>

        <section className="website-section" id="web-completa">
          <div className="website-copy">
            <span className="budget-eyebrow"><i /> TAMBIÉN HACEMOS LA WEB COMPLETA</span>
            <h2>No necesitas llegar con una web preparada.</h2>
            <p>
              Podemos encargarnos del proyecto entero: arquitectura, textos,
              diseño, desarrollo responsive, analítica, SEO técnico y despliegue.
              El chatbot nace integrado en la experiencia, no pegado al final.
            </p>
            <div className="website-services">
              <span><LayoutTemplate size={19} /><b>UX/UI a medida</b><small>Sin plantillas genéricas</small></span>
              <span><Braces size={19} /><b>Desarrollo completo</b><small>Rápido, accesible y mantenible</small></span>
              <span><SearchCheck size={19} /><b>SEO y analítica</b><small>Preparada para medir y crecer</small></span>
              <span><Globe2 size={19} /><b>Dominio y despliegue</b><small>Nos ocupamos de la puesta en marcha</small></span>
            </div>
            <button type="button" onClick={openEstimator}>Estimar web + chatbot <ArrowRight size={18} /></button>
          </div>
          <ProjectScope />
        </section>

        <section className="included-section" id="incluye">
          <div>
            <span className="budget-eyebrow">UNA PRIMERA VERSIÓN QUE YA APORTA VALOR</span>
            <h2>Una primera versión lista para trabajar.</h2>
            <p>Definimos un alcance concreto, lo ponemos a prueba y dejamos una base preparada para crecer.</p>
          </div>
          <ul>
            <li><Check size={17} /><span><strong>Diseño conversacional</strong>Preguntas, respuestas, validaciones y rutas alternativas.</span></li>
            <li><Check size={17} /><span><strong>Web actual o web completa</strong>Integramos el asistente o diseñamos toda la presencia digital.</span></li>
            <li><Check size={17} /><span><strong>Panel y seguimiento</strong>Registro de solicitudes y visibilidad sobre el uso del asistente.</span></li>
            <li><Check size={17} /><span><strong>Puesta en marcha</strong>Pruebas, despliegue y acompañamiento durante la activación.</span></li>
          </ul>
        </section>

        <section className="demo-callout">
          <div>
            <span className="budget-eyebrow">¿QUIERES VERLO EN ACCIÓN?</span>
            <h2>Prueba nuestros asistentes sectoriales.</h2>
            <p>Recorre una conversación completa y comprueba cómo un chatbot pregunta, valida y calcula una estimación.</p>
          </div>
          <a href={DEMO_URL}>Abrir las demos <Send size={17} /></a>
        </section>
      </main>

      <footer className="budget-footer">
        <Brand />
        <span>Chatbots útiles, medibles y hechos a medida.</span>
        <a href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
      </footer>
    </div>
  );
}
