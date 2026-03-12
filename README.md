# DWS Blog Challenge

Frontend implementation for the DWS Blog technical challenge using React, TypeScript, Vite, and Zustand.

## Scripts

- `npm run dev`: run development server
- `npm run build`: build production bundle
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm run test`: run unit tests with Vitest

## Setup

```bash
npm install
echo "VITE_API_BASE_URL='insert back-end url'" >> .env.override
npm run dev
```

The application uses `VITE_API_BASE_URL` and defaults to:

```txt
https://tech-test-backend.dwsbrazil.io
```

Use `.env.override` to define your backend URL for local setup.

## Project Structure

```text
src
 ├── components
 ├── hooks
 ├── pages
 ├── services
 ├── store
 ├── styles
 ├── types
 └── utils
```

## Architecture Summary

- `components`: reusable presentational pieces
- `pages`: list and detail page composition
- `hooks`: fetch/data orchestration and interaction with store
- `services`: API access and data normalization
- `store`: shared application state via Zustand
