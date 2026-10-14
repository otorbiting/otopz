OTOPZ — project source archive
Generated : 2026-10-01T12:55:56.805Z
Files     : 54

Contents
--------
src/            Application code (Next.js App Router)
public/         Static assets — artwork, fonts, covers
  images/       Product artwork and hero photography
  fonts/        Splatink webfont used by the logo
drizzle.config.json, tsconfig.json, package.json, next.config.ts

Running it locally
------------------
1. Install dependencies:  npm install
2. Create a .env file with:
       DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
3. Build the database:    npx drizzle-kit push
4. Start the app:         npm run dev

The demo data is seeded automatically on the first app or API request after
the database is configured; there is no separate seed script.

Note
----
node_modules/ and .next/ are intentionally excluded — run npm install to
recreate them. The .env file stores only a local development database URL.

Deployment
----------
The app can be built without DATABASE_URL. Configure DATABASE_URL as a
runtime environment variable in Vercel to enable database-backed features.
It must contain the connection URL for the PostgreSQL database.
