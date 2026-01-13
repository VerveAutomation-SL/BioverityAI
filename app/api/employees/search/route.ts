import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const org_id = searchParams.get("org_id");
  const q = searchParams.get("q");

  if (!org_id || !q) {
    return NextResponse.json({ employees: [] });
  }

  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, employee_id, department, role")
    .eq("org_id", org_id)
    .ilike("full_name", `%${q}%`)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ employees: data });
}
