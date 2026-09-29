import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Bot,
  Check,
  ChevronDown,
  Cloud,
  Database,
  GitBranch,
  Globe2,
  HardDrive,
  Layers3,
  LockKeyhole,
  Mail,
  Menu,
  MonitorCheck,
  Network,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";

const BUDGET_URL = "https://presupuestos.mercamicro.es";
const DEMOS_URL = "https://demos.mercamicro.es";
const CONTACT_URL = `mailto:presupuestos@mercamicro.es?subject=${encodeURIComponent("Consulta sobre servicios Mercamicro")}`;

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "infrastructure", label: "Infraestructura" },
  { id: "azure", label: "Azure" },
  { id: "managed", label: "Gestionados" },
  { id: "web", label: "Web" },
  { id: "automation", label: "Automatización" },
  { id: "consulting", label: "Consultoría" },
];

const SERVICES = [
  {
    id: "iaas", category: "infrastructure", number: "01", icon: Server,
    title: "Infraestructura como servicio",
    description: "Servidores virtuales, capacidad de cómputo y entornos para aplicaciones. Dimensionamos, desplegamos y dejamos una base preparada para crecer.",
    tags: ["IaaS", "Servidores", "Despliegue"],
  },
  {
    id: "storage", category: "infrastructure", number: "02", icon: HardDrive,
    title: "Almacenamiento y copias",
    description: "Espacio para datos y ficheros, políticas de copia y recuperación acordes con lo que tu negocio necesita conservar y restaurar.",
    tags: ["Almacenamiento", "Copias", "Recuperación"],
  },
  {
    id: "platform", category: "infrastructure", number: "03", icon: Database,
    title: "Plataformas de aplicaciones",
    description: "Contenedores, bases de datos, caché y servicios de soporte para ejecutar aplicaciones con despliegues controlados.",
    tags: ["Docker", "PostgreSQL", "Valkey"],
  },
  {
    id: "network", category: "infrastructure", number: "04", icon: Network,
    title: "Red, DNS y acceso seguro",
    description: "Organizamos dominios, certificados TLS, proxies y conexiones entre servicios para que cada pieza esté donde debe estar.",
    tags: ["DNS", "TLS", "Conectividad"],
  },
  {
    id: "azure-design", category: "azure", number: "05", icon: Cloud,
    title: "Arquitectura en Azure",
    description: "Diseño y puesta en marcha de entornos en Microsoft Azure: recursos, red, almacenamiento y aplicaciones según el alcance del proyecto.",
    tags: ["Azure", "Arquitectura", "Migración"],
  },
  {
    id: "azure-ops", category: "azure", number: "06", icon: Settings2,
    title: "Gestión de Azure",
    description: "Administración y evolución de los recursos, revisión de configuración, acceso, uso y costes con una visión operativa.",
    tags: ["Administración", "Costes", "Operación"],
  },
  {
    id: "managed", category: "managed", number: "07", icon: MonitorCheck,
    title: "Servicios gestionados",
    description: "Nos ocupamos del seguimiento técnico, mantenimiento, actualizaciones y cambios de los sistemas incluidos en el servicio acordado.",
    tags: ["Mantenimiento", "Monitorización", "Soporte"],
  },
  {
    id: "resilience", category: "managed", number: "08", icon: ShieldCheck,
    title: "Seguridad y continuidad",
    description: "Revisión de accesos, protección de servicios, copias y planes de recuperación para reducir interrupciones y puntos únicos de fallo.",
    tags: ["Accesos", "Copias", "Continuidad"],
  },
  {
    id: "hosting", category: "web", number: "09", icon: Globe2,
    title: "Alojamiento web",
    description: "Hosting para webs y aplicaciones, con dominio, certificados, despliegue y mantenimiento ajustados a las necesidades de cada sitio.",
    tags: ["Hosting", "Dominios", "SSL/TLS"],
  },
  {
    id: "websites", category: "web", number: "10", icon: Layers3,
    title: "Webs y portales a medida",
    description: "Estrategia, contenidos, UX/UI, desarrollo responsive, SEO técnico e integraciones. Desde una landing hasta un portal de trabajo.",
    tags: ["Diseño", "Desarrollo", "SEO técnico"],
  },
  {
    id: "workflows", category: "automation", number: "11", icon: Workflow,
    title: "Automatización de procesos",
    description: "Conectamos formularios, avisos, aprobaciones, datos y equipos para quitar tareas repetitivas del día a día.",
    tags: ["n8n", "Flujos", "Notificaciones"],
  },
  {
    id: "assistants", category: "automation", number: "12", icon: Bot,
    title: "Chatbots y asistentes",
    description: "Experiencias guiadas o con IA para responder consultas, recoger solicitudes, preparar presupuestos y trabajar con documentación cuando aporta valor.",
    tags: ["Chatbots", "IA", "Documentación"],
  },
  {
    id: "integrations", category: "automation", number: "13", icon: GitBranch,
    title: "Integraciones y APIs",
    description: "Hacemos que la web, las aplicaciones y las herramientas de negocio compartan la información necesaria sin repetir trabajo manual.",
    tags: ["APIs", "CRM / ERP", "Datos"],
  },
  {
    id: "insight", category: "managed", number: "14", icon: Blocks,
    title: "Datos y analítica",
    description: "Ordenamos datos operativos y medición web para ver qué ocurre, detectar problemas y decidir mejoras con información útil.",
    tags: ["Datos", "Analítica", "Informes"],
  },
  {
    id: "advisory", category: "consulting", number: "15", icon: Search,
    title: "Consultoría tecnológica",
    description: "Revisamos la situación actual, aclaramos prioridades y proponemos una arquitectura y un plan de trabajo realista.",
    tags: ["Diagnóstico", "Arquitectura", "Hoja de ruta"],
  },
  {
    id: "delivery", category: "consulting", number: "16", icon: LockKeyhole,
    title: "Implantación y acompañamiento",
    description: "Migraciones, puesta en marcha, documentación y transferencia de conocimiento para que el cambio se pueda operar después.",
    tags: ["Migración", "Documentación", "Evolución"],
  },
];

