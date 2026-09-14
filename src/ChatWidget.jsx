import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, LoaderCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { SERVICES_BY_SLUG } from "./service-models";

const STORAGE_KEY = "mercamicro-budget-chat-v2";
const sessionKey = (pathname) => `${STORAGE_KEY}:${serviceForPath(pathname)?.id || "home"}`;
const CONVERSATION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    const saved = JSON.parse(window.sessionStorage.getItem(sessionKey(pathname)));
    if (Array.isArray(saved?.messages) && saved.messages.length && saved.messages.every((item) =>
      item && ["user", "assistant"].includes(item.role) && typeof item.text === "string"
    ) && Array.isArray(saved.quickReplies) && saved.quickReplies.every((item) => typeof item === "string") &&
      (saved.conversationId === null || CONVERSATION_ID_PATTERN.test(saved.conversationId))) {
      return {
        ...saved,
        recoveryRequired: saved.recoveryRequired === true,
        quickReplies: saved.recoveryRequired === true ? [] : saved.quickReplies,
      };
    }
  } catch {
    // La sesión es opcional; una entrada dañada se reemplaza sin bloquear el chat.
  }
  const service = serviceForPath(pathname);
  return {
    conversationId: null,
    recoveryRequired: false,
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
  const launcherRef = useRef(null);
  const recoveryButtonRef = useRef(null);
  const sendingRef = useRef(false);
  const requestRef = useRef(null);
  const service = useMemo(() => serviceForPath(pathname), [pathname]);

  useEffect(() => {
    try { window.sessionStorage.setItem(sessionKey(pathname), JSON.stringify(session)); } catch { /* El chat funciona también sin almacenamiento. */ }
  }, [session, pathname]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const closeChat = () => { setOpen(false); launcherRef.current?.focus(); };

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("mercamicro:open-chat", openChat);
    return () => window.removeEventListener("mercamicro:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeWithEscape = (event) => {
      if (event.key === "Escape") closeChat();
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
    if (session.recoveryRequired && !sending) recoveryButtonRef.current?.focus();
    else inputRef.current?.focus();
  }, [open, session.messages, sending]);

  const sendMessage = async (providedMessage) => {
    const message = String(providedMessage ?? draft).trim();
    if (!message || sendingRef.current || session.recoveryRequired) return;
    sendingRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    setDraft("");
    setSending(true);
    setSession((current) => ({
      ...current,
      // A reload while awaiting the response must not resume an uncertain state.
      recoveryRequired: true,
      quickReplies: [],
      messages: [...current.messages, { role: "user", text: message }],
    }));

    try {
      const response = await fetch("/api/chat/messages", {
        signal: controller.signal,
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

      if (!response.ok) throw new Error(response.status === 429 ? "chat_rate_limit" : "chat_unavailable");
      const result = await response.json();
      if (!CONVERSATION_ID_PATTERN.test(result.conversationId) || typeof result.message !== "string" ||
        !Array.isArray(result.quickReplies) || !result.quickReplies.every((reply) => typeof reply === "string")) {
        throw new Error("chat_unavailable");
      }
      setSession((current) => ({
        conversationId: result.conversationId,
        recoveryRequired: false,
        messages: [
          ...current.messages,
          { role: "assistant", text: result.message },
        ],
        quickReplies: result.quickReplies || [],
      }));
    } catch (error) {
      const retrySafe = error.message === "chat_rate_limit";
      setDraft(retrySafe ? message : "");
      setSession((current) => ({
        ...current,
        recoveryRequired: !retrySafe,
        quickReplies: [],
        messages: [
          ...current.messages,
          {
            role: "assistant",
            text: retrySafe
              ? "Hemos recibido varios mensajes seguidos. Espera un minuto y vuelve a enviar tu respuesta."
              : "La conexión se ha interrumpido antes de poder confirmar tu última respuesta.",
            error: true,
          },
        ],
      }));
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
      sendingRef.current = false;
      setSending(false);
    }
  };

  const restart = () => {
    if (sendingRef.current) return;
    setDraft("");
    setSession({
      conversationId: null,
      recoveryRequired: false,
      messages: [{ role: "assistant", text: initialAssistantMessage(pathname) }],
      quickReplies: service ? ["Empezar"] : SERVICE_REPLIES,
    });
  };

  return (
    <aside className={`real-chat ${open ? "is-open" : ""}`}>
      {open && (
        <section
          className="real-chat-panel"
          id="mercamicro-chat-panel"
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
            <button type="button" onClick={restart} disabled={sending} aria-label="Reiniciar conversación">
              <RotateCcw size={17} />
            </button>
            <button type="button" onClick={closeChat} aria-label="Cerrar chat">
              <X size={19} />
            </button>
          </header>

          <div className="real-chat-messages" ref={messagesRef} role="log" aria-label="Conversación" aria-live="polite">
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
            {session.recoveryRequired && !sending && (
              <div className="real-chat-recovery">
                <p className="real-chat-message is-assistant is-error" id="chat-recovery-hint" role="alert">
                  No podemos confirmar el estado de esta conversación. Reiníciala para continuar sin aplicar tu respuesta a otra pregunta.
                </p>
                <div className="real-chat-replies">
                  <button type="button" ref={recoveryButtonRef} onClick={restart}>
                    Reiniciar conversación
                  </button>
                </div>
              </div>
            )}
            {!!session.quickReplies.length && !sending && !session.recoveryRequired && (
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
              disabled={sending || session.recoveryRequired}
              aria-describedby={session.recoveryRequired && !sending ? "chat-recovery-hint" : undefined}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button type="submit" disabled={sending || session.recoveryRequired || !draft.trim()} aria-label="Enviar mensaje">
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
        ref={launcherRef}
        type="button"
        onClick={() => open ? closeChat() : setOpen(true)}
        aria-expanded={open}
        aria-controls={open ? "mercamicro-chat-panel" : undefined}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de presupuestos"}
      >
        {open ? <X size={23} /> : <Bot size={24} />}
        {!open && <span>Probar chatbot real</span>}
      </button>
    </aside>
  );
}
