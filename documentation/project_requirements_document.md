# Project Requirements Document (PRD)

## 1. Project Overview

We are building a **Fomo-style Social-Proof Notification Platform**—a multi-tenant SaaS that helps online merchants boost trust and conversions by showing real-time “John from Berlin just bought…” messages on their websites. Merchants manage sites, design and schedule pop-ups, emails, and push campaigns from one modern dashboard, while the system handles live data ingestion, targeting, A/B testing and analytics behind the scenes.

This platform is being built to give businesses an easy, unified way to display social proof across channels without managing multiple tools. Key success criteria include:

*   Seamless merchant onboarding and site setup in under 5 minutes
*   Sub-100 ms notification delivery time (edge-cached)
*   Automatic A/B test winner selection with manual override
*   99.9% uptime and secure handling of millions of events per day

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1.0)

*   **Authentication & Access Control**: Clerk‐based SSO (SAML/OIDC), invitation-only team onboarding, RBAC roles.

*   **Dashboard**: Next.js single‐page console with site selector, WYSIWYG notification builder, live analytics, exports (CSV/PDF) and scheduled email digests.

*   **Site Management**: Add/verify domains via DNS TXT or automated CNAME wizard, staging & production environments, embed script generator.

*   **Notification Engine**:

    *   Pop-ups via SSE + Service Worker + IntersectionObserver
    *   Email campaigns via SendGrid
    *   Browser push via Firebase
    *   Visual rule editor, multi-variant A/B tests, AI-optimized send-time

*   **Analytics & Reporting**: Real-time charts (funnels, cohorts, attribution), raw event retention for 90 days, archival to S3 Glacier.

*   **Integrations**: Native connectors for Shopify, WooCommerce, Zapier, plus generic REST/GraphQL webhooks.

*   **Billing & Pricing**: Five tiers (Free for Shopify, Starter, Business, Pro, Unlimited) with Stripe integration.

*   **Internationalization**: Dashboard and notifications support multiple languages, locale-aware dates/currencies.

*   **White-Labeling (Enterprise Add-On)**: Custom domains, fully custom CSS/themes, SSO provisioning.

*   **Security & Compliance**: TLS/mTLS, field-level PII encryption, WAF/CSP, GDPR/CCPA workflows, audit logs.

*   **DevOps & Observability**: Terraform-driven infra, GitHub Actions + Argo Rollouts, OpenTelemetry, Prometheus/Grafana, Jaeger, Loki.

### Out-of-Scope (v1.0)

*   SMS channel integration
*   Built-in AI copywriting for notifications
*   Mobile SDKs (iOS/Android)
*   Live chat or deep-linking features
*   Offline merchant dashboard

## 3. User Flow

A new merchant visits the platform’s website, clicks **Sign Up** (or uses SSO), and creates an organization. They add their first site by entering its URL and verifying ownership via DNS TXT or an automated CNAME flow. The dashboard then shows their site in a dropdown and displays a generated embed snippet they can copy into their site’s `<head>`.

Next, the merchant clicks **Create Notification**, picks a template or uploads a custom CSS/theme file, sets targeting rules (geolocation, UTM, behavior), and defines A/B variants. They choose delivery channels—pop-up, email, push—and schedule or enable AI-optimized send-times. After publishing, they monitor live impressions, clicks, and conversions in the analytics tab, export reports on demand (CSV/PDF) or schedule them by email. When ready, they invite teammates (designer, analyst) via email, who join by invitation only and get appropriate role-based access.

## 4. Core Features

*   **Authentication & Team Management**\
    • Clerk SSO (SAML/OIDC), SCIM user provisioning\
    • Invitation-only team onboarding, roles (Admin, Analyst, Designer)\
    • Immutable audit log (7-year configurable retention)
*   **Site Configuration**\
    • Domain add/verify via DNS TXT or CNAME wizard\
    • Staging vs. production environments\
    • Embed snippet generator
*   **Notification Builder**\
    • Drag-and-drop wizard with Shadcn UI components\
    • Pre-built templates + custom CSS/theme upload\
    • Dynamic variables (user name, location, product)\
    • Visual boolean/regex rule editor\
    • Multi-variant A/B tests (auto and manual winner selection)
*   **Multi-Channel Delivery**\
    • In-page pop-ups (SSE + IntersectionObserver + Service Worker)\
    • Email campaigns via SendGrid (template editor, segmentation)\
    • Browser push via Firebase (opt-in prompt, segmentation)
