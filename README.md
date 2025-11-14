# Chatbot App – Complete LLM-Powered Chat Interface

A production-ready chatbot application with real LLM integration via OpenRouter. Works like ChatGPT or Gemini with conversation history, context awareness, and a beautiful responsive UI.

## Quick Start

1. **Create a `.env` file** in the project root:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   OPENROUTER_MODEL=z-ai/glm-4.5-air:free
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   node server.js
   ```

4. **Open your browser** to `http://localhost:8787`

That's it! The server serves the frontend and handles all LLM communication.

## Features

- ✅ **Real LLM Integration** – Powered by OpenRouter (supports GPT-4, Claude, Gemini, and more)
- ✅ **Conversation History** – Maintains context across messages for natural conversations
- ✅ **Two UI Options**:
  - **Plain HTML/CSS/JS** – Works in any browser, no build step
  - **React + Tailwind** – Modern component-based UI (build with `cd react && npm run build`)
- ✅ **Responsive Design** – Mobile-first, works on all devices
- ✅ **Accessibility** – ARIA labels, keyboard navigation, screen reader support
- ✅ **Local Storage** – Messages persist in your browser
- ✅ **Error Handling** – Graceful fallbacks if API is unavailable

## Project Structure

```
.
├── server.js              # Main server (serves frontend + API)
├── plain/                 # Plain HTML/CSS/JS implementation
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── react/                 # React + Tailwind implementation
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── api.js
│   └── package.json
└── .env                   # Your API keys (not in git)
```

## API Endpoints

### `POST /api/chat`
Send a message and get an LLM response.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "sessionId": "abc123"
}
```

### `POST /api/clear`
Clear conversation history for a session.

### `GET /health`
Check server status and configuration.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
PORT=8787
```

- `OPENROUTER_API_KEY` (required) – Your OpenRouter API key
- `OPENROUTER_MODEL` (optional) – Model to use, defaults to `z-ai/glm-4.5-air:free`
- `PORT` (optional) – Server port, defaults to `8787`

### Available Models

You can use any model supported by OpenRouter:
- `openai/gpt-4-turbo`
- `anthropic/claude-3-opus`
- `google/gemini-pro`
- `z-ai/glm-4.5-air:free` (default, free tier)

See [OpenRouter Models](https://openrouter.ai/models) for the full list.

## Development

### Running the React Version

```bash
cd react
npm install
npm run dev      # Development server
npm run build    # Production build
npm test         # Run tests
```

After building, the main server will automatically serve the React build at the root URL.

### Running the Plain Version

The plain version is served at `/plain` or as the default if React isn't built.

## How It Works

1. **Server** (`server.js`):
   - Serves static frontend files
   - Maintains conversation history per session
   - Proxies requests to OpenRouter API
   - Handles errors gracefully

2. **Frontend**:
   - Sends messages to `/api/chat`
   - Displays responses in real-time
   - Persists messages in localStorage
   - Shows typing indicators

3. **Conversation Context**:
   - Server maintains last 20 messages per session
   - Each API call includes full conversation history
   - LLM responds with full context awareness

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Render** (Recommended for full-stack):
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Railway**:
   - Import from GitHub
   - Add environment variables
   - Auto-deploys on push

3. **Vercel**:
   - Import GitHub repo
   - Configure build settings
   - Add environment variables

### Environment Variables

Set these in your deployment platform:
- `OPENROUTER_API_KEY` (required)
- `OPENROUTER_MODEL` (optional, defaults to `z-ai/glm-4.5-air:free`)
- `PORT` (optional, auto-set by most platforms)

## Troubleshooting

**"OPENROUTER_API_KEY is missing"**
- Make sure you created a `.env` file with your API key

**"Cannot GET /"**
- Make sure the server is running (`node server.js`)
- Check that you're accessing `http://localhost:8787`

**API errors**
- Verify your OpenRouter API key is valid
- Check that the model name is correct
- Review server logs for detailed error messages

## Testing

```bash
# React app tests
cd react
npm test

# Test the API
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## License

MIT

---

**Enjoy chatting with your AI assistant!** 🚀
