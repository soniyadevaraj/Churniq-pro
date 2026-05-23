# Churniq-pro
AI-powered telecom churn analytics dashboard with 4 Claude agents, live KPIs, Chart.js visualisations, and zero build steps.
# ChurnIQ Pro — Telecom Intelligence Platform

A browser-based telecom churn analytics dashboard with 4 AI-powered agents, live synthetic data, and interactive charts.

## Features

- **4 AI Agent bots** (Analyst, Retention, Forecast, Segment Intel) powered by Claude
- **AI Intelligence Search** — ask free-form questions about your churn data
- **Live KPIs** — churn rate, high-risk count, revenue at risk
- **Charts** — donut, bar, trend/forecast, scatter, SHAP feature importance
- **Segment filter** — slice by senior citizens, fiber, month-to-month, no internet
- **Auto-refreshing** synthetic customer data (500 records, updates every 5s)

## Quick Start

1. Clone or download this repo
2. Open `index.html` in any modern browser — no build step needed
3. Paste your [Anthropic API key](https://console.anthropic.com) to activate the AI agents

> **Note:** The API key is stored in `localStorage` under `churniq_key`. Clear browser storage to remove it.

## Project Structure

```
churniq-pro/
├── index.html          # Main HTML shell & bootstrap script
├── css/
│   └── styles.css      # All styles & CSS variables
└── js/
    ├── data.js         # Synthetic data generation, filter logic, metrics
    ├── charts.js       # Chart.js chart builders (donut, bar, trend, scatter)
    ├── ui.js           # DOM rendering (KPIs, table, segments, SHAP, ticker)
    └── ai.js           # API key setup, bot messaging, AI search
```

## Dependencies (CDN, no install)

| Library | Version | Purpose |
|---------|---------|---------|
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | All charts |
| [Google Fonts](https://fonts.google.com/) | — | DM Mono, Syne, Inter |
| [Anthropic API](https://docs.anthropic.com/) | — | AI agent responses |

## Deployment

The project is a static site — deploy anywhere:

- **GitHub Pages** → push to `gh-pages` branch or enable Pages on `main`
- **Netlify / Vercel** → drag-and-drop the folder
- **Local** → `open index.html` or `npx serve .`

## License

MIT

