Using production backend from local dev

If you want your local frontend to call the production API, set `VITE_API_URL` to the production URL in `.env.local`:

```env
# .env.local
VITE_API_URL=https://ironbackend-production.up.railway.app/api/v1
```

Important: the production backend must allow your frontend origin in its `CORS_ORIGIN` setting (for example `http://localhost:3000`). If you see CORS errors when calling production, add your frontend origin to the backend's `CORS_ORIGIN` environment variable and redeploy the API.

To revert to local backend and use Vite proxy, set:

```env
VITE_API_URL=/api/v1
```

Notes:
- When using the production API, requests originate from your browser to the remote host.
- If you control the production backend (Railway), update the `CORS_ORIGIN` environment variable to include your dev or preview origins.
- If you don't control the backend, you must use a backend that allows your origin or use a local proxy.
