# Job Intelligence Collector 🚀

**Job Intelligence Collector** is a modern, offline-first Chrome Extension (Manifest V3) designed to help job seekers collect, track, and organize jobs, company profiles, and hiring updates privately on their local machine.

Built with **React**, **TypeScript**, **Vite**, and **TailwindCSS**, the extension parses metadata from major job portals and stores it inside the browser's local **IndexedDB** using **Dexie.js**—requiring zero external accounts, servers, or trackers.

---

## Key Features

* **Resilient Site Parsers**: Domain-specific scraping adapters for major portals:
  * **LinkedIn**: Supports Jobs listings, Company profiles (parsing overview data, industry, headquarters, and specialties), and feed/post updates.
  * **Indeed**: Resilient selectors for single job view details, same-origin description iframes, and search results page fallback cards.
  * **Naukri**: Parses single job layouts (resilient to CSS module obfuscations), search listing feed pages, and extracts structured job highlights.
  * **Wellfound**: Scrapes startup details, salary ranges, and technical skill tags.
  * **Generic Portals**: Intelligent fallback parser that matches structured `application/ld+json` schemas or OpenGraph headers to scrape career portals like Greenhouse, Lever, and Workday.
* **SPA Real-time Auto-Refresh**: Uses a background content script `MutationObserver` to track query parameter shifts (like LinkedIn's `currentJobId`). If you switch jobs in your browser list, the open popup instantly re-scrapes and updates its forms after a 500ms debounce delay.
* **Instant Keyboard Shortcut**: Press **`Alt+S`** anywhere on your keyboard to instantly trigger the extension popup without moving your mouse.
* **Options Console Dashboard**: A complete Kanban-style application management board (`Saved` ➔ `Applied` ➔ `Interview` ➔ `Rejected` ➔ `Offer`) with full-text search, drawers to edit notes/tags, and detailed job specification sheets.
* **Data Portability**: Clean export utilities to download all stored jobs, companies, and posts as structured **JSON** or **CSV** spreadsheets for backup.
* **Privacy Focused**: No data leaves your machine. Storage is 100% local, offline-first, and private.

---

## Technology Stack

* **Build Tool**: Vite (configured for multi-entry manifest builds)
* **Framework**: React 18 & TypeScript
* **Styling**: TailwindCSS & Lucide Icons
* **Database**: Dexie.js (IndexedDB wrapper)
* **Testing / Mock DOMs**: JSDOM, Node.js (for isolated parser validation scripts)

---

## Project Structure

```
jobx/                              ← Monorepo root
├── extension/                     ← Chrome Extension (MV3)
│   ├── public/                    ← manifest.json & icons
│   ├── src/
│   │   ├── background/            ← MV3 service worker
│   │   ├── content/               ← DOM injector & event listener
│   │   ├── dashboard/             ← Options page (React/Dexie)
│   │   ├── popup/                 ← Action popup (React/Dexie)
│   │   ├── parsers/               ← Site-specific scraper strategies
│   │   ├── storage/               ← Dexie IndexedDB services
│   │   ├── types/                 ← TypeScript contracts
│   │   └── utils/                 ← Helpers & export engine
│   ├── dist/                      ← Compiled extension (load in Chrome)
│   ├── samples/                   ← HTML mock DOM snapshots for testing
│   ├── scratch/                   ← Local parser integration scripts
│   ├── popup.html
│   ├── dashboard.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                       ← Job Intelligence API Server
│   ├── src/
│   │   ├── config/                ← MongoDB connection
│   │   ├── models/                ← Mongoose schemas (Job, Company, Skill…)
│   │   ├── controllers/           ← Route handlers
│   │   ├── middleware/            ← JWT auth guard
│   │   ├── routes/                ← Express router
│   │   ├── services/              ← Business logic & AI placeholders
│   │   └── scripts/               ← Database seeder
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      ← Dashboard SPA (React + Vite)
│   ├── src/
│   │   ├── api/                   ← Axios client & React Query hooks
│   │   ├── components/            ← Sidebar, MetricCard…
│   │   ├── pages/                 ← Overview, Jobs, Companies, Skills, Tracker, Profile
│   │   ├── store/                 ← Zustand auth store
│   │   └── types/                 ← Domain TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## Database Schema (IndexedDB)

Data is stored locally under five primary object stores:

```typescript
jobs: 'id, title, company, url, savedAt, *tags'
companies: 'id, name, website, savedAt, *tags'
posts: 'id, author, url, savedAt, *tags'
applications: 'id, jobId, status, createdAt'
```

* **Duplicate Handling**: Automatically merges records when matching duplicates (e.g., matching job URL or company name) to prevent duplicate cards while retaining custom notes and tags.
* **History Log**: Creating a job automatically initializes a tracking application record in the pipeline with a `Saved` status.

---

## Development Setup

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Chrome Extension

```bash
cd extension
npm install

# Run parser integration tests
node scratch/test_indeed_parser.js
node scratch/test_linkedin_parser.js

# Build the extension
npm run build
```

Load `extension/dist/` in Chrome via `chrome://extensions` → **Load unpacked**.

### Backend API Server

```bash
cd backend
npm install
npm run seed   # Seed MongoDB Atlas with sample data
npm run dev    # Starts on http://localhost:5000
```

### Frontend Dashboard

```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:5173
```

Open **http://localhost:5173** → login with `suraj@example.com` / `password123`
