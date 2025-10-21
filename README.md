# Village CMS (Vercel + Supabase)

This Next.js project includes serverless API routes for:
- Auth (register/login)
- CSV upload (citizens) with NIK parsing and encryption
- Public and protected stats endpoints

## Setup locally

1. Copy `.env.example` to `.env.local` and fill your Supabase DATABASE_URL and keys.
2. Install:
   ```
   npm install
   npx prisma generate
   npx prisma migrate deploy
   node prisma/seed.ts
   ```
3. Run dev:
   ```
   npm run dev
   ```
4. Visit `http://localhost:3000`

## Deploy

- Push to GitHub and connect repository to Vercel.
- Add environment variables in Vercel (see `.env.example`).
- Vercel will build and deploy the app and serverless API routes.

