import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { employee_id } = await req.json();

    if (!employee_id) {
      return NextResponse.json(
        { error: "employee_id is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Check enrollment exists
    const { data: enrollment, error: fetchError } = await supabase
      .from("biometric_enrollments")
      .select("*")
      .eq("employee_id", employee_id)
      .eq("biometric_type", "finger_vein")
      .single();

    if (fetchError || !enrollment) {
      return NextResponse.json(
        { error: "Biometric enrollment not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Call LOCAL biometric service
    let serviceResponse;
    try {
      serviceResponse = await fetch("http://localhost:5050/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id }),
        // timeout safety
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return NextResponse.json(
        { error: "Device service not available" },
        { status: 503 }
      );
    }

    if (!serviceResponse.ok) {
      return NextResponse.json(
        { error: "Biometric service failed" },
        { status: 502 }
      );
    }

    const { template_id, status } = await serviceResponse.json();

    // 3️⃣ Update DB using service response
    const { error: updateError } = await supabase
      .from("biometric_enrollments")
      .update({
        status,
        template_id,
      })
      .eq("id", enrollment.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Success
    return NextResponse.json(
      {
        success: true,
        template_id,
        status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
