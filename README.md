# Paradise Hotel (frontend)

React (Vite) фронтенд для системы бронирования Paradise Hotel.

## Запуск

1) Установить зависимости:

```bash
npm install
```

2) Настроить API URL.

Скопируй `.env.example` → `.env` и укажи адрес бэкенда:

```env
VITE_API_URL=http://localhost:5000
```

3) Запустить dev-сервер:

```bash
npm run dev
```

Открой адрес из консоли (обычно `http://localhost:5173`).

## Как пользоваться

- **Поиск номеров**: `/search` — даты, гости, фильтры, результаты.
- **Регистрация / вход**: `/register`, `/login`. Токен сохраняется в `localStorage`.
- **Мои брони**: `/reservations` (только для авторизованных).
- **Админка**: `/admin` (только для роли Admin в объекте `user`).

## Примечания по API

- Авторизация: `Authorization: Bearer <token>` берётся из `localStorage`.
- Эндпоинты:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/rooms/availability`
  - `POST /api/reservations`
  - `GET /api/reservations/me`
  - `DELETE /api/reservations/:id`
  - `GET /api/admin/dashboard`
  - `GET /api/admin/reservations`
  - `CRUD /api/locations` (если у тебя другой путь, поменяй `BASE` в `src/services/locations.js`)

---

Ниже оставлен текст из шаблона Vite (можно удалить при желании).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
