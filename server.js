import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 8787;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "z-ai/glm-4.5-air:free";

// In-memory conversation history (in production, use a database)
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

// Get or create conversation history for a session
function getConversationHistory(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  return conversations.get(sessionId);
}

// Add message to conversation history
function addToHistory(sessionId, role, content) {
  const history = getConversationHistory(sessionId);
  history.push({ role, content });
  // Keep last 20 messages to avoid token limits
  if (history.length > 20) {
    history.shift();
  }
}

async function fetchCompletion(messages) {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is missing. Create a .env file with your API key."
    );
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": `http://localhost:${PORT}`,
      "X-Title": "Chatbot App",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful, friendly, and concise AI assistant. Provide clear and useful responses.",
        },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter error ${response.status}: ${errorText.slice(0, 200)}`
    );
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("OpenRouter returned an empty reply.");
  }
  return reply;
}

app.post("/api/chat", async (req, res) => {
  const { message = "", sessionId: providedSessionId } = req.body ?? {};
  const sanitized = message.trim();

  // Generate or use provided session ID
  const sessionId = providedSessionId ?? randomUUID();

  try {
    if (!sanitized) {
      return res.json({
        reply: "Hello! I'm ready to chat. What would you like to know?",
        sessionId,
      });
    }

    // Get conversation history for this session
    const history = getConversationHistory(sessionId);

    // Add user message to history
    addToHistory(sessionId, "user", sanitized);

    // Fetch completion with full conversation context
    const reply = await fetchCompletion(history);

    // Add assistant reply to history
    addToHistory(sessionId, "assistant", reply);

    res.json({
      reply,
      sessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(502).json({
      reply:
        "I'm having trouble connecting to the AI service right now. Please check your API key and try again.",
      sessionId,
      error: error.message,
    });
  }
});

// Clear conversation history endpoint
app.post("/api/clear", (req, res) => {
  const { sessionId } = req.body ?? {};
  if (sessionId && conversations.has(sessionId)) {
    conversations.delete(sessionId);
  }
  res.json({ success: true });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    model: OPENROUTER_MODEL,
    apiKeyConfigured: Boolean(OPENROUTER_API_KEY),
    activeSessions: conversations.size,
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Chatbot server running at http://localhost:${PORT}`);
  console.log(`📝 Model: ${OPENROUTER_MODEL}`);
  console.log(`🔑 API Key: ${OPENROUTER_API_KEY ? "✅ Configured" : "❌ Missing"}`);
  console.log(`\n💡 Open http://localhost:${PORT} in your browser to start chatting!\n`);
});
