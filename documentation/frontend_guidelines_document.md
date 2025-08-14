# Frontend Guideline Document

## Frontend Architecture

Our frontend is built on **Next.js** (App Router) and **React**, using **TypeScript** for type safety.  

•  **Next.js App Router** provides file-based routing, co-locating page, layout, and server logic in the `app/` folder.  
•  **React** components drive the UI, split into server and client components as needed.  
•  **TypeScript** ensures compile-time checks and consistent interfaces.  
•  **Next.js API Routes** (in `app/api/`) let us handle webhooks or other server logic without a separate backend.  

This architecture supports:
•  **Scalability:** Easily add new routes, pages, and API endpoints under `app/`.  
•  **Maintainability:** Clear folder structure (`app/`, `components/`, `fonts/`, `.cursor/`) and component reuse reduce cognitive overhead.  
•  **Performance:** Out-of-the-box code splitting, server-side rendering (SSR), static site generation (SSG), and API routes.  

## Design Principles

1.  **Usability:** We use semantic HTML, clear navigation, and straightforward interactions. Buttons, links, and forms follow predictable patterns.  
2.  **Accessibility:** We follow WCAG guidelines—semantic tags, ARIA attributes, keyboard navigation, and sufficient color contrast.  
3.  **Responsiveness:** Mobile-first CSS with flexible layouts (CSS Grid, Flexbox) ensures the app works smoothly on all devices.  
4.  **Consistency:** Shared layout (`layout.tsx`), global styles, and a design token system ensure a unified experience.  
5.  **Performance-First:** Minimizing bundle size, optimizing images, and lazy-loading heavy components.  

## Styling and Theming

### Approach

•  **Global CSS:** `globals.css` defines resets, base typography, and CSS variables.  
•  **Component-Level CSS Modules:** `Component.module.css` for scoped styles, preventing clashes.  
•  **CSS Variables:** Manage color and spacing tokens in `:root` for easy theming.  

### Look & Feel

We chose a **modern flat design** aesthetic—clean lines, minimal shadows, and bold typography.  

### Color Palette

•  **Primary:** #005F73  
•  **Secondary:** #0A9396  
•  **Accent:** #94D2BD  
•  **Background:** #F0FAF9  
•  **Surface:** #FFFFFF  
•  **Text (dark):** #14213D  
•  **Text (light):** #F8F9FA  

### Typography

We include custom fonts in `fonts/`:  
•  **Geist VF:** used for headings and body text for a distinctive, readable look.  
•  **Geist Mono VF:** used for code snippets and monospaced elements.  

Font loading is handled via Next.js’s built-in font optimization or imported in `globals.css`:
```css
@font-face {
  font-family: 'Geist VF';
  src: url('/fonts/GeistVF.woff') format('woff');
}
@font-face {
  font-family: 'Geist Mono VF';
  src: url('/fonts/GeistMonoVF.woff') format('woff');
}
:root {
  --font-sans: 'Geist VF', sans-serif;
  --font-mono: 'Geist Mono VF', monospace;
}
```  

## Component Structure

All UI is split into small, self-contained components under `/components`.  

•  **Feature folders (optional):** Group related components (e.g., `Button/`, `Card/`) together.  
•  **Atomic approach:** Atoms (buttons, inputs), molecules (form groups), organisms (navbars), templates (pages).  
•  **Reusable props:** Components accept props for data and callbacks, keeping them stateless where possible.  

This component-based architecture:  
•  Enhances reusability and consistency.  
•  Simplifies testing and documentation.  
•  Makes onboarding new features straightforward.  

## State Management

•  **Local State:** We use React’s `useState` and `useReducer` for component-level state.  
•  **Global State:** For cross-component data, we rely on React’s `Context API`. Context providers wrap `layout.tsx`.  
•  **Future Scale:** If state logic grows complex, we can introduce lightweight libraries like **Zustand** or **Jotai**, or a full solution like **Redux Toolkit**.  

## Routing and Navigation

•  **File-based routing:** Any `app/[route]/page.tsx` becomes a route.  
•  **Layouts:** `layout.tsx` in a route folder defines shared UI for that segment.  
•  **Dynamic routes:** Use brackets (`[id]`) for dynamic segments.  
•  **Navigation:** `next/link` for client-side transitions, `useRouter` for programmatic navigation.  

## Performance Optimization

1.  **Code Splitting:** Automatic per-route splitting by Next.js.  
2.  **Dynamic Imports:** `next/dynamic` to lazy-load heavy components or charts.  
3.  **Image Optimization:** Use `next/image` for responsive, compressed images.  
4.  **Caching & Revalidation:** Leverage ISR (Incremental Static Regeneration) and `getStaticProps`/`getServerSideProps` where appropriate.  
5.  **Minified Assets:** Next.js builds minified JS and CSS bundles by default.  

## Testing and Quality Assurance

•  **Unit & Integration Tests:** `Jest` + `React Testing Library` to verify components, hooks, and utility functions.  
•  **End-to-End Tests:** **Cypress** or **Playwright** for critical user flows (login, form submission, navigation).  
•  **API Route Tests:** Use `supertest` or Next.js test helpers to simulate webhook calls.  
•  **Type Checking:** Continuous TypeScript checks prevent type regressions.  
•  **Linting:** `ESLint` with React and TypeScript plugins catch code issues early.  
•  **Formatting:** `Prettier` enforces consistent code style.  

## Developer Experience and Tooling

•  **`.cursor/rules/`:** Custom AI-powered rules for inline code guidance, suggestions, and documentation snippets via Cursor IDE.  
•  **Git Hooks:** Use `husky` to run linting and tests on `pre-commit`.  
•  **EditorConfig:** Maintains consistent tab sizes and encoding across editors.  
•  **VS Code Extensions:** Recommended: ESLint, Prettier, Tailwind (if adopted later), and Cursor.  

## Conclusion and Overall Frontend Summary

This guideline lays out a clear, modern frontend setup using Next.js, React, and TypeScript. We follow a component-based architecture, flat design style, and strong conventions for scalability, maintainability, and performance. Accessibility, consistency, and developer productivity are top priorities. With built-in API routes for webhooks and AI-driven code guidance, this starter project accelerates development of production-ready web applications while maintaining a high standard of quality.