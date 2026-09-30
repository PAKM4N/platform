import { useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Bot, Check, ChevronDown, Cloud,
  Globe2, HardDrive, Menu, MessageCircle, Server, Workflow, X,
} from "lucide-react";

const BUDGET_URL = "https://presupuestos.mercamicro.es";
const DEMOS_URL = "https://demos.mercamicro.es";
const CONTACT_URL = `mailto:presupuestos@mercamicro.es?subject=${encodeURIComponent("Consulta sobre servicios Mercamicro")}`;

const MODELS = [
  { id: "sistemas", number: "01", short: "Sistemas", label: "Alojamiento y gestión de sistemas operativos y servicios" },
  { id: "automatizacion", number: "02", short: "Procesos", label: "Automatización de procesos y consultoría" },
  { id: "webs", number: "03", short: "Experiencias", label: "Diseño de páginas web y chatbots" },
];

const SYSTEM_SERVICES = [
  ["Servidores y sistemas operativos", "IaaS, instalación, configuración y administración de entornos."],
  ["Almacenamiento y copias", "Datos protegidos con políticas de copia y recuperación acordadas."],
  ["Cloud y Azure", "Arquitectura, migración y gestión de recursos en Azure y otros entornos."],
  ["Red y seguridad", "Dominios, DNS, certificados, accesos y protección de servicios."],
  ["Alojamiento web y aplicaciones", "Hosting, contenedores, bases de datos y despliegues controlados."],
  ["Operación continua", "Monitorización, mantenimiento, actualizaciones y soporte según el alcance."],
];

const AUTOMATION_SERVICES = [
  ["Automatización de procesos", "Flujos para solicitudes, avisos, aprobaciones y tareas repetitivas."],
  ["Integraciones y APIs", "Conexión entre aplicaciones, datos y herramientas de negocio."],
  ["Consultoría tecnológica", "Diagnóstico, prioridades, arquitectura y una hoja de ruta viable."],
  ["Datos y mejora", "Medición, informes y revisión de procesos para decidir con criterio."],
];

const WEB_SERVICES = [
  ["Webs y portales a medida", "Diseño, contenido, desarrollo responsive e integraciones."],
  ["Chatbots y asistentes", "Recorridos guiados o con IA para consultas, solicitudes y presupuestos."],
  ["Visibilidad y experiencia", "SEO técnico, claridad de contenidos y facilidad de uso."],
  ["Lanzamiento y evolución", "Pruebas, puesta en marcha, mantenimiento y mejoras."],
];

const FAQ = [
  ["¿Puedo contratar una sola línea de servicio?", "Sí. Cada línea puede contratarse por separado. Si tu proyecto necesita varias, definimos cómo se conectan y quién se ocupa de cada parte."],
  ["¿Podéis trabajar con mis sistemas actuales?", "Sí. Revisamos el entorno, los accesos y las dependencias antes de proponer una mejora, integración o migración."],
  ["¿Hay precios cerrados?", "La infraestructura, la gestión y la consultoría dependen del alcance y las responsabilidades. Para webs y automatizaciones puedes empezar con el configurador de presupuesto orientativo."],
];

function Brand({ light = false }) {
  return (
    <a className={`services-brand${light ? " is-light" : ""}`} href="#inicio" aria-label="Mercamicro, volver al inicio">
      <img src="/mercamicro-logo.jpg" alt="" width="42" height="42" />
      <span><strong>mercamicro</strong><small>Soluciones digitales a medida</small></span>
    </a>
  );
}

function OfferingList({ items }) {
  return (
    <ul className="offering-list">
      {items.map(([name, description]) => (
        <li key={name}><span><Check size={17} strokeWidth={2} /></span><div><strong>{name}</strong><p>{description}</p></div></li>
      ))}
    </ul>
  );
}

function SystemsVisual() {
  return (
    <div className="systems-visual" role="img" aria-label="Capas de una infraestructura gestionada">
      <div className="systems-visual-head"><span>01 / OPERACIÓN</span><span><i /> Alcance a medida</span></div>
      <div className="systems-visual-body">
        <p>Una base técnica que se puede <strong>entender, mantener y recuperar.</strong></p>
        <div className="systems-layer systems-layer-front"><Globe2 size={19} /><span>Web, aplicaciones y servicios</span><small>Lo que usa tu equipo</small></div>
        <div className="systems-layer"><Cloud size={19} /><span>Cloud, servidores y red</span><small>Donde todo funciona</small></div>
        <div className="systems-layer"><HardDrive size={19} /><span>Datos, copias y accesos</span><small>Lo que hay que proteger</small></div>
      </div>
      <div className="systems-visual-foot"><span>DISEÑO</span><i /><span>DESPLIEGUE</span><i /><span>GESTIÓN</span></div>
    </div>
  );
}

