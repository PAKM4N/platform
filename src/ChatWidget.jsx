import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, LoaderCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { SERVICES_BY_SLUG } from "./service-models";

const STORAGE_KEY = "mercamicro-budget-chat-v1";
const SERVICE_REPLIES = [
  "Vehículos",
  "Bicicletas",
  "Taller",
  "Mudanzas",
  "Limpieza",
  "Pintura",
  "Reformas",
];

function serviceForPath(pathname) {
  const slug = String(pathname).split("/").filter(Boolean)[0];
  return SERVICES_BY_SLUG[slug] || null;
}

function initialAssistantMessage(pathname) {
  const service = serviceForPath(pathname);
  if (service) {
    return `Hola. Soy la demo real de Mercamicro para ${service.name.toLowerCase()}. Te haré cinco preguntas y calcularé una horquilla con las mismas reglas del simulador.`;
  }
  return "Hola. Soy la demo real de Mercamicro. Puedo guiarte por cualquiera de los siete presupuestos y calcular una horquilla orientativa.";
}

function loadSession(pathname) {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    if (saved?.messages?.length) return saved;
  } catch {
    // La sesión es opcional; una entrada dañada se reemplaza sin bloquear el chat.
  }
  const service = serviceForPath(pathname);
  return {
    conversationId: null,
    messages: [{ role: "assistant", text: initialAssistantMessage(pathname) }],
    quickReplies: service ? ["Empezar"] : SERVICE_REPLIES,
  };
}

export default function ChatWidget({ pathname }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [session, setSession] = useState(() => loadSession(pathname));
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const service = useMemo(() => serviceForPath(pathname), [pathname]);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("mercamicro:open-chat", openChat);
    return () => window.removeEventListener("mercamicro:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeWithEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
    inputRef.current?.focus();
  }, [open, session.messages, sending]);

  const sendMessage = async (providedMessage) => {
    const message = String(providedMessage ?? draft).trim();
    if (!message || sending) return;

    setDraft("");
    setSending(true);
    setSession((current) => ({
      ...current,
      quickReplies: [],
      messages: [...current.messages, { role: "user", text: message }],
    }));

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId: session.conversationId || undefined,
          message,
          pagePath: pathname,
          locale: navigator.language || "es",
          website: "",
        }),
      });

      if (!response.ok) throw new Error("chat_unavailable");
      const result = await response.json();
      setSession((current) => ({
        conversationId: result.conversationId,
        messages: [
          ...current.messages,
          { role: "assistant", text: result.message },
        ],
        quickReplies: result.quickReplies || [],
      }));
    } catch {
      setSession((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            role: "assistant",
            text: "Ahora mismo no puedo conectar con el asistente. Vuelve a intentarlo en unos segundos.",
            error: true,
          },
        ],
      }));
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    if (session.conversationId) {
      sendMessage("otro presupuesto");
      return;
    }
    setSession({
      conversationId: null,
      messages: [{ role: "assistant", text: initialAssistantMessage(pathname) }],
      quickReplies: service ? ["Empezar"] : SERVICE_REPLIES,
    });
  };

  return (
    <aside className={`real-chat ${open ? "is-open" : ""}`}>
      {open && (
        <section
          className="real-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Chat de presupuestos Mercamicro"
        >
          <header className="real-chat-header">
            <span className="real-chat-avatar">
              <img src="/mercamicro-logo.jpg" alt="" />
              <i />
            </span>
            <span>
              <strong>Asistente Mercamicro</strong>
              <small>
                <Sparkles size={12} /> Demo real · {service?.shortName || "7 sectores"}
              </small>
            </span>
            <button type="button" onClick={restart} aria-label="Reiniciar conversación">
              <RotateCcw size={17} />
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <X size={19} />
            </button>
          </header>

          <div className="real-chat-messages" ref={messagesRef} aria-live="polite">
            <span className="real-chat-day">Ahora</span>
            {session.messages.map((message, index) => (
              <p
                className={`real-chat-message is-${message.role} ${message.error ? "is-error" : ""}`}
                key={`${message.role}-${index}-${message.text.slice(0, 12)}`}
              >
                {message.text}
              </p>
            ))}
            {sending && (
              <p className="real-chat-message is-assistant is-typing">
                <LoaderCircle size={16} /> Calculando…
              </p>
            )}
            {!!session.quickReplies.length && !sending && (
              <div className="real-chat-replies" aria-label="Respuestas rápidas">
                {session.quickReplies.map((reply) => (
                  <button type="button" key={reply} onClick={() => sendMessage(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="real-chat-compose"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <label htmlFor="real-chat-input">Escribe tu respuesta</label>
            <textarea
              id="real-chat-input"
              ref={inputRef}
              rows="1"
              value={draft}
              maxLength="2000"
              placeholder="Escribe un mensaje…"
              disabled={sending}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="submit" disabled={sending || !draft.trim()} aria-label="Enviar mensaje">
              <Send size={17} />
            </button>
          </form>
          <small className="real-chat-privacy">
            Conversación de demostración. No incluyas datos personales o confidenciales.
          </small>
        </section>
      )}

      <button
        className="real-chat-launcher"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de presupuestos"}
      >
        {open ? <X size={23} /> : <Bot size={24} />}
        {!open && <span>Probar chatbot real</span>}
      </button>
    </aside>
  );
}
