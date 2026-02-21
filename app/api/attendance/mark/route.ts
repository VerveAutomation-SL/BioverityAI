import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const now = new Date();
    const isoTime = now.toISOString();
    const formattedTime = now.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 2️⃣ Insert attendance log
    await supabase.from("attendance_logs").insert({
      org_id: employee.org_id,
      employee_id,
      event_time: isoTime,
    });

    // 3️⃣ Get ALL alert recipients for this org
    const { data: recipients } = await supabase
      .from("alert_recipients")
      .select("phone_number")
      .eq("org_id", employee.org_id);

    if (recipients && recipients.length > 0) {
      // 4️⃣ Send WhatsApp Alert to each recipient with 15s delay between each
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        if (!recipient.phone_number) continue;

        if (i > 0) {
          await sleep(15000); // 15 second delay before each subsequent message
        }

        await fetch("https://wasenderapi.com/api/send-message", {
          method: "POST",
          headers: {
            Authorization: `Bearer YOUR_WASENDER_KEY_HERE`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipient.phone_number.replace("+", ""),
            text: `Greetings from Bioverity AI

${employee.full_name} checked in at ${formattedTime}
Method: Finger Vein Device
Check-in location detected as Office`,
          }),
        });
      }
    }

    return NextResponse.json({
      status: "logged",
      org_id: employee.org_id,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process check-in" }, { status: 500 });
  }
}