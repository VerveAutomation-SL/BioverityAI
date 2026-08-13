import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  dayRange,
  getLocalDate,
  getTimezoneFromCountry,
} from "@/lib/time";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  /* ================= PROFILE ================= */

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("org_id, country")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);

    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }

  const orgId = profile?.org_id;

  if (!orgId) {
    return NextResponse.json(
      { error: "Org missing" },
      { status: 400 }
    );
  }

  /* ================= ORGANIZATION TIMEZONE ================= */

  const orgTimezone = getTimezoneFromCountry(profile.country);

  /* ================= EMPLOYEES ================= */

  // Only active employees should be counted.
  // Soft-deleted employees remain in the database for historical
  // attendance records but must not appear in current statistics.

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id")
    .eq("org_id", orgId)
    .eq("is_deleted", false);

  if (employeesError) {
    console.error("Error fetching employees:", employeesError);

    return NextResponse.json(
      { error: "Failed to load employees" },
      { status: 500 }
    );
  }

  const totalEmployees = employees?.length || 0;

  const employeeIds =
    employees?.map((employee) => employee.id) || [];

  /* ================= TODAY ================= */

  const now = new Date();

  // Today's date according to the organization's timezone.
  const today = getLocalDate(now, orgTimezone);

  // UTC range corresponding to today's local calendar day.
  const { start, end } = dayRange(
    today,
    orgTimezone
  );

  /* ================= BIOMETRIC LOGS ================= */

  const { data: bioLogsToday, error: bioError } = await supabase
    .from("attendance_logs")
    .select("employee_id")
    .eq("org_id", orgId)
    .in("employee_id", employeeIds)
    .gte("event_time", start)
    .lte("event_time", end);

  if (bioError) {
    console.error("Error fetching biometric logs:", bioError);
  }

  /* ================= WEB LOGS ================= */

  const { data: webLogsToday, error: webError } = await supabase
    .from("web_attendance_logs")
    .select("employee_id")
    .eq("attendance_date", today)
    .in("employee_id", employeeIds);

  if (webError) {
    console.error("Error fetching web attendance logs:", webError);
  }

  /* ================= MERGE PRESENT EMPLOYEES ================= */

  const presentSet = new Set([
    ...(bioLogsToday?.map((log) => log.employee_id) ?? []),
    ...(webLogsToday?.map((log) => log.employee_id) ?? []),
  ]);

  const presentToday = presentSet.size;

  const absentToday = Math.max(
    totalEmployees - presentToday,
    0
  );

  /* ================= LAST 5 DAYS TREND ================= */

  const trend = [];

  const [year, month, day] = today
    .split("-")
    .map(Number);

  /*
   * Use UTC purely to perform calendar-day arithmetic.
   * The actual attendance range is still calculated using
   * the organization's timezone through dayRange().
   */
  const todayCalendar = new Date(
    Date.UTC(year, month - 1, day)
  );

  for (let i = 4; i >= 0; i--) {
    const calendarDate = new Date(todayCalendar);

    calendarDate.setUTCDate(
      calendarDate.getUTCDate() - i
    );

    const dayStr = calendarDate
      .toISOString()
      .slice(0, 10);

    const { start: dayStart, end: dayEnd } =
      dayRange(dayStr, orgTimezone);

    /* -------- Biometric -------- */

    const { data: bioDayLogs, error: bioDayError } =
      await supabase
        .from("attendance_logs")
        .select("employee_id")
        .eq("org_id", orgId)
        .in("employee_id", employeeIds)
        .gte("event_time", dayStart)
        .lte("event_time", dayEnd);

    if (bioDayError) {
      console.error(
        `Error fetching biometric logs for ${dayStr}:`,
        bioDayError
      );
    }

    /* -------- Web -------- */

    const { data: webDayLogs, error: webDayError } =
      await supabase
        .from("web_attendance_logs")
        .select("employee_id")
        .eq("attendance_date", dayStr)
        .in("employee_id", employeeIds);

    if (webDayError) {
      console.error(
        `Error fetching web attendance logs for ${dayStr}:`,
        webDayError
      );
    }

    /* -------- Merge -------- */

    const dayPresentSet = new Set([
      ...(bioDayLogs?.map((log) => log.employee_id) ?? []),
      ...(webDayLogs?.map((log) => log.employee_id) ?? []),
    ]);

    const dayPresent = dayPresentSet.size;

    const dayAbsent = Math.max(
      totalEmployees - dayPresent,
      0
    );

    /*
     * Display the weekday according to the organization's
     * timezone.
     */
    const displayDate = new Date(
      `${dayStr}T12:00:00Z`
    );

    const dayLabel = displayDate.toLocaleDateString(
      "en-US",
      {
        timeZone: orgTimezone,
        weekday: "short",
      }
    );

    trend.push({
      day: dayLabel,
      present: dayPresent,
      absent: dayAbsent,
    });
  }

  /* ================= RESPONSE ================= */

  return NextResponse.json({
    totalEmployees,
    presentToday,
    absentToday,
    onLeave: 0,

    pie: [
      {
        name: "Present",
        value: presentToday,
        color: "#16a34a",
      },
      {
        name: "Absent",
        value: absentToday,
        color: "#dc2626",
      },
    ],

    trend,

    // Useful for debugging / future UI use.
    timezone: orgTimezone,
    country: profile.country,
  });
}