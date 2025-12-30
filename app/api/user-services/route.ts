import { supabase } from "@/lib/supabaseClient";
import { withCors, corsOptions } from "@/lib/cors";

// Handle preflight
export function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return withCors(
        { error: "user_id is required" },
        400,
        req
      );
    }

    const { data, error } = await supabase
      .from("user_services")
      .select(`
        service_key,
        services (
          key,
          name,
          description
        )
      `)
      .eq("user_id", user_id);

    if (error) {
      return withCors(
        { error: error.message },
        500,
        req
      );
    }

    return withCors(
      { services: data },
      200,
      req
    );

  } catch (err: any) {
    return withCors(
      { error: err.message || "Server error" },
      500,
      req
    );
  }
}
