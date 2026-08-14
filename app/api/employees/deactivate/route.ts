import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const {
      employee_id,
      org_id,
    } = await req.json();

    if (!employee_id || !org_id) {
      return NextResponse.json(
        {
          error:
            "employee_id and org_id are required",
        },
        { status: 400 }
      );
    }

    const { data: employee, error: employeeError } =
      await supabase
        .from("employees")
        .select(
          "id, employee_id, status"
        )
        .eq("id", employee_id)
        .eq("org_id", org_id)
        .eq("is_deleted", false)
        .single();

    if (
      employeeError ||
      !employee
    ) {
      return NextResponse.json(
        {
          error:
            "Employee not found",
        },
        { status: 404 }
      );
    }

    if (employee.status === "inactive") {
      return NextResponse.json(
        {
          error:
            "Employee is already inactive",
        },
        { status: 400 }
      );
    }

    const { error: updateError } =
      await supabase
        .from("employees")
        .update({
          status: "inactive",
          previous_employee_id:
            employee.employee_id,
          employee_id: null,
        })
        .eq("id", employee.id)
        .eq("org_id", org_id);

    if (updateError) {
      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err.message ||
          "Server error",
      },
      { status: 500 }
    );
  }
}