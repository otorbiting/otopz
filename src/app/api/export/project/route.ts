import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { shouldSkipProjectArchiveFile } from "@/lib/project-archive-files.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Zips the entire project source so it can be taken elsewhere and run:
 * application code, configuration and the public artwork folder.
 * Build output and dependencies are left out to keep the archive small.
 */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  ".cache",
  "coverage",
  ".DS_Store",
]);

async function walk(dir: string, root: string, zip: JSZip, stats: { files: number }) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".log")) continue;
      await walk(abs, root, zip, stats);
      continue;
    }
    if (!entry.isFile()) continue;
    if (shouldSkipProjectArchiveFile(entry.name)) continue;

    try {
      const buf = await fs.readFile(abs);
      zip.file(rel, buf);
      stats.files++;
    } catch (err) {
      console.error("Skipped unreadable file:", rel, err);
    }
  }
}

export async function GET() {
  try {
    const root = process.cwd();
    const zip = new JSZip();
    const stats = { files: 0 };

    await walk(root, root, zip, stats);

    zip.file(
      "PROJECT-README.txt",
      `OTOPZ — project source archive
Generated : ${new Date().toISOString()}
Files     : ${stats.files}

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
`
    );

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="otopz-project-${stamp}.zip"`,
        "Content-Length": String(buffer.length),
        "X-File-Count": String(stats.files),
      },
    });
  } catch (error) {
    console.error("GET /api/export/project error:", error);
    return NextResponse.json({ error: "Failed to build the project archive" }, { status: 500 });
  }
}
