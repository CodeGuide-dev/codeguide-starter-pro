# Security Guidelines for Fomo-Style Social-Proof Notification Platform

This document defines the security principles, controls, and best practices to be applied throughout the design, implementation, and operation of the Fomo-Style Social-Proof Notification Platform. It aligns with the organization’s core security requirements and the project’s multi-tenant architecture, ensuring confidentiality, integrity, availability, and compliance.

## 1. Security by Design & Core Principles

• **Embed security early**: Incorporate threat modeling during design, secure coding standards in development, and security testing in CI/CD. • **Least Privilege**: Grant services, containers, users, and CI/CD pipelines only the minimum permissions needed (e.g., separate IAM roles for Kafka producers, Supabase writes, ClickHouse reads). • **Defense in Depth**: Layer controls across network (mTLS, WAF), application (RBAC, input validation), data (encryption), and host/infra (hardened OS). • **Fail Securely**: Ensure errors default to safe states (e.g., block notification publishing on channel-failures), avoid verbose stack traces in responses. • **Secure Defaults**: All settings (CORS, CSP, TLS ciphers, cookie flags) must ship in their most restrictive configuration.

## 2. Authentication & Access Control

### 2.1 User Authentication

• Use Clerk’s SAML/OIDC SSO and email/password flows, enforce unique salted hashing (bcrypt/Argon2) for any local credentials. • Enforce strong password policy: minimum 12 characters, complexity rules, block common passwords. • Enable Multi-Factor Authentication (TOTP or SMS backup codes) for Admin and Owner roles. • Protect login endpoints with brute-force throttling (e.g., Redis-backed rate limit).

### 2.2 Session & Token Management

• Issue JWT access tokens with strong signing algorithm (RS256/ECDSA), validate `exp`, `aud`, `iss` on every request. • Store session tokens in Secure, HttpOnly, SameSite=Strict cookies for web UI. • Enforce idle (15 min) and absolute (8 hr) session timeouts; support explicit logout and token revocation. • Prevent session fixation: regenerate session token on privilege elevation.

### 2.3 Authorization & RBAC

• Implement server-side RBAC checks for every API/microservice call. Never rely on client-provided roles. • Define roles: Owner, Admin, Analyst, Designer with granular permissions on sites, notifications, analytics, billing, and settings. • Use SCIM provisioning for enterprise customers; audit creation, modification, and deletion of users/roles.

## 3. Input Handling & Processing

• **Server-Side Validation**: Validate all incoming data (URLs, JSON payloads, query parameters) against strict schemas (e.g., Zod/Tajson) in API routes and microservices. • **Prevent Injection**: Use parameterized queries via Supabase ORM/Prepared Statements for Postgres; escape inputs before passing to TimescaleDB/ClickHouse. • **Sanitize HTML**: Strip or encode user-provided CSS/theme files and dynamic variables to prevent XSS in notifications and dashboard previews. • **File Uploads**: Validate MIME types, file sizes, and strip metadata for CSS/theme uploads; store files in an isolated bucket with restrictive ACLs. • **Template Safety**: Escape variables in Shadcn templates; disable arbitrary template compilation from untrusted sources.

## 4. Data Protection & Privacy

### 4.1 Encryption & Secrets Management

• Enforce TLS 1.3 for all in-transit traffic (clients ↔ CDN/Edge ↔ API Gateway ↔ Microservices). • Use mTLS between services (API Gateway ↔ EKS pods/Lambdas) to prevent unauthorized access. • Encrypt sensitive fields (PII: email, name) at rest in Postgres using `pgcrypto`. • Store secrets (DB credentials, JWT keys, SendGrid API key, Firebase credentials) in a secrets manager (AWS Secrets Manager or HashiCorp Vault), not in code or env files.

### 4.2 Data Retention & Erasure

• Retain raw events in Postgres for 90 days; automatically export to S3 Glacier with server-side encryption (AES-256). • Implement GDPR/CCPA workflows: data export (CSV/PDF) and secure erasure on user or site deletion. • Audit logs: write-once logs stored for up to 7 years with integrity checks (hash chaining).

