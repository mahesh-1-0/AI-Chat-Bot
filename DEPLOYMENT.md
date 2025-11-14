# Deployment Guide

This guide will help you upload your chatbot to GitHub and deploy it to various platforms.

## 📤 Upload to GitHub

### Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd "E:\chat bot"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI Chat Bot with OpenRouter integration"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it (e.g., `ai-chatbot` or `chatbot-app`)
4. **Don't** initialize with README (you already have one)
5. Click **"Create repository"**

### Step 3: Connect and Push

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename main branch if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You'll need to authenticate. Use a Personal Access Token if prompted.

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Best for:** Frontend + Serverless functions

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** Leave empty (or `cd react && npm run build` if using React)
   - **Output Directory:** `plain` (or `react/dist` if using React)
5. Add Environment Variables:
   - `OPENROUTER_API_KEY` = your API key
   - `OPENROUTER_MODEL` = `z-ai/glm-4.5-air:free` (optional)
6. Click **"Deploy"**

**Note:** For server deployment, you'll need to use Vercel's serverless functions or deploy the server separately.

---

### Option 2: Render (Best for Full-Stack)

**Best for:** Node.js server with frontend

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `ai-chatbot`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free tier is fine
5. Add Environment Variables:
   - `OPENROUTER_API_KEY` = your API key
   - `OPENROUTER_MODEL` = `z-ai/glm-4.5-air:free` (optional)
   - `PORT` = `8787` (optional, Render sets this automatically)
6. Click **"Create Web Service"**

**Your app will be live at:** `https://your-app-name.onrender.com`

---

### Option 3: Railway

**Best for:** Full-stack apps with database support

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add Environment Variables:
   - `OPENROUTER_API_KEY` = your API key
   - `OPENROUTER_MODEL` = `z-ai/glm-4.5-air:free` (optional)
5. Railway auto-detects Node.js and deploys

**Your app will be live at:** `https://your-app-name.up.railway.app`

---

### Option 4: Netlify

**Best for:** Static frontend (requires separate backend)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select your repo
4. Configure:
   - **Base directory:** `plain` (or `react` if using React)
   - **Build command:** (leave empty for plain, or `npm run build` for React)
   - **Publish directory:** `plain` (or `react/dist` for React)
5. Add Environment Variables in Site settings → Environment variables
6. Deploy

**Note:** For the API, deploy `server.js` separately to Render/Railway and update the API URL in your frontend.

---

### Option 5: Fly.io

**Best for:** Full control, Docker support

1. Install Fly CLI: `npm install -g @fly/cli`
2. Sign up: `fly auth signup`
3. Initialize: `fly launch` (in your project directory)
4. Add secrets:
   ```bash
   fly secrets set OPENROUTER_API_KEY=your-key-here
   fly secrets set OPENROUTER_MODEL=z-ai/glm-4.5-air:free
   ```
5. Deploy: `fly deploy`

---

## 🔧 Pre-Deployment Checklist

- [ ] Remove or secure your `.env` file (never commit API keys!)
- [ ] Update `README.md` with your deployment URL
- [ ] Test locally: `npm start`
- [ ] Ensure `.gitignore` includes `.env` and `node_modules/`
- [ ] Build React version if using: `cd react && npm run build`

---

## 🔐 Environment Variables Setup

For all platforms, you'll need to set these environment variables:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
PORT=8787
```

**Never commit your `.env` file to GitHub!**

---

## 📝 Quick Deploy Commands

### Render
```bash
# After connecting GitHub repo, just set env vars in dashboard
```

### Railway
```bash
railway login
railway init
railway up
```

### Vercel
```bash
npm i -g vercel
vercel login
vercel
```

---

## 🐛 Troubleshooting

**Issue:** API key not working after deployment
- **Solution:** Double-check environment variables are set correctly in your platform's dashboard

**Issue:** Server not starting
- **Solution:** Check logs in your platform's dashboard, ensure `node server.js` is the start command

**Issue:** CORS errors
- **Solution:** Make sure your server.js has `app.use(cors())` enabled

**Issue:** Port errors
- **Solution:** Use `process.env.PORT || 8787` (already in server.js)

---

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)

---

**Need help?** Check your platform's logs and ensure all environment variables are set correctly!

