# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies for our Fomo-style Social-Proof Notification Platform. It’s written in everyday language so anyone can understand how our frontend is set up and why.

## 1. Frontend Architecture

### Overall Structure

*   **Framework**: Next.js 14 with the App Router.
*   **Language**: TypeScript for strong typing and safer code.
*   **Component Library**: Shadcn UI (built on Tailwind CSS) for pre-styled, accessible components.
*   **Styling**: Tailwind CSS utility classes, extended with custom themes.
*   **Data Fetching**: React Query (TanStack Query) handles server-state fetching, caching, and synchronization.
*   **Client-State**: Zustand stores local and UI state (e.g., modal open/close, form wizard progress).
*   **Routing**: Next.js App Router for pages, plus TanStack Router for advanced, nested client-side navigation within the dashboard.
*   **Rendering Modes**: SSR for initial page load, ISR/Edge Runtime for fast updates, and selective client-side rendering where needed.

### Why This Works

*   **Scalability**: Modular components and hooks let multiple teams build features in parallel.
*   **Maintainability**: TypeScript and clear folder structure keep code predictable. React Query and Zustand separate server vs. client state.
*   **Performance**: Edge caching, code-splitting, lazy loading of heavy parts (charts, editors), and service workers for notifications.

## 2. Design Principles

### Usability

*   Keep the interface simple. Wizards guide users step by step (e.g., notification builder).
*   Live previews and inline validation minimize errors.

### Accessibility

*   Follow WAI-ARIA best practices. Shadcn UI components are a11y-ready.
*   Keyboard navigation in forms and menus.
*   Proper color contrast and screen-reader labels.

### Responsiveness

*   Mobile-first design with Tailwind’s responsive utilities.
*   Dashboard layout adapts from desktop (side nav + content) to tablet/mobile (hamburger menu, stacked cards).

### Consistency

*   Shared design tokens (colors, spacing, typography).
*   Reusable components (buttons, inputs, cards) ensure a unified look.

## 3. Styling and Theming

### CSS Approach

*   **Utility-first**: Tailwind CSS for most styling needs.
*   **Component-level**: Shadcn UI primitives extended with custom Tailwind classes.
*   **Custom CSS**: Support for BEM naming when merchants supply full CSS/theme files (white-label).

### Theming

*   **Core theme**: Defined in `tailwind.config.js` with design tokens (colors, fonts, spacing).
*   **Merchant themes**: Dynamically load merchant’s CSS or JSON theme object via the API. Apply via CSS variables.

### Visual Style

*   Modern, clean UI with subtle glassmorphism in notification pop-ups (semi-transparent backgrounds, soft shadows).
*   Dashboard uses a flat, material-inspired style for clarity.

### Color Palette

*   Primary: #3B82F6 (blue), #10B981 (green for success), #EF4444 (red for errors)
*   Neutrals: #F9FAFB (light), #6B7280 (medium gray), #111827 (dark)
*   Accent: #FBBF24 (yellow for highlights)

### Typography

*   **Font**: Inter (system-friendly, highly legible)
*   **Headings**: Inter Bold
*   **Body**: Inter Regular

## 4. Component Structure

### Folder Layout

`/src /app ← Next.js App Router folders (dashboard, builder) /components ← Shared UI components (Button, Modal, Chart) /features ← Feature-specific modules (site-management, notifications) /hooks ← Reusable React hooks (useAuth, useTheme) /state ← Zustand stores /styles ← Global CSS, theme files /utils ← Helpers (formatDate, analytics)`

### Reuse and Modularity

*   **Atoms**: Buttons, Inputs, Icons.
*   **Molecules**: Form rows, NavItem, Card.
*   **Organisms**: DashboardHeader, NotificationWizard.
*   **Pages**: Next.js pages under `/app` use organisms to build screens.

### Benefits of Component-Based Architecture

*   Clear separation of concerns.
*   Easy to test in isolation.
*   Promotes consistent UX across features.

## 5. State Management

### Server State: React Query

*   Caches data, refetches in background, handles loading and error states.
*   Queries: site list, notification configs, analytics metrics.
*   Mutations: create notification, update site settings, run A/B tests.

### Client State: Zustand

*   Stores UI state unrelated to server: wizard step, modal visibility, filter dropdowns.
*   Lightweight and no boilerplate.
*   Shared across components via simple hooks (`useWizardStore`, `useUIStore`).

### Sharing State

*   React Query’s `useQueryClient` invalidates and refreshes data globally.
*   Zustand store subsets can be subscribed to in any component.

## 6. Routing and Navigation

### Next.js App Router

*   File-based routing: `/app/dashboard`, `/app/builder`, `/app/settings`.
*   Layouts: Shared dashboard layout with sidebar and header.

### TanStack Router

*   Nested routes within complex builders (e.g., steps in notification wizard).
*   Declarative route definitions for advanced patterns.
*   Route guards based on user roles (Admin, Analyst, Designer) using Clerk’s session.

### Navigation Flow

1.  **Login** via Clerk. Redirect to `/dashboard`.
2.  **Site Selector** in navbar switches context.
3.  **Routes**: Dashboard home → Analytics → Notifications → Builders → Integrations → Settings.

## 7. Performance Optimization

*   **Code Splitting**: Dynamic `import()` for heavy components (charting libraries, editor).
*   **Lazy Loading**: React.lazy for non-critical UI.
*   **Edge Caching**: Vercel/Cloudflare cache SSR pages and static assets.
*   **Optimized Images**: Next.js Image component.
*   **Service Worker**: Pre-cache embed snippet payload for in-page pop-ups.
*   **Bundle Analysis**: Regular checks with `next build --profile`.

## 8. Testing and Quality Assurance

### Unit Tests

*   **Framework**: Jest + React Testing Library.
*   Test components in isolation (buttons, form steps).

### Integration Tests

*   Combine React Query mocks (MSW) with component tests to simulate data flows.

### End-to-End Tests

*   **Tool**: Playwright.
*   Scenarios: login, site setup, build and preview notification, live on page.

### Linting and Formatting

*   ESLint with TypeScript rules, Prettier for consistent style.
*   Husky pre-commit hooks to run `lint-staged`.

### CI/CD Quality Gates

*   GitHub Actions runs tests and lint on every PR.
*   Coverage checks ensure new code is tested.

## 9. Conclusion and Frontend Summary

Our frontend is built for reliability, speed, and extensibility. We rely on Next.js 14, TypeScript, React Query, Zustand, and Tailwind CSS + Shadcn UI to deliver a modern, accessible experience. Component-based design, clear state separation, and robust testing ensure that developers can onboard quickly and iterate safely. Performance is baked in via edge caching, lazy loading, and efficient bundling. Together, these guidelines keep our codebase maintainable and aligned with business goals: making it easy for merchants to build, test, and deploy social-proof notifications that convert.
