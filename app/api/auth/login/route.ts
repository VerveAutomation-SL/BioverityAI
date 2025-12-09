import { NextResponse } from "next/server";
import { withCors, corsOptions } from "@/lib/cors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Handle OPTIONS
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, username, password, debug } = body;

    // -------- DEBUG OUTPUT --------
    if (debug === true) {
      return withCors({
        debug: true,
        received_orgId: orgId ?? null,
        received_username: username ?? null,
        env_supabase_url: SUPABASE_URL ?? "undefined",
        env_anon_key: ANON_KEY ? "loaded" : "missing",
        profileUrl_example:
          `${SUPABASE_URL}/rest/v1/profiles?org_id=eq.${orgId}&username=eq.${username}&select=*`
      });
    }
    // ------------------------------

    if (!orgId || !username || !password) {
      return withCors({ error: "Missing fields" }, 400);
    }

    const cleanOrgId = orgId.trim();
    const cleanUsername = username.trim();

    // Build URL using anon key (RLS OFF → permitted)
    const profileUrl =
      `${SUPABASE_URL}/rest/v1/profiles?org_id=eq.${encodeURIComponent(cleanOrgId)}` +
      `&username=eq.${encodeURIComponent(cleanUsername)}&select=*`;

    const profileRes = await fetch(profileUrl, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    if (!profile) {
      return withCors({ error: "Invalid credentials" }, 401);
    }

    // Login using email + password
    const tokenRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
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
    return withCors({ 
      error: "Server error", 
      detail: err.message 
    }, 500);
  }
}
