# Tech Stack Document for Fomo-Style Social-Proof Notification Platform

This document explains in everyday language why we chose each technology in our stack and how they work together to deliver a seamless, secure, and scalable social-proof notification service.

## 1. Frontend Technologies

We built our user interface with modern, developer-friendly tools that ensure a snappy experience for merchants and their teams.

*   **Next.js 14 (App Router)** • Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) for fast page loads and SEO. • Edge-rendered routes (via Vercel Edge) for ultra-low latency on critical paths.
*   **TypeScript** • Adds type checking to JavaScript, catching errors early and making components more self-documenting.
*   **Tailwind CSS** • Utility-first CSS framework for rapid styling, easy theming, and consistent responsive layouts.
*   **Shadcn UI** • Ready-made, accessible React components built on top of Tailwind—ensures a polished, uniform look.
*   **React Query** • Simplifies data fetching, caching, and synchronization with the backend API.
*   **Zustand** • Lightweight state management for local UI state (e.g. form wizard steps, toast notifications).
*   **TanStack Router** • Client-side routing with cross-tab cache sharing and URL-based state, giving users smooth navigation even across multiple open tabs.
*   **Browser APIs** • **IntersectionObserver**: Triggers pop-ups only when users scroll into view, saving resources. • **Service Worker**: Caches embed scripts and pop-up templates for instant display, even offline.

## 2. Backend Technologies

Our backend is a mix of relational databases, streaming systems, and microservices—each chosen for its specialty in storing, processing, or serving data at scale.

*   **Databases & Storage** • **Supabase (PostgreSQL)**: Primary OLTP store for sites, users, notifications, and billing data. • **TimescaleDB**: Postgres extension for time-series data—ideal for rolling up event counts (impressions, clicks) by hour. • **ClickHouse**: Columnar OLAP database for high-performance, ad-hoc analytics queries over millions of events. • **Redis**: In-memory store for real-time counters and temporary caches (e.g. rate limits).
*   **Event Streaming** • **Apache Kafka (MSK)**: Reliable, durable event bus to ingest raw notification events and fan them out to multiple consumers. • **Redis Streams**: Lightweight stream for low-latency processing and dead-letter queue (DLQ) support.
*   **Microservices & APIs** • **API Gateway** (Kong / Gloo with mutual TLS): Central entry point for rate limiting, authentication, and traffic shifting. • **Node.js Services** on EKS pods and AWS Lambda: Handle notification scheduling, analytics aggregation, integration connectors, and billing workflows. • **REST (OpenAPI)** and **GraphQL (Apollo Router)**: Allow merchant dashboards and external systems to read/write configuration and events. • **Webhooks**: HMAC-signed POST callbacks with retry logic for custom integrations.
*   **Authentication & Authorization** • **Clerk Auth**: User sign-in, SSO (SAML/OIDC), SCIM provisioning, role-based access control (RBAC), and multi-factor authentication (MFA). • **JWT Cookies**: Secure session tokens for service-to-service calls and API consumers.
*   **Machine Learning Inference** • **AWS SageMaker**: Hosts models to predict optimal send-times and suggest A/B test variants. • **OpenAI SDK**: (Optional) Used for generating dynamic content suggestions and enhancing AI-driven workflows.

## 3. Infrastructure and Deployment

We automated provisioning, deployment, and monitoring so the platform stays reliable and can grow without manual intervention.

*   **Version Control & CI/CD** • **GitHub**: Source code hosting with branch protection and code reviews. • **GitHub Actions**: Runs tests, builds containers, and publishes artifacts. • **Argo Rollouts**: Blue/green and canary deployments to reduce downtime and mitigate risk.
*   **Infrastructure as Code** • **Terraform**: Declarative modules for EKS clusters, MSK, RDS, ElastiCache, and Cloudflare configuration.
*   **Hosting & Edge** • **AWS EKS**: Kubernetes-based microservices hosting for core backend logic. • **AWS Lambda**: Serverless functions for lightweight connectors and scheduled jobs. • **Cloudflare CDN & Vercel Edge**: Global caching layer for static assets, edge functions for instant script delivery.
*   **Observability** • **OpenTelemetry**: Standardized instrumentation across services. • **Jaeger**: Distributed tracing to follow requests end-to-end. • **Prometheus & Grafana**: Metrics collection and dashboards for system health and performance. • **Loki**: Centralized log aggregation for troubleshooting.
*   **Long-Term Storage** • **S3 Glacier**: Archives raw event data beyond the 90-day retention window for compliance.

## 4. Third-Party Integrations

We rely on proven external services to handle email, push notifications, payments, and e-commerce connectors.

*   **Email (SendGrid)** • Campaign builder, template hosting, segmentation, and deliverability tracking.
*   **Browser Push (Firebase Cloud Messaging)** • Opt-in prompts, push payloads, and analytics via Firebase SDK.
*   **E-Commerce Connectors** • **Shopify**, **WooCommerce**, **Zapier**: Native apps that sync orders and customer data in real time.
*   **Generic Webhooks** • REST/GraphQL endpoints for custom pipelines or proprietary systems.
*   **Billing (Stripe)** • Manages subscription tiers, trials, prorations, and usage-based overages.

## 5. Security and Performance Considerations

We built multiple layers of protection and optimization to keep data safe and experiences smooth.

Security Measures:

*   TLS 1.3 on all public endpoints and mTLS between internal services
*   Web Application Firewall (WAF) and strict Content Security Policy (CSP) with nonces
*   Protection against XSS, CSRF, and supply chain attacks via Subresource Integrity (SRI)
*   Field-level encryption of PII in Postgres (using pgcrypto)
*   GDPR/CCPA workflows for data export and erasure
*   Immutable audit log stored up to 7 years (configurable)

Performance Optimizations:

*   Edge caching of scripts and API responses (Cloudflare, Vercel Edge)
*   Multi-layer cache: CDN → Redis → Browser Service Worker
*   Server-Sent Events (SSE) with auto-reconnect for real-time pop-ups
*   Database partitioning and hypertables (TimescaleDB) plus ClickHouse downsampling
*   Automatic A/B test winner selection at statistical significance to reduce manual overhead

## 6. Conclusion and Overall Tech Stack Summary

Our technology choices align tightly with the platform’s goals:

*   Fast, responsive UI built with **Next.js**, **Tailwind**, and **Shadcn UI**
*   Strong type safety and developer DX via **TypeScript**
*   Reliable, multi-model data storage using **Supabase**, **TimescaleDB**, **ClickHouse**, and **Redis**
*   High-throughput event handling with **Kafka**, **Redis Streams**, and **microservices**
*   Secure, flexible auth through **Clerk**, **JWT**, and industry best practices
*   Real-time delivery and offline resilience with **Service Workers** and **Edge caching**
*   Scalable infrastructure managed by **Terraform**, **EKS**, and **GitHub Actions**
*   Comprehensive observability with **OpenTelemetry**, **Prometheus**, **Grafana**, and **Jaeger**
*   Seamless integrations for email, push, e-commerce, and payments

This cohesive stack ensures merchants get an intuitive dashboard and visitors experience instant, reliable social-proof notifications—backed by a secure, observable, and easily extendable backend.
