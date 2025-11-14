# Quick GitHub Upload Guide

Follow these steps to upload your chatbot to GitHub and deploy it.

## Step 1: Initialize Git (First Time Only)

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Navigate to your project (if not already there)
cd "E:\chat bot"

# Initialize git repository
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: AI Chat Bot"
```

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `ai-chatbot` (or any name you like)
4. Description: `AI Chat Bot with OpenRouter integration`
5. Choose **Public** or **Private**
6. **DO NOT** check "Add a README file" (you already have one)
7. Click **"Create repository"**

## Step 3: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You may be asked to authenticate. Use:
- Your GitHub username
- A Personal Access Token (not your password)
  - Get one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Give it `repo` permissions

## Step 4: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files
3. Make sure `.env` is NOT visible (it's in `.gitignore`)

---

## 🚀 Deploy to Render (Easiest Option)

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository (`ai-chatbot`)
5. Configure:
   - **Name:** `ai-chatbot` (or any name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
6. Click **"Advanced"** → **"Add Environment Variable"**:
   - Key: `OPENROUTER_API_KEY`
   - Value: `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`
   - Add another:
   - Key: `OPENROUTER_MODEL`
   - Value: `z-ai/glm-4.5-air:free`
7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment
9. Your app will be live at: `https://ai-chatbot.onrender.com` (or your chosen name)

---

## 🚀 Deploy to Railway (Alternative)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Click on your project → **"Variables"** tab
5. Add:
   - `OPENROUTER_API_KEY` = `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`
   - `OPENROUTER_MODEL` = `z-ai/glm-4.5-air:free`
6. Railway auto-deploys! Your app will be at: `https://your-app.up.railway.app`

---

## 📝 Future Updates

After making changes, push updates:

```bash
git add .
git commit -m "Description of your changes"
git push
```

Render/Railway will automatically redeploy!

---

## ⚠️ Important Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- **Keep your API key secret** - only add it as environment variables in your deployment platform
- **Free tiers** may have cold starts (first request takes longer)

---

## 🆘 Need Help?

- Check deployment logs in Render/Railway dashboard
- Make sure environment variables are set correctly
- Verify your API key is valid

**That's it! Your chatbot is now live on the internet! 🎉**

