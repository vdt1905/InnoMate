# InnoMate

Post a project idea, get people to request to join, and run the team from a private
dashboard with real-time chat.

- **frontend/** — React 19 + Vite + Tailwind, Zustand for state
- **backend/** — Express 5 + Mongoose + Socket.io
- **Auth** — Firebase (Google, email/password, email link) proves the email address;
  the API then issues its own httpOnly session cookie.

## Running locally

You need Node 18+ and a MongoDB (local or Atlas).

```bash
# backend
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # nodemon on http://localhost:5000

# frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

`NODE_ENV` must be `development` locally: in production the session cookie is sent
with `Secure` + `SameSite=None`, which browsers reject over plain `http://localhost`,
so login silently fails if you set it to `production`.

Firebase Admin needs credentials on the backend — either drop a service account at
`backend/config/serviceAccountKey.json` or set `FIREBASE_SERVICE_ACCOUNT` to the same
JSON. Without it, `/api/auth/firebase` cannot verify tokens and nobody can log in.

## Deploying

The backend needs a long-lived process for Socket.io chat, so it runs on Render,
not on serverless. The frontend is a static build on Vercel.

**Backend — Render.** `backend/render.yaml` builds with `npm ci` and starts with
`npm start`, health-checking `/ping`. Set these in the dashboard:

| Variable | Notes |
| --- | --- |
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | long random string; rotating it signs everyone out |
| `FIREBASE_SERVICE_ACCOUNT` | the whole service-account JSON in one variable |
| `CLIENT_URL` | the frontend origin, e.g. `https://innomate.vercel.app` |
| `NODE_ENV` | `production` (already in render.yaml) |

Instead of `FIREBASE_SERVICE_ACCOUNT` you may set `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` separately. Whichever you pick,
credentials must come from the environment: `config/serviceAccountKey.json` is
gitignored and never reaches the host. If none are set the server still boots, but
sign-in returns 503 and the log says so on the first line.

**Frontend — Vercel.** Set the project's Root Directory to `frontend`; the rest comes
from `frontend/vercel.json`, including the rewrite that makes deep links work. Set
`VITE_API_BASE_URL` to the Render URL **including `/api`** (e.g.
`https://innomate-backend.onrender.com/api`) — the socket URL is derived from it by
stripping the suffix. It is read at build time, so changing it needs a redeploy.

**Cookies across the two hosts.** The session cookie is `httpOnly` and, when
`NODE_ENV=production`, `Secure` + `SameSite=None` so it survives the cross-origin
request. That requires HTTPS on both ends, which Render and Vercel provide. Any
additional origin (a preview deployment, a custom domain) must be added to
`CLIENT_URL` or it will fail CORS and never receive the cookie.

**Free-tier note.** Render's free plan sleeps an idle service, so the first request
after a lull takes ~30s. The frontend renders without waiting on the API, so this
shows up as a slow first login rather than a blank page.

## API

All routes are under `/api`. Everything except `GET /ideas/all` and `GET /ideas/search`
requires the session cookie.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/firebase`, `POST /auth/resolve-email`, `POST /auth/logout` |
| Users | `GET/PUT /users/me`, `GET /users/search`, `GET /users/username/:username`, `GET /users/details/:userId` |
| Ideas | `POST /ideas/createIdea`, `GET /ideas/all`, `GET /ideas/feed`, `GET/PUT/DELETE /ideas/:id`, likes, comments |
| Teams | `GET /ideas/teams/mine`, `GET /ideas/:id/dashboard`, `GET /ideas/:id/messages`, member remove/leave |
| Join requests | `POST /ideas/:id/join-request`, `GET /ideas/:id/requests`, accept/reject, `GET /ideas/:ideaId/join-request/status` |

Chat runs over Socket.io: the handshake is authenticated with the same session cookie,
and both `joinRoom` and `sendMessage` verify team membership server-side.
