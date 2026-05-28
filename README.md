# CI-Desk Frontend

A highly advanced, real-time commodities intelligence and energy trading dashboard built for analysts and traders. It provides comprehensive visibility into global energy markets, crude oil fundamentals (Upstream, Midstream, Downstream), macro-economics, and live market quotes.

Built with **React 19**, **TypeScript**, and **Vite**, and styled with **Tailwind CSS v4**.

---

## 🚀 Key Features

### 1. Real-Time Market Data & Curves
- **Live WebSocket Feed**: Integrates with a real-time pricing backend (`useMarketWebSocket.ts`) to stream live market quotes (bid, ask, mid, vwap, settlement) and market states for various energy instruments (Crude, Brent, RBOB, HO).
- **Forward Curves**: Dynamically constructs and renders term structure (forward curves) for tracking calendar spreads and outright prices.
- **Ticker Strip**: A persistent, live ticker component (`TickerStrip.tsx`) showing delayed NYMEX/ICE futures prices and changes across the top of the dashboard.

### 2. Deep Energy Fundamentals
The dashboard is structurally divided into key commodity sectors to streamline data analysis:
- **Upstream**: Insights into Crude Production, Baker Hughes Rig Counts, OPEC Production estimates, and DUC (Drilled but Uncompleted) wells data.
- **Midstream**: Weekly tracking of U.S. commercial crude inventories (including Cushing), SPR, and Refinery Utilization rates across PADDs.
- **Downstream**: Analytics on Crack Spreads (3-2-1, RBOB, Heating Oil) with historical Z-scores, and Product Demand (Gasoline, Distillate, Jet Fuel).
- **WPSR (Weekly Petroleum Status Report)**: Detailed tables and historical comparisons of EIA inventory data.
- **COT (Commitments of Traders)**: Tracking managed money net positions and week-over-week changes for WTI and Brent.

### 3. Macro & News Intelligence
- **Macro Indicators**: Tracks the Dollar Index (DXY), US 10-Year Treasury Yields, and Fed Funds rate using FRED (Federal Reserve Economic Data).
- **News Aggregation**: Integration with Finnhub to fetch real-time market and company-specific news articles, paired with an Economic Calendar.

### 4. High-Performance Visualizations
- **Lightweight Charts**: Used for rendering high-performance financial charts (candlesticks, line series) for market curves and historical prices.
- **Recharts**: Powers the data visualization for fundamental metrics (bar charts, line charts, area charts) with customized tooltips and responsive scaling.

### 5. Custom Design System
- Built on a bespoke design system featuring a unified aesthetic (`DesignSystem.tsx`).
- Styled using **Tailwind CSS v4**, completely embracing CSS variables for theming (`var(--color-bg-panel)`, `var(--color-bull)`, `var(--color-bear)`).
- Includes an extensive library of UI components in `src/components/` and `src/components/ui/`, ensuring strict consistency across the app.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build & Dev**: [Vite](https://vitejs.dev/)
- **State & Data Fetching**: [TanStack React Query (v5)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [clsx](https://github.com/lukeed/clsx) / [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- **Routing**: [React Router (v7)](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [ESLint (v10)](https://eslint.org/) with React-specific plugins.

---

## 📂 Project Architecture

```text
src/
├── assets/         # Static visual assets
├── components/     # Reusable UI components
│   ├── AppShell.tsx     # Main application layout wrapper
│   ├── Navbar.tsx       # Primary navigation
│   ├── TickerStrip.tsx  # Live market ticker
│   ├── ui/              # Primitive design system components (buttons, cards, etc.)
│   └── [sector]/        # Sector-specific components (upstream, midstream, etc.)
├── constants/      # App-wide constants (e.g., mock data fallbacks, chart configurations)
├── contexts/       # React Context providers for global states (e.g., Auth, Theme)
├── hooks/          # Custom hooks encapsulating logic
│   ├── useApiData.ts           # Unified data fetching hook wrapping React Query
│   └── useMarketWebSocket.ts   # Complex WebSocket logic for streaming market data
├── lib/            # Utility functions and API configuration
│   ├── api.ts      # Axios/Fetch abstractions
│   ├── config.ts   # Environment configs (e.g., API_BASE_URL)
│   └── tz.ts       # Timezone and date formatting helpers
├── pages/          # Top-level route components
│   ├── Markets.tsx
│   ├── Upstream.tsx
│   ├── Midstream.tsx
│   ├── Downstream.tsx
│   ├── Reports.tsx
│   ├── News.tsx
│   └── Showcase.tsx   # Component design system playground
└── types/          # Strict TypeScript interfaces defining the backend data contracts
    └── api.ts      # Interfaces for WPSR, COT, Curves, Quotes, etc.
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ci-desk-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Environment Configuration
The frontend communicates with a Python FastAPI backend. You must configure the API URL.

1. **Create the `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Set your Variables**
   Open `.env` and set the `VITE_API_BASE_URL` to point to your local or staging backend.
   ```env
   # Base URL for the CI-Desk FastAPI backend.
   VITE_API_BASE_URL=http://localhost:8000
   ```
   *(Note: WebSockets will automatically derive their URL by swapping `http` for `ws` from this base).*

### Running Locally
Launch the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available NPM Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Runs the TypeScript compiler and builds the production bundle via Vite.
- **`npm run lint`**: Lints the codebase using the new ESLint flat config (`eslint.config.js`).
- **`npm run preview`**: Serves the `dist/` directory locally to preview the production build.

---

## 🎨 Design System Showcase
To ensure visual consistency and allow developers to test components in isolation, this project includes a **Component Showcase**. 

Run the app and navigate to the `/components` route (or click "Components" in the sidebar/navbar if exposed) to interact with the `DesignSystem.tsx` page. This page demonstrates all standard buttons, typography, cards, data tables, and indicator states.
