import { supabase } from "@/lib/supabaseClient";
import { withCors, corsOptions } from "@/lib/cors";

export function OPTIONS(req: Request) {
  return corsOptions(req);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const org_id = searchParams.get("org_id");

    if (!date) {
      return withCors({ error: "Date required" }, 400, req);
    }

    if (!org_id) {
      return withCors({ error: "org_id required" }, 400, req);
    }

    const { data, error } = await supabase
      .from("web_attendance_logs")
      .select(`
        id,
        attendance_date,
        check_in_time,
        check_out_time,
        check_in_address,
        check_out_address,
        check_in_photo_url,
        check_out_photo_url,
        check_in_latitude,
        check_in_longitude,
        check_out_latitude,
        check_out_longitude,
        employees!inner (
          id,
          employee_id,
          full_name,
          department,
          photo_url,
          org_id
        )
      `)
      .eq("attendance_date", date)
      .eq("employees.org_id", org_id);

    if (error) {
      return withCors({ error: error.message }, 500, req);
    }

    return withCors(
      {
        logs: data || [],
      },
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
