import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SG_START = (date: Date) =>
  new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  ).toISOString().slice(0, 10) + "T00:00:00+08:00";

const SG_END = (date: Date) =>
  new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  ).toISOString().slice(0, 10) + "T23:59:59+08:00";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();

  const orgId = profile?.org_id;
  if (!orgId) return NextResponse.json({ error: "Org missing" }, { status: 400 });

  /* ================= EMPLOYEES ================= */
  const { data: employees } = await supabase
    .from("employees")
    .select("id")
    .eq("org_id", orgId);

  const totalEmployees = employees?.length || 0;
  const employeeIds = employees?.map(e => e.id) || [];

  /* ================= TODAY (SG) ================= */
  const now = new Date();
  const start = SG_START(now);
  const end = SG_END(now);

  const { data: logsToday } = await supabase
    .from("attendance_logs")
    .select("employee_id")
    .eq("org_id", orgId)
    .gte("event_time", start)
    .lte("event_time", end);

  const presentSet = new Set(logsToday?.map(l => l.employee_id));
  const presentToday = presentSet.size;
  const absentToday = totalEmployees - presentToday;

  /* ================= LAST 5 DAYS TREND ================= */
  const trend = [];

  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const s = SG_START(d);
    const e = SG_END(d);

    const { data: dayLogs } = await supabase
      .from("attendance_logs")
      .select("employee_id")
      .eq("org_id", orgId)
      .gte("event_time", s)
      .lte("event_time", e);

    const dayPresent = new Set(dayLogs?.map(l => l.employee_id)).size;

    trend.push({
      day: d.toLocaleDateString("en-SG", { weekday: "short" }),
      present: dayPresent,
      absent: totalEmployees - dayPresent,
    });
  }

  return NextResponse.json({
    totalEmployees,
    presentToday,
    absentToday,
    onLeave: 0,
    pie: [
      { name: "Present", value: presentToday, color: "#16a34a" },
      { name: "Absent", value: absentToday, color: "#dc2626" },
    ],
    trend,
  });
}