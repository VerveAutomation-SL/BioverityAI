import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: "No auth token provided" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (profErr || !profile?.org_id) {
      console.error("Profile error:", profErr);
      return NextResponse.json({ error: "Org not found" }, { status: 400 });
    }

    const org_id = profile.org_id;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;
    const today = new Date().toISOString().slice(0, 10);
    const isToday = date === today;

    // Fetch employees
    const { data: employees, error: empErr } = await supabase
      .from("employees")
      .select("id, employee_id, full_name, role, photo_url")
      .eq("org_id", org_id);

    if (empErr) {
      console.error("Employee fetch error:", empErr);
      return NextResponse.json({ error: empErr.message }, { status: 500 });
    }

    // Fetch attendance logs - employee_id here is the UUID from employees.id
    const { data: logs, error: logErr } = await supabase
      .from("attendance_logs")
      .select("employee_id, event_time")
      .eq("org_id", org_id)
      .gte("event_time", startOfDay)
      .lte("event_time", endOfDay)
      .order("event_time", { ascending: true });

    if (logErr) {
      console.error("Logs fetch error:", logErr);
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    // Group logs by employee_id (UUID) - this matches employees.id
    const logMap = new Map<string, Date[]>();

    logs?.forEach((log) => {
      if (!logMap.has(log.employee_id)) {
        logMap.set(log.employee_id, []);
      }
      logMap.get(log.employee_id)!.push(new Date(log.event_time));
    });

    const result = employees?.map((emp) => {
      const empLogs = logMap.get(emp.id) || []; 

      if (empLogs.length > 0) {
        return {
          employee_id: emp.employee_id,  
          name: emp.full_name,
          role: emp.role,
          photo: emp.photo_url,
          status: "present" as const,
          check_in: empLogs[0].toISOString(),
          check_out: empLogs[empLogs.length - 1].toISOString(),
        };
      }

      if (isToday) {
        return {
          employee_id: emp.employee_id,
          name: emp.full_name,
          role: emp.role,
          photo: emp.photo_url,
          status: "not_arrived" as const,
          check_in: null,
          check_out: null,
        };
      }

      return {
        employee_id: emp.employee_id,
        name: emp.full_name,
        role: emp.role,
        photo: emp.photo_url,
        status: "absent" as const,
        check_in: null,
        check_out: null,
      };
    }) || [];

    return NextResponse.json({
      date,
      total: result.length,
      present: result.filter(r => r.status === "present").length,
      absent: result.filter(r => r.status === "absent").length,
      data: result,
    });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}