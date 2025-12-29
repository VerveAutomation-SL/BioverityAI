import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { name, description } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Service name is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("services")
    .update({ name, description })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
