# Job Intelligence Collector 🚀

**Job Intelligence Collector** is an advanced, privacy-first, AI-augmented job tracking and application management platform. It consists of a modern, offline-first Chrome Extension (Manifest V3) for seamless job scraping, a secure Node.js Express backend powering a suite of Gemini-based AI services with BullMQ background queue scheduling, and a premium React dashboard SPA featuring real-time AI performance monitoring and career profile matching.

All modules are managed inside a unified **Turborepo** monorepo workspace.

---

## Architecture & Monorepo Structure

```
jobx/                                   ← Monorepo root (Turborepo)
├── apps/                               ← Workspace packages
│   ├── extension/                      ← Chrome Extension (MV3)
│   │   ├── public/                     ← manifest.json, assets, and icons
│   │   └── src/
│   │       ├── background/             ← MV3 service worker & active tab triggers
│   │       ├── content/                ← SPA query tracker (MutationObserver for auto-refresh)
│   │       ├── popup/                  ← Swift React popup form (Dexie.js IndexedDB)
│   │       ├── dashboard/              ← Rich Options console & Kanban board (React/Dexie)
│   │       └── parsers/                ← Adapters (LinkedIn, Indeed, Naukri, Wellfound, Generic LD+JSON)
│   │
│   ├── backend/                        ← Node.js Express API Server (TypeScript)
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── providers/          ← Gemini & OpenAI provider adapters
│   │   │   │   ├── services/           ← AI Engines (Resume Parsing, Generation, Scoring, and Telemetry)
│   │   │   │   └── utils/              ← Prompt engineering & Gemini token counters
│   │   │   ├── config/                 ← DB connection & Redis configuration
│   │   │   ├── controllers/            ← API controllers (Jobs, Profile, Resumes, Telemetry)
│   │   │   ├── models/                 ← Mongoose Schees (User, Job, Company, Resume, Telemetry)
│   │   │   ├── routes/                 ← Router endpoint definitions
│   │   │   └── scripts/                ← Seeding & verify utilities
│   │   └── .env.example                ← Environment template
│   │
│   └── frontend/                       ← Dashboard SPA (React 18 + Vite + TailwindCSS)
│       ├── src/
│       │   ├── api/                    ← Axios client & React Query cache hooks
│       │   ├── components/             ← Reusable layouts, Sidebar, metrics
│       │   ├── pages/                  ← App views (Profile, ResumeBuilder, ResumeVersions, AIMonitoring, etc.)
│       │   └── store/                  ← Zustand Global Auth Store
│
├── package.json                        ← Monorepo configuration
├── turbo.json                          ← Turborepo cache pipeline
└── README.md
```

---

## Key Features & Capabilities

### 1. Robust Chrome Extension (Offline-First)
* **Resilient Site Parsers**: Domain-specific scraping adapters for major portals:
  * **LinkedIn**: Supports Jobs listings, Company profiles (parsing overview data, industry, headquarters, and specialties), and feed/post updates.
  * **Indeed**: Resilient selectors for single job view details, same-origin description iframes, and search results page fallback cards.
  * **Naukri**: Parses single job layouts (resilient to CSS module obfuscations), search listing feed pages, and extracts structured job highlights.
  * **Wellfound**: Scrapes startup details, salary ranges, and technical skill tags.
  * **Generic Portals**: Intelligent fallback parser that matches structured `application/ld+json` schemas or OpenGraph headers to scrape career portals like Greenhouse, Lever, and Workday.
