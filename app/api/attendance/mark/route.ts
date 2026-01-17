import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { primary_org_id, test_org_id, employee_id } = await req.json();

  if (!employee_id || !primary_org_id || !test_org_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ✅ Check which org this employee belongs to
  const { data: employee } = await supabase
    .from("employees")
    .select("org_id")
    .eq("employee_id", employee_id)
    .in("org_id", [primary_org_id, test_org_id])
    .single();

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // ✅ Log attendance for the correct org
  await supabase.from("attendance_logs").insert({
    org_id: employee.org_id,
    employee_id,
    event_time: new Date().toISOString(),
  });

  return NextResponse.json({ status: "logged", org_id: employee.org_id });
}