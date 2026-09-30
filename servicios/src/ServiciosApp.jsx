import { useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, ChartNoAxesCombined, ChevronDown, Cloud, Compass, Globe, HardDrive, LayoutTemplate, Menu, MessagesSquare, Network, Plug, Search, Server, Workflow, Wrench, X } from "lucide-react";
import { AreaArtwork, HeroArtwork } from "./ServiceArtwork.jsx";

const BUDGET_URL = "https://presupuestos.mercamicro.es";
const DEMOS_URL = "https://demos.mercamicro.es";
const DEMO_QUOTE_URL = DEMOS_URL + "/demos/solicitud-presupuestos#probar-demo";
const emailLink = (subject = "Consulta sobre servicios Mercamicro") =>
  "mailto:presupuestos@mercamicro.es?subject=" + encodeURIComponent(subject);

const AREAS = [
  {
    id: "sistemas",
    name: "Sistemas y alojamiento",
    summary: "Infraestructura, cloud y servicios gestionados",
    title: "Alojamiento y gestión de sistemas operativos y servicios.",
    description: "Administramos la infraestructura donde trabajan tus aplicaciones: servidores, almacenamiento, servicios y entornos en Azure.",
    services: [
      ["Servidores y sistemas operativos", "IaaS, instalación, configuración y administración."],
      ["Almacenamiento y copias", "Capacidad, políticas de copia y recuperación de datos."],
      ["Azure y cloud", "Arquitectura, migración, recursos y revisión de costes."],
      ["Alojamiento web y aplicaciones", "Hosting, contenedores y bases de datos."],
      ["Red y accesos", "DNS, certificados, conectividad y protección de servicios."],
      ["Mantenimiento y soporte", "Monitorización, actualizaciones y gestión de incidencias."],
    ],
    note: "Servicio gestionado",
    asideTitle: "También sobre lo que ya tienes.",
    asideText: "Podemos asumir la gestión de tu entorno o planificar una migración. Primero revisamos recursos, accesos y dependencias.",
    scope: "Capacidad, soporte y responsabilidades definidos en la propuesta.",
    action: "Consultar sistemas y alojamiento",
    href: emailLink("Consulta sobre sistemas y alojamiento"),
  },
  {
    id: "automatizacion",
    name: "Automatización y consultoría",
    summary: "Procesos, integraciones y asesoramiento técnico",
    title: "Automatización de procesos y consultoría.",
    description: "Revisamos cómo trabaja tu equipo y conectamos sus herramientas para reducir tareas manuales, errores y pasos que se repiten.",
    services: [
      ["Flujos de trabajo", "Solicitudes, avisos, aprobaciones y tareas recurrentes."],
      ["Integraciones y APIs", "Conexión entre aplicaciones y herramientas de negocio."],
      ["Consultoría tecnológica", "Diagnóstico, arquitectura y prioridades de implantación."],
      ["Datos e informes", "Información ordenada para hacer seguimiento y decidir."],
    ],
    note: "Un ejemplo de automatización",
    asideTitle: "De una solicitud a una tarea asignada.",
    steps: ["Recibir el formulario", "Comprobar los datos", "Asignar y avisar al equipo", "Registrar el seguimiento"],
    scope: "Analizamos el proceso antes de elegir las herramientas.",
    action: "Consultar mi proceso",
    href: emailLink("Consulta sobre automatización y consultoría"),
  },
  {
    id: "webs",
    name: "Webs y chatbots",
    summary: "Diseño, desarrollo y atención a tus clientes",
    title: "Diseño de páginas web y chatbots.",
    description: "Creamos webs que explican tu negocio y asistentes que ayudan a tus clientes a consultar, reservar o pedir presupuesto.",
    services: [
      ["Webs y portales", "Diseño, contenidos y desarrollo adaptado a móvil."],
      ["Chatbots y asistentes", "Consultas y solicitudes guiadas, con IA cuando hace falta."],
      ["SEO técnico e integraciones", "Una web preparada para encontrarse y conectar con tus herramientas."],
      ["Publicación y mantenimiento", "Pruebas, despliegue y evolución del proyecto."],
    ],
    note: "Proyecto a medida",
    asideTitle: "Una web nueva o una mejora de la actual.",
    asideText: "Puedes empezar con una estimación orientativa. El configurador te ayuda a definir necesidades y alcance antes de enviarnos tu solicitud.",
    scope: "También puedes probar nuestras demos antes de decidir.",
    action: "Calcular presupuesto orientativo",
    href: BUDGET_URL,
  },
];

