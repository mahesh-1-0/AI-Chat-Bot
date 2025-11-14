import { useEffect, useMemo, useRef, useState } from "react";
import ChatWindow from "./components/ChatWindow.jsx";
import Composer from "./components/Composer.jsx";
import { sendChatMessage } from "./api.js";

const SESSION_STORAGE_KEY = "chatbot_session_id";
const HISTORY_PREFIX = "chatbot_history";
const MIN_TYPING_DURATION = 350;

const welcomeMessage = () => ({
  id: "welcome",
  sender: "bot",
  text: "👾 WELCOME TO PIXEL CHAT! 👾\n\nTYPE YOUR MESSAGE AND PRESS ENTER TO START CHATTING WITH THE AI!",
  timestamp: new Date().toISOString(),
});

function getHistoryKey(id) {
  return `${HISTORY_PREFIX}_${id}`;
}

function loadHistory(id) {
  try {
    const stored = JSON.parse(localStorage.getItem(getHistoryKey(id)));
    return Array.isArray(stored) && stored.length ? stored : [welcomeMessage()];
  } catch {
    return [welcomeMessage()];
  }
}

function getOrCreateSessionId() {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

export function ChatApp({ apiUrl = "/api/chat" }) {
  const initialSession = useMemo(() => getOrCreateSessionId(), []);
  const [sessionId, setSessionId] = useState(initialSession);
  const [messages, setMessages] = useState(() => loadHistory(initialSession));
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState("READY");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const inputRef = useRef(null);
  const previousSessionId = useRef(initialSession);

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (previousSessionId.current === sessionId) {
      return;
    }
    previousSessionId.current = sessionId;
    setMessages(loadHistory(sessionId));
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(getHistoryKey(sessionId), JSON.stringify(messages));
  }, [messages, sessionId]);

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const userMessage = createMessage(trimmed, "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setStatus("CONNECTING...");
    const startTime = performance.now();

    try {
      const result = await sendChatMessage({
        message: trimmed,
        sessionId,
        apiUrl,
      });
      if (result.sessionId && result.sessionId !== sessionId) {
        setSessionId(result.sessionId);
      }
      const botMessage = createMessage(result.reply, "bot");
      setMessages((prev) => [...prev, botMessage]);
      setStatus(result.mode === "live" ? "ONLINE" : "MOCK MODE");
      setLiveAnnouncement(result.reply);
    } catch (error) {
      console.error(error);
      const fallback = createMessage(
        "ERROR: CONNECTION FAILED. PLEASE TRY AGAIN.",
        "bot"
      );
      setMessages((prev) => [...prev, fallback]);
      setStatus("ERROR");
      setLiveAnnouncement("We hit an error replying.");
    } finally {
      const elapsed = performance.now() - startTime;
      if (elapsed < MIN_TYPING_DURATION) {
        await sleep(MIN_TYPING_DURATION - elapsed);
      }
      setIsTyping(false);
      queueMicrotask(() => {
        inputRef.current?.focus();
      });
    }
  }

  function handleClear() {
    localStorage.removeItem(getHistoryKey(sessionId));
    setMessages([welcomeMessage()]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-pixel-bg px-4 py-6 text-pixel-text font-pixel text-xs">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 relative z-10">
        <header className="pixel-border bg-pixel-panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-pixel-accent pixel-glow">
                AI CHAT BOT
              </p>
              <h1 className="mt-2 text-xl md:text-2xl text-pixel-accent pixel-glow">
                AI CONVERSATION TERMINAL
              </h1>
              <p className="max-w-2xl text-[0.65rem] text-pixel-text-muted leading-relaxed mt-2">
                PIXEL-STYLED CHAT INTERFACE WITH REAL LLM INTEGRATION. MESSAGES PERSIST LOCALLY.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <p className="text-[0.6rem] uppercase tracking-widest text-pixel-text-muted">
                STATUS
              </p>
              <p
                className="pixel-border bg-pixel-panel px-4 py-2 text-[0.7rem] text-pixel-success pixel-glow"
                aria-live="polite"
              >
                {status}
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="pixel-button bg-transparent border-pixel-border text-pixel-text text-[0.6rem] px-3 py-1"
              >
                CLEAR
              </button>
            </div>
          </div>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4 pixel-border bg-pixel-panel p-4 relative">
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
              }}
            />
            <div className="relative z-10">
              <ChatWindow messages={messages} isTyping={isTyping} />
              <Composer
                ref={inputRef}
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                disabled={isTyping}
              />
            </div>
          </div>
          <aside className="pixel-border bg-pixel-panel p-5 text-[0.6rem] text-pixel-text-muted space-y-4 relative">
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
              }}
            />
            <div className="relative z-10">
              <h2 className="text-[0.9rem] text-pixel-accent pixel-glow mb-4">COMMANDS</h2>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed">
                <li>ENTER = SEND MESSAGE</li>
                <li>SHIFT+ENTER = NEW LINE</li>
                <li>DATA STORED LOCALLY</li>
                <li>REAL LLM RESPONSES</li>
              </ul>
              <div className="pixel-border bg-pixel-panel p-4 mt-4 border-pixel-accent">
                <p className="text-[0.6rem] uppercase tracking-[0.15em] text-pixel-accent mb-2">
                  API ENDPOINT
                </p>
                <p className="text-[0.65rem] font-mono text-pixel-text">{apiUrl}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>
    </div>
  );
}

function createMessage(text, sender) {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    timestamp: new Date().toISOString(),
  };
}

export default function App() {
  return <ChatApp />;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
