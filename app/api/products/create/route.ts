import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withCors, corsOptions } from "@/lib/cors";

// Handle OPTIONS (preflight)
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const { name, description, imageUrl, orgId } = await req.json();

    if (!name || !description || !imageUrl || !orgId) {
      return withCors({ error: "Missing fields" }, 400);
    }

    const { error } = await supabaseAdmin.from("products").insert({
      name,
      description,
      image_url: imageUrl,
      org_id: orgId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return withCors({ error: error.message }, 500);
    }

    return withCors({ success: true });
  } catch (err: any) {
    return withCors({ error: err.message }, 500);
  }
}
