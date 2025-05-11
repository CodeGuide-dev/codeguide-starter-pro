# Backend Structure Document

This document outlines the backend architecture, database setup, APIs, hosting, infrastructure, security, monitoring, and maintenance for our multi-tenant social proof notification platform. It’s written in everyday language so anyone can understand how everything fits together.

## 1. Backend Architecture

Overall, we use a microservices approach with event-driven components to keep things scalable, maintainable, and high-performing.

• Microservices:

* Separate services for Sites, Notifications, Analytics, Integrations, Users, and Billing.
* Each service runs in its own container (EKS pod) or as a Lambda function for bursty workloads.

• Event Streaming:

* We use Apache Kafka (via AWS MSK) or Redis Streams to move events (like “new purchase” or “notification shown”) between services.
* This decouples producers (e.g., website snippets) from consumers (e.g., analytics, notifications).

• API Gateway:

* Kong or Gloo sits at the front, handling authentication, rate limiting, and traffic routing via mutual TLS (mTLS).

• Serverless & Edge:

* Edge functions on Cloudflare or Vercel handle the lightweight embed snippet delivery for super-low latency.

How this supports our goals:

* Scalability: Services can be scaled independently based on load; Kafka handles high event volumes.
* Maintainability: Clear service boundaries and IaC (Terraform) make updates and rollbacks easier.
* Performance: Edge functions and Redis caching keep user-facing operations snappy.

## 2. Database Management

We use a mix of SQL, time-series, OLAP, and in-memory stores to fit each use case.

• Primary OLTP (Online Transactional) Data:

* PostgreSQL (via Supabase) stores core tables like users, sites, notifications, billing, and templates.

• Time-Series & Analytics:

* TimescaleDB (built on Postgres) for ordered event data that powers our real-time dashboards.
* ClickHouse for heavy analytics queries and reports (e.g., A/B test results, long-term trends).

• Caching & Counters:

* Redis (ElastiCache) for fast counters (impressions, clicks) and temporary cache of templates or user sessions.

• Data Management Practices:

* Raw event data is kept in TimescaleDB for 90 days, then archived to S3 Glacier.
* Backups for Postgres and ClickHouse run daily; retention is configurable per customer plan.

## 3. Database Schema

### Core SQL Tables (PostgreSQL)

Below is a simplified view of the main SQL tables. Real implementation will include indexes, constraints, and foreign keys.

`-- Users CREATE TABLE users ( id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL, hashed_password TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() ); -- Sites (tenants) CREATE TABLE sites ( id UUID PRIMARY KEY, owner_id UUID REFERENCES users(id), name TEXT, domain TEXT UNIQUE NOT NULL, settings JSONB, created_at TIMESTAMPTZ DEFAULT NOW() ); -- Notifications CREATE TABLE notifications ( id UUID PRIMARY KEY, site_id UUID REFERENCES sites(id), template_id UUID REFERENCES templates(id), status TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() ); -- Templates (branding) CREATE TABLE templates ( id UUID PRIMARY KEY, site_id UUID REFERENCES sites(id), name TEXT, css_content TEXT, created_at TIMESTAMPTZ DEFAULT NOW() ); -- Billing CREATE TABLE subscriptions ( id UUID PRIMARY KEY, site_id UUID REFERENCES sites(id), tier TEXT, status TEXT, next_billing_date DATE, created_at TIMESTAMPTZ DEFAULT NOW() );`

### Time-Series Schema (TimescaleDB)

• __events__ table:

* Columns: time, site\_id, event\_type, payload (JSONB)
* Hypertable on `time` for efficient inserts and queries

### OLAP Schema (ClickHouse)

• Distributed tables for event aggregation, A/B test results, and long-term analytics. • Columns: site\_id, timestamp, metric, value

## 4. API Design and Endpoints

We offer both RESTful and GraphQL interfaces plus real-time webhooks and SSE.

