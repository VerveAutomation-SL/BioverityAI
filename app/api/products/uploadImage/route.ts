import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { randomUUID } from "crypto";
import { withCors, corsOptions } from "@/lib/cors";

// Handle OPTIONS preflight
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return withCors({ error: "No file uploaded" }, 400);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return withCors({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    return withCors({ url: data.publicUrl }, 200);
  } catch (err: any) {
    return withCors({ error: err.message }, 500);
  }
}
