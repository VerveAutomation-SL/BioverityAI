import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(req: Request) {
  try {
    const { org_id, name } = await req.json();

    if (!org_id || !name) {
      return NextResponse.json(
        { error: "Organization ID and department name are required" },
        { status: 400 }
      );
    }

    // Optional safety check:
    // prevent deleting if employees are using this department

    const { data: employees, error: employeeError } = await supabase
      .from("employees")
      .select("id")
      .eq("org_id", org_id)
      .eq("department", name)
      .limit(1);

    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message },
        { status: 500 }
      );
    }

    if (employees && employees.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete department because employees are assigned to it",
        },
        { status: 409 }
      );
    }

    // Delete department
    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("org_id", org_id)
      .eq("name", name);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

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