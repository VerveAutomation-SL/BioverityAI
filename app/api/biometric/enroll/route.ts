import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { employee_id, org_id } = await req.json();

    if (!employee_id) {
      return NextResponse.json(
        { error: "employee_id is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify employee exists
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, full_name, employee_id")
      .eq("id", employee_id)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Check for existing enrollment
    const { data: existingEnrollment, error: enrollmentFetchError } = await supabase
      .from("biometric_enrollments")
      .select("*")
      .eq("employee_id", employee_id)
      .eq("biometric_type", "finger_vein")
      .maybeSingle(); 

    if (!existingEnrollment) {
      const { data: newEnrollment, error: createError } = await supabase
        .from("biometric_enrollments")
        .insert({
          employee_id,
          org_id,
          biometric_type: "finger_vein",
          status: "pending",
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: `Failed to create enrollment: ${createError.message}` },
          { status: 500 }
        );
      }
    }

    // 3️⃣ Call LOCAL biometric device service to capture fingerprint
    let serviceResponse;
    try {
      serviceResponse = await fetch("http://localhost:5050/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          employee_id: employee.employee_id, 
          employee_name: employee.full_name,
          database_id: employee.id 
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (err: any) {
      await supabase
        .from("biometric_enrollments")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("employee_id", employee_id)
        .eq("biometric_type", "finger_vein");

      return NextResponse.json(
        { 
          error: "Biometric device not available",
          details: "Please ensure the finger vein scanner is connected and the service is running on port 5050.",
          technicalDetails: err.message 
        },
        { status: 503 }
      );
    }

    if (!serviceResponse.ok) {
      const errorData = await serviceResponse.json().catch(() => ({}));
      
      await supabase
        .from("biometric_enrollments")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("employee_id", employee_id)
        .eq("biometric_type", "finger_vein");

      return NextResponse.json(
        { 
          error: "Biometric capture failed",
          details: errorData.error || errorData.message || "Device returned an error. Please try again."
        },
        { status: 502 }
      );
    }

    const deviceData = await serviceResponse.json();
    const { template_id, status: deviceStatus } = deviceData;

    if (!template_id) {
      return NextResponse.json(
        { error: "Device did not return template data" },
        { status: 502 }
      );
    }

    // 4️⃣ Update enrollment record with template data
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("biometric_enrollments")
      .update({
        status: deviceStatus || "enrolled",
        template_id,
        updated_at: new Date().toISOString(),
      })
      .eq("employee_id", employee_id)
      .eq("biometric_type", "finger_vein")
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to save enrollment: ${updateError.message}` },
        { status: 500 }
      );
    }

    // 5️⃣ Return success
    const wasReEnrollment = existingEnrollment?.status === "enrolled";
    
    return NextResponse.json(
      {
        success: true,
        message: wasReEnrollment 
          ? "Biometric data updated successfully" 
          : "Biometric enrollment completed successfully",
        enrollment: {
          id: updatedEnrollment.id,
          template_id,
          status: updatedEnrollment.status,
          biometric_type: "finger_vein",
        },
        action: wasReEnrollment ? "re-enrolled" : "enrolled",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}