import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId"); // optional

  let query = supabase
    .from("profiles")
    .select(`
      id,
      username,
      org_id,
      full_name,
      role,
      email,
      organization_logo,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (orgId) {
    query = query.eq("org_id", orgId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Map response shape
  const users = (data || []).map((u) => ({
    id: u.id,
    username: u.username,
    org_id: u.org_id,
    organization_name: u.full_name,
    role: u.role,
    email: u.email,
    full_name: u.full_name,
    organization_logo: u.organization_logo,
    created_at: u.created_at,
  }));

  return NextResponse.json({ users }, { status: 200 });
}