import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  MessagesSquare,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const DEMO_URL = "https://demos.mercamicro.es";

const QUESTIONS = [
  {
    id: "goal",
    text: "¿Qué trabajo quieres que haga el chatbot?",
    hint: "Elige el objetivo principal; después podremos combinar funciones.",
    options: [
      ["support", "Responder consultas frecuentes", 900],
      ["leads", "Captar y cualificar contactos", 1200],
      ["quotes", "Preparar presupuestos", 1700],
      ["bookings", "Gestionar reservas o citas", 1500],
    ],
  },
  {
    id: "channel",
    text: "¿Dónde debería atender a tus clientes?",
    hint: "Puedes empezar por un canal y ampliar después.",
    options: [
      ["web", "En mi página web", 0],
      ["whatsapp", "WhatsApp", 850],
      ["telegram", "Telegram", 450],
      ["multi", "En varios canales", 1300],
    ],
  },
  {
    id: "integration",
    text: "¿Necesita conectarse con otras herramientas?",
    hint: "Por ejemplo, CRM, agenda, ERP, correo o una base de datos.",
    options: [
      ["none", "No, puede funcionar de forma independiente", 0],
      ["simple", "Sí, con una herramienta", 750],
      ["several", "Sí, con varios sistemas", 1700],
      ["unknown", "No lo sé todavía", 450],
    ],
  },
  {
    id: "conversation",
    text: "¿Cómo debe conversar?",
    hint: "Esto determina la lógica y el trabajo de entrenamiento.",
    options: [
      ["guided", "Flujo guiado con opciones claras", 0],
      ["hybrid", "Guiado, pero entendiendo texto libre", 950],
      ["ai", "Conversación avanzada con IA", 2100],
      ["unknown", "Quiero que me recomendéis", 650],
    ],
  },
];

function estimate(answers) {
  const subtotal = QUESTIONS.reduce((total, question) => {
    const option = question.options.find(([id]) => id === answers[question.id]);
    return total + (option?.[2] || 0);
  }, 0);
  const base = 950 + subtotal;
  return {
    minimum: Math.round(base / 100) * 100,
    maximum: Math.round((base * 1.32 + 350) / 100) * 100,
  };
}

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

function Estimator({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const finished = step >= QUESTIONS.length;
  const result = useMemo(() => estimate(answers), [answers]);

  const choose = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    window.setTimeout(() => setStep((current) => current + 1), 120);
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const question = QUESTIONS[step];

  return (
    <section className="budget-estimator" id="calculadora" aria-label="Estimador de chatbot">
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
            <span className="result-icon"><Sparkles size={23} /></span>
            <small>PRIMERA ESTIMACIÓN</small>
            <h3>{result.minimum.toLocaleString("es-ES")} € — {result.maximum.toLocaleString("es-ES")} €</h3>
            <p>
              Esta horquilla sirve para situar el proyecto. Revisaremos contigo
              los flujos, integraciones y alcance antes de preparar una propuesta cerrada.
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
          <a href="#incluye">Qué incluye</a>
          <a className="demo-link" href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
        </nav>
      </header>

      <main>
        <section className="budget-hero">
          <div className="budget-hero-copy">
            <span className="budget-eyebrow"><i /> CHATBOTS A MEDIDA PARA NEGOCIOS</span>
            <h1>Tu próximo chatbot empieza con una <em>conversación.</em></h1>
            <p>
              Cuéntanos qué necesitas y obtén una primera estimación. Diseñamos
              asistentes que atienden, filtran solicitudes, reservan y preparan presupuestos.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={openEstimator}>Calcular mi proyecto <ArrowRight size={17} /></button>
              <a href={DEMO_URL}>Probar una demo real</a>
            </div>
            <div className="hero-proof">
              <span><Check size={14} /> Estimación inmediata</span>
              <span><Check size={14} /> Sin compromiso</span>
              <span><Check size={14} /> Adaptado a tu negocio</span>
            </div>
          </div>
          <div className={`hero-estimator ${mobileEstimator ? "is-visible" : ""}`}>
            <Estimator />
          </div>
        </section>

        <section className="trust-strip" aria-label="Capacidades">
          <span>WEB</span><i />
          <span>WHATSAPP</span><i />
          <span>TELEGRAM</span><i />
          <span>CRM</span><i />
          <span>RESERVAS</span><i />
          <span>PRESUPUESTOS</span>
        </section>

        <section className="solution-section" id="solucion">
          <div className="section-heading">
            <span className="budget-eyebrow">DEL PROBLEMA A UNA SOLUCIÓN ÚTIL</span>
            <h2>No instalamos un chat genérico. Diseñamos un flujo que trabaja contigo.</h2>
          </div>
          <div className="solution-grid">
            <article>
              <span><MessagesSquare size={22} /></span><small>01</small>
              <h3>Entendemos tus conversaciones</h3>
              <p>Ordenamos las preguntas, decisiones y excepciones que aparecen cada día en tu negocio.</p>
            </article>
            <article>
              <span><Workflow size={22} /></span><small>02</small>
              <h3>Conectamos el proceso</h3>
              <p>El bot puede consultar datos, registrar contactos o integrarse con las herramientas que ya utilizas.</p>
            </article>
            <article>
              <span><Clock3 size={22} /></span><small>03</small>
              <h3>Medimos y mejoramos</h3>
              <p>Revisamos el uso real para ajustar respuestas y ampliar capacidades con criterio.</p>
            </article>
          </div>
        </section>

        <section className="included-section" id="incluye">
          <div>
            <span className="budget-eyebrow">UNA PRIMERA VERSIÓN QUE YA APORTA VALOR</span>
            <h2>Todo lo necesario para empezar bien.</h2>
            <p>Definimos un alcance concreto, lo ponemos a prueba y dejamos una base preparada para crecer.</p>
          </div>
          <ul>
            <li><Check size={17} /><span><strong>Diseño conversacional</strong>Preguntas, respuestas, validaciones y rutas alternativas.</span></li>
            <li><Check size={17} /><span><strong>Integración en tu web</strong>Una experiencia coherente con tu marca y accesible desde móvil.</span></li>
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
