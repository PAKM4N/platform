"use client";

import { useEffect, useRef } from "react";
import { Link } from "./router";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  MessageCircle,
  Monitor,
  Send,
} from "lucide-react";
import { Brand, Estimator } from "./App";
import ConversationFan from "./ConversationFan";
import { SERVICES, SERVICE_ORDER } from "./service-models";

function SectorRouteHeader({ service }) {
  return (
    <header className="sector-route-header">
      <Brand href="/" tag={service.eyebrow} />
      <nav aria-label="Navegación del sector">
        <Link to="/">
          <ArrowLeft size={15} /> Cambiar sector
        </Link>
        <a href="#calculadora">
          Ir al simulador <ArrowRight size={15} />
        </a>
      </nav>
    </header>
  );
}

function SimulatorCover({ service }) {
  const Icon = service.icon;

  return (
    <section className="simulator-cover">
      <img
        src={service.image}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <span className="simulator-cover-overlay" />
      <div className="simulator-cover-copy">
        <span>
          <Icon size={17} />
          {service.eyebrow}
          <ChevronRight size={13} />
          SIMULADOR SECTORIAL
        </span>
        <h1>{service.name}</h1>
        <p>
          Prueba cómo sería una experiencia de captación y presupuesto diseñada
          específicamente para este negocio.
        </p>
        <a href="#calculadora">
          Abrir simulador <ArrowRight size={17} />
        </a>
      </div>
      <div className="simulator-cover-facts">
        {service.highlights.map((highlight) => (
          <span key={highlight}>
            <Check size={13} /> {highlight}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectorSwitcher({ service }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector(".active");
    if (!scroller || !active) return;
    scroller.scrollLeft =
      active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2;
  }, [service.id]);

  return (
    <nav
      className="sector-route-switcher"
      aria-label="Cambiar de sector"
      ref={scrollerRef}
    >
      <span>Otras demos</span>
      <div>
        {SERVICE_ORDER.map((id, index) => {
          const item = SERVICES[id];
          const Icon = item.icon;
          return (
            <Link
              to={`/${item.slug}`}
              key={id}
              className={id === service.id ? "active" : ""}
            >
              <small>0{index + 1}</small>
              <Icon size={16} />
              {item.shortName}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SectorBotNote({ service }) {
  return (
    <section className="sector-chat-example">
      <div className="sector-chat-copy">
        <span className="sector-bot-icon">
          <Bot size={25} />
        </span>
        <small>EJEMPLO DE RESPUESTA AUTOMÁTICA</small>
        <h2>Una conversación pensada para {service.shortName.toLowerCase()}.</h2>
        <p>
          El bot puede responder, hacer la siguiente pregunta relevante y dejar
          los datos preparados para continuar el presupuesto.
        </p>
        <div className="sector-chat-levels" aria-label="Tipos de chat disponibles">
          <span>FAQs predefinidas</span>
          <span className="active">Bot guiado · demo</span>
          <span>Bot avanzado · opcional</span>
        </div>
        <div className="sector-bot-channels">
          <span className="is-live">
            <Monitor size={17} /> Web <small>activa</small>
          </span>
          <span>
            <MessageCircle size={17} /> WhatsApp <small>opcional</small>
          </span>
          <span>
            <Send size={17} /> Telegram <small>opcional</small>
          </span>
        </div>
      </div>

      <ConversationFan
        messages={[
          ["user", service.chat.customer],
          ["bot", service.chat.bot],
          ["bot", service.chat.followUp],
        ]}
        assistantName={`Asistente de ${service.shortName}`}
        subtitle="Bot guiado"
        messageKey={service.id}
      />
    </section>
  );
}

function SectorRouteFooter({ service }) {
  const nextIndex = (SERVICE_ORDER.indexOf(service.id) + 1) % SERVICE_ORDER.length;
  const nextService = SERVICES[SERVICE_ORDER[nextIndex]];

  return (
    <footer className="sector-route-footer">
      <div>
        <Brand href="/" />
        <span>Demo sectorial · datos de ejemplo</span>
      </div>
      <Link to={`/${nextService.slug}`}>
        Siguiente: {nextService.shortName} <ArrowRight size={16} />
      </Link>
    </footer>
  );
}

export default function SectorExperience({ serviceId }) {
  const service = SERVICES[serviceId];
  const estimatorRef = useRef(null);

  return (
    <div
      className={`sector-experience sector-${service.id}`}
      style={{
        "--sector-accent": service.accent,
        "--sector-tint": service.tint,
        "--blue": service.accent,
      }}
    >
      <SectorRouteHeader service={service} />
      <main>
        <SimulatorCover service={service} />
        <SectorSwitcher service={service} />
        <Estimator
          activeId={service.id}
          setActiveId={() => {}}
          estimatorRef={estimatorRef}
          standalone
        />
        <SectorBotNote service={service} />
      </main>
      <SectorRouteFooter service={service} />
    </div>
  );
}
