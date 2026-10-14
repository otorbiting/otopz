import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "atelier_session_email";

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();

    const cookieEmail = request.cookies.get(COOKIE_NAME)?.value;
    if (cookieEmail === "guest") {
      return NextResponse.json({ user: null });
    }

    const targetEmail = cookieEmail || "marcus@studio.co";
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, targetEmail));

    if (!user) {
      const [fallback] = await db.select().from(users).limit(1);
      return NextResponse.json({ user: fallback || null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("GET /api/auth error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const action = body.action || "login";

    if (action === "logout") {
      const res = NextResponse.json({ user: null, success: true });
      res.cookies.set(COOKIE_NAME, "guest", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = String(body.name || "").trim();
    // Public sign-up can only ever create buyer accounts.
    const role = "buyer";

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    let [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existing) {
      const displayName =
        name ||
        email
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const [created] = await db
        .insert(users)
        .values({
          name: displayName,
          email,
          passwordHash: String(body.password || "atelier-auth"),
          role,
          avatarUrl: initials || "AF",
        })
        .returning();
      existing = created;
    }

    const res = NextResponse.json({
      user: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        avatarUrl: existing.avatarUrl,
      },
    });

    res.cookies.set(COOKIE_NAME, existing.email, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
