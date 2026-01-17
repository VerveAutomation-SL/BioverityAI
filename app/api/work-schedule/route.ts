import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");

  const { data, error } = await supabase
    .from("work_schedules")
    .select("*")
    .eq("org_id", org_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { org_id, morning_start, morning_end, evening_start, evening_end } = body;

  const { error } = await supabase
    .from("work_schedules")
    .update({
      morning_start,
      morning_end,
      evening_start,
      evening_end,
      updated_at: new Date().toISOString(),
    })
    .eq("org_id", org_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
