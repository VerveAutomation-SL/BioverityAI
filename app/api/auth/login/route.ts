import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const allowedOrigins = [
  "https://thk-org.onrender.com",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function OPTIONS(req: Request) {
  return new Response(null, { headers: getCorsHeaders(req) });
}

export async function POST(req: Request) {
  const headers = getCorsHeaders(req);

  try {
    const body = await req.json();
    const { orgId, username, password, debug } = body;

    if (debug === true) {
      return new Response(
        JSON.stringify({
          debug: true,
          received_orgId: orgId ?? null,
          received_username: username ?? null,
          env_supabase_url: SUPABASE_URL ?? "undefined",
          env_anon_key: ANON_KEY ? "loaded" : "missing",
        }),
        { status: 200, headers }
      );
    }

    if (!orgId || !username || !password) {
      return new Response(
        JSON.stringify({ errorCode: "MISSING_FIELDS", error: "Missing fields" }),
        { status: 400, headers }
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
      return new Response(
        JSON.stringify({ errorCode: "ORG_NOT_FOUND", error: "Organization not found" }),
        { status: 401, headers }
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
      return new Response(
        JSON.stringify({ errorCode: "USER_NOT_FOUND", error: "Username not found" }),
        { status: 401, headers }
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
      return new Response(
        JSON.stringify({ errorCode: "INVALID_PASSWORD", error: "Incorrect password" }),
        { status: 401, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, token: tokenJson, profile }),
      { status: 200, headers }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ errorCode: "SERVER_ERROR", error: "Server error", detail: err.message }),
      { status: 500, headers }
    );
  }
}