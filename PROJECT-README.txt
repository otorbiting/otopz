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
Prerequisite: Node.js 20.9 or later and a reachable PostgreSQL database.

1. Install the locked dependencies:  npm ci
2. Set DATABASE_URL in your runtime environment or local .env file. For example:
       DATABASE_URL=postgresql://localhost:5432/app_db
   Replace localhost and app_db with your PostgreSQL server and database. If your
   provider requires authentication, use the connection URL it supplies.
3. Apply the database schema:  npx drizzle-kit push
4. Start the development server:  npm run dev
5. Open http://localhost:3000 in your browser.

The demo data is seeded automatically on the first app or API request after
the database is configured; there is no separate seed script.

Checks
------
npm test          Run the automated tests
npm run lint      Check code style
npm run typecheck Check TypeScript types
npm run build     Create a production build

The GET /api/health endpoint checks database connectivity and returns a
non-200 response when the database is unavailable.

Note
----
node_modules/ and .next/ are intentionally excluded — run npm ci to
recreate them. Local .env files are excluded (except the shareable .env.example
template); configure DATABASE_URL in the runtime environment instead.

Deployment
----------
The app can be built without DATABASE_URL. Configure DATABASE_URL as a
runtime environment variable in Vercel to enable database-backed features.
It must contain the connection URL for the PostgreSQL database. After building
with npm run build, start the production server with npm start.
