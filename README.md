# Qaleen

Standalone luxury qaleen storefront and admin catalog manager.

## Routes

- Public storefront: `/`
- Admin catalog: `/admin`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase setup

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Then run `supabase/qaleen-setup.sql` once in Supabase Dashboard > SQL Editor.

The app uses Supabase for shared catalog, orders, and uploaded qaleen images. Browser local storage remains as a fallback during setup.
