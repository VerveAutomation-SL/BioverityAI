import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      full_name,
      logo_url,
      username,
      org_id,
      role,
      services, // NEW
    } = await req.json();

    if (!email || !password || !full_name || !username || !org_id || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: authData, error: authError } =
      await supabase.auth.signUp({ email, password });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth creation failed" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name,
        username,
        org_id,
        role,
        organization_logo: logo_url,
      });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const selectedServices: string[] =
      Array.isArray(services) ? services : [];

    if (selectedServices.length > 0) {
      const { error: serviceError } = await supabase
        .from("user_services")
        .insert(
          selectedServices.map((service) => ({
            user_id: userId,
            service_key: service,
          }))
        );

      if (serviceError) {
        return NextResponse.json(
          { error: serviceError.message },
          { status: 500 }
        );
      }
    }

    const { error: serviceError } = await supabase
      .from("user_services")
      .insert(
        selectedServices.map((service) => ({
          user_id: userId,
          service_key: service,
        }))
      );

    if (serviceError) {
      return NextResponse.json(
        { error: serviceError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
