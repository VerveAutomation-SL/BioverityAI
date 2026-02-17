import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const org_id = searchParams.get("org_id");
        const key = searchParams.get("key");

        return NextResponse.json({
            envSecret: process.env.CRON_SECRET,
            urlKey: key,
            equal: key === process.env.CRON_SECRET
        });

        // if (!org_id) {
        //     return NextResponse.json({ error: "Missing org_id" }, { status: 400 });
        // }

        // if (key !== process.env.CRON_SECRET) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // const supabase = createClient(
        //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
        //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        // );

        // /* ================= TODAY (SG TIME) ================= */
        // const nowSG = new Date().toLocaleString("en-US", {
        //     timeZone: "Asia/Singapore",
        // });

        // const today = new Date(nowSG).toISOString().slice(0, 10);

        // const start = `${today}T00:00:00`;
        // const end = `${today}T23:59:59`;

        // /* ================= GET RECIPIENT ================= */
        // const { data: recipient } = await supabase
        //     .from("alert_recipients")
        //     .select("phone_number")
        //     .eq("org_id", org_id)
        //     .single();

        // if (!recipient?.phone_number) {
        //     return NextResponse.json({ error: "No WhatsApp number found" }, { status: 400 });
        // }

        // /* ================= FETCH EMPLOYEES ================= */
        // const { data: employees } = await supabase
        //     .from("employees")
        //     .select("id, full_name, employee_id")
        //     .eq("org_id", org_id);

        // const { data: logs } = await supabase
        //     .from("attendance_logs")
        //     .select("employee_id")
        //     .eq("org_id", org_id)
        //     .gte("event_time", start)
        //     .lte("event_time", end);

        // /* ================= GENERATE PDF ================= */
        // const pdf = await PDFDocument.create();
        // const font = await pdf.embedFont(StandardFonts.Helvetica);

        // let page = pdf.addPage([595, 842]);
        // let y = 800;

        // const draw = (text: string) => {
        //     page.drawText(text, { x: 50, y, size: 11, font });
        //     y -= 18;
        // };

        // draw(`Attendance Report - ${today}`);
        // draw("--------------------------------------------------");

        // employees?.forEach(emp => {
        //     const empLogs = logs?.filter(l => l.employee_id === emp.id) || [];
        //     const status = empLogs.length > 0 ? "Present" : "Absent";
        //     draw(`${emp.full_name} (${emp.employee_id}) - ${status}`);
        // });

        // const pdfBytes = await pdf.save();

        // /* ================= UPLOAD TO STORAGE ================= */
        // const filePath = `${org_id}/attendance-${today}.pdf`;

        // const { data: uploadData, error: uploadError } = await supabase.storage
        //     .from("attendance-reports")
        //     .upload(filePath, pdfBytes, {
        //         contentType: "application/pdf",
        //         upsert: true,
        //     });

        // if (uploadError) {
        //     console.error("UPLOAD ERROR:", uploadError);
        //     return NextResponse.json({ error: uploadError.message }, { status: 500 });
        // }

        // console.log("UPLOAD SUCCESS:", uploadData);

        // const { data: publicUrlData } = supabase.storage
        //     .from("attendance-reports")
        //     .getPublicUrl(filePath);

        // const publicUrl = publicUrlData.publicUrl;

        // /* ================= SEND WHATSAPP DOCUMENT ================= */

        // await fetch("https://wasenderapi.com/api/send-message", {
        //     method: "POST",
        //     headers: {
        //         Authorization: `Bearer ${process.env.WASENDER_API_KEY}`,
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         to: recipient.phone_number.replace("+", ""),
        //         documentUrl: publicUrl,
        //         fileName: `attendance-${today}.pdf`,
        //     }),
        // });

        // return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to send daily report" }, { status: 500 });
    }
}