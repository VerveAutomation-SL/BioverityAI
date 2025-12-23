import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employee_id = searchParams.get("employee_id");
    const org_id = searchParams.get("org_id");

    // 1️⃣ Validate input
    if (!employee_id || !org_id) {
      return NextResponse.json(
        { error: "employee_id and org_id are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Delete biometric enrollments FIRST
    const { error: biometricError } = await supabase
      .from("biometric_enrollments")
      .delete()
      .eq("employee_id", employee_id);

    if (biometricError) {
      return NextResponse.json(
        { error: biometricError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Delete employee (org-safe)
    const { error: employeeError } = await supabase
      .from("employees")
      .delete()
      .eq("id", employee_id)
      .eq("org_id", org_id);

    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Success
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
