# Security Guidelines for codeguide-starter-pro

This document provides comprehensive security recommendations for the **codeguide-starter-pro** repository, a modern Next.js application starter kit. It embeds essential security-by-design principles and best practices across authentication, data protection, API security, and infrastructure configuration. Follow these guidelines to ensure a secure, resilient, and maintainable codebase.

---

## 1. Security by Design

- **Threat Modeling**: Enumerate potential threats (e.g., unauthorized access, webhook spoofing, injection attacks) early in the design phase. Update as features evolve.
- **Secure Defaults**: Ensure all new files, routes, and components adopt secure settings by default rather than relying on opt-in security.
- **Defense in Depth**: Apply multiple layers of controls. For example, combine input validation, CSP headers, and output encoding to mitigate XSS.
- **Least Privilege**: Grant minimal permissions for environment variables, file system access, and third-party services.

---

## 2. Authentication & Access Control

Even if your starter project does not include authentication out of the box, consider these guidelines before adding protected routes:

- **Use a Battle-Tested Library**: Adopt NextAuth.js or a custom solution using Passport.js; avoid rolling your own auth unless absolutely necessary.
- **Strong Password Policies**: If storing credentials, hash passwords using Argon2 or bcrypt with unique salts. Enforce complexity and minimum lengths (e.g., ≥12 characters).
- **Session Management**:
  - Store sessions in a secure, server-side store (e.g., Redis).
  - Set cookies with `Secure`, `HttpOnly`, and `SameSite=Strict` attributes.
  - Implement idle and absolute timeouts.
- **JWT Best Practices** (if used):
  - Select a robust algorithm (e.g., RS256) and never use `alg: none`.
  - Validate `exp` and `aud` claims on every request.
  - Rotate or refresh tokens regularly.
- **Role-Based Access Control (RBAC)**:
  - Define clear roles (e.g., `user`, `admin`) and enforce server-side checks on every protected API route or page.
  - Deny access by default (`default-deny` policy) and explicitly grant permissions as needed.
- **Multi-Factor Authentication (MFA)**: Provide optional or mandatory MFA for administrative or high-sensitivity areas.

---

## 3. Input Handling & Processing

- **Server-Side Validation**: Never trust client-side checks alone. Validate all incoming JSON, form data, and headers using a schema validation library (e.g., Zod, Joi).
- **SQL/NoSQL Injection**: Use parameterized queries or a reputable ORM (e.g., Prisma). Do not concatenate user input into queries.
- **Command Injection**: Avoid invoking shell commands with user input. If necessary, sanitize and use safe APIs (e.g., `child_process.spawn` with arguments array).
- **Prevent XSS**:
  - Sanitize any HTML fragments before server-side rendering (e.g., DOMPurify).
  - Use Next.js’s built-in escaping for interpolated values in React.
  - Enforce a strict Content Security Policy (CSP) via HTTP headers.
- **CSRF Protection**: Use anti-CSRF tokens (e.g., `next-csrf` or built-in NextAuth.js CSRF support) for all state-changing POST/PUT/DELETE requests.
- **Redirect Validation**: If you implement redirects (e.g., after login), validate the `returnTo` URL against an allow-list to prevent open redirect attacks.
- **File Upload Security**:
  - Restrict allowed file types and maximum sizes.
  - Store user uploads outside the `public/` directory or on a dedicated object storage bucket with restricted permissions.
  - Scan uploads for malware (e.g., ClamAV).
  - Sanitize filenames to avoid path traversal.

---

## 4. API & Webhook Security

The `api/webhooks/route.ts` endpoint is an integration point for third-party services. Secure it as follows:

- **Signature Verification**: Require providers to sign payloads (e.g., HMAC SHA-256). Reject requests with invalid or missing signatures.
- **Rate Limiting**: Throttle repeated requests from the same IP or webhook source to mitigate abuse or DoS.
- **HTTPS Only**: Enforce TLS (1.2+) for all incoming webhook calls and API requests. Redirect HTTP to HTTPS at the CDN or load-balancer level.
- **Input Validation**: Strictly validate webhook payload structure and types. Drop any unexpected fields.
- **Idempotency**: Design the webhook handler to be idempotent. Use a unique event ID to prevent duplicate processing.
- **Error Handling**: Return appropriate status codes (2xx for success, 4xx for client errors, 5xx for server errors). Do not leak stack traces in responses.

---

## 5. Data Protection & Privacy

- **Encrypt in Transit**: Use HTTPS everywhere (Next.js `next.config.js` as needed).
- **Encrypt at Rest**:
  - Enable encryption for your database (e.g., AWS RDS encryption at rest).
  - Encrypt backups and snapshots.
- **Secrets Management**:
  - Store API keys, database credentials, and webhook secrets in environment variables or a dedicated vault (e.g., HashiCorp Vault, AWS Secrets Manager).
  - Never check secrets into source control or `.cursor/rules/`.
- **PII Handling**: Mask or hash personally identifiable information before logging. Comply with GDPR/CCPA guidelines for user data deletion upon request.
- **Logging & Monitoring**:
  - Centralize logs (e.g., Sentry, Datadog). Ensure no sensitive values are logged.
  - Set log levels appropriately (avoid `debug` in production).

---

## 6. Web Application Security Hygiene

- **Security Headers** (set in `next.config.js` or a custom server):
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy (CSP)
  - X-Frame-Options: DENY or `frame-ancestors` in CSP
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: no-referrer or strict-origin-when-cross-origin
- **Cookie Settings**:
  - `Secure` and `HttpOnly` flags
  - `SameSite=Strict` or `Lax` as appropriate
- **Subresource Integrity (SRI)**: Use `integrity` attributes for any third-party scripts/styles.
- **Disable Debug in Production**: Set `NODE_ENV=production` and ensure any debug middleware (e.g., React DevTools) is disabled.

---

## 7. Infrastructure & Configuration Management

- **Environment Hardening**:
  - Disable unused services on the hosting VM or container.
  - Regularly apply OS and package updates.
- **Port Management**: Only expose necessary ports (e.g., 80, 443). Block internal ports via firewall rules.
- **CI/CD Security**:
  - Use least-privileged CI service credentials.
  - Store deployment secrets in the CI’s secure vault.
  - Scan pull requests with SCA tools (e.g., Dependabot, Snyk) and fail builds on critical vulnerabilities.
- **Immutable Infrastructure**: Prefer container or serverless deployments to reduce drift and enforce consistency.

---

## 8. Dependency Management

- **Lockfiles**: Commit `package-lock.json` or `yarn.lock` for deterministic installs.
- **Regular Updates**: Schedule periodic dependency reviews and updates. Automate with Dependabot or Renovate.
- **Security Scanning**: Integrate `npm audit` or a dedicated SCA tool in your CI pipeline. Address high and critical vulnerabilities promptly.
- **Minimal Footprint**: Remove unused dependencies to shrink the attack surface.

---

## 9. Testing and Validation

- **Unit & Integration Tests**: Cover critical logic in API routes (especially `webhooks/route.ts`) and core components.
- **End-to-End Tests**: Simulate real user flows with Cypress or Playwright, including authentication and webhook events.
- **Fuzz Testing**: Optionally fuzz JSON parsers and input handlers to catch edge-case errors.
- **Penetration Testing**: Periodically engage in pen tests or use automated tools (e.g., OWASP ZAP, Burp Suite) against staging environments.

---

## Conclusion
Adhering to these security guidelines ensures that **codeguide-starter-pro** remains a secure and reliable foundation for your Next.js application. Regularly revisit and update your security posture as new threats emerge and the project evolves. Always prioritize simplicity, least privilege, and defense in depth.