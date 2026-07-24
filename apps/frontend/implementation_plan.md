# Frontend Codebase Refactoring Plan

## Goal
Reorganize `apps/frontend/src/` into a clean, scalable folder structure with clear separation of concerns — making every file small, focused, and easily testable.

## Proposed Folder Structure

```
src/
├── api/
│   ├── client.ts           ← (unchanged) axios instance
│   └── hooks/              ← SPLIT from hooks.ts into per-domain files
│       ├── index.ts        ← re-exports all hooks
│       ├── useJobs.ts
│       ├── useCompanies.ts
│       ├── useSkills.ts
│       ├── useApplications.ts
│       ├── useAnalytics.ts
│       └── useAuth.ts
│
├── types/
│   └── index.ts            ← (unchanged — already well organized)
│
├── data/                   ← NEW: static constant data
│   ├── avatarGradients.ts  ← AVATAR_GRADIENTS map + getGradient()
│   ├── statusConfig.ts     ← STATUS_OPTIONS, COLUMN_STYLES, color maps
│   └── sourceConfig.ts     ← SOURCES list, source color map
│
├── hooks/                  ← NEW: custom UI/app hooks (non-API)
│   └── useDebounce.ts      ← debounced search state hook
│
├── icons/                  ← NEW: custom SVG icon components
│   ├── GoogleIcon.tsx      ← MOVE from components/
│   └── GithubIcon.tsx      ← MOVE from components/
│
├── components/             ← shared reusable UI components only
│   ├── Button.tsx          ← (exists)
│   ├── PageHeader.tsx      ← (exists)
│   ├── FilterTabs.tsx      ← (exists)
│   ├── Table.tsx           ← (exists)
│   ├── MetricCard.tsx      ← (exists)
│   ├── AnalysisPanel.tsx   ← (exists)
│   ├── StatusTag.tsx       ← EXTRACT from Jobs.tsx
│   ├── SourceTag.tsx       ← EXTRACT from Jobs.tsx
│   └── AvatarInitials.tsx  ← EXTRACT gradient letter avatar (used in Jobs + Companies)
│
├── pages/
│   ├── Jobs/
│   │   ├── index.tsx       ← main page (thin, uses hooks/components)
│   │   └── JobDrawer.tsx   ← EXTRACT drawer component
│   ├── Companies/
│   │   ├── index.tsx       ← main page
│   │   └── CompanyDrawer.tsx ← EXTRACT drawer component
│   ├── Overview.tsx
│   ├── Tracker.tsx
│   ├── Skills.tsx
│   ├── Login.tsx
│   ├── Profile.tsx
│   ├── ResumeBuilder.tsx
│   ├── ResumeVersions.tsx
│   └── AIMonitoring.tsx
│
├── store/                  ← (unchanged) zustand auth store
├── App.tsx
└── main.tsx
```

## Changes by Layer

### `src/data/` — New
- `avatarGradients.ts`: Extract `AVATAR_GRADIENTS` map + `getGradient()` — currently duplicated in both `Jobs.tsx` and `Companies.tsx`
- `statusConfig.ts`: Extract `STATUS_OPTIONS`, `COLUMN_STYLES` (Tracker), status color maps used across pages
- `sourceConfig.ts`: Extract `SOURCES` array and source pill color map

### `src/hooks/` — New (non-API)
- `useDebounce.ts`: A `useDebounce(value, delay)` hook to replace the `setTimeout + clearTimeout` pattern duplicated in Jobs, Companies, and Skills pages

### `src/icons/` — New
- Move `GoogleIcon.tsx` and `GithubIcon.tsx` from `components/`

### `src/api/hooks/` — Split
- Break the 476-line `api/hooks.ts` into 6 focused files grouped by domain:
  - `useJobs.ts`, `useCompanies.ts`, `useSkills.ts`, `useApplications.ts`, `useAnalytics.ts`, `useAuth.ts`
  - `index.ts` re-exports everything (zero breaking changes to importers)

### `src/components/` — Extract
- `StatusTag.tsx`: Status pill badge (extracted from Jobs.tsx, reusable in Tracker + Companies drawer)
- `SourceTag.tsx`: Source pill badge (extracted from Jobs.tsx)
- `AvatarInitials.tsx`: Gradient letter avatar (extracted from Jobs.tsx + Companies.tsx)

### `src/pages/` — Sub-folders for complex pages
- `Jobs/index.tsx` + `Jobs/JobDrawer.tsx`
- `Companies/index.tsx` + `Companies/CompanyDrawer.tsx`

## Verification Plan
- TypeScript build must pass: `npx turbo build --filter=job-intelligence-dashboard`
- All import paths must be updated to reflect new locations
- No runtime behavior changes — purely structural refactor
