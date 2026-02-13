# IPO Radar 📈

Track upcoming U.S. IPOs and get AI-powered stock picks with momentum scoring.

## Features

### IPO Tracker
- Scans SEC filings, Nasdaq, NYSE & financial news for upcoming IPOs
- Color-coded urgency (red/yellow/green) based on days until IPO
- Browser notifications 7 days before each IPO
- Filter by timeframe, search by company/ticker/sector

### Stock Picks (NEW)
- AI-powered stock screener using a multi-signal scoring system
- **Momentum Score (0-100)** based on 4 weighted categories:
  - Fundamentals (30%): Revenue growth, P/E ratio, earnings, debt
  - Technicals (30%): RSI, MACD, moving averages, price momentum
  - Sentiment (25%): Analyst ratings, news tone, insider activity
  - Sector Momentum (15%): Sector vs S&P 500 performance
- Expandable cards show full score breakdown, metrics & risk factors
- Filter by signal (Strong Buy / Buy / Watch) and sector
- Price targets and suggested timeframes

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "IPO Radar v2 with Stock Picks"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ipo-radar.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import your `ipo-radar` repo
3. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

### Step 3: You're live!
- Bookmark the URL or add to your phone's home screen
- iPhone: Safari → Share → "Add to Home Screen"

## Run Locally
```bash
npm install
cp .env.local.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
# Open http://localhost:3000
```

## Project Structure
```
ipo-radar/
├── app/
│   ├── api/
│   │   ├── ipos/route.js      # IPO data endpoint
│   │   └── stocks/route.js    # Stock picks endpoint
│   ├── components/
│   │   ├── theme.js           # Design tokens & utilities
│   │   ├── icons.js           # SVG icon components
│   │   ├── shared.js          # Shared UI (StatGrid, ScoreBar, etc.)
│   │   ├── IPOCard.js         # IPO card component
│   │   └── StockCard.js       # Stock card with momentum ring
│   ├── globals.css
│   ├── layout.js
│   └── page.js                # Main app with tab navigation
├── public/manifest.json        # PWA manifest
├── .env.local.example
└── package.json
```

## Cost
- **Vercel**: Free (hobby plan)
- **Anthropic API**: ~$0.02-0.05 per refresh (Sonnet + web search)

## Disclaimer
This tool provides data-driven insights for educational purposes only. Not financial advice. Always do your own research.
