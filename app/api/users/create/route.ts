import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, full_name, username, org_id, role } = await req.json();

    if (!email || !password || !full_name || !username || !org_id || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Create Auth User with anon key (allowed because email signup enabled)
    const { data: authUser, error: signupError } =
      await supabase.auth.signUp({ email, password });

    if (signupError) {
      return NextResponse.json({ error: signupError.message }, { status: 400 });
    }

    const userId = authUser.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 500 });
    }

    // 2. Update profile row created by trigger
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name,
        username,
        org_id,
        role,
      })
      .eq("id", userId);

    if (updateError) {
      if (updateError.message.includes("unique_org_id_for_shop")) {
        return NextResponse.json(
          { error: "Organization ID already exists. Please choose a different one." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