*   **Analytics & Reporting**\
    • Real-time dashboards: funnels, cohorts, attribution\
    • Raw event retention (90 days), archival to S3 Glacier\
    • On-demand and scheduled CSV/PDF exports
*   **Integrations**\
    • Native connectors: Shopify, WooCommerce, Zapier\
    • Generic REST/GraphQL webhooks
*   **Billing & Plans**\
    • Five self-serve tiers, usage-based overages\
    • Stripe integration for upgrade/downgrade/trials
*   **White-Label & Enterprise**\
    • Custom domains via UI or DNS/CNAME wizard\
    • Fully custom CSS/themes, advanced branding\
    • Dedicated infrastructure option
*   **Internationalization**\
    • UI translations, locale-aware dates, numbers, currencies
*   **Security & Compliance**\
    • TLS 1.3 in-transit, mTLS between services\
    • Field-level PII encryption (pgcrypto)\
    • WAF, CSP nonces, XSS/CSRF/SRI protection\
    • GDPR/CCPA export & erasure workflows

## 5. Tech Stack & Tools

*   **Frontend**\
    • Next.js 14 (App Router, SSR/ISR/Edge)\
    • TypeScript, Tailwind CSS, Shadcn UI\
    • React Query (data fetching), Zustand (local state)\
    • TanStack Router (cross-tab cache)
*   **Backend & Infrastructure**\
    • Supabase (Postgres OLTP), TimescaleDB & ClickHouse (OLAP)\
    • Redis Streams & Apache Kafka (MSK) for event ingestion\
    • Microservices on EKS pods / AWS Lambda\
    • API Gateway (Kong/Gloo + mTLS)\
    • Clerk Auth (RBAC, SSO, SCIM) + JWT cookies\
    • AWS SageMaker for ML inference (send-time prediction)\
    • Cloudflare/Vercel Edge + Redis + Service Worker caching
*   **Integrations & Third-Party**\
    • SendGrid (email)\
    • Firebase Cloud Messaging (push)\
    • Shopify, WooCommerce, Zapier connectors\
    • Generic REST/GraphQL webhook endpoint
*   **DevOps & Observability**\
    • Terraform (IaC for EKS, MSK, RDS, ElastiCache, Cloudflare)\
    • GitHub Actions + Argo Rollouts (blue/green, canary)\
    • OpenTelemetry → Jaeger (tracing)\
    • Prometheus/Grafana (metrics)\
    • Loki (logs)\
    • S3 Glacier (long-term event archive)
*   **IDE & Developer Tools**\
    • Cursor for AI-powered coding assistance\
    • VS Code with TypeScript, Tailwind, ESLint, Prettier

## 6. Non-Functional Requirements

*   **Performance**:\
    • Notification render < 100 ms via edge caching\
    • Dashboard p95 load time < 1 s
*   **Scalability & Availability**:\
    • Auto-scale microservices to handle millions of daily events\
    • Target 99.9% uptime
*   **Security & Compliance**:\
    • TLS 1.3 everywhere, mTLS between services\
    • Field-level encryption for PII, WAF/CSP rules\
    • GDPR/CCPA workflows, audit logging
*   **Usability & Accessibility**:\
    • WCAG 2.1 AA compliance\
    • RTL/language support\
    • Intuitive UI with live previews
*   **Maintainability**:\
    • IaC modules, standardized component library\
    • Modular microservices and clear API contracts

## 7. Constraints & Assumptions

*   **No SMS channel in v1** (future consideration)
*   **90-day raw event retention**, then archive to Glacier
*   **Invitation-only team onboarding**; no self-service registration
*   **Merchant custom domains** can be set via UI or manual DNS instructions
*   **Third-party API rate limits** (SendGrid, Firebase) must be respected
*   **Kafka & Redis Streams** availability in target regions
*   **AI send-time optimization** depends on SageMaker endpoint availability

## 8. Known Issues & Potential Pitfalls

*   **SSE through CDNs** can have connection drops—use auto-reconnect logic.
*   **Backpressure in event streams**—implement DLQ and retry with exponential back-off.
*   **Third-party rate limits**—throttle outbound email/push and queue events.
*   **High-cardinality analytics queries**—partition and downsample with TimescaleDB/ClickHouse.
*   **Domain verification complexity**—provide clear UI guidance and fallback to manual steps.
*   **CSP & inline scripts**—use nonces and strict SRI checks to avoid blocking the embed.

This PRD provides a clear, unambiguous blueprint for building the Fomo-style Social-Proof Notification Platform. Subsequent technical documents (Tech Stack Details, Frontend Guidelines, Backend Structure, etc.) can be generated directly from this source.
