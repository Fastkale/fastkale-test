# FastKale Test Harness (Public)

Public repo for the FastKale backend test harness. Deploys to GitHub Pages.

## Create the repo and push (one-time)

Run these **one command at a time** in your terminal:

```bash
cd fastkale-test
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial: FastKale test harness + GitHub Pages deploy"
```

```bash
gh repo create Fastkale/fastkale-test --public --source=. --remote=origin --push
```

(Replace `Fastkale/fastkale-test` with your username/org and repo name if you want a different name.)

## After first push

1. **Enable Pages:** GitHub repo → **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions** → Save.
2. **Live URL:** `https://fastkale.github.io/fastkale-test/` (or your org/user + repo name).
3. **(Optional)** Add secret **VITE_API_BASE_URL** (Supabase functions URL) in **Settings** → **Secrets and variables** → **Actions**, then run **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Set `VITE_API_BASE_URL` in `.env` (copy from `.env.example`) to point at your backend.

## Endpoints tested

All Supabase functions: signup, login, logout, refresh-token, password-reset-request/confirm, scan-item, confirm-item, get-ebay-price, manual-price-override, add-to-cart, get-cart, remove-from-cart, update-cart-item, clear-cart, create-offer, get-offer, accept-offer, reject-offer.
