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
    const text = await req.text(); 

    return new Response(
      JSON.stringify({
        received_raw_body: text
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
