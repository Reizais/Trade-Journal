# Options Trade Journal

A personal options trading journal with dashboard, trade log, keynotes, and pre-trade checklist. Built with React + Vite.

## Deploy in 5 steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trade-journal.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your `trade-journal` repository
4. Set build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**

Cloudflare will build and deploy automatically. You'll get a free URL like `trade-journal.pages.dev`.

### 3. Run locally

```bash
npm install
npm run dev
```

## Features

- **Dashboard** — P&L summary, open positions, risk alerts
- **Trade Log** — full history, filterable by status
- **Keynotes** — your 4-rule trading framework
- **New Trade** — pre-trade checklist, premium calculator, thesis field

## Data storage

Trades are saved to `localStorage` in the browser. Data stays on your device.
