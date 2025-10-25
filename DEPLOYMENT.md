Deployment guide (overview)

This project contains two folders: `frontend` (Vite + React) and `backend` (Node + Express).

Recommended hosting:
- Frontend: Vercel (connect repo, set project root to `/frontend`).
- Backend: Render (use `render.yaml` in repo root or create a Web Service manually pointing to `/backend`).
- Database: MongoDB Atlas (use production cluster, set MONGO_URI in Render/Vercel env vars).

Quick steps to deploy backend on Render using `render.yaml`:
1. Sign up / log in to Render.
2. Connect your GitHub repo.
3. Import from repo; Render will detect `render.yaml` and create the service.
4. In Render dashboard -> Service -> Environment -> set secrets: `MONGO_URI`, `SESSION_KEY`, `FRONTEND_ORIGIN`, `GOOGLE_CLIENT_ID`.
5. Deploy and confirm `/health` returns `{ ok: true }`.

Quick steps to deploy frontend on Vercel:
1. Sign up/log in to Vercel.
2. Import GitHub repo and set project root to `/frontend`.
3. Set env var `VITE_GOOGLE_CLIENT_ID` in Vercel project settings.
4. Deploy and verify the site loads.

GitHub Actions:
- The included workflow builds frontend and backend on pushes to `main` and stores the frontend build artifact.
- To enable Render auto-deploy via the workflow, add `RENDER_API_KEY` and `RENDER_SERVICE_ID` as GitHub secrets and add a curl step to call Render's deploy API.

Notes:
- Do NOT commit real secrets into the repository. Use the hosting provider's secrets management.
- For production, ensure `SESSION_KEY` is a long random value and `NODE_ENV=production`.
- Configure Google OAuth origins and redirect URIs in Google Cloud Console for your production domain(s).
