const MOCK_DELAY = 900;

const mockTemplates = [
  (text) => `I heard "${text}". Let's dig into that together.`,
  (text) => `Thanks for sharing "${text}". Here's a quick thought...`,
  (text) => `“${text}” sounds exciting! What's the next step?`,
];

function generateMockReply(message) {
  const template =
    mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
  return template(message);
}

export async function sendChatMessage({ message, sessionId, apiUrl = "/api/chat" }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply ?? "I'm here to help!",
      sessionId: data.sessionId ?? sessionId,
      mode: "live",
    };
  } catch (error) {
    clearTimeout(timeout);
    console.warn("Falling back to mock reply", error);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reply: generateMockReply(message),
          sessionId,
          mode: "mock",
        });
      }, MOCK_DELAY);
    });
  }
}