### REST API (OpenAPI Spec)

• __Auth & Users__

* POST /auth/signup — create account
* POST /auth/login — get JWT token
* GET /users/me — fetch profile

• __Sites & Notifications__

* GET /sites — list customer sites
* POST /sites — create a new site
* GET /sites/{siteId}/notifications — list notifications
* POST /sites/{siteId}/notifications — create notification

• __Analytics__

* GET /sites/{siteId}/analytics?start=\&end= — fetch metrics

• __Billing__

* GET /sites/{siteId}/subscription — current plan
* POST /sites/{siteId}/subscription — change plan

### GraphQL API (Apollo Router)

• Single endpoint `/graphql` • Queries and mutations covering all data types (Users, Sites, Notifications, Reports)

### Webhooks & Real-Time

• HMAC-signed webhooks for external integrations (Shopify, WooCommerce, Zapier). • Server-Sent Events (SSE) endpoint `/events/stream` for live notification updates.

## 5. Hosting Solutions

We host primarily on AWS, with edge layers on Cloudflare or Vercel.

• AWS:

* EKS for microservices
* MSK for Kafka
* RDS for PostgreSQL (Supabase) and TimescaleDB
* EC2 cluster or serverless ClickHouse
* ElastiCache Redis
* S3 & Glacier for storage and archives

• Edge:

* Cloudflare Workers or Vercel Edge Functions for the embed snippet and static assets

Benefits:

* High reliability (multi-AZ deployments)
* Auto-scaling on demand
* Cost control via serverless options and spot instances

## 6. Infrastructure Components

• API Gateway (Kong/Gloo)

* Central entrypoint, handles auth, rate limits, routing

• Load Balancer (AWS ALB)

* Distributes traffic to EKS pods

• Caching (Redis)

* Speeds up session lookup, template caching, counters

• CDN (Cloudflare/Vercel)

* Delivers JS snippet, CSS, and static assets globally

• IaC (Terraform)

* Defines EKS clusters, RDS instances, MSK, ElastiCache, Cloudflare settings

• CI/CD

* GitHub Actions + Argo Rollouts for blue/green and canary deployments

## 7. Security Measures

• Transport & Network:

* TLS 1.3 everywhere, mTLS between services
* WAF to block common web attacks

• Data Protection:

* Field-level encryption (pgcrypto) for PII in PostgreSQL
* Encrypted S3 buckets, server-side encryption

• Application Security:

* CSP nonces, XSS/CSRF/SRI protections
* RBAC and SSO via Clerk Auth (supports SAML, OIDC, SCIM)

• Compliance & Auditing:

* GDPR/CCPA workflows (data erasure, consent logs)
* Configurable audit logs retained up to 7 years

## 8. Monitoring and Maintenance

• Observability Stack:

* OpenTelemetry for traces and metrics
* Prometheus + Grafana for dashboards and alerts
* Jaeger for distributed tracing
* Loki for log aggregation

• Maintenance Practices:

* Automated backups and restores for all databases
* IaC drift detection and daily Terraform plan checks
* Security patching via managed services and regular image rebuilds

## 9. Conclusion and Overall Backend Summary

Our backend is built on a microservices, event-driven architecture hosted on AWS, with edge layers on Cloudflare/Vercel. We leverage a mix of SQL (PostgreSQL), time-series (TimescaleDB), OLAP (ClickHouse), and in-memory (Redis) stores to meet transactional, analytical, and real-time needs. APIs include REST, GraphQL, webhooks, and SSE, all guarded by mTLS, WAF, and field-level encryption.

With Terraform and GitHub Actions, we ensure reliable deployments. OpenTelemetry, Prometheus, and Jaeger give us full visibility. Security and compliance are baked in with encryption, RBAC, audit logs, and GDPR/CCPA workflows. This setup aligns perfectly with our goal to provide a scalable, secure, customizable, and real-time social proof platform for online merchants.
