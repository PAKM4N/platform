"use client";

import { useMemo, useRef, useState } from "react";
import { Link } from "./router";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Monitor,
  Send,
} from "lucide-react";
import { Brand } from "./App";
import ConversationFan from "./ConversationFan";
import { SERVICES, SERVICE_ORDER } from "./service-models";

const BOT_LEVELS = [
  {
    id: "faq",
    title: "Preguntas-respuestas predefinidas (FAQs)",
    description: "Respuestas cerradas para las consultas habituales.",
    messages: [
      ["user", "¿Cuál es vuestro horario?"],
      ["bot", "Atendemos de lunes a viernes de 09:00 a 18:00 y los sábados con cita previa."],
    ],
  },
  {
    id: "simple",
    title: "Bot guiado",
    description: "La demo operativa: pregunta, valida y calcula una estimación.",
    messages: [
      ["bot", "¡Hola! ¿Qué servicio necesitas?"],
      ["user", "Quiero calcular una mudanza."],
      ["bot", "Perfecto. Indícame el código postal de origen y el de destino."],
    ],
  },
  {
    id: "advanced",
    title: "Bot avanzado",
    description: "Puede añadir lenguaje natural y conexiones con otros sistemas.",
    messages: [
      ["user", "Me mudo de un tercero sin ascensor a otra ciudad y necesito embalaje."],
      ["bot", "He detectado distancia, dificultad de acceso y embalaje completo. Puedo preparar una horquilla inicial."],
      ["bot", "¿Cuántas estancias tienen mobiliario y qué fecha prefieres?"],
    ],
  },
];

function PortalHeader() {
  return (
    <header className="portal-header">
      <Brand />
      <nav aria-label="Navegación principal">
        <a href="#sectores">Sectores</a>
        <a href="#bots">Bots para mensajería</a>
        <a href="https://presupuestos.mercamicro.es">Pide tu chatbot</a>
      </nav>
      <a className="portal-header-action" href="#sectores">
        Ver demos <ArrowRight size={15} />
      </a>
    </header>
  );
}

function SectorPicker() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const move = (direction) => {
    trackRef.current?.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.72, 760),
      behavior: "smooth",
    });
  };

  const updateProgress = (event) => {
    const track = event.currentTarget;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextProgress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const firstCard = track.querySelector(".sector-choice");
    const cardWidth = (firstCard?.offsetWidth || 1) + 18;

    setProgress(Math.min(1, Math.max(0, nextProgress)));
    setActiveIndex(
      Math.min(
        SERVICE_ORDER.length - 1,
        Math.max(0, Math.round(track.scrollLeft / cardWidth)),
      ),
    );
  };

  return (
    <section className="sector-picker" id="sectores">
      <div className="sector-picker-status">
        <span>7 demos disponibles · desliza para explorar</span>
        <strong aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / 07
        </strong>
      </div>
      <button
        className="sector-picker-arrow is-left"
        type="button"
        onClick={() => move(-1)}
        aria-label="Ver sectores anteriores"
      >
        <ArrowLeft size={22} />
      </button>

      <div
        className="sector-choice-track"
        ref={trackRef}
        onScroll={updateProgress}
      >
        {SERVICE_ORDER.map((id, index) => {
          const service = SERVICES[id];
          const Icon = service.icon;
          return (
            <Link
              to={`/${service.slug}`}
              className="sector-choice"
              key={id}
              style={{
                "--choice-accent": service.accent,
                "--choice-tint": service.tint,
              }}
              aria-label={`Abrir demo de ${service.name}`}
            >
              <img
                src={service.image}
                alt=""
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <span className="sector-choice-overlay" />
              <span className="sector-choice-number">0{index + 1}</span>
              <span className="sector-choice-copy">
                <Icon size={21} />
                <small>{service.eyebrow}</small>
                <strong>{service.name}</strong>
                <span>
                  Ver simulador <ArrowRight size={16} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <button
        className="sector-picker-arrow is-right"
        type="button"
        onClick={() => move(1)}
        aria-label="Ver más sectores"
      >
        <ArrowRight size={22} />
      </button>

      <div className="sector-picker-progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
      </div>
    </section>
  );
}

function BotOffer() {
  const [activeMode, setActiveMode] = useState("simple");
  const activeBot = useMemo(
    () => BOT_LEVELS.find((level) => level.id === activeMode) || BOT_LEVELS[2],
    [activeMode],
  );

  return (
    <section className="bot-offer" id="bots">
      <div className="bot-offer-copy">
        <span className="portal-eyebrow">ATENCIÓN AUTOMATIZADA</span>
        <h2>También podemos crear el bot que responde por ti.</h2>
        <p>
          El chatbot web ya usa las reglas de los simuladores para preguntar,
          validar datos y calcular una horquilla orientativa. El mismo flujo puede
          adaptarse después a otros canales.
        </p>
        <div className="bot-channel-list">
          <span className="is-live">
            <Monitor size={18} />
            <span>Web <small>demo activa</small></span>
          </span>
          <span className="is-optional">
            <MessageCircle size={18} />
            <span>WhatsApp <small>opcional</small></span>
          </span>
          <span className="is-optional">
            <Send size={18} />
            <span>Telegram <small>opcional</small></span>
          </span>
        </div>
        <button
          className="bot-offer-cta"
          type="button"
          onClick={() => window.dispatchEvent(new Event("mercamicro:open-chat"))}
        >
          <MessageCircle size={17} /> Probar el chatbot web
          <ArrowRight size={16} />
        </button>
        <div className="bot-levels">
          {BOT_LEVELS.map((level, index) => (
            <button
              type="button"
              className={activeMode === level.id ? "active" : ""}
              onClick={() => setActiveMode(level.id)}
              aria-pressed={activeMode === level.id}
              key={level.id}
            >
              <small>0{index + 1}</small>
              <span>
                <strong>{level.title}</strong>
                <em>{level.description}</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <ConversationFan
        messages={activeBot.messages}
        assistantName="Asistente Mercamicro"
        subtitle={activeBot.title}
        messageKey={activeBot.id}
      />
    </section>
  );
}

export default function HomeExperience() {
  return (
    <div className="home-experience">
      <PortalHeader />
      <main>
        <section className="portal-hero">
          <span className="portal-eyebrow">DEMOSTRACIONES POR SECTOR</span>
          <h1>
            ¿En qué sector
            <br />
            <em>estás interesado?</em>
          </h1>
          <p>
            Elige una opción para entrar directamente en un simulador adaptado a
            ese tipo de negocio.
          </p>
        </section>
        <SectorPicker />
        <BotOffer />
      </main>
      <footer className="portal-footer">
        <Brand />
        <span>Soluciones digitales a medida · Demo interactiva</span>
        <a href="https://presupuestos.mercamicro.es">
          Presupuesta tu chatbot <ArrowRight size={14} />
        </a>
      </footer>
    </div>
  );
}
