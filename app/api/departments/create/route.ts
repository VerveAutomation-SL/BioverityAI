import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { org_id, name } = await req.json();

    if (!org_id || !name) {
      return NextResponse.json(
        { error: "Organization ID and department name are required" },
        { status: 400 }
      );
    }

    // Check if department already exists
    const { data: existing } = await supabase
      .from("departments")
      .select("id")
      .eq("org_id", org_id)
      .eq("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Department already exists" },
        { status: 409 }
      );
    }

    // Insert new department
    const { data, error } = await supabase
      .from("departments")
      .insert({ org_id, name })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, department: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}