const FAQ = [
  ["¿Puedo contratar solo una parte?", "Sí. Cada área se puede contratar por separado. Si necesitas combinar varias, concretamos su alcance y cómo se conectan."],
  ["¿Cómo preparáis una propuesta?", "Revisamos tu situación y lo que necesitas resolver. Después definimos el trabajo, las responsabilidades y los costes. El configurador ofrece una primera orientación para webs y automatizaciones."],
  ["¿Y después de la puesta en marcha?", "Podemos acordar mantenimiento, soporte y evolución. Qué se cubre y en qué condiciones queda definido en la propuesta."],
];

const SERVICE_ICONS = {
  sistemas: [Server, HardDrive, Cloud, Globe, Network, Activity],
  automatizacion: [Workflow, Plug, Compass, ChartNoAxesCombined],
  webs: [LayoutTemplate, MessagesSquare, Search, Wrench],
};

function selectedFromHash() {
  const id = window.location.hash.slice(1);
  return AREAS.some((area) => area.id === id) ? id : "sistemas";
}

function Brand() {
  return (
    <a className="services-brand" href="#inicio" aria-label="Mercamicro, volver al inicio">
      <img src="/mercamicro-logo.jpg" alt="" width="40" height="40" />
      <span><strong>mercamicro</strong><small>Soluciones digitales a medida</small></span>
    </a>
  );
}

