import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const WASENDER_KEY = "45c4351855553c63e57fdca99f068b61d309e8d4537a5da029666516b9cca618";

// ── Timezone per org ──
const ORG_TIMEZONES: Record<string, string> = {
  omnicomm: "Asia/Singapore",
  VerveSL: "Asia/Colombo",
};

export async function POST(req: Request) {
  try {
    const { primary_org_id, test_org_id, employee_id } = await req.json();

    if (!employee_id || !primary_org_id || !test_org_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1️⃣ Find employee + org
    const { data: employee } = await supabase
      .from("employees")
      .select("org_id, full_name")
      .eq("id", employee_id)
      .in("org_id", [primary_org_id, test_org_id])
      .single();

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // ── Pick the correct timezone for this org ──
    const orgTimezone = ORG_TIMEZONES[employee.org_id] ?? "Asia/Singapore";

    const now = new Date();
    const isoTime = now.toISOString();

    const formattedTime = now.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: orgTimezone,
    });

    // 2️⃣ Check if this employee already has a log today (org local time)
    const nowLocal = new Date(now.toLocaleString("en-US", { timeZone: orgTimezone }));
    const todayLocal = nowLocal.toISOString().slice(0, 10);
    const startOfDay = `${todayLocal}T00:00:00`;
    const endOfDay = `${todayLocal}T23:59:59`;

    const { data: existingLogs } = await supabase
      .from("attendance_logs")
      .select("id")
      .eq("employee_id", employee_id)
      .eq("org_id", employee.org_id)
      .gte("event_time", startOfDay)
      .lte("event_time", endOfDay);

    const isFirstCheckIn = !existingLogs || existingLogs.length === 0;

    // 3️⃣ Insert attendance log
    await supabase.from("attendance_logs").insert({
      org_id: employee.org_id,
      employee_id,
      event_time: isoTime,
    });

    // 4️⃣ Only notify on first check-in of the day
    if (isFirstCheckIn) {
      const { data: recipients } = await supabase
        .from("alert_recipients")
        .select("phone_number")
        .eq("org_id", employee.org_id);

      if (recipients && recipients.length > 0) {
        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];
          if (!recipient.phone_number) continue;

          if (i > 0) {
            await sleep(15000);
          }

          await fetch("https://wasenderapi.com/api/send-message", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WASENDER_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: recipient.phone_number.replace("+", ""),
              text: `Greetings from Bioverity AI\n\n${employee.full_name} checked in at ${formattedTime}\nMethod: Finger Vein Device\nCheck-in location detected as Office`,
            }),
          });
        }
      }
    }

    return NextResponse.json({
      status: "logged",
      org_id: employee.org_id,
      notified: isFirstCheckIn,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process check-in" }, { status: 500 });
  }
}