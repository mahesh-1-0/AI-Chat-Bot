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
  text: "Hello! I'm your AI assistant. How can I help you today?",
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
  const [status, setStatus] = useState("Ready");
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
    setStatus("Connecting...");
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
      setStatus(result.mode === "live" ? "Online" : "Mock mode");
      setLiveAnnouncement(result.reply);
    } catch (error) {
      console.error(error);
      const fallback = createMessage(
        "Sorry, I'm having trouble connecting right now. Please try again.",
        "bot"
      );
      setMessages((prev) => [...prev, fallback]);
      setStatus("Error");
      setLiveAnnouncement("Connection error occurred.");
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
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              AI Chat Bot
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              AI Conversation Terminal
            </h1>
            <p className="max-w-2xl mt-2 text-sm text-gray-600 dark:text-gray-400">
              AI chat interface with real LLM integration via OpenRouter. Messages persist locally.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </p>
            <p
              className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              aria-live="polite"
            >
              {status}
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline-offset-4 hover:underline transition-colors"
            >
              Clear history
            </button>
          </div>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <ChatWindow messages={messages} isTyping={isTyping} />
            <Composer
              ref={inputRef}
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              disabled={isTyping}
            />
          </div>
          <aside className="space-y-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-sm text-gray-600 dark:text-gray-400">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Tips</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Press Enter to send, Shift+Enter for a new line</li>
              <li>Session data is stored locally in your browser</li>
              <li>Responses come from the API or a mock fallback</li>
            </ul>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-2">
                API Endpoint
              </p>
              <p className="text-xs font-mono text-gray-900 dark:text-gray-100">{apiUrl}</p>
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