export default function ServiciosApp() {
  const [activeArea, setActiveArea] = useState(selectedFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [verticalTabs, setVerticalTabs] = useState(() => window.matchMedia("(max-width: 620px)").matches);
  const menuButton = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 620px)");
    const updateOrientation = () => setVerticalTabs(media.matches);
    const updateHash = () => {
      const id = window.location.hash.slice(1);
      if (AREAS.some((area) => area.id === id)) setActiveArea(id);
    };
    media.addEventListener("change", updateOrientation);
    window.addEventListener("hashchange", updateHash);
    return () => {
      media.removeEventListener("change", updateOrientation);
      window.removeEventListener("hashchange", updateHash);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const selectArea = (id) => {
    setActiveArea(id);
    window.history.replaceState(null, "", "#" + id);
  };

  const moveTab = (event, index) => {
    const previousKey = verticalTabs ? "ArrowUp" : "ArrowLeft";
    const nextKey = verticalTabs ? "ArrowDown" : "ArrowRight";
    let nextIndex;
    if (event.key === nextKey) nextIndex = (index + 1) % AREAS.length;
    else if (event.key === previousKey) nextIndex = (index - 1 + AREAS.length) % AREAS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = AREAS.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectArea(AREAS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="services-site" id="inicio">
      <a className="services-skip" href="#contenido">Saltar al contenido</a>
      <header className="services-header shell">
        <Brand />
        <button ref={menuButton} className="services-menu-button" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="services-nav" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <nav id="services-nav" className={menuOpen ? "is-open" : ""} aria-label="Navegación principal">
          <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
          <a href="#demostraciones" onClick={() => setMenuOpen(false)}>Nuestro trabajo</a>
          <a href={BUDGET_URL}>Presupuestos <ArrowUpRight size={13} /></a>
          <a className="nav-contact" href="#contacto" onClick={() => setMenuOpen(false)}>Cuéntanos tu proyecto <ArrowRight size={16} /></a>
        </nav>
      </header>

      <main id="contenido" tabIndex="-1">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="services-hero shell">
            <div className="hero-title-block">
              <p className="eyebrow"><span className="eyebrow-mark" aria-hidden="true" />Servicios tecnológicos para empresas</p>
              <h1 id="hero-title">Sistemas,<br />automatización<br />y <span>desarrollo web.</span></h1>
              <p className="hero-description">Alojamos tus servicios, conectamos las herramientas de tu equipo y damos forma a tu presencia digital.</p>
              <div className="hero-actions"><a href="#servicios" className="button-light">Descubre los servicios <ArrowDown size={18} /></a><a href="#contacto" className="hero-contact">Hablemos de tu proyecto <ArrowUpRight size={17} /></a></div>
            </div>
            <HeroArtwork />
          </div>
          <div className="hero-baseline shell"><span>Desde la infraestructura hasta la experiencia de tus clientes.</span><a href="#demostraciones">Mira lo que hacemos <ArrowDown size={15} /></a></div>
        </section>

        <section className="service-browser shell" id="servicios" aria-label="Nuestras tres líneas de servicio">
          <div className="section-heading"><div><p className="eyebrow">Qué hacemos</p><h2>Tres áreas para hacer<br className="desktop-break" /> avanzar tu proyecto.</h2></div><p>Empieza por lo que necesitas.<br />Podemos combinar varias áreas en una misma propuesta.</p></div>
          <div className="service-tabs" role="tablist" aria-label="Elige un área de servicio" aria-orientation={verticalTabs ? "vertical" : "horizontal"}>
            {AREAS.map((area, index) => (
              <button key={area.id} data-area={area.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" id={"tab-" + area.id} role="tab" aria-selected={activeArea === area.id} aria-controls={area.id} tabIndex={activeArea === area.id ? 0 : -1} onClick={() => selectArea(area.id)} onKeyDown={(event) => moveTab(event, index)}>
                <AreaArtwork area={area.id} />
                <span className="service-tab-copy"><span className="service-tab-name">{area.name}</span><span className="service-tab-summary">{area.summary}</span></span>
                <span className="service-tab-action" aria-hidden="true">{activeArea === area.id ? "Servicios de esta área" : "Explorar servicios"}<ArrowRight size={18} /></span>
              </button>
            ))}
          </div>
          {AREAS.map((area) => (
            <div key={area.id} data-area={area.id} id={area.id} className="service-panel" role="tabpanel" aria-labelledby={"tab-" + area.id} hidden={activeArea !== area.id} tabIndex="0">
              <div className="service-content">
                <div className="service-intro"><span className="service-intro-mark" aria-hidden="true" /><h2>{area.title}</h2><p className="service-description">{area.description}</p></div>
                <ul className="capability-list">{area.services.map(([name, description], index) => { const Icon = SERVICE_ICONS[area.id][index]; return <li key={name}><span className="capability-icon"><Icon size={19} aria-hidden="true" /></span><div><h3>{name}</h3><p>{description}</p></div></li>; })}</ul>
              </div>
              <aside className="service-aside">
                <div className="aside-heading"><span className="aside-label">{area.note}</span><h3>{area.asideTitle}</h3></div>
                <div className="aside-detail">{area.asideText && <p>{area.asideText}</p>}{area.steps && <ol className="process-example">{area.steps.map((step) => <li key={step}>{step}</li>)}</ol>}</div>
                <div className="aside-bottom"><p>{area.scope}</p><a className="button-primary" href={area.href}>{area.action}<ArrowUpRight size={17} /></a></div>
              </aside>
            </div>
          ))}
        </section>

        <section className="work-section" id="demostraciones" aria-labelledby="work-title">
          <div className="work-layout shell">
            <div className="work-copy"><p className="eyebrow">Desarrollado por Mercamicro</p><h2 id="work-title">Mejor verlo<br /><span>en funcionamiento.</span></h2><p>Reservas, consultas y presupuestos. Recorre nuestras demos como lo haría tu cliente y descubre qué podríamos crear para tu empresa.</p><a className="button-primary" href={DEMOS_URL}>Explorar las demos <ArrowUpRight size={18} /></a><p className="work-note">Ejemplos interactivos con datos ficticios.<br />Sin registro ni envíos reales.</p></div>
            <figure className="work-preview"><a href={DEMO_QUOTE_URL} aria-label="Probar la demo de solicitud de presupuestos"><div className="preview-bar" aria-hidden="true"><span className="preview-dots"><i /><i /><i /></span><span>demos.mercamicro.es</span><ArrowUpRight size={14} /></div><picture><source media="(max-width: 620px)" srcSet="/services-demo-presupuesto-mobile.png" width="696" height="1432" /><img src="/services-demo-presupuesto.png" alt="Pantalla real de la demo de solicitud de presupuestos de Mercamicro" width="1080" height="644" loading="lazy" /></picture></a><figcaption><span>Solicitud de presupuestos <small>Demo interactiva</small></span><a href={DEMO_QUOTE_URL}>Probar <ArrowUpRight size={16} /></a></figcaption></figure>
          </div>
        </section>

        <section className="contact-section shell" id="contacto" aria-labelledby="contact-title">
          <div className="contact-copy"><p className="eyebrow">Contacto directo</p><h2 id="contact-title">Cuéntanos en qué estás trabajando.</h2><p>Puede ser una idea nueva, un proceso que quieres mejorar o unos sistemas que necesitan atención. Empezamos por entender tu situación.</p><a className="contact-email" href={emailLink()}>presupuestos@mercamicro.es <ArrowUpRight size={20} /></a><a className="budget-link" href={BUDGET_URL}>¿Buscas una web o automatización? Calcula una orientación <ArrowRight size={16} /></a></div>
          <div className="faq-list"><h3>Antes de empezar</h3>{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} /></summary><p>{answer}</p></details>)}</div>
        </section>
      </main>

      <footer className="services-footer shell"><Brand /><nav aria-label="Enlaces del pie de página"><a href="#servicios">Servicios</a><a href={BUDGET_URL}>Presupuestos</a><a href={DEMOS_URL}>Demos</a><a href={emailLink()}>Contacto</a></nav><small>© {new Date().getFullYear()} Mercamicro</small></footer>
    </div>
  );
}