function ProcessVisual() {
  return (
    <div className="process-visual" role="img" aria-label="Ejemplo de un proceso automatizado desde una solicitud hasta el seguimiento">
      <div className="process-visual-head"><span>EJEMPLO DE PROCESO</span><span>Solicitud de un cliente</span></div>
      <div className="process-step"><span>01</span><div><strong>Entra una solicitud</strong><small>Web, correo o formulario</small></div><ArrowDown size={19} /></div>
      <div className="process-step"><span>02</span><div><strong>Se comprueban los datos</strong><small>Reglas y validaciones</small></div><ArrowDown size={19} /></div>
      <div className="process-step"><span>03</span><div><strong>Actúa el equipo adecuado</strong><small>Aviso, tarea o integración</small></div><ArrowDown size={19} /></div>
      <div className="process-step"><span>04</span><div><strong>Queda registrado</strong><small>Respuesta y seguimiento</small></div><Check size={19} /></div>
      <div className="process-visual-foot"><Workflow size={17} /> Menos pasos manuales. Más control del proceso.</div>
    </div>
  );
}

function WebVisual() {
  return (
    <div className="web-visual" role="img" aria-label="Ejemplo ilustrativo de una página web con asistente conversacional">
      <div className="web-window">
        <div className="web-window-bar"><span><i /><i /><i /></span><small>tuempresa.es</small><span>↗</span></div>
        <div className="web-window-page">
          <div className="web-window-nav"><span>tu marca</span><span>Servicios&nbsp;&nbsp; Contacto</span></div>
          <div className="web-window-copy"><small>UNA WEB QUE EXPLICA BIEN</small><strong>De la primera visita a una conversación.</strong><span>Una experiencia clara, útil y preparada para crecer.</span><b>Hablemos <ArrowRight size={14} /></b></div>
          <div className="web-window-figure"><span /><span /><span /></div>
        </div>
      </div>
      <div className="chat-preview"><span><Bot size={17} /> Asistente</span><p>Hola, ¿en qué podemos ayudarte?</p><small>Ver servicios&nbsp;&nbsp; · &nbsp;&nbsp;Pedir presupuesto</small></div>
    </div>
  );
}

