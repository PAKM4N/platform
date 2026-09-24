import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  Clock3,
  Globe2,
  LayoutTemplate,
  MessagesSquare,
  SearchCheck,
  Send,
  Workflow,
} from "lucide-react";
import ProjectConfigurator from "./ProjectConfigurator";

const DEMO_URL = "https://demos.mercamicro.es";

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
    ["03", "Desarrollo e integraciones", "Web, chatbot y conexiones necesarias."],
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

function HeroBrief() {
  const [example, setExample] = useState("presupuestos");
  const examples = {
    presupuestos: { label: "Presupuestos", request: "Quiero una web con un asistente para mi negocio.", reply: "Vamos a darle forma. ¿Qué te gustaría que pudieran hacer tus clientes?", choices: ["Pedir presupuesto", "Reservar una cita", "Resolver dudas"], outcome: "De una idea a una solicitud bien definida." },
    citas: { label: "Citas", request: "Me gustaría reservar una primera visita.", reply: "Claro. Empezamos por lo importante: ¿qué servicio te interesa?", choices: ["Primera consulta", "Revisión", "Asesoramiento"], outcome: "Menos intercambios para organizar una cita." },
    consultas: { label: "Consultas", request: "Tengo una pregunta sobre mi pedido.", reply: "Te ayudamos a encontrar la información. ¿Qué necesitas consultar?", choices: ["Estado del pedido", "Envío", "Hablar con el equipo"], outcome: "La consulta llega a la persona adecuada." },
  };
  const current = examples[example];

  return (
    <aside className="hero-brief" aria-label="Ejemplos de conversaciones para tu negocio">
      <div className="hero-preview-topbar"><span aria-hidden="true"><i /><i /><i /></span><small>Tu negocio, mejor conectado</small></div>
      <div className="hero-preview-tabs" role="group" aria-label="Ver un ejemplo de conversación">
        {Object.entries(examples).map(([id, item]) => <button type="button" key={id} aria-pressed={example === id} onClick={() => setExample(id)}>{item.label}</button>)}
      </div>
      <div className="hero-preview-conversation" aria-live="polite" aria-atomic="true">
        <span className="hero-preview-caption">EJEMPLO ILUSTRATIVO</span>
        <p className="hero-preview-customer">{current.request}</p>
        <div className="hero-preview-assistant"><span><Bot size={20} /></span><div><strong>Asistente de tu negocio</strong><p>{current.reply}</p></div></div>
        <div className="hero-preview-choices" aria-label="Opciones que mostraría el asistente">{current.choices.map((choice) => <span key={choice}>{choice}</span>)}</div>
        <p className="hero-preview-outcome"><Check size={18} /> {current.outcome}</p>
      </div>
      <a className="hero-preview-link" href={DEMO_URL}>Pruébalo en las demos <ArrowRight size={17} /></a>
    </aside>
  );
}

const QUESTIONS = [
  ["¿La estimación es un presupuesto cerrado?", "Es un punto de partida para hablar de tu proyecto. Revisaremos contigo el alcance, las integraciones y los contenidos antes de presentar una propuesta definitiva. Los importes calculados no incluyen IVA, consumos de terceros ni una nueva web cuando se solicita aparte."],
  ["¿Necesito inteligencia artificial?", "Depende del problema. Un formulario o un recorrido con botones puede ser suficiente para recoger solicitudes, preparar presupuestos o gestionar citas. La IA encaja cuando necesitas interpretar preguntas abiertas, consultar documentación o realizar acciones con contexto."],
  ["¿Podéis trabajar con mi web actual?", "Sí. Podemos integrar la automatización en tu web o plantear una landing o una web completa. En el configurador puedes indicar qué necesitas; el desarrollo de una nueva web se valora por separado según su alcance."],
  ["¿Las demos hacen reservas o pedidos reales?", "No. Son recorridos de demostración con resultados simulados. Te permiten probar la experiencia sin contratar, reservar ni realizar pagos. Utiliza datos ficticios mientras exploras."],
];

