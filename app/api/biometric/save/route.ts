import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { employee_id, template_id } = await req.json();

    console.log("📥 Received:", { 
      employee_id, 
      template_length: template_id?.length 
    });

    if (!employee_id || !template_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Simple UPDATE - works with existing "pending" enrollments
    const { data, error } = await supabase
      .from("biometric_enrollments")
      .update({
        status: "enrolled",
        template_id,
      })
      .eq("employee_id", employee_id)
      .eq("biometric_type", "finger_vein")
      .select();

    console.log("📤 Update result:", { data, error });

    if (error) {
      console.error("❌ Database error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.warn("⚠️ No rows were updated - enrollment might not exist");
      return NextResponse.json(
        { error: "No pending enrollment found for this employee" },
        { status: 404 }
      );
    }

    console.log("✅ Success! Updated rows:", data.length);
    return NextResponse.json({ 
      success: true,
      updated: data.length 
    });

  } catch (err: any) {
    console.error("💥 Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}