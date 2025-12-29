import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { key, name, description } = await req.json();

  if (!key || !name) {
    return NextResponse.json(
      { error: "Key and name are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("services").insert({
    key,
    name,
    description,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
