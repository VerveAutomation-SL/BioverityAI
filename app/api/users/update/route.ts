import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { id, username, role, email, organization_logo } = await req.json();

    if (!id || !username || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build update object dynamically
    const updateData: any = {
      username,
      role,
    };

    // Only update email if provided
    if (email) {
      updateData.email = email;
    }

    // Only update organization_logo if provided (allow empty string to clear logo)
    if (organization_logo !== undefined) {
      updateData.organization_logo = organization_logo;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}