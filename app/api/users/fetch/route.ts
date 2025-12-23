import { withCors, corsOptions } from "@/lib/cors";
import { supabase } from "@/lib/supabaseClient";

// Handle preflight
export function OPTIONS() {
  return corsOptions();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

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
    return withCors({ error: error.message }, 500);
  }

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

  return withCors({ users }, 200);
}
