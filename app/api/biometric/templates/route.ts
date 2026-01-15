import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("biometric_enrollments")
    .select("employee_id, template_id")
    .eq("status", "enrolled")
    .eq("biometric_type", "finger_vein");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return ONLY what verifier needs
  return NextResponse.json(
    data.map(row => ({
      employee_id: row.employee_id,
      template_base64: row.template_id
    }))
  );
}
