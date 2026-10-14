import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "atelier_session_email";

/**
 * Returns null when the caller is an admin, otherwise a ready-to-return
 * 401/403 response. Only admins may create, edit or delete catalog data.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const email = request.cookies.get(SESSION_COOKIE)?.value;
  if (!email || email === "guest") {
    return NextResponse.json({ error: "Sign in as an admin to do this." }, { status: 401 });
  }
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can manage products and orders." }, { status: 403 });
  }
  return null;
}