export default function ServiciosApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="services-site" id="inicio">
      <a className="services-skip" href="#contenido">Saltar al contenido</a>
      <header className="services-header">
        <Brand />
        <button className="services-menu-button" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="services-nav" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        <nav className={menuOpen ? "is-open" : ""} id="services-nav" aria-label="Navegación principal">
          <a href="#sistemas" onClick={closeMenu}>Sistemas</a>
          <a href="#automatizacion" onClick={closeMenu}>Automatización</a>
          <a href="#webs" onClick={closeMenu}>Webs y chatbots</a>
          <a href={DEMOS_URL} onClick={closeMenu}>Demos</a>
          <a className="services-nav-contact" href="#contacto" onClick={closeMenu}>Hablemos <ArrowUpRight size={16} /></a>
        </nav>
      </header>

      <main id="contenido" tabIndex="-1">
        <section className="services-hero section-shell" aria-labelledby="hero-title">
          <div className="services-hero-copy">
            <span className="services-eyebrow"><i /> MERCAMICRO / SERVICIOS</span>
            <h1 id="hero-title">Del servidor <span>a la conversación.</span></h1>
            <p>Alojamos y gestionamos sistemas, automatizamos procesos y creamos webs y chatbots. Tres formas de resolver lo que tu negocio necesita hoy.</p>
            <div className="services-hero-actions"><a className="button-primary" href="#modelos">Descubre cómo podemos ayudarte <ArrowRight size={18} /></a><a className="text-link" href="#contacto">Cuéntanos tu caso <ArrowUpRight size={18} /></a></div>
          </div>
          <div className="hero-index" id="modelos">
            <div className="hero-index-head"><span>QUÉ HACEMOS</span><span>01 — 03</span></div>
            {MODELS.map((model) => <a href={`#${model.id}`} key={model.id}><small>{model.number}</small><span><strong>{model.short}</strong><em>{model.label}</em></span><ArrowDown size={18} /></a>)}
            <div className="hero-index-foot"><span>Una empresa. Tres especialidades.</span><span>↓</span></div>
          </div>
        </section>

        <section className="model-section model-systems" id="sistemas" aria-labelledby="systems-title">
          <div className="section-shell">
            <div className="model-heading"><div><span className="model-kicker">01 / SISTEMAS</span><h2 id="systems-title">Alojamiento y gestión de <span>sistemas operativos y servicios.</span></h2><p>Preparamos la infraestructura, la ponemos en marcha y nos ocupamos de que siga funcionando. Podemos trabajar sobre tu entorno actual o diseñar uno nuevo.</p><a className="model-link" href={CONTACT_URL}>Hablemos de tus sistemas <ArrowUpRight size={19} /></a></div><SystemsVisual /></div>
            <div className="model-offerings"><div className="model-offerings-label"><Server size={23} /><span>EN QUÉ PODEMOS AYUDARTE</span></div><OfferingList items={SYSTEM_SERVICES} /></div>
          </div>
        </section>

        <section className="model-section model-automation section-shell" id="automatizacion" aria-labelledby="automation-title">
          <div className="model-heading"><div><span className="model-kicker">02 / PROCESOS</span><h2 id="automation-title">Automatización de procesos <span>y consultoría.</span></h2><p>Estudiamos cómo trabajas, encontramos los pasos que frenan al equipo y conectamos las herramientas necesarias. Antes de automatizar, entendemos el proceso.</p><a className="model-link" href={CONTACT_URL}>Cuéntanos qué quieres mejorar <ArrowUpRight size={19} /></a></div><ProcessVisual /></div>
          <div className="model-offerings"><div className="model-offerings-label"><Workflow size={23} /><span>DEL ANÁLISIS A LA PUESTA EN MARCHA</span></div><OfferingList items={AUTOMATION_SERVICES} /></div>
        </section>

        <section className="model-section model-web" id="webs" aria-labelledby="web-title">
          <div className="section-shell">
            <div className="model-heading"><div><span className="model-kicker">03 / EXPERIENCIAS</span><h2 id="web-title">Diseño de páginas web <span>y chatbots.</span></h2><p>Una presencia digital que explica lo que haces y ayuda a tus clientes a dar el siguiente paso. Diseñamos la web, la conversación y las conexiones que hacen falta detrás.</p><div className="model-links"><a className="model-link" href={BUDGET_URL}>Configura tu proyecto <ArrowUpRight size={19} /></a><a className="model-link secondary" href={DEMOS_URL}>Prueba las demos <ArrowRight size={18} /></a></div></div><WebVisual /></div>
            <div className="model-offerings"><div className="model-offerings-label"><MessageCircle size={23} /><span>DE LA IDEA AL PRODUCTO PUBLICADO</span></div><OfferingList items={WEB_SERVICES} /></div>
          </div>
        </section>

        <section className="services-method section-shell" aria-labelledby="method-title"><div className="method-intro"><span className="services-eyebrow"><i /> NUESTRA FORMA DE TRABAJAR</span><h2 id="method-title">Primero entendemos.<br />Después hacemos.</h2><p>Cada proyecto tiene un alcance distinto. El proceso para definirlo tiene que ser claro desde el principio.</p></div><ol><li><span>01</span><div><strong>Revisamos el punto de partida</strong><p>Objetivos, sistemas actuales, personas y restricciones.</p></div></li><li><span>02</span><div><strong>Definimos una propuesta concreta</strong><p>Qué haremos, cómo se integra y quién se ocupa de cada parte.</p></div></li><li><span>03</span><div><strong>Lo ponemos a trabajar</strong><p>Implantación, pruebas, documentación y evolución acordada.</p></div></li></ol></section>

        <section className="services-explore" aria-labelledby="explore-title"><div className="section-shell"><div className="explore-intro"><span className="services-eyebrow"><i /> DA EL PRIMER PASO</span><h2 id="explore-title">Mira cómo trabajamos.<br />Luego hablamos de tu caso.</h2></div><div className="explore-grid"><a href={BUDGET_URL}><span><small>01 / CONFIGURAR</small><ArrowUpRight size={21} /></span><strong>Calcula una primera estimación</strong><p>Describe tu web, chatbot o automatización y revisa un presupuesto orientativo.</p><em>Ir a presupuestos <ArrowRight size={17} /></em></a><a href={DEMOS_URL}><span><small>02 / PROBAR</small><ArrowUpRight size={21} /></span><strong>Prueba las conversaciones</strong><p>Explora demos y simuladores con datos de ejemplo, a tu ritmo y sin registro.</p><em>Ver las demos <ArrowRight size={17} /></em></a></div></div></section>

        <section className="services-faq section-shell" aria-labelledby="faq-title"><div><span className="services-eyebrow"><i /> PREGUNTAS FRECUENTES</span><h2 id="faq-title">Lo que conviene saber antes de empezar.</h2></div><div className="faq-list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={20} /></summary><p>{answer}</p></details>)}</div></section>

        <section className="services-contact" id="contacto" aria-labelledby="contact-title"><div className="section-shell services-contact-inner"><span className="services-eyebrow"><i /> HABLEMOS</span><h2 id="contact-title">¿Qué necesitas poner en marcha?</h2><div><p>Cuéntanos el contexto. Te ayudaremos a definir el alcance y el siguiente paso.</p><a href={CONTACT_URL}>Escríbenos <ArrowUpRight size={24} /></a></div></div></section>
      </main>

      <footer className="services-footer"><div className="section-shell services-footer-inner"><Brand light /><nav aria-label="Enlaces del pie de página"><a href="#sistemas">Sistemas</a><a href="#automatizacion">Automatización</a><a href="#webs">Webs y chatbots</a><a href={BUDGET_URL}>Presupuestos</a><a href={DEMOS_URL}>Demos</a><a href={CONTACT_URL}>Contacto</a></nav><small>© {new Date().getFullYear()} Mercamicro</small></div></footer>
    </div>
  );
}
