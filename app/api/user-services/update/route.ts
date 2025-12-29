import { supabase } from "@/lib/supabaseClient";
import { withCors, corsOptions } from "@/lib/cors";

export function OPTIONS() {
  return corsOptions();
}

export async function POST(req: Request) {
  try {
    const { user_id, service_keys } = await req.json();

    if (!user_id || !Array.isArray(service_keys)) {
      return withCors(
        { error: "user_id and service_keys[] are required" },
        400
      );
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return withCors({ error: "Unauthorized" }, 401);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single();

    if (profile?.role !== "admin") {
      return withCors({ error: "Forbidden" }, 403);
    }

    if (service_keys.length > 0) {
      const { data: services } = await supabase
        .from("services")
        .select("key")
        .in("key", service_keys);

      if (!services || services.length !== service_keys.length) {
        return withCors(
          { error: "One or more service keys are invalid" },
          400
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("user_services")
      .delete()
      .eq("user_id", user_id);

    if (deleteError) {
      return withCors({ error: deleteError.message }, 500);
    }

    if (service_keys.length > 0) {
      const inserts = service_keys.map((key: string) => ({
        user_id,
        service_key: key,
      }));

      const { error: insertError } = await supabase
        .from("user_services")
        .insert(inserts);

      if (insertError) {
        return withCors({ error: insertError.message }, 500);
      }
    }

    return withCors({ success: true }, 200);

  } catch (err: any) {
    return withCors(
      { error: err.message || "Server error" },
      500
    );
  }
}
