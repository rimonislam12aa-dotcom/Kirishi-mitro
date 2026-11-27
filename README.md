# কৃষি মিত্র (Krishi Mitra)

**Offline-first Smart Agriculture, Weather & Disaster Alert, AI Crop Disease Scanner, and Planting/Harvest Calendar PWA.**

Designed for farmers across Bangladesh and Bengal with full multilingual support (**বাংলা**, **हिन्दी**, **English**), offline IndexedDB persistence, audio voice briefings, and one-tap home screen installation.

---

## Key Features / মূল সুবিধাসমূহ

1. **Live GPS Weather, AQI & Disaster Alerts (আবহাওয়া, বায়ুর মান ও দুর্যোগ সতর্কতা)**
   - Real-time temperature, humidity, wind speed & gusts, rainfall, UV index, and US Air Quality Index (`us_aqi`, `PM2.5`, `PM10`) powered by **Open-Meteo Weather & Air Quality APIs**.
   - District presets across Bangladesh (Dhaka, Bogura, Rajshahi, Rangpur, Sylhet, Sunamganj, Chattogram, Cox's Bazar, Khulna, Barishal, Mymensingh, Cumilla, Jashore) and neighboring regions, plus device GPS detection.
   - Regional agronomic hazard alerts (Kalboishakhi squall/lightning, Haor flash-flood rain, heatwave, cold wave & late-blight fog alerts) with OS & in-app push notifications.

2. **Smart Crop Planting & Harvest Calendar (ফসল রোপণ ও ফসল তোলার স্মার্ট পঞ্জিকা)**
   - 12-month BARI/BRRI-aligned planting & harvest schedule for 12 major crops (Boro/Aman/Aus Rice, Potato, Wheat, Mustard, Maize, Tomato, Onion, Jute, Lentil, Chili).
   - **Interactive Sowing-to-Harvest Date Calculator**: pick any crop and your field's sowing date to get expected harvest dates, soil/seed-rate per 33-decimal Bigha, and dated stage-by-stage care & fertilizer milestones.

3. **AI Crop Leaf Disease Scanner (ক্যামেরা দিয়ে ফসলের রোগ নির্ণয়)**
   - Live device camera capture or photo upload to diagnose leaf diseases with symptoms, organic remedies, chemical management, and prevention guidance (powered server-side via `@google/genai`), with offline diagnosis history.

4. **Agricultural Audio Player (ভয়েস অডিও প্লেয়ার)**
   - Listen to daily weather alerts, planting schedules, crop care tips, disease diagnoses, and market prices via neural voice (`/api/tts`) with automatic offline Web Speech API fallback.

5. **Local Market Prices, Crop Care Guides & Farmer Feedback**
   - Cached crop tips (33-decimal Bigha & acre dosages) and per-kg / per-maund (40 kg) market updates, plus offline-queued farmer feedback & price reports that sync automatically when online.

6. **Installable Progressive Web App (PWA)**
   - Built-in `vite-plugin-pwa` Service Worker caching Open-Meteo responses, app shell, and assets for offline field usage.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, `vite-plugin-pwa`
- **Backend / Serverless**: Express (`server.ts`) for local/Node hosting + Vercel Serverless Functions (`/api/*.ts`)
- **AI & Data**: `@google/genai` (server-side only via `GEMINI_API_KEY`), Open-Meteo Forecast & Air Quality APIs, IndexedDB

---

## Getting Started (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Required server-side variable for AI crop scanning & TTS:
   - `GEMINI_API_KEY`

3. **Run development server** (Port `3000`):
   ```bash
   npm run dev
   ```

4. **Type-check and build production bundle (`dist/`)**:
   ```bash
   npm run lint
   npm run build
   ```

---

## Deployment

### GitHub Pages (Static / PWA Frontend)
This repository supports **three** effortless GitHub Pages publishing modes:

1. **1-File Instant Mobile Upload (Zero Subfolders — Best for Mobile Chrome)**:
   - Use **`github-pages-ready/index.html`** (pre-built single self-contained HTML file with all JS & CSS bundled inside!).
   - Upload just that single `index.html` file to the root of a new GitHub repository, then set **Settings -> Pages -> Branch: `main` + Folder: `/ (root)`**.
   - Zero extra folders or asset paths needed—eliminates blank white screens completely!
2. **Deploy from `/docs` Branch (Full Multi-File PWA)**:
   - Upload the full repository and in **Settings -> Pages -> Build and deployment**, set **Branch: `main`** and Folder: **`/docs`** (pre-built PWA with `sw.js` and `manifest.webmanifest`).
   - *(Note: Even if `/ (root)` is selected, the root `index.html` automatically redirects static GitHub Pages visitors to `./docs/` or `./github-pages-ready/`.)*
3. **GitHub Actions (Automatic CI Build)**:
   - In **Settings -> Pages**, set **Source** to **`GitHub Actions`**.
   - `.github/workflows/deploy.yml` automatically runs `npm run lint`, builds `dist/`, and publishes on every push to `main`.

> Note: GitHub Pages serves static files only; `/api/*` server routes (AI Crop Scanner, `/api/tts`, `/api/visitors`) require a Node.js host or Vercel deployment.

### Vercel (Full-Stack with `/api/*` Serverless Functions)
This repository includes `vercel.json` and `/api/*.ts` handlers:
1. Import the GitHub repository into Vercel.
2. Add `GEMINI_API_KEY` in Vercel **Project Settings -> Environment Variables**.
3. Deploy — Vite outputs to `dist/` and all `/api/*` routes run automatically.

---

## License

Licensed under the [Apache License 2.0](./LICENSE).
