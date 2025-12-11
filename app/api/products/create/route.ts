import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { withCors, corsOptions } from "@/lib/cors";

// OPTIONS handler (required for CORS)
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const { name, description, imageUrl, orgId } = await req.json();

    if (!name || !description || !imageUrl || !orgId) {
      return withCors({ error: "Missing fields" }, 400);
    }

    // Insert product using normal client
    const { error } = await supabase.from("products").insert({
      name,
      description,
      image_url: imageUrl,
      org_id: orgId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return withCors({ error: error.message }, 500);
    }

    return withCors({ success: true }, 200);
  } catch (err: any) {
    return withCors({ error: err.message }, 500);
  }
}
