# Paradise Hotel (frontend)

React (Vite) frontend for the Paradise Hotel booking system.

## Getting Started

1) Install dependencies:

```bash
npm install
```

2) Configure the API URL.

Copy `.env.example` to `.env` and set the backend address:

```env
VITE_API_URL=http://localhost:5000
```

3) Start the dev server:

```bash
npm run dev
```

Open the URL shown in the console (usually `http://localhost:5173`).

## Usage

- **Room search**: `/search` — dates, guests, filters, and results.
- **Register / login**: `/register`, `/login`. The token is stored in `localStorage`.
- **My reservations**: `/reservations` (authorized users only).
- **Admin panel**: `/admin` (only for users with the `Admin` role in the `user` object).

## API Notes

- Authorization: `Authorization: Bearer <token>` is read from `localStorage`.
- Endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/rooms/availability`
  - `POST /api/reservations`
  - `GET /api/reservations/me`
  - `DELETE /api/reservations/:id`
  - `GET /api/admin/dashboard`
  - `GET /api/admin/reservations`
  - `CRUD /api/locations` (if your path is different, update `BASE` in `src/services/locations.js`)

---

The text below is from the default Vite template (you can remove it if you want).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
