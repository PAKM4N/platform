import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
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

const QUESTIONS = [
  {
    id: "scope",
    text: "¿Qué necesitas construir?",
    hint: "Podemos integrar el chatbot en tu web actual o crear toda la experiencia desde cero.",
    options: [
      ["bot", "Un chatbot para mi web actual", 0],
      ["landing", "Una landing nueva + chatbot", 2200],
      ["website", "Una web completa + chatbot", 4200],
      ["unknown", "Necesito que me recomendéis", 1200],
    ],
  },
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

function WebsitePreview() {
  return (
    <div className="website-preview" aria-hidden="true">
      <div className="preview-browser">
        <div className="preview-chrome">
          <span /><span /><span />
          <i>tunegocio.es</i>
        </div>
        <div className="preview-canvas">
          <div className="preview-nav"><b>Tu marca</b><span>Servicios&nbsp;&nbsp; Proyectos&nbsp;&nbsp; Contacto</span></div>
          <div className="preview-hero">
            <small>UNA PROPUESTA CLARA</small>
            <strong>Tu negocio,<br />mejor explicado.</strong>
            <i />
          </div>
          <div className="preview-metrics">
            <span><b>+37%</b><small>solicitudes</small></span>
            <span><b>24/7</b><small>atención</small></span>
            <span><b>1 web</b><small>todo conectado</small></span>
          </div>
        </div>
      </div>
      <div className="preview-chat">
        <span><Bot size={17} /></span>
        <p>Hola, ¿quieres que te ayude a elegir el servicio adecuado?</p>
        <div><i /><i /><i /></div>
      </div>
      <span className="preview-label preview-label-design"><LayoutTemplate size={15} /> Diseño propio</span>
      <span className="preview-label preview-label-speed"><BarChart3 size={15} /> Medible</span>
    </div>
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
          <a href="#web-completa">Web completa</a>
          <a href="#incluye">Qué incluye</a>
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

        <section className="trust-strip" aria-label="Capacidades">
          <span>ESTRATEGIA</span><i />
          <span>DISEÑO UX/UI</span><i />
          <span>DESARROLLO WEB</span><i />
          <span>CHATBOTS</span><i />
          <span>INTEGRACIONES</span><i />
          <span>MEJORA CONTINUA</span>
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
          <WebsitePreview />
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
