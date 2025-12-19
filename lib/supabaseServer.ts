import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient(req: Request) {
  return createClient(
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
}
