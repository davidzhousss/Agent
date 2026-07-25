# Finance Agent

A finance analysis chat powered by Claude. A polished chat frontend (`finance-agent.html`) connects to a lightweight Node.js proxy server that handles the Claude API calls.

## How it works

```
SharePoint page  →  finance-agent.html  →  server.js  →  Claude API
```

The frontend is a single self-contained HTML file you host on SharePoint. The server is a small Node.js app you run on your infrastructure (local, Azure, Fly.io, etc.).

---

## 1. Run the server

### Requirements
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
cd server
npm install

cp ../.env.example .env
# Edit .env — add your ANTHROPIC_API_KEY
```

```bash
npm start
# Finance Agent server running
# Local:   http://localhost:3001
# Health:  http://localhost:3001/health
```

Visit `/health` in a browser to confirm it's running.

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | _(required)_ | Your Anthropic API key |
| `PORT` | `3001` | Free tier works on 8080 for Azure |
| `MODEL` | `claude-sonnet-5` | Claude model to use |

---

## 2. Deploy to SharePoint

### Option A — Direct file link (simplest)

1. Open your SharePoint document library
2. Upload `finance-agent.html`
3. Click the file → **Open in browser** — share that URL with your team

### Option B — Embed in a SharePoint page

1. Upload `finance-agent.html` to a document library (note the URL)
2. Edit a SharePoint page → **+** → **Embed**
3. Paste: `<iframe src="YOUR_FILE_URL" width="100%" height="700" style="border:none"></iframe>`
4. Publish the page

---

## 3. Connect the frontend to your server

The first time you open the chat:

1. Click the **status pill** (top-right of the chat) — it opens Settings
2. Enter your server URL (e.g. `https://your-server.azurewebsites.net`)
3. Click **Test connection** to verify
4. Click **Save** — the URL is stored in the browser per user

---

## Deploying the server to Azure App Service

```bash
# Create and deploy
az webapp create --resource-group myRG --plan myPlan \
  --name finance-agent-server --runtime "NODE:22-lts"

az webapp config appsettings set \
  --name finance-agent-server --resource-group myRG \
  --settings ANTHROPIC_API_KEY="sk-ant-..." PORT=8080

az webapp deploy --name finance-agent-server \
  --resource-group myRG --src-path ./server --type zip
```

Then set the chat's server URL to `https://finance-agent-server.azurewebsites.net`.

---

## File structure

```
finance-agent.html    ← Upload this to SharePoint
server/
  server.js           ← Run this on your server
  package.json
.env.example          ← Copy to server/.env and fill in
```
