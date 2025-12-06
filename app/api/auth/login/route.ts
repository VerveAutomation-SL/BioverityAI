import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    const { orgId, username, password } = await req.json();

    if (!orgId || !username || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const profileUrl = `${SUPABASE_URL}/rest/v1/profiles?org_id=eq.${orgId}&username=eq.${username}&select=*`;

    const profileRes = await fetch(profileUrl, {
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
        },
    });

    const profiles = await profileRes.json();
    const profile = profiles[0];

    if (!profile) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const email = profile.email;

    const tokenUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

    const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: SERVICE_KEY,
        },
        body: JSON.stringify({
            email: email,
            password: password
        }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
        return NextResponse.json(
            { error: tokenJson.error_description || "Incorrect password" },
            { status: 401 }
        );
    }

    return NextResponse.json({ success: true, token: tokenJson, profile });
}
