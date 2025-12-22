import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const {
      org_id,
      employee_id,
      full_name,
      department,
      role,
      photo_url,
    } = await req.json();

    // 1️⃣ Validate input
    if (!org_id || !employee_id || !full_name || !department || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2️⃣ Insert employee
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .insert({
        org_id,
        employee_id,
        full_name,
        department,
        role,
        photo_url,
      })
      .select()
      .single();

    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Create biometric enrollment (PENDING)
    const { error: biometricError } = await supabase
      .from("biometric_enrollments")
      .insert({
        employee_id: employee.id,
        biometric_type: "finger_vein",
        status: "pending",
      });

    if (biometricError) {
      return NextResponse.json(
        { error: biometricError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Success
    return NextResponse.json(
      {
        success: true,
        employee,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
