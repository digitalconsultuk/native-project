# Project Context: Native Cave Restaurant

This project is a React-based web application for the **Native Cave Restaurant**, focusing on a modern redesign of their website and booking system.

## 🛠 Tech Stack

- **Core:** React 19, TypeScript, Vite
- **Styling:**
  - **Tailwind CSS v4:** Primary utility-first styling.
  - **Material UI (MUI) v7:** Used for complex UI components like Cards, Buttons, and Modals.
  - **CSS Modules/Plain CSS:** For custom styles (`App.css`, `index.css`).
- **Routing:** React Router 7
- **State Management:** React `useReducer` hook (logic located in `src/state/`).

## 📂 Project Structure

- `src/assets/`: Static images and icons.
- `src/components/`: Reusable UI components (e.g., `HeaderComponent`, `HeroFeature`, `MenuGrid`).
- `src/pages/`: Top-level page views (e.g., `HomePage`).
- `src/state/`: State management logic and reducers.
- `src/utils/`: Utility functions and helpers.
- `public/`: Public assets like `favicon.svg`.

## 🚀 Key Commands

- `pnpm dev`: Starts the Vite development server.
- `pnpm build`: Runs TypeScript check and builds the project for production.
- `pnpm lint`: Runs ESLint for code quality checks.
- `pnpm preview`: Previews the production build locally.

## 📝 Development Conventions

- **Component Patterns:** Use functional components with arrow functions or the `function` keyword. Prefer named exports for components (e.g., `export { MyComponent };`).
- **Styling Strategy:** Combine Tailwind CSS for layout/spacing and MUI for interactive UI elements. Custom styles should be kept in `App.css` or scoped CSS files.
- **State Management:** UI-heavy state transitions (like opening/closing menus with specific data) should be handled via reducers in `src/state/`.
- **Routing:** Managed in `src/App.tsx`. Current main entry is `/home`.

## 🎯 Current Focus

- Redesigning the landing page (`HomePage.tsx`).
- Implementing an interactive menu with modal details.
- Developing a booking system integration (CTA button present in `HeroFeature`).
