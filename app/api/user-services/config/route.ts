import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      service_key,
      config,
    } = body;

    if (!user_id || !service_key || !config) {
      return NextResponse.json(
        { error: "user_id, service_key and config are required" },
        { status: 400 }
      );
    }

    const {
      access_id,
      access_secret,
      device_id,
      dp_code,
      region,
    } = config;

    if (
      !access_id ||
      !access_secret ||
      !device_id ||
      !dp_code ||
      !region
    ) {
      return NextResponse.json(
        { error: "Incomplete Tuya configuration" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_service_configs")
      .upsert(
        {
          user_id,
          service_key,
          tuya_access_id: access_id,
          tuya_access_secret: access_secret,
          tuya_device_id: device_id,
          tuya_dp_code: dp_code,
          tuya_region: region,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,service_key",
        }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
