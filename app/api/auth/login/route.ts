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

    if (debug === true) {
      return withCors({
        debug: true,
        received_orgId: orgId ?? null,
        received_username: username ?? null,
        env_supabase_url: SUPABASE_URL ?? "undefined",
        env_anon_key: ANON_KEY ? "loaded" : "missing",
      });
    }

    if (!orgId || !username || !password) {
      return withCors(
        { errorCode: "MISSING_FIELDS", error: "Missing fields" },
        400
      );
    }

    const cleanOrgId = orgId.trim();
    const cleanUsername = username.trim();

    const orgCheckUrl =
      `${SUPABASE_URL}/rest/v1/profiles` +
      `?org_id=eq.${encodeURIComponent(cleanOrgId)}` +
      `&select=id&limit=1`;

    const orgCheckRes = await fetch(orgCheckUrl, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    const orgCheck = await orgCheckRes.json();

    if (!Array.isArray(orgCheck) || orgCheck.length === 0) {
      return withCors(
        {
          errorCode: "ORG_NOT_FOUND",
          error: "Organization not found",
        },
        401
      );
    }

    const profileUrl =
      `${SUPABASE_URL}/rest/v1/profiles` +
      `?org_id=eq.${encodeURIComponent(cleanOrgId)}` +
      `&username=eq.${encodeURIComponent(cleanUsername)}` +
      `&select=*`;

    const profileRes = await fetch(profileUrl, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    if (!profile) {
      return withCors(
        {
          errorCode: "USER_NOT_FOUND",
          error: "Username not found",
        },
        401
      );
    }

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
        {
          errorCode: "INVALID_PASSWORD",
          error: "Incorrect password",
        },
        401
      );
    }

    return withCors({
      success: true,
      token: tokenJson,
      profile,
    });

  } catch (err: any) {
    return withCors(
      {
        errorCode: "SERVER_ERROR",
        error: "Server error",
        detail: err.message,
      },
      500
    );
  }
}
