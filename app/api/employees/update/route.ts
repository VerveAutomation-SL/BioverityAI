import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(req: Request) {
  try {
    const {
      employee_id,
      org_id,
      full_name,
      department,
      role,
      photo_url,
    } = await req.json();

    // 1️⃣ Validate
    if (!employee_id || !org_id) {
      return NextResponse.json(
        { error: "employee_id and org_id are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Update employee
    const { data, error } = await supabase
      .from("employees")
      .update({
        full_name,
        department,
        role,
        photo_url,
      })
      .eq("id", employee_id)
      .eq("org_id", org_id)
      .select(`
        *,
        biometric_enrollments (
          id,
          biometric_type,
          status,
          template_id,
          enrolled_at
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 3️⃣ Success
    return NextResponse.json(
      { success: true, employee: data },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}