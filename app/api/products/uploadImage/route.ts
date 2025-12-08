import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

    const { error } = await supabaseAdmin.storage
      .from("products")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (error) {
      return withCors({ error: error.message }, 500);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("products").getPublicUrl(fileName);

    return withCors({ url: publicUrl });
  } catch (err: any) {
    return withCors({ error: err.message }, 500);
  }
}
