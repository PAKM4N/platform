import { useState } from "react";
import {
  BatteryMedium,
  Camera,
  CheckCheck,
  ChevronLeft,
  LockKeyhole,
  MessageCircle,
  Mic,
  Monitor,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Signal,
  Smile,
  Video,
  Wifi,
} from "lucide-react";

const CHANNELS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    status: "Integración opcional",
    icon: MessageCircle,
    input: "Mensaje",
  },
  {
    id: "web",
    label: "Web",
    status: "Demo operativa",
    helper: "Chat de la web",
    icon: Monitor,
    input: "Escribe un mensaje",
  },
  {
    id: "telegram",
    label: "Telegram",
    status: "Integración opcional",
    icon: Send,
    input: "Mensaje",
  },
];

function ConversationCard({
  channel,
  messages,
  assistantName,
  subtitle,
  messageKey,
  position,
  onActivate,
}) {
  const isWeb = channel.id === "web";
  const isWhatsApp = channel.id === "whatsapp";

  return (
    <article
      className={`conversation-card conversation-card--${channel.id} is-${position}`}
      aria-label={`Ejemplo de conversación en ${channel.label}`}
      aria-pressed={position === "active"}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
    >
      {isWeb ? (
        <div className="conversation-browser-bar">
          <span className="conversation-browser-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="conversation-browser-url">
            <LockKeyhole size={8} aria-hidden="true" /> mercamicro.es
          </span>
          <small>
            <Monitor size={9} aria-hidden="true" /> Demo web
          </small>
        </div>
      ) : (
        <div className="conversation-mobile-status">
          <strong>9:41</strong>
          <span aria-hidden="true">
            <Signal size={10} />
            <Wifi size={10} />
            <BatteryMedium size={12} />
          </span>
        </div>
      )}
      <header className="conversation-card-head">
        {!isWeb && <ChevronLeft className="conversation-back" size={18} aria-hidden="true" />}
        <span className="conversation-card-avatar">
          <img src="/mercamicro-logo.jpg" alt="" />
        </span>
        <div>
          <strong>{assistantName}</strong>
          <small>
            {isWeb && <i />} {isWeb ? `En línea · ${subtitle}` : isWhatsApp ? "en línea" : "bot"}
          </small>
        </div>
        {!isWeb && (
          <span className="conversation-app-actions" aria-hidden="true">
            {isWhatsApp ? <Video size={14} /> : <Search size={14} />}
            {isWhatsApp && <Phone size={13} />}
            <MoreVertical size={15} />
          </span>
        )}
      </header>
      <div className="conversation-card-body">
        <span className="conversation-day">Hoy</span>
        {messages.map(([role, message], index) => (
          <p className={`is-${role}`} key={`${messageKey}-${channel.id}-${index}`}>
            <span>{message}</span>
            <small>
              {index === 0 ? "10:42" : `10:4${index + 2}`}
              {role === "user" && <CheckCheck size={10} aria-hidden="true" />}
            </small>
          </p>
        ))}
      </div>
      {isWeb ? (
        <div className="conversation-card-input">
          <span>{channel.input}</span>
          <Send size={13} aria-hidden="true" />
        </div>
      ) : isWhatsApp ? (
        <div className="conversation-mobile-input conversation-mobile-input--whatsapp">
          <div>
            <Smile size={15} aria-hidden="true" />
            <span>{channel.input}</span>
            <Paperclip size={14} aria-hidden="true" />
            <Camera size={14} aria-hidden="true" />
          </div>
          <i aria-hidden="true">
            <Mic size={15} />
          </i>
        </div>
      ) : (
        <div className="conversation-mobile-input conversation-mobile-input--telegram">
          <Paperclip size={16} aria-hidden="true" />
          <div>
            <span>{channel.input}</span>
            <Smile size={15} aria-hidden="true" />
          </div>
          <Mic size={16} aria-hidden="true" />
        </div>
      )}
    </article>
  );
}

export default function ConversationFan({
  messages,
  assistantName,
  subtitle,
  messageKey = "conversation",
}) {
  const [activeChannel, setActiveChannel] = useState("web");
  const activeIndex = CHANNELS.findIndex((channel) => channel.id === activeChannel);

  const getPosition = (index) => {
    const relativePosition = (index - activeIndex + CHANNELS.length) % CHANNELS.length;
    if (relativePosition === 0) return "active";
    return relativePosition === 1 ? "right" : "left";
  };

  return (
    <div className="conversation-fan" aria-label="Ejemplos de una conversación adaptada a distintos canales">
      <div className="conversation-fan-switcher" aria-label="Elegir canal de la conversación">
        <span>Ejemplos de interfaz</span>
        <div>
          {CHANNELS.map((channel) => {
            const ChannelIcon = channel.icon;
            return (
              <button
                type="button"
                className={activeChannel === channel.id ? "active" : ""}
                aria-pressed={activeChannel === channel.id}
                aria-label={`${channel.label}: ${channel.status}`}
                onClick={() => setActiveChannel(channel.id)}
                key={channel.id}
              >
                <ChannelIcon size={11} aria-hidden="true" />
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="conversation-fan-note">
        <strong>Web operativa</strong>
        <span aria-hidden="true">·</span>
        WhatsApp y Telegram son integraciones opcionales
      </p>
      {CHANNELS.map((channel, index) => (
        <ConversationCard
          key={channel.id}
          channel={channel}
          messages={messages}
          assistantName={assistantName}
          subtitle={subtitle}
          messageKey={messageKey}
          position={getPosition(index)}
          onActivate={() => setActiveChannel(channel.id)}
        />
      ))}
    </div>
  );
}
