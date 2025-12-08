import { NextResponse } from "next/server";
import { withCors, corsOptions } from "@/lib/cors";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const { orgId, username, password } = await req.json();

    const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?org_id=eq.${orgId}&username=eq.${username}&select=*`;

    return new Response(
      JSON.stringify({
        debug: true,
        orgId,
        username,
        profileUrl,
        serviceUrl: SUPABASE_URL,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