* **SPA Real-time Auto-Refresh**: Uses a background content script `MutationObserver` to track query parameter shifts (like LinkedIn's `currentJobId`). If you switch jobs in your browser list, the open popup instantly re-scrapes and updates its forms after a 500ms debounce delay.
* **Instant Keyboard Shortcut**: Press **`Alt+S`** anywhere on your keyboard to instantly trigger the extension popup without moving your mouse.
* **Data Portability**: Clean export utilities to download all stored jobs, companies, and posts as structured **JSON** or **CSV** spreadsheets for backup.
* **Privacy Focused**: No data leaves your machine. Storage is 100% local, offline-first, and private.

### 2. Resume Intelligence & Tailoring (AI Backend)
* **Resume Parser Engine**: Upload resumes in PDF or DOCX format. Heavy documents are extracted via `pdf-parse` and `mammoth` and analyzed by Gemini to extract structured sections (work experience, skills, education, projects, certifications).
* **Resume Generator & Templates**: Automatically draft custom, job-specific resume variants aligned to targeted job descriptions. Supports rendering and print-formatting using curated HTML templates.
* **Outcome Analytics**: Register application outcomes (`Interview`, `Offer`, `Rejected`) to specific resume variants. Let the system track success rates to optimize matching metrics.
* **Comparison Engine**: Visually compare diffs between different resume versions, including match analysis and key modification pointers.

### 3. AI Orchestration & Telemetry (Backend + Frontend)
* **High-Performance BullMQ Queues**: Heavy LLM analysis jobs are processed out-of-band using background queues backed by **Redis** to prevent HTTP request timeouts.
* **Analysis Caching**: Job description analyses are cached to prevent redundant, expensive LLM API calls on repeated views.
* **Telemetry Dashboard**: A beautiful real-time analytics UI showing:
  * Total AI spend (USD) and token count aggregates.
  * Mean latency metrics per LLM provider.
  * Queue statuses (Completed, Failed, Processing, Pending).
  * Fine-tuning dataset exports (Download structured training records in JSONL format for future model tuning).

---

## Technology Stack

* **Monorepo Build**: [Turborepo](https://turbo.build/)
* **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, Recharts, Zustand, React Query, Axios.
* **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB), BullMQ (Redis), Multer, Mammoth, PDF-parse.
* **AI Engine**: Google Generative AI (`@google/generative-ai` with Gemini models), OpenAI SDK.
* **Extension Storage**: Dexie.js (IndexedDB wrapper for local-first storage).

---

## Environment Variables

Create an `.env` file inside `apps/backend/` using the following keys:

```ini
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/job_intelligence

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# AI Orchestration Providers
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODEL=gemini-1.5-flash

# Optional OpenAI Provider
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini

# Cache & Message Queue
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Parsing Modes (gemini or local fallback)
PARSE_MODE=gemini
```

---

## Development Setup

### 1. Prerequisites
* **Node.js** v18 or later.
* **MongoDB** server running locally (or MongoDB Atlas connection string).
* **Redis** server running locally (required for BullMQ background analysis queues).

### 2. Quick Start (Monorepo-wide commands)
From the root directory:

```bash
# 1. Install all dependencies across all workspaces
npm install

# 2. Seed database with mock jobs, companies, templates, and default user
npm run seed

# 3. Start development servers for backend, frontend, and extension compiler
npm run dev
```

* **Frontend Dashboard**: Runs on [http://localhost:5173](http://localhost:5173)
  * Default Credentials: `suraj@example.com` / `password123`
* **Backend API**: Runs on [http://localhost:5000](http://localhost:5000)

### 3. Load the Chrome Extension
1. Build the extension first:
   ```bash
   # From root:
   npx turbo build --filter=job-intelligence-collector
   
   # Or directly inside the workspace folder:
   cd apps/extension
   npm run build
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the built folder located at `apps/extension/dist/`.

### 4. Running Isolated Tasks (Optional)
If you want to run builds, dev environments, or scripts for specific workspaces:

```bash
# Start backend in dev mode
npx turbo dev --filter=job-intelligence-backend

# Start frontend in dev mode
npx turbo dev --filter=job-intelligence-dashboard

# Run integration tests for extension parsers
cd apps/extension
node scratch/test_indeed_parser.js
node scratch/test_linkedin_parser.js
```
