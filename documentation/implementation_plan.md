# Implementation plan

## Phase 1: Environment Setup

1. __Prevalidation__: Check if current directory contains `package.json` or `.git` folder; if yes, prompt user to confirm re-initialization of the Fomo project (Project Overview).
2. Install Node.js v20.2.1 (handles Next.js and microservices) if not already installed (Tech Stack: Frontend).
3. __Validation__: Run `node -v` and verify output equals `v20.2.1` (Tech Stack: Frontend).
4. Install Docker Engine v24.0.5 for container builds (Tech Stack: DevOps).
5. __Validation__: Run `docker --version` and confirm `Docker version 24.0.5` (Tech Stack: DevOps).
6. Install Git CLI v2.41.0 to manage source control (Core Tools).
7. __Validation__: Run `git --version` and confirm `git version 2.41.0` (Core Tools).
8. Create project root directory `fomo-notifications-platform` if it does not exist, then `cd fomo-notifications-platform` (Project Overview).
9. Initialize a new Git repository: `git init` (Project Overview).
10. Create `cursor_metrics.md` in the project root to capture Cursor metrics (Tools: Cursor).
11. Create a `.cursor` directory in the project root (Tools: Cursor).
12. Inside `.cursor`, create `mcp.json` (Tools: Cursor).
13. Add `.cursor/mcp.json` to `.gitignore` to avoid committing secrets (Tools: Cursor).
14. Populate `cursor_metrics.md` with a reference: "Refer to `cursor_project_rules.mdc` for guidelines on capturing metrics." (Tools: Cursor).
15. In `.cursor/mcp.json`, add placeholder configuration:

`{ "mcpServers": { "supabase": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"] } } }`(Tools: Cursor)

1. Display link for obtaining Supabase connection string:\
   `https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp`\
   (Tools: Cursor)
2. Instruct user to replace `<connection-string>` in `.cursor/mcp.json` after obtaining it and restart the MCP server (Tools: Cursor).

## Phase 2: Frontend Development

1. Create `/frontend` and initialize a Next.js 14 app with TypeScript:

`cd frontend npx create-next-app@14 fomo-frontend --typescript `__Note:__ Next.js 14 is required for AI coding tools and LLM integration (Tech Stack: Frontend).

1. __Validation__: Run `npm run dev` inside `/frontend` and verify default page at <http://localhost:3000> (Tech Stack: Frontend).
2. Install Tailwind CSS v3 dependencies in `/frontend`:

`npm install tailwindcss@3 postcss@8 autoprefixer@10 npx tailwindcss init -p `(Tech Stack: Frontend)

1. Update `tailwind.config.js` content paths to include App Router files:

`module.exports = { content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"], theme: { extend: {} }, plugins: [] } `(Tech Stack: Frontend)

1. Create `/frontend/app/globals.css` and add:

`@tailwind base; @tailwind components; @tailwind utilities; `(Tech Stack: Frontend)

1. Install Shadcn UI components in `/frontend`:

`npm install @shadcn/ui `(Tech Stack: Frontend)

1. Install React Query v4 in `/frontend`:

`npm install @tanstack/react-query `(App Flow: Data Fetching)

1. Install Zustand for state management in `/frontend`:

`npm install zustand `(App Flow: State Management)

1. Install TanStack Router in `/frontend`:

`npm install @tanstack/router `(App Flow: Routing)

1. Create `/frontend/app/layout.tsx` importing Tailwind CSS, wrapping children with React Query and Zustand providers (Tech Stack: Frontend).

2. Create placeholder pages:

   * `/frontend/app/page.tsx` for Dashboard
   * `/frontend/app/sites/page.tsx` for Site Management\
     (App Flow: Page Structure)

3. __Validation__: Add a simple Jest + React Testing Library test in `/frontend/tests/layout.test.tsx` to verify `layout.tsx` renders children, then run `npm test` and ensure tests pass (QA: Unit Tests).

## Phase 3: Backend Development

1. Create `/infra/terraform/main.tf` and configure AWS provider in `us-east-1`:

`provider "aws" { region = "us-east-1" } `(Tech Stack: DevOps)

1. Add Terraform module for EKS cluster `fomo-eks` in `/infra/terraform/main.tf` (Architecture: Microservices).

2. Add Terraform module for MSK cluster `fomo-msk` in `/infra/terraform/main.tf` (Architecture: Event Streaming).

3. Add Terraform provider block for Supabase and configure project in `/infra/terraform/main.tf` (Tech Stack: Database).

4. Create `/docs/schema.sql` containing Postgres schema for core tables:

   * `accounts(site_id UUID, ... )`
   * `sites(...)`
   * `notifications(...)`
   * `notification_events(...)` partitioned by RANGE on `created_at` and HASH on `site_id`
   * `ab_tests(...)`
   * `translations(...)`
   * `templates(...)`
   * `users(...)`
   * `billing_invoices(...)`\
     (Tech Stack: Database)

5. __Validation__: Launch Supabase MCP server via Cursor:

`npx @modelcontextprotocol/server-postgres "<connection-string>" `then run `psql` or Supabase SQL editor to execute `/docs/schema.sql` and verify tables exist (Tools: Cursor).

1. Create `/backend/notification-service/Dockerfile` using Node 20.2.1 base image and copy `src` (Microservices).
2. Create `/backend/notification-service/src/index.ts` implementing an Express.js SSE endpoint at `GET /events` (PRD: Real-time Notifications).
3. __Validation__: Build and run the notification service:

`docker build -t notification-service ./backend/notification-service docker run -p 4000:4000 notification-service curl -i http://localhost:4000/events `and confirm SSE headers (Performance Test).

1. Create `/backend/user-service/src/config.ts` to integrate Clerk with JWT cookies and SCIM provisioning (Tech Stack: Auth).
2. Create `/backend/integration-service/src` with stub endpoints for Shopify, WooCommerce, and Zapier connectors (PRD: Integrations).
3. __Validation__: Run `npm test` across `/backend` and ensure unit tests cover >80% of code (QA: Backend Tests).

## Phase 4: Integration

1. In `/frontend/src/services/api.ts`, configure Axios base URL to the Kong API Gateway at `https://api.fomo.com/v1` (Tech Stack: API Gateway).
2. Implement `/frontend/src/hooks/useNotifications.ts` using React Query to connect to the SSE stream at `/events` (App Flow: SSE).
3. Configure Kong CORS plugin to allow `http://localhost:3000` and require mTLS for service-to-service calls (Tech Stack: Security).
4. __Validation__: Trigger a notification via `curl -X POST https://api.fomo.com/v1/notifications` and verify the SSE event arrives in the frontend within 100ms (Performance Test).

## Phase 5: Deployment

1. Create GitHub Actions workflow `.github/workflows/ci-cd.yml` with jobs:

   * Terraform `plan`/`apply`
   * Docker build & push to ECR
   * Argo Rollouts promotion to EKS
   * Frontend deployment to Vercel (Tech Stack: CI/CD).

2. Add AWS credentials and GitHub secrets for Terraform state, ECR and Argo in repository settings (Tech Stack: DevOps).

3. __Validation__: Merge to `main`, confirm GitHub Actions completes successfully, and check EKS services health in AWS Console (Availability Test).

4. Configure CloudFront distribution in Terraform to serve `/frontend` build from S3 bucket `fomo-static-assets` in `us-east-1` with caching rules (Tech Stack: Deployment).

5. __Validation__: Visit `https://app.fomo.com`, ensure dashboard loads within 1s, and verify real-time notification overlay functions correctly (PRD: Performance & Availability).
