import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const employee_id =
      searchParams.get("employee_id");

    const org_id =
      searchParams.get("org_id");

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
    // 2. Verify that the employee exists
    //    and belongs to the requested organization
    // --------------------------------------------------

    const { data: employee, error: employeeLookupError } =
      await supabase
        .from("employees")
        .select(
          "id, employee_id, full_name, org_id"
        )
        .eq("id", employee_id)
        .eq("org_id", org_id)
        .eq("is_deleted", false)
        .single();

    if (employeeLookupError) {
      return NextResponse.json(
        {
          error:
            employeeLookupError.message,
        },
        { status: 500 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        {
          error: "Employee not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Delete biometric enrollments
    // --------------------------------------------------

    const { error: biometricError } =
      await supabase
        .from("biometric_enrollments")
        .delete()
        .eq("employee_id", employee_id);

    if (biometricError) {
      console.error(
        "Failed to delete biometric enrollments:",
        biometricError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete biometric enrollments: " +
            biometricError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 4. Delete leave applications
    // --------------------------------------------------

    const { error: leaveError } =
      await supabase
        .from("leave_applications")
        .delete()
        .eq("employee_id", employee_id);

    if (leaveError) {
      console.error(
        "Failed to delete leave applications:",
        leaveError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete leave applications: " +
            leaveError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 5. Delete manual schedules
    // --------------------------------------------------

    const { error: scheduleError } =
      await supabase
        .from("manual_schedules")
        .delete()
        .eq("employee_id", employee_id);

    if (scheduleError) {
      console.error(
        "Failed to delete manual schedules:",
        scheduleError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete manual schedules: " +
            scheduleError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 6. Delete web attendance events
    // --------------------------------------------------

    const { error: webEventsError } =
      await supabase
        .from("web_attendance_events")
        .delete()
        .eq("employee_id", employee_id);

    if (webEventsError) {
      console.error(
        "Failed to delete web attendance events:",
        webEventsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete web attendance events: " +
            webEventsError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Delete web attendance logs
    // --------------------------------------------------

    const { error: webLogsError } =
      await supabase
        .from("web_attendance_logs")
        .delete()
        .eq("employee_id", employee_id);

    if (webLogsError) {
      console.error(
        "Failed to delete web attendance logs:",
        webLogsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete web attendance logs: " +
            webLogsError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 8. Permanently delete the employee
    // --------------------------------------------------

    const { error: employeeDeleteError } =
      await supabase
        .from("employees")
        .delete()
        .eq("id", employee_id)
        .eq("org_id", org_id);

    if (employeeDeleteError) {
      console.error(
        "Failed to permanently delete employee:",
        employeeDeleteError
      );

      return NextResponse.json(
        {
          error:
            "Failed to permanently delete employee: " +
            employeeDeleteError.message,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. Success
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Employee permanently deleted",
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error(
      "Permanent employee deletion error:",
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