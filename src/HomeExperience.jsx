"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import DemoLibrary from "./DemoLibrary";
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
        <a href="#biblioteca-demos">Demos</a>
        <a href="#sectores">Simuladores sectoriales</a>
        <a href="#bots">Bots para mensajería</a>
        <a href="https://presupuestos.mercamicro.es">Cuéntanos tu proyecto</a>
      </nav>
      <a className="portal-header-action" href="#biblioteca-demos">
        Ver demos <ArrowRight size={15} />
      </a>
    </header>
  );
}

function SectorPicker() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const syncTrackState = useCallback((track) => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextProgress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const cards = Array.from(track.querySelectorAll(".sector-choice"));
    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    setProgress(Math.min(1, Math.max(0, nextProgress)));
    setActiveIndex(closestIndex);
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let frameId;
    const balanceDesktopBleed = () => {
      const cards = Array.from(track.querySelectorAll(".sector-choice"));
      const firstCard = cards[0];

      if (!firstCard || window.innerWidth <= 820) {
        track.scrollLeft = 0;
        syncTrackState(track);
        return;
      }

      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      const paddingStart = Number.parseFloat(styles.paddingInlineStart) || 0;
      const cardWidth = firstCard.offsetWidth;
      const edgePeek = Math.min(160, Math.max(96, track.clientWidth * 0.1));
      const idealSpan = track.clientWidth + 2 * Math.max(0, cardWidth - edgePeek);
      const cardCount = Math.min(
        cards.length,
        Math.max(2, Math.round((idealSpan + gap) / (cardWidth + gap))),
      );
      const cardsSpan = cardCount * cardWidth + (cardCount - 1) * gap;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const targetScroll = paddingStart + (cardsSpan - track.clientWidth) / 2;

      track.scrollLeft = Math.min(maxScroll, Math.max(0, targetScroll));
      syncTrackState(track);
    };
    const scheduleBalance = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(balanceDesktopBleed);
    };
    const resizeObserver = new ResizeObserver(scheduleBalance);

    resizeObserver.observe(track);
    scheduleBalance();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [syncTrackState]);

  const move = (direction) => {
    trackRef.current?.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.72, 760),
      behavior: "smooth",
    });
  };

  const updateProgress = (event) => {
    syncTrackState(event.currentTarget);
  };

  return (
    <section className="sector-picker" id="sectores">
      <div className="sector-picker-status">
        <span>{SERVICE_ORDER.length} simuladores detallados · desliza para explorar</span>
        <strong aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / {String(SERVICE_ORDER.length).padStart(2, "0")}
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
          <span className="portal-eyebrow">DEMOSTRACIONES INTERACTIVAS</span>
          <h1>
            ¿Qué quieres
            <br />
            <em>automatizar?</em>
          </h1>
          <p>
            Prueba reservas, presupuestos, atención, pedidos y otros recorridos
            configurados sobre un único motor reutilizable.
          </p>
        </section>
        <DemoLibrary />
        <section className="legacy-sector-heading" id="simuladores-sectoriales">
          <span className="portal-eyebrow">SIMULADORES CON CÁLCULO DETALLADO</span>
          <h2>Siete experiencias sectoriales que conservan toda su profundidad.</h2>
          <p>
            Formularios completos, reglas específicas y desglose económico para
            explorar escenarios más extensos.
          </p>
        </section>
        <SectorPicker />
        <BotOffer />
      </main>
      <footer className="portal-footer">
        <Brand />
        <span>Soluciones digitales a medida · Demo interactiva</span>
        <a href="https://presupuestos.mercamicro.es">
          Configura tu proyecto <ArrowRight size={14} />
        </a>
      </footer>
    </div>
  );
}
