# DWS Blog Frontend Challenge

## Overview
This repository contains a frontend implementation of the DWS Blog challenge.

The application consumes the challenge backend API and delivers two core experiences:
- Blog posts list view
- Blog post detail view

The implementation prioritizes component-driven architecture, reusable hooks, predictable shared state, responsive behavior, and maintainable code organization.

## Tech Stack
- React 19
- TypeScript
- Vite
- Zustand
- Axios
- CSS Modules
- SCSS (global tokens, base, and theming)
- Vitest + React Testing Library

## Features
- Posts feed with grid rendering
- Post detail page with author metadata and full content
- Client-side sorting (newest/oldest)
- Filtering by category and author (desktop + mobile controls)
- Search with suggestion dropdown and integrated filtering
- “Latest articles” section on detail pages
- Request error states with retry actions
- URL-based post selection (`?post=<id>`) using the History API
- Light/dark theme toggle persisted in `localStorage`
- Responsive, mobile-first layout with accessible interactions

## Architecture
The project follows a hooks-first architecture with clear separation of concerns:

- `components/`: reusable UI primitives and composed presentation blocks
- `pages/`: view-level composition (`BlogList`, `BlogPost`)
- `hooks/`: orchestration for async data and UI behavior (`usePosts`, `usePost`, `useThemeMode`)
- `store/`: shared normalized entities and request state via Zustand
- `services/`: API client and endpoint-specific data access/normalization
- `utils/`: date, error, and people formatting helpers

### Zustand Usage
Zustand is used only for meaningful shared state:
- normalized post, author, and category maps
- selected post id
- loading/error status for list and detail requests

This keeps local UI state inside components while centralizing cross-view data consistency.

### Responsive and Accessibility Considerations
- Mobile-first CSS with breakpoint-based enhancements
- Semantic HTML (`article`, `section`, `header`, `time`)
- Accessible labels and state attributes (`aria-label`, `aria-expanded`, `aria-controls`, `aria-pressed`)
- Keyboard support for dismissible controls (including `Escape`)
- Error screens surfaced with alert semantics

## Project Structure
```text
.
├── public/
├── src/
│   ├── components/
│   │   ├── AuthorBadge/
│   │   ├── BlogHeader/
│   │   ├── Button/
│   │   ├── FilterChip/
│   │   ├── PostCard/
│   │   ├── PostDetail/
│   │   ├── PostList/
│   │   ├── PostMetaInline/
│   │   ├── RequestErrorScreen/
│   │   └── SortByControl/
│   ├── hooks/
│   │   └── tests/
│   ├── pages/
│   │   ├── BlogList/
│   │   └── BlogPost/
│   ├── services/
│   │   └── tests/
│   ├── store/
│   │   └── tests/
│   ├── styles/
│   ├── test/
│   │   ├── fixtures/
│   │   └── utils/
│   ├── types/
│   └── utils/
├── index.html
├── package.json
└── vite.config.ts
```

## Getting Started
### Prerequisites
- Node.js 24.14+ (recommended)
- npm 11.9.0+ (recommended)

### One-Command Startup (New Machine)
```bash
npm run bootstrap
```

What it does:
- installs dependencies (when needed)
- creates `.env.override` with a default API URL if missing
- syncs `VITE_API_BASE_URL` into `.env.local` when `.env.local` is missing or empty
- starts the Vite development server

### Installation
```bash
npm install
```

### Environment
The app uses `VITE_API_BASE_URL`.

If not provided, it defaults to:
```txt
https://tech-test-backend.dwsbrazil.io
```

Bootstrap flow uses `.env.override` as the local setup source and writes runtime overrides to `.env.local`.

Example `.env.override`:
```env
VITE_API_BASE_URL=https://tech-test-backend.dwsbrazil.io
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

## API Integration
Base URL:
```txt
https://tech-test-backend.dwsbrazil.io
```

Available backend endpoints:
- `GET /posts`
- `GET /posts/{id}`
- `GET /authors`
- `GET /authors/{id}`
- `GET /categories`
- `GET /categories/{id}`

Current implementation usage:
- Directly requested: `GET /posts`, `GET /posts/{id}`
- Authors and categories are currently consumed from post payload relationships and stored in normalized Zustand slices

## Styling Approach
- Uses CSS Modules for component-scoped styles
- Uses SCSS for design tokens, base styles, and theme variables
- Follows a mobile-first approach, then scales to tablet/desktop breakpoints
- Focuses on maintainable styling primitives over utility sprawl
- No UI component framework is used (no Tailwind UI kit, MUI, Chakra, Ant, or Bootstrap components)

## Testing
The project includes automated tests with:
- Vitest (`jsdom` environment)
- React Testing Library
- `@testing-library/jest-dom`
- `axios-mock-adapter` for service and hook network tests

Covered areas include:
- services (`postsService`)
- store behavior (`blogStore`)
- custom hooks (`usePosts`, `usePost`)
- reusable components and page-level rendering behavior
- utility functions

## Engineering Decisions
- Hooks-first architecture:
  keeps async orchestration reusable and testable while reducing logic in page components.
- Zustand for shared state:
  provides a lightweight, predictable store for cross-view entities without overengineering.
- Isolated service layer:
  centralizes API access and response normalization, simplifying UI concerns.
- Functional components only:
  aligns with modern React patterns and improves composability with hooks.
- Mobile-first implementation:
  ensures baseline usability on constrained devices, then progressively enhances layouts.
- Clear boundaries by folder:
  improves onboarding, maintainability, and long-term iteration speed.

## Possible Improvements
- Add paginated/infinite loading for large datasets
- Introduce request deduplication and stale-while-revalidate caching refinements
- Expand automated coverage for edge-case error and accessibility flows
- Add skeleton/loading placeholders for richer perceived performance
- Add explicit error boundaries for unexpected rendering failures
- Consider route-layer abstraction if navigation complexity grows

## Scripts
- `npm install` - install dependencies
- `npm run bootstrap` - setup dependencies/env files and start development server
- `npm run dev` - start Vite development server
- `npm run build` - type-check and build production assets
- `npm run test` - run Vitest suite once
- `npm run test:watch` - run tests in watch mode
- `npm run lint` - run ESLint
- `npm run preview` - preview production build locally
