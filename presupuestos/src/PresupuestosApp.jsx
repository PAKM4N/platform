import {
  ArrowRight,
  Braces,
  Check,
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
  const outcomes = [
    ["01", "Entender", "Qué necesitas automatizar y para quién."],
    ["02", "Configurar", "Canales, lógica, integraciones y alojamiento."],
    ["03", "Valorar", "Implantación, cuota y consumos por separado."],
  ];

  return (
    <aside className="hero-brief" aria-label="Cómo preparamos la orientación inicial">
      <div className="hero-brief-heading">
        <span>ORIENTACIÓN INICIAL</span>
        <strong>Antes de hablar de tecnología, ordenamos el proyecto.</strong>
      </div>
      <div className="hero-brief-list">
        {outcomes.map(([number, title, description]) => (
          <div key={number}>
            <small>{number}</small>
            <span>
              <strong>{title}</strong>
              <p>{description}</p>
            </span>
          </div>
        ))}
      </div>
      <p><Check size={17} /> Resultado explicable, editable y sin IVA.</p>
    </aside>
  );
}

export default function PresupuestosApp() {
  const openConfigurator = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    document.getElementById("configurador")?.scrollIntoView({ behavior, block: "start" });
  };

  return (
    <div className="budget-site" id="inicio">
      <header className="budget-header">
        <Brand />
        <nav aria-label="Navegación principal">
          <a href="#solucion">Cómo trabajamos</a>
          <a href="#configurador">Configura tu proyecto</a>
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
              Diseñamos la web completa y la automatización que trabaja dentro de ella.
              Una experiencia coherente para atender, filtrar solicitudes, reservar,
              consultar datos o preparar presupuestos.
            </p>
            <div className="hero-actions">
              <button type="button" onClick={openConfigurator}>Configurar mi proyecto <ArrowRight size={18} /></button>
              <a href={DEMO_URL}>Probar una demo real</a>
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
            <h2>Cuéntanos el problema. Nosotros proponemos la solución.</h2>
            <p>
              No tienes que elegir un paquete técnico. Responde sobre tus objetivos y
              obtendrás una configuración razonada, con las partidas separadas.
            </p>
            <ol>
              <li><span>1</span><p><strong>Define la necesidad</strong>Selecciona procesos, canales y funciones.</p></li>
              <li><span>2</span><p><strong>Revisa la propuesta</strong>Edita cualquier respuesta antes de enviarla.</p></li>
              <li><span>3</span><p><strong>Recibe una valoración</strong>Solo pedimos tus datos al finalizar.</p></li>
            </ol>
            <div className="configurator-intro-note">
              <Clock3 size={18} />
              <span><strong>Unos 3 minutos</strong>Sin registro previo y sin cookies de seguimiento.</span>
            </div>
          </div>
          <ProjectConfigurator />
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
              <p>Contenido, interfaz y automatización comparten una lógica para que el usuario nunca se pierda.</p>
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
              diseño, desarrollo responsive, SEO técnico y despliegue.
              La automatización nace integrada en la experiencia, no pegada al final.
            </p>
            <div className="website-services">
              <span><LayoutTemplate size={19} /><b>UX/UI a medida</b><small>Sin plantillas genéricas</small></span>
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
            <li><Check size={17} /><span><strong>Panel y seguimiento</strong>Registro de solicitudes y visibilidad sobre el uso.</span></li>
            <li><Check size={17} /><span><strong>Puesta en marcha</strong>Pruebas, despliegue y acompañamiento durante la activación.</span></li>
          </ul>
        </section>

        <section className="demo-callout">
          <div>
            <span className="budget-eyebrow">¿QUIERES VERLO EN ACCIÓN?</span>
            <h2>Prueba 18 automatizaciones interactivas.</h2>
            <p>Explora reservas, citas, stock, presupuestos, pedidos, atención y otros recorridos configurados sobre un único motor.</p>
          </div>
          <a href={DEMO_URL}>Abrir las demos <Send size={17} /></a>
        </section>
      </main>

      <footer className="budget-footer">
        <Brand />
        <span>Webs y automatizaciones útiles, medibles y hechas a medida.</span>
        <a href={DEMO_URL}>Ver demos <ArrowRight size={14} /></a>
      </footer>
    </div>
  );
}
