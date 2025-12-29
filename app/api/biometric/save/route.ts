import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { employee_id, org_id, template_id } = await req.json();

  if (!employee_id || !template_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("biometric_enrollments")
    .update({
      status: "enrolled",
      template_id,
      updated_at: new Date().toISOString(),
    })
    .eq("employee_id", employee_id)
    .eq("biometric_type", "finger_vein");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
