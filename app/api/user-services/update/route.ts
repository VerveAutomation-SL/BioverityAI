import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { user_id, service_keys } = await req.json();

    // 1️⃣ Validate input
    if (!user_id || !Array.isArray(service_keys)) {
      return NextResponse.json(
        { error: "user_id and service_keys[] are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Delete existing services
    const { error: deleteError } = await supabase
      .from("user_services")
      .delete()
      .eq("user_id", user_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Insert new services
    if (service_keys.length > 0) {
      const inserts = service_keys.map((key: string) => ({
        user_id,
        service_key: key,
      }));

      const { error: insertError } = await supabase
        .from("user_services")
        .insert(inserts);

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    // 4️⃣ Success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
