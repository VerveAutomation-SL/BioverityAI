import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(req: Request) {
  try {
    const { org_id, old_name, new_name } = await req.json();

    if (!org_id || !old_name || !new_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedNewName = new_name.trim();

    // Check duplicate
    const { data: existing } = await supabase
      .from("departments")
      .select("id")
      .eq("org_id", org_id)
      .ilike("name", normalizedNewName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Department already exists" },
        { status: 409 }
      );
    }

    // Update department table
    const { error: deptError } = await supabase
      .from("departments")
      .update({
        name: normalizedNewName,
      })
      .eq("org_id", org_id)
      .eq("name", old_name);

    if (deptError) {
      return NextResponse.json(
        { error: deptError.message },
        { status: 500 }
      );
    }

    // Update employees using this department
    const { error: employeeError } = await supabase
      .from("employees")
      .update({
        department: normalizedNewName,
      })
      .eq("org_id", org_id)
      .eq("department", old_name);

    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}