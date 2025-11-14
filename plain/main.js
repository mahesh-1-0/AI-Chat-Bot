const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const enterToggle = document.getElementById("enterSendsToggle");
const clearBtn = document.getElementById("clearHistoryBtn");
const connectionStatus = document.getElementById("connectionStatus");

const STORAGE_KEY = "chatbot_plain_history";
const SESSION_KEY = "chatbot_plain_session";
const API_URL = "/api/chat";

let messages = loadMessages();
let sessionId = loadSessionId();
let isSending = false;

// Add welcome message if no messages exist
if (messages.length === 0) {
  messages.push({
    id: crypto.randomUUID(),
    sender: "bot",
    text: "👾 WELCOME TO PIXEL CHAT! 👾\n\nTYPE YOUR MESSAGE AND PRESS ENTER TO START CHATTING WITH THE AI!",
    timestamp: new Date().toISOString(),
  });
  saveMessages();
}

renderMessages();
connectionStatus.textContent = "READY";

sendBtn.addEventListener("click", () => {
  sendCurrentMessage();
});

messageInput.addEventListener("keydown", (event) => {
  if (!enterToggle.checked) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendCurrentMessage();
  }
});

clearBtn.addEventListener("click", () => {
  messages = [];
  saveMessages();
  renderMessages();
  messageInput.focus();
});

async function sendCurrentMessage() {
  const raw = messageInput.value.trim();
  if (!raw || isSending) {
    return;
  }

  const userMessage = createMessage(raw, "user");
  appendMessage(userMessage);
  messageInput.value = "";
  messageInput.focus();

  createTypingIndicator();
  try {
    const botText = await fetchBotReply(raw);
    removeTypingIndicator();
    const replyMessage = createMessage(botText, "bot");
    appendMessage(replyMessage);
  } catch (error) {
    console.error(error);
    removeTypingIndicator();
    const fallbackMessage = createMessage(
      "I had trouble replying just now, please try again.",
      "bot"
    );
    appendMessage(fallbackMessage);
  } finally {
    isSending = false;
    sendBtn.disabled = false;
  }
}

function createMessage(text, sender) {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    timestamp: new Date().toISOString(),
  };
}

function appendMessage(message) {
  messages.push(message);
  saveMessages();
  renderMessages();
}

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function loadSessionId() {
  let saved = localStorage.getItem(SESSION_KEY);
  if (!saved) {
    saved = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, saved);
  }
  return saved;
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function renderMessages() {
  messageList.innerHTML = "";
  const template = document.getElementById("messageTemplate");

  messages.forEach((msg) => {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.classList.add(msg.sender);
    clone.querySelector(".text").textContent = msg.text;
    clone.querySelector(".meta").textContent = formatMeta(msg);
    messageList.appendChild(clone);
  });

  messageList.scrollTop = messageList.scrollHeight;
}

function formatMeta(message) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${message.sender === "user" ? "YOU" : "BOT"} • ${time}`;
}

function createTypingIndicator() {
  isSending = true;
  sendBtn.disabled = true;
  const indicator = document.createElement("li");
  indicator.className = "message bot typing";
  indicator.dataset.typing = "true";
  indicator.innerHTML =
    '<div class="bubble" aria-live="polite" aria-label="Bot is typing">' +
    '<span class="typing-dot"></span>'.repeat(3) +
    "</div>";
  messageList.appendChild(indicator);
  messageList.scrollTop = messageList.scrollHeight;
}

function removeTypingIndicator() {
  const typing = messageList.querySelector('[data-typing="true"]');
  if (typing) {
    typing.remove();
  }
}

function generateMockReply(text) {
  const templates = [
    "Interesting! Tell me more about \"%s\".",
    "I hear \"%s\"—here's a quick tip: stay curious.",
    "Let's explore \"%s\" together.",
    "\"%s\" sounds exciting! What's the next step?",
  ];
  const pick = templates[Math.floor(Math.random() * templates.length)];
  return pick.replace("%s", text);
}

function mockReply(text) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(generateMockReply(text)), 1200);
  });
}

async function fetchBotReply(text) {
  connectionStatus.textContent = "CONNECTING...";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.sessionId && data.sessionId !== sessionId) {
      sessionId = data.sessionId;
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    connectionStatus.textContent = "ONLINE";
    return data.reply ?? "I received your message!";
  } catch (error) {
    clearTimeout(timeout);
    connectionStatus.textContent = "MOCK MODE";
    return mockReply(text);
  }
}