## 5. API & Service Security

• **HTTPS Everywhere**: Redirect all HTTP requests to HTTPS; disable insecure protocols (TLS 1.0/1.1). • **Rate Limiting & Throttling**: Enforce per-key and per-IP rate limits at the API Gateway (Kong/Gloo) using Redis for counters. • **CORS**: Permit only merchant-configured domains for embed and dashboard; default to no-origin. • **Authentication Enforcement**: Validate JWT or session cookie on every REST, GraphQL, SSE, and webhook endpoint. • **Minimal Response Data**: Strip PII and internal metadata from API responses; use projection/whitelisting. • **Webhook Security**: Sign outgoing webhooks with HMAC-SHA256; verify signatures and timestamps, reject stale requests (> 5 min).

## 6. Web Application Security Hygiene

• **CSP**: Configure a strict Content-Security-Policy with nonces for inline scripts/styles; restrict external sources to trusted CDNs. • **X-Frame-Options**: DENY to prevent clickjacking in the dashboard app. • **X-Content-Type-Options**: nosniff on all responses. • **Referrer-Policy**: `strict-origin-when-cross-origin`. • **SRI**: Subresource Integrity on all third-party scripts (e.g., analytics, Chat widget). • **CSRF Protection**: Implement double-submit cookies or synchronizer tokens for all state-changing requests in the dashboard. • **Secure Cookies**: Always set `Secure`, `HttpOnly`, `SameSite=Strict` for session cookies.

## 7. Infrastructure & Configuration Management

• **Harden Hosts**: Apply CIS benchmarks to EKS nodes and Lambda environments; disable unused ports and services. • **Immutable Infrastructure**: Use Terraform for defining infrastructure; avoid manual changes in production. • **Network Segmentation**: Deploy microservices in private subnets with limited egress; expose only necessary ports (443, 80 for redirect). • **Secrets Rotation**: Rotate database and API credentials quarterly; automate with secrets manager. • **TLS Configuration**: Use Let’s Encrypt or ACM; enforce strong ciphers (ECDHE-RSA-AES256-GCM). • **Disable Debug**: Ensure Next.js runs in production mode; remove verbose error pages and stack traces.

## 8. Dependency Management & CI/CD Security

• **Lockfiles**: Commit `package-lock.json`, `yarn.lock`, `Pipfile.lock` for deterministic builds. • **Vulnerability Scanning**: Integrate SCA tools (Dependabot, Snyk) in CI to detect CVEs in dependencies. • **Minimal Dependencies**: Only include libraries that are actively maintained; remove unused packages. • **CI/CD Guardrails**:

*   Require code reviews and security approvals for pull requests.
*   Run automated tests: unit, integration, and security (SAST/DAST) in GitHub Actions before merge.
*   Use Argo Rollouts for safe canary/blue-green deployments; rollback on errors/thresholds.

## 9. Logging, Monitoring & Incident Response

• **Centralized Logs**: Ship application and infra logs to Loki; redact sensitive fields. • **Metrics & Alerts**: Collect Prometheus metrics; set SLO/SLA alerts (e.g., SSE error rate, API error rate, auth failures). • **Tracing**: Instrument code with OpenTelemetry; visualize in Jaeger for performance bottlenecks and security anomalies. • **Alerting**: Integrate alerting to PagerDuty/Slack for critical security incidents (unauthorized access attempts, secret exposures). • **Incident Playbook**: Maintain documented runbooks for breach scenarios, revoke tokens, rotate secrets, and notify stakeholders.

## 10. Ongoing Security Practices

• **Penetration Testing**: Perform periodic third-party pen tests focusing on SSRF, XSS, auth bypass, and API abuse. • **Red Team Exercises**: Simulate real-world attacks on the platform and webhooks. • **Security Training**: Provide developers with secure coding workshops and code review guidelines. • **Policy Reviews**: Quarterly review of security policies, threat models, and compliance requirements (GDPR/CCPA).

**By adhering to these guidelines, the Fomo-Style Notification Platform will achieve a robust security posture, protecting merchant data, customer privacy, and ensuring compliance at scale.**