const FAQ = [
  ["¿Puedo contratar solo una parte?", "Sí. Podemos encargarnos de un servicio concreto o diseñar un conjunto que conecte infraestructura, web y procesos. Definimos el alcance antes de presentar una propuesta."],
  ["¿Trabajáis sobre sistemas que ya tengo?", "Sí. Primero revisamos el estado, los accesos y las dependencias. Después planteamos una mejora, integración o migración según convenga."],
  ["¿Azure es obligatorio para trabajar con Mercamicro?", "No. La elección de plataforma depende de los requisitos, la infraestructura existente y los costes. También podemos trabajar con otros entornos acordados para el proyecto."],
  ["¿Tenéis precios cerrados para todos los servicios?", "Los servicios de infraestructura, gestión y consultoría se dimensionan según capacidad, alcance y responsabilidades. Para proyectos web y automatizaciones puedes empezar por el configurador orientativo."],
];

function Brand({ light = false }) {
  return (
    <a className={`services-brand${light ? " is-light" : ""}`} href="#inicio" aria-label="Mercamicro, volver al inicio">
      <img src="/mercamicro-logo.jpg" alt="" width="40" height="40" />
      <span><strong>mercamicro</strong><small>Servicios digitales</small></span>
    </a>
  );
}

function ServiceCard({ service }) {
  const Icon = service.icon;
  return (
    <article className="service-card" id={`servicio-${service.id}`}>
      <div className="service-card-top"><span className="service-card-icon"><Icon size={25} strokeWidth={1.8} /></span><small>{service.number} / 16</small></div>
      <span className="service-card-category">{CATEGORIES.find(({ id }) => id === service.category)?.label}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <ul aria-label={`Áreas de ${service.title}`}>{service.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
    </article>
  );
}

export default function ServiciosApp() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const normalizedQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visibleServices = useMemo(() => SERVICES.filter((service) => {
    if (selectedCategory !== "all" && service.category !== selectedCategory) return false;
    const searchable = [service.title, service.description, ...service.tags].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return searchable.includes(normalizedQuery);
  }), [selectedCategory, normalizedQuery]);

  const closeMenu = () => setMenuOpen(false);
  const resetFilters = () => { setSelectedCategory("all"); setQuery(""); };

  return (
    <div className="services-site" id="inicio">
      <a className="services-skip" href="#contenido">Saltar al contenido</a>
      <div className="services-topline"><span>Mercamicro / tecnología que trabaja contigo</span><a href={CONTACT_URL}>Hablemos de tu proyecto <ArrowUpRight size={14} /></a></div>
      <header className="services-header">
        <Brand />
        <button className="services-menu-button" type="button" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="services-nav" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        <nav className={menuOpen ? "is-open" : ""} id="services-nav" aria-label="Navegación principal">
          <a href="#servicios" onClick={closeMenu}>Servicios</a>
          <a href="#metodo" onClick={closeMenu}>Cómo trabajamos</a>
          <a href="#explora" onClick={closeMenu}>Explora</a>
          <a href={BUDGET_URL} onClick={closeMenu}>Presupuestos</a>
          <a href={DEMOS_URL} onClick={closeMenu}>Demos</a>
          <a className="services-nav-contact" href="#contacto" onClick={closeMenu}>Contactar <ArrowUpRight size={16} /></a>
        </nav>
      </header>

      <main id="contenido" tabIndex="-1">
        <section className="services-hero" aria-labelledby="hero-title">
          <div className="services-hero-copy">
            <span className="services-eyebrow"><i /> INFRAESTRUCTURA · CLOUD · AUTOMATIZACIÓN</span>
            <h1 id="hero-title">La tecnología que necesitas, <em>bien conectada.</em></h1>
            <p>Diseñamos, construimos y cuidamos la base digital de tu negocio. Desde el servidor y los datos hasta la web, las integraciones y los procesos que hacen avanzar el trabajo.</p>
            <div className="services-hero-actions"><a className="button-primary" href="#contacto">Cuéntanos qué necesitas <ArrowRight size={19} /></a><a className="button-quiet" href="#servicios">Explorar servicios <ArrowDownRight size={18} /></a></div>
            <div className="services-hero-note"><Check size={18} /><span>Un alcance definido contigo. Una solución que puede evolucionar.</span></div>
          </div>
          <div className="services-diagram" aria-label="Infraestructura, aplicaciones, datos y automatización conectados a tu negocio">
            <div className="diagram-top"><span>ARQUITECTURA DE UNA SOLUCIÓN</span><span className="diagram-status"><i /> CONECTADO</span></div>
            <div className="diagram-network">
              <span className="diagram-line diagram-line-a" /><span className="diagram-line diagram-line-b" /><span className="diagram-line diagram-line-c" /><span className="diagram-line diagram-line-d" />
              <div className="diagram-center"><span><Layers3 size={26} /></span><strong>Tu negocio</strong><small>objetivos · personas · procesos</small></div>
              <div className="diagram-node node-infra"><Server size={18} /><span>Infraestructura</span></div>
              <div className="diagram-node node-cloud"><Cloud size={18} /><span>Cloud / Azure</span></div>
              <div className="diagram-node node-data"><Database size={18} /><span>Datos</span></div>
              <div className="diagram-node node-automation"><Workflow size={18} /><span>Automatización</span></div>
            </div>
            <div className="diagram-bottom"><span><i /> DISEÑO</span><span><i /> DESPLIEGUE</span><span><i /> OPERACIÓN</span></div>
          </div>
        </section>

        <section className="services-intro" aria-label="Nuestra forma de abordar cada proyecto">
          <div><small>01 / ENTENDER</small><strong>Partimos de lo que necesitas resolver.</strong></div>
          <div><small>02 / CONSTRUIR</small><strong>Elegimos piezas que trabajen juntas.</strong></div>
          <div><small>03 / ACOMPAÑAR</small><strong>Dejamos la solución lista para operar y mejorar.</strong></div>
        </section>

        <section className="services-catalog section-shell" id="servicios" aria-labelledby="services-title">
          <div className="section-heading"><span className="services-eyebrow"><i /> QUÉ PODEMOS HACER</span><div><h2 id="services-title">Una oferta completa.<br /><em>El alcance que te haga falta.</em></h2><p>Elige un área para explorar o busca una necesidad concreta. Combinamos servicios cuando el proyecto lo requiere.</p></div></div>
          <div className="services-catalog-tools">
            <div className="services-filters" role="group" aria-label="Filtrar servicios por área">{CATEGORIES.map(({ id, label }) => <button type="button" key={id} aria-pressed={selectedCategory === id} className={selectedCategory === id ? "is-active" : ""} onClick={() => setSelectedCategory(id)}>{label}</button>)}</div>
            <label className="services-search"><Search size={18} /><span className="visually-hidden">Buscar servicios</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar un servicio" /></label>
          </div>
          <p className="services-count" role="status">{visibleServices.length} {visibleServices.length === 1 ? "servicio" : "servicios"} {selectedCategory === "all" ? "disponibles" : "en esta área"}</p>
          {visibleServices.length ? <div className="services-grid">{visibleServices.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <div className="services-empty"><Search size={28} /><h3>No encontramos ese servicio.</h3><p>Prueba otra palabra o consulta el catálogo completo.</p><button type="button" onClick={resetFilters}>Ver todos los servicios <ArrowRight size={17} /></button></div>}
          <div className="services-catalog-footer"><span>¿No ves exactamente lo que necesitas? Es habitual que un proyecto combine varias áreas.</span><a href={CONTACT_URL}>Cuéntanoslo <ArrowUpRight size={17} /></a></div>
        </section>

        <section className="services-system" aria-labelledby="system-title"><div className="section-shell services-system-inner"><div><span className="services-eyebrow">TODO ENCAJA MEJOR CUANDO SE DISEÑA JUNTO</span><h2 id="system-title">Del servidor a la experiencia de tus clientes.</h2><p>Una web rápida necesita una base fiable. Una automatización útil necesita datos claros. Una operación sostenible necesita saber qué está pasando.</p><a href="#contacto">Diseñemos esa conexión <ArrowRight size={18} /></a></div><div className="system-flow" aria-label="Infraestructura, datos, aplicaciones, automatización y operación"><span><Server size={21} /> Infraestructura</span><i /><span><Database size={21} /> Datos</span><i /><span><Globe2 size={21} /> Aplicaciones</span><i /><span><Workflow size={21} /> Automatización</span><i /><span><MonitorCheck size={21} /> Operación</span></div></div></section>

        <section className="services-method section-shell" id="metodo" aria-labelledby="method-title"><div className="section-heading"><span className="services-eyebrow"><i /> CÓMO TRABAJAMOS</span><div><h2 id="method-title">Primero claridad.<br /><em>Después tecnología.</em></h2><p>Definimos qué se espera de la solución y quién se ocupa de cada parte antes de ponerla en marcha.</p></div></div><div className="method-steps"><article><span>01</span><h3>Entender</h3><p>Objetivos, sistemas actuales, restricciones y prioridades.</p></article><article><span>02</span><h3>Diseñar</h3><p>Arquitectura, alcance, costes previstos y plan de ejecución.</p></article><article><span>03</span><h3>Implantar</h3><p>Construcción, integraciones, pruebas y despliegue controlado.</p></article><article><span>04</span><h3>Acompañar</h3><p>Documentación, seguimiento y evolución según lo acordado.</p></article></div></section>

        <section className="services-explore section-shell" id="explora" aria-labelledby="explore-title"><div className="section-heading"><span className="services-eyebrow"><i /> MERCAMICRO EN ACCIÓN</span><div><h2 id="explore-title">Pasa de la idea<br /><em>a algo que puedas ver.</em></h2><p>Estas dos experiencias muestran cómo pensamos y construimos soluciones digitales.</p></div></div><div className="explore-grid"><a href={BUDGET_URL} className="explore-card explore-budget"><span><small>01 / CONFIGURAR</small><ArrowUpRight size={22} /></span><h3>Configura tu proyecto</h3><p>Describe lo que necesitas para una web, chatbot o automatización y revisa una estimación orientativa.</p><strong>Ir a presupuestos <ArrowRight size={17} /></strong></a><a href={DEMOS_URL} className="explore-card explore-demos"><span><small>02 / PROBAR</small><ArrowUpRight size={22} /></span><h3>Explora las demos</h3><p>Prueba recorridos interactivos y simuladores sectoriales con datos de ejemplo, sin registro.</p><strong>Ver demostraciones <ArrowRight size={17} /></strong></a></div></section>

        <section className="services-faq section-shell" aria-labelledby="faq-title"><div><span className="services-eyebrow"><i /> ANTES DE EMPEZAR</span><h2 id="faq-title">Preguntas que ayudan a decidir.</h2><p>Si tu caso tiene otras condiciones, cuéntanoslas y lo revisamos contigo.</p></div><div className="faq-list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={20} /></summary><p>{answer}</p></details>)}</div></section>

        <section className="services-contact" id="contacto" aria-labelledby="contact-title"><div className="section-shell services-contact-inner"><div><span className="services-eyebrow"><i /> EMPECEMOS POR TU NECESIDAD</span><h2 id="contact-title">Cuéntanos qué quieres conseguir.<br /><em>Encontramos la forma de hacerlo.</em></h2><p>Infraestructura nueva, sistemas que necesitan orden o un proceso que quieres automatizar: explícanos el contexto y prepararemos el siguiente paso contigo.</p><div className="contact-actions"><a className="button-primary" href={CONTACT_URL}><Mail size={19} /> Escribir a Mercamicro <ArrowUpRight size={19} /></a><a href={BUDGET_URL}>Configurar web o automatización <ArrowRight size={17} /></a></div><small>El alcance, los plazos y los importes se concretan en una propuesta personalizada.</small></div><div className="contact-panel" aria-hidden="true"><span className="contact-panel-icon"><Sparkles size={28} /></span><strong>Una conversación. Varias posibilidades.</strong><p>Escuchamos el problema, conectamos las piezas y definimos una solución que puedas poner a trabajar.</p><div><span><Check size={16} /> Sin paquetes obligatorios</span><span><Check size={16} /> Con objetivos claros</span><span><Check size={16} /> Preparada para evolucionar</span></div></div></div></section>
      </main>

      <footer className="services-footer"><div className="section-shell services-footer-inner"><div><Brand light /><p>Infraestructura, aplicaciones y procesos pensados para trabajar juntos.</p></div><nav aria-label="Enlaces del pie de página"><a href="#servicios">Servicios</a><a href={BUDGET_URL}>Presupuestos</a><a href={DEMOS_URL}>Demos</a><a href={CONTACT_URL}>Contacto</a></nav><small>© {new Date().getFullYear()} Mercamicro</small></div></footer>
    </div>
  );
}
