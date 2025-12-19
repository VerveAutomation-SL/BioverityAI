import { randomUUID } from "crypto";
import { withCors, corsOptions } from "@/lib/cors";
import { createClient } from "@supabase/supabase-js";

// OPTIONS handler (CORS)
export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: req.headers.get("authorization") ?? "",
        },
      },
    }
  );

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return withCors({ error: "No file uploaded" }, 400);
    }

    const ext = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return withCors({ error: error.message }, 500);
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return withCors({ url: data.publicUrl }, 200);
  } catch (err: any) {
    return withCors({ error: err.message }, 500);
  }
}
