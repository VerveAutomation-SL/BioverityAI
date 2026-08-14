import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const {
      employee_id,
      org_id,
    } = await req.json();

    // --------------------------------------------------
    // 1. Validate input
    // --------------------------------------------------

    if (!employee_id || !org_id) {
      return NextResponse.json(
        {
          error:
            "employee_id and org_id are required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Find the inactive employee
    // --------------------------------------------------

    const {
      data: employee,
      error: employeeError,
    } = await supabase
      .from("employees")
      .select(
        `
        id,
        employee_id,
        previous_employee_id,
        status,
        is_deleted,
        org_id,
        full_name
        `
      )
      .eq("id", employee_id)
      .eq("org_id", org_id)
      .eq("status", "inactive")
      .eq("is_deleted", false)
      .single();

    if (employeeError) {
      return NextResponse.json(
        {
          error:
            employeeError.message,
        },
        { status: 500 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        {
          error:
            "Inactive employee not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Make sure the employee has a previous ID
    // --------------------------------------------------

    if (!employee.previous_employee_id) {
      return NextResponse.json(
        {
          error:
            "This employee does not have a previous Employee ID and cannot be reactivated.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Check whether the old Employee ID
    //    is already being used by another employee
    // --------------------------------------------------

    const {
      data: existingEmployee,
      error: existingEmployeeError,
    } = await supabase
      .from("employees")
      .select(
        "id, employee_id, full_name, status"
      )
      .eq("org_id", org_id)
      .eq(
        "employee_id",
        employee.previous_employee_id
      )
      .eq("status", "active")
      .eq("is_deleted", false)
      .maybeSingle();

    if (existingEmployeeError) {
      return NextResponse.json(
        {
          error:
            existingEmployeeError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 5. Employee ID is already being used
    // --------------------------------------------------

    if (existingEmployee) {
      return NextResponse.json(
        {
          error:
            `Employee ID ${employee.previous_employee_id} is already assigned to ${existingEmployee.full_name}.`,
          code: "EMPLOYEE_ID_IN_USE",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 6. Reactivate employee
    // --------------------------------------------------

    const {
      error: updateError,
    } = await supabase
      .from("employees")
      .update({
        status: "active",
        employee_id:
          employee.previous_employee_id,
        previous_employee_id: null,
        is_deleted: false,
        deleted_at: null,
      })
      .eq("id", employee.id)
      .eq("org_id", org_id)
      .eq("status", "inactive");

    if (updateError) {
      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Success
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Employee reactivated successfully",
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error(
      "Reactivate employee error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Server error",
      },
      { status: 500 }
    );
  }
}