export default function PresupuestosApp() {
  const openConfigurator = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    document.getElementById("configurador")?.scrollIntoView({ behavior, block: "start" });
    document.querySelector("#calculadora [tabindex='-1']")?.focus({ preventScroll: true });
  };

  return (
    <div className="budget-site" id="inicio">
      <a className="budget-skip-link" href="#contenido">Saltar al contenido</a>
      <header className="budget-header">
        <Brand />
        <nav aria-label="Navegación principal">
          <a href="#solucion">Cómo trabajamos</a>
          <a href="#configurador">Configura tu proyecto</a>
          <a href="#web-completa">Web completa</a>
          <a className="demo-link" href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
        </nav>
      </header>

      <main id="contenido" tabIndex="-1">
        <section className="budget-hero">
          <div className="budget-hero-copy">
            <span className="budget-eyebrow"><i /> DISEÑO WEB + AUTOMATIZACIÓN</span>
            <h1>Una web que explica bien. <em>Un bot que hace avanzar.</em></h1>
            <p>
              Diseñamos tu web y la conectamos con lo que tu negocio necesita:
              responder consultas, organizar citas o preparar presupuestos.
              Empieza por probarlo. Después, damos forma a tu proyecto.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={openConfigurator}>Configurar mi proyecto <ArrowRight size={18} /></button>
              <a href={DEMO_URL}>Explorar las demos <ArrowRight size={17} /></a>
            </div>
            <div className="hero-proof">
              <span><Check size={15} /> Diseño y desarrollo propios</span>
              <span><Check size={15} /> Web y automatización conectadas</span>
              <span><Check size={15} /> Orientación sin compromiso</span>
            </div>
          </div>
          <HeroBrief />
        </section>

        <section className="configurator-section" id="configurador">
          <div className="configurator-intro">
            <span className="budget-eyebrow"><i /> CONFIGURADOR DE PROYECTOS</span>
            <h2>Tu idea. Un alcance claro. El siguiente paso.</h2>
            <p>
              Cuéntanos qué quieres conseguir. Verás una estimación desglosada
              antes de compartir tus datos y podrás cambiar cualquier respuesta.
            </p>
            <ol>
              <li><span>1</span><p><strong>Define la necesidad</strong>Selecciona procesos, canales y funciones.</p></li>
              <li><span>2</span><p><strong>Revisa la propuesta</strong>Edita cualquier respuesta antes de enviarla.</p></li>
              <li><span>3</span><p><strong>Decide si damos el siguiente paso</strong>Envía la solicitud solo cuando quieras.</p></li>
            </ol>
            <div className="configurator-intro-note">
              <Clock3 size={18} />
              <span><strong>Unos 3 minutos</strong>Sin registro previo y sin cookies de seguimiento.</span>
            </div>
            <a className="configurator-demo-link" href={DEMO_URL}>¿Necesitas inspiración? Prueba las demos <ArrowRight size={17} /></a>
          </div>
          <ProjectConfigurator />
        </section>

        <section className="solution-section" id="solucion">
          <div className="section-heading">
            <span className="budget-eyebrow">DEL PROBLEMA A UNA SOLUCIÓN ÚTIL</span>
            <h2>Una experiencia pensada de principio a fin.</h2>
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
              <p>Contenido, interfaz y automatización comparten una lógica para que el usuario nunca se pierda.</p>
            </article>
            <article>
              <span><Clock3 size={22} /></span><small>03</small>
              <h3>Conectamos, medimos y mejoramos</h3>
              <p>Integramos tus herramientas, probamos los recorridos y definimos contigo cómo medir y mejorar el resultado.</p>
            </article>
          </div>
        </section>

        <section className="website-section" id="web-completa">
          <div className="website-copy">
            <span className="budget-eyebrow"><i /> TAMBIÉN HACEMOS LA WEB COMPLETA</span>
            <h2>No necesitas llegar con una web preparada.</h2>
            <p>
              Podemos encargarnos del proyecto entero: arquitectura, textos,
              diseño, desarrollo responsive, SEO técnico y despliegue.
              La automatización forma parte del diseño desde el primer día.
            </p>
            <div className="website-services">
              <span><LayoutTemplate size={19} /><b>UX/UI a medida</b><small>Diseñada para tu marca y tus usuarios</small></span>
              <span><Braces size={19} /><b>Desarrollo completo</b><small>Rápido, accesible y mantenible</small></span>
              <span><SearchCheck size={19} /><b>SEO técnico</b><small>Preparada para posicionar y crecer</small></span>
              <span><Globe2 size={19} /><b>Dominio y despliegue</b><small>Nos ocupamos de la puesta en marcha</small></span>
            </div>
            <button type="button" onClick={openConfigurator}>Valorar web + automatización <ArrowRight size={18} /></button>
            <small className="website-quote-note">La web completa se presenta como presupuesto personalizado y no se suma automáticamente.</small>
          </div>
          <ProjectScope />
        </section>

        <section className="included-section" id="incluye">
          <div>
            <span className="budget-eyebrow">UNA PRIMERA VERSIÓN QUE YA APORTA VALOR</span>
            <h2>Una base lista para trabajar y crecer.</h2>
            <p>Definimos un alcance concreto, lo ponemos a prueba y dejamos una arquitectura preparada para evolucionar.</p>
          </div>
          <ul>
            <li><Check size={17} /><span><strong>Diseño del recorrido</strong>Preguntas, respuestas, validaciones y rutas alternativas.</span></li>
            <li><Check size={17} /><span><strong>Web actual o web completa</strong>Integramos la solución o diseñamos toda la presencia digital.</span></li>
            <li><Check size={17} /><span><strong>Seguimiento según tu alcance</strong>Valoramos el registro de solicitudes y el panel de gestión que necesites.</span></li>
            <li><Check size={17} /><span><strong>Puesta en marcha</strong>Pruebas, despliegue y acompañamiento durante la activación.</span></li>
          </ul>
        </section>

        <section className="budget-faq" aria-labelledby="budget-faq-title">
          <div><span className="budget-eyebrow">ANTES DE EMPEZAR</span><h2 id="budget-faq-title">Las dudas que suelen salir primero.</h2><p>Un poco de contexto para decidir con tranquilidad.</p></div>
          <div className="budget-faq-list">{QUESTIONS.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="demo-callout">
          <div>
            <span className="budget-eyebrow">¿QUIERES VERLO EN ACCIÓN?</span>
            <h2>La mejor forma de entenderlo es probarlo.</h2>
            <p>18 demos interactivas de reservas, citas, presupuestos, pedidos y atención. Explora a tu ritmo, con datos ficticios y sin registro.</p>
          </div>
          <a href={DEMO_URL}>Abrir las demos <Send size={17} /></a>
        </section>

        <section className="budget-data-note" id="datos-solicitud" aria-labelledby="budget-data-title">
          <h2 id="budget-data-title">Tus datos, solo para tu solicitud.</h2>
          <p>Al enviar el formulario, Mercamicro recibe tus datos de contacto y las respuestas del proyecto para preparar y responder a tu solicitud. Puedes consultarnos sobre su tratamiento o pedir su eliminación en <a href="mailto:presupuestos@mercamicro.es">presupuestos@mercamicro.es</a>.</p>
          <p>El configurador conserva temporalmente tus selecciones en esta pestaña durante dos horas, sin guardar tus datos de contacto en el navegador. Esta web no utiliza cookies de analítica ni publicidad.</p>
          <p>Utilizamos Umami, alojado por Mercamicro, para medir las visitas y la navegación. No enviamos a Umami las respuestas del configurador ni los datos de contacto.</p>
        </section>
      </main>

      <footer className="budget-footer">
        <Brand />
        <a href="mailto:presupuestos@mercamicro.es">Hablemos de tu proyecto</a>
        <a href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
      </footer>
    </div>
  );
}
