import 'dotenv/config';
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Read env vars with safe defaults (do NOT log secrets)
const PORT = process.env.PORT ?? 8787;
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || "").trim();
const OPENROUTER_MODEL   = (process.env.OPENROUTER_MODEL || "z-ai/glm-4.5-air:free").trim();


// In-memory conversation history (for demo; use a DB in production)
const conversations = new Map();

app.use(cors());
app.use(express.json());

// Serve static files from plain directory (CSS, JS, etc.)
app.use(express.static(join(__dirname, "plain")));

// Serve React build if it exists, otherwise serve plain as default
const reactBuildPath = join(__dirname, "react", "dist");
if (existsSync(reactBuildPath)) {
  app.use(express.static(reactBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(join(reactBuildPath, "index.html"));
  });
} else {
  // Serve plain HTML at root - all assets are served from root via static middleware above
  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "plain", "index.html"));
  });
}

// Helpers for conversation history
function getConversationHistory(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  return conversations.get(sessionId);
}

function addToHistory(sessionId, role, content) {
  const history = getConversationHistory(sessionId);
  history.push({ role, content });
  if (history.length > 20) history.shift(); // keep history small
}

// Fetch completion from OpenRouter
async function fetchCompletion(messages) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing. Configure it in your environment.");
  }

  const payload = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful, friendly, and concise AI assistant. Provide clear and useful responses.",
      },
      ...messages,
    ],
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      // optional additional headers:
      "HTTP-Referer": `http://localhost:${PORT}`,
      "X-Title": "Chatbot App",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("OpenRouter returned an empty reply.");
  return reply;
}

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message = "", sessionId: providedSessionId } = req.body ?? {};
  const sanitized = String(message).trim();
  const sessionId = providedSessionId ?? randomUUID();

  try {
    if (!sanitized) {
      return res.json({
        reply: "Hello! I'm ready to chat. What would you like to know?",
        sessionId,
      });
    }

    // add user message
    addToHistory(sessionId, "user", sanitized);

    // fetch reply using conversation history
    const history = getConversationHistory(sessionId);
    const reply = await fetchCompletion(history);

    // add assistant reply to history and respond
    addToHistory(sessionId, "assistant", reply);
    res.json({ reply, sessionId });
  } catch (err) {
    console.error("Chat error:", err?.message ?? err);
    res.status(502).json({
      reply:
        "I'm having trouble connecting to the AI service right now. Please check your API key and try again.",
      sessionId,
      error: err?.message ?? String(err),
    });
  }
});

// Clear conversation history
app.post("/api/clear", (req, res) => {
  const { sessionId } = req.body ?? {};
  if (sessionId && conversations.has(sessionId)) conversations.delete(sessionId);
  res.json({ success: true });
});

// Health endpoint
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    model: OPENROUTER_MODEL,
    apiKeyConfigured: Boolean(OPENROUTER_API_KEY),
    activeSessions: conversations.size,
  });
});

// Start server
app.listen(PORT, () => {
  // Render/host platforms set process.env.PORT. Bind message is informational.
  console.log(`\n🚀 Chatbot server running at http://localhost:${PORT}`);
  console.log(`📝 Model: ${OPENROUTER_MODEL}`);
  console.log(`🔑 API Key: ${OPENROUTER_API_KEY ? "✅ Configured" : "❌ Missing"}`);
  console.log("\n💡 Open the URL above to start chatting (or call /api/chat).\n");
});
