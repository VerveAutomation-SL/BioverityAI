import { supabase } from "@/lib/supabaseClient";
import { withCors, corsOptions } from "@/lib/cors";

// Handle preflight
export function OPTIONS() {
  return corsOptions();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id");

    // 1️⃣ Validate input
    if (!org_id) {
      return withCors(
        { error: "org_id is required" },
        400
      );
    }

    // 2️⃣ Fetch employees with biometric status
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        employee_id,
        full_name,
        department,
        role,
        photo_url,
        created_at,
        biometric_enrollments (
          biometric_type,
          status
        )
      `)
      .eq("org_id", org_id)
      .order("created_at", { ascending: false });

    if (error) {
      return withCors(
        { error: error.message },
        500
      );
    }

    // 3️⃣ Success
    return withCors(
      { employees: data },
      200
    );

  } catch (err: any) {
    return withCors(
      { error: err.message || "Server error" },
      500
    );
  }
}
