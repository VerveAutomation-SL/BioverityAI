import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
