import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(req: Request) {
  const {
    employee_id,
    schedule_date,
    end_time,
  } = await req.json();

  if (!employee_id || !schedule_date || !end_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("manual_schedules")
    .update({ end_time })
    .eq("employee_id", employee_id)
    .eq("schedule_date", schedule_date)
    .is("end_time", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
