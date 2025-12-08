import { NextResponse } from "next/server";
import { withCors, corsOptions } from "@/lib/cors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Handle preflight OPTIONS requests
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const { orgId, username, password } = await req.json();

    if (!orgId || !username || !password) {
      return withCors({ error: "Missing fields" }, 400);
    }

    // Fetch profile
    const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?org_id=eq=${orgId}&username=eq=${username}&select=*`;

    const profileRes = await fetch(profileUrl, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles[0];

    if (!profile) {
      return withCors({ error: "Invalid credentials" }, 401);
    }

    // Login using email
    const tokenRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_KEY,
        },
        body: JSON.stringify({
          email: profile.email,
          password,
        }),
      }
    );

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      return withCors(
        { error: tokenJson.error_description || "Incorrect password" },
        401
      );
    }

    return withCors({
      success: true,
      token: tokenJson,
      profile,
    });
  } catch (err: any) {
    return withCors({ error: "Server error" }, 500);
  }
}
