# Vercel Hosting & Deployment Guide 🚀

This repository is pre-configured to build and run seamlessly as a **Unified Deployment** on **Vercel** (both the React frontend and Express backend are served under the same project/domain).

---

## Unified Hosting Setup

This model deploys both the static React SPA frontend and the serverless Node.js/Express API backend under a single Vercel project. Requests to `/api/*` are routed automatically to your serverless Express function.

### Step-by-Step Vercel Setup:

1.  **Import Repository**: In your Vercel Dashboard, click **Add New** > **Project** and import your `jobx` monorepo.
2.  **Project Configuration**:
    *   **Framework Preset**: Select **Other** (Turborepo configuration is handled automatically).
    *   **Root Directory**: Leave it as the root directory (`.`).
    *   **Build Command**: `npm run build` (runs `turbo build` across workspaces).
    *   **Output Directory**: `apps/frontend/dist`
3.  **Environment Variables**: Add the required environment variables under the project settings (see the [Environment Variables](#environment-variables) section below).
4.  **Deploy**: Click **Deploy**. Vercel will install dependencies, build the Vite app, compile the serverless API entry point (`/api`), and deploy.

---

## Environment Variables

Configure the following environment variables in your Vercel project dashboard settings under **Settings > Environment Variables**:

| Variable Name | Required | Description | Example / Recommended Value |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | App execution context | `production` |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | Secret key for signing authorization tokens | (A secure random string) |
| `GEMINI_API_KEY` | Yes | Gemini developer API credentials | `AIzaSy...` |
| `PARSE_MODE` | No | Parsing engine mode | `gemini` (or `local` fallback) |
| `GEMINI_MODEL` | No | Model version to target | `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MODEL`| No | Fallback model version | `gemini-1.5-flash` |
| `REDIS_HOST` | No | External Redis host (for BullMQ queues) | (e.g., Upstash Redis hostname) |
| `REDIS_PORT` | No | External Redis port (for BullMQ queues) | (e.g., `6379`) |

> [!NOTE]  
> If `REDIS_HOST` and `REDIS_PORT` are omitted, the backend will automatically fall back to an **In-Memory processing queue** for AI jobs. Note that in-memory background queues are ephemeral and may be cut short in serverless environments if the function runtime finishes before the queue has cleared. For production workloads, provisioning an external Redis instance (e.g. from Upstash) is recommended.

---

## Extension Integration

Once hosted on Vercel, the extension will communicate with your live Vercel domain. Make sure to configure the extension to target the domain Vercel assigns to your project (e.g., `https://your-project.vercel.app`).
