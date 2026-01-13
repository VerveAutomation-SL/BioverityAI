import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const {
    org_id,
    employee_id,
    email,
    schedule_date,
    start_time,
  } = await req.json();

  if (!org_id || !employee_id || !email || !schedule_date || !start_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("manual_schedules")
    .insert({
      org_id,
      employee_id,
      email,
      schedule_date,
      start_time,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
