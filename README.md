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
├── dist/                      # Compiled production-ready extension (generated on build)
├── public/                    # Static assets & icons
│   └── manifest.json          # Chrome Extension Manifest V3 configuration
├── samples/                   # Mock HTML DOM snapshots for local testing
├── scratch/                   # Local parser scripts and integration tests
├── src/
│   ├── background/            # MV3 background worker
│   ├── content/               # DOM injector and event listener script
│   ├── dashboard/             # Console Dashboard app (React/Dexie)
│   ├── popup/                 # Ext Action Popover form (React/Dexie)
│   ├── parsers/               # Parsing Strategy pattern implementations
│   ├── storage/               # Dexie DB instance, schemas, and CRUD services
│   ├── types/                 # Strict TypeScript contracts and models
│   └── utils/                 # Regex helpers, clean utilities, and export engines
├── package.json
└── vite.config.ts
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

### 1. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 2. Run Local Parser Integration Tests

Verify that all strategy scrapers work correctly on the static HTML mock samples inside the `scratch/` folder:

```bash
# Run Indeed & LinkedIn job parser tests
node scratch/test_indeed_parser.js
node scratch/test_linkedin_parser.js

# Run LinkedIn post & company page parser tests
node scratch/test_linkedin_post_improved.js
node scratch/test_linkedin_company.js

# Run all parser integration checks
node scratch/test_parsers_improved.js
```

### 3. Build the Extension

Compile the React components and bundle the background/content scripts into the `dist/` directory:

```bash
npm run build
```

---

## Installation in Chrome

To load and use the compiled extension in Google Chrome:

1. Open Google Chrome.
2. Navigate to **`chrome://extensions/`**.
3. Enable **Developer mode** by toggling the switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the **`dist/`** directory located in the project's root folder.
6. The **Job Intelligence Collector** icon will now appear in your browser toolbar!
