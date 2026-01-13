import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const employee_id = searchParams.get("employee_id");
  const date = searchParams.get("date");

  if (!employee_id || !date) {
    return NextResponse.json({ schedule: null });
  }

  const { data } = await supabase
    .from("manual_schedules")
    .select("id, start_time, end_time")
    .eq("employee_id", employee_id)
    .eq("schedule_date", date)
    .single();

  return NextResponse.json({ schedule: data || null });
}
