import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sgDayRange } from "@/lib/time";

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

    const { start, end } = sgDayRange(date);

    const nowSG = new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" });
    const todaySG = new Date(nowSG).toISOString().slice(0, 10);
    const isToday = date === todaySG;

    // Fetch employees
    const { data: employees, error: empErr } = await supabase
      .from("employees")
      .select("id, employee_id, full_name, role, photo_url")
      .eq("org_id", org_id);

    if (empErr) {
      console.error("Employee fetch error:", empErr);
      return NextResponse.json({ error: empErr.message }, { status: 500 });
    }

    const employeeIds = (employees ?? []).map(e => e.id);

    // ── Biometric logs ──
    const { data: bioLogs, error: bioErr } = await supabase
      .from("attendance_logs")
      .select("employee_id, event_time")
      .eq("org_id", org_id)
      .gte("event_time", start)
      .lte("event_time", end)
      .order("event_time", { ascending: true });

    if (bioErr) {
      console.error("Bio logs fetch error:", bioErr);
      return NextResponse.json({ error: bioErr.message }, { status: 500 });
    }

    // ── Web logs ──
    const { data: webLogs, error: webErr } = await supabase
      .from("web_attendance_logs")
      .select("employee_id, check_in_time, check_out_time, attendance_mode")
      .eq("attendance_date", date)
      .in("employee_id", employeeIds);

    if (webErr) {
      console.error("Web logs fetch error:", webErr);
      return NextResponse.json({ error: webErr.message }, { status: 500 });
    }

    // ── Track which source each employee used ──
    const sourceMap = new Map<string, "biometric" | "web" | "both">();

    // ── Build logMap from biometric logs ──
    const logMap = new Map<string, Date[]>();
    bioLogs?.forEach((log) => {
      if (!logMap.has(log.employee_id)) {
        logMap.set(log.employee_id, []);
      }
      logMap.get(log.employee_id)!.push(new Date(log.event_time));
      sourceMap.set(log.employee_id, "biometric");
    });

    // ── Merge web logs into logMap ──
    webLogs?.forEach((log) => {
      if (!logMap.has(log.employee_id)) {
        logMap.set(log.employee_id, []);
      }
      const times = logMap.get(log.employee_id)!;
      if (log.check_in_time) times.push(new Date(log.check_in_time));
      if (log.check_out_time) times.push(new Date(log.check_out_time));
      times.sort((a, b) => a.getTime() - b.getTime());

      // Update source
      const existing = sourceMap.get(log.employee_id);
      sourceMap.set(
        log.employee_id,
        existing === "biometric" ? "both" : "web"
      );
    });

    const result = employees?.map((emp) => {
      const empLogs = logMap.get(emp.id) || [];
      const source = sourceMap.get(emp.id) ?? null;

      if (empLogs.length > 0) {
        return {
          employee_id: emp.employee_id,
          name: emp.full_name,
          role: emp.role,
          photo: emp.photo_url,
          status: "present" as const,
          source,
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
          status: "not_recorded" as const,
          source: null,
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
        source: null,
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