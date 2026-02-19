import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function hex(h: string) {
    const n = parseInt(h.slice(1), 16);
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

async function fetchImage(url: string): Promise<Uint8Array | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return new Uint8Array(await res.arrayBuffer());
    } catch { return null; }
}

function rect(
    page: ReturnType<PDFDocument["addPage"]>,
    x: number, y: number, w: number, h: number,
    colour: ReturnType<typeof rgb>
) {
    page.drawRectangle({ x, y, width: w, height: h, color: colour });
}

// FIX 1: Pie chart now handles 0/100% case correctly (full circle when one slice dominates)
function drawPieChart(
    page: ReturnType<PDFDocument["addPage"]>,
    cx: number, cy: number, radius: number,
    slices: { value: number; colour: ReturnType<typeof rgb> }[]
) {
    const total = slices.reduce((s, sl) => s + sl.value, 0);
    if (total === 0) return;

    // If only one slice has value, draw a plain filled circle — no degenerate SVG path
    const nonZero = slices.filter(sl => sl.value > 0);
    if (nonZero.length === 1) {
        page.drawCircle({ x: cx, y: cy, size: radius, color: nonZero[0].colour, borderColor: rgb(1, 1, 1), borderWidth: 2 });
        return;
    }

    let startAngle = -Math.PI / 2;
    slices.forEach(sl => {
        if (sl.value === 0) return;
        const sweep = (sl.value / total) * 2 * Math.PI;
        const steps = Math.max(4, Math.round(64 * (sweep / (2 * Math.PI))));
        const pts: { x: number; y: number }[] = [{ x: cx, y: cy }];
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (sweep * i) / steps;
            pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
        }
        const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") + " Z";
        page.drawSvgPath(pathD, { color: sl.colour, borderWidth: 0 });
        startAngle += sweep;
    });
    page.drawCircle({ x: cx, y: cy, size: radius, borderColor: rgb(1, 1, 1), borderWidth: 2 });
}

function drawBarChart(
    page: ReturnType<PDFDocument["addPage"]>,
    x: number, y: number, chartW: number, chartH: number,
    bars: { label: string; presentVal: number; absentVal: number; totalVal: number }[],
    maxVal: number,
    font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
    fontSize: number,
    green: ReturnType<typeof rgb>,
    danger: ReturnType<typeof rgb>
) {
    if (bars.length === 0 || maxVal === 0) return;
    const groupW = chartW / bars.length;
    const barW   = Math.min(groupW * 0.6, 50);
    const gap    = (groupW - barW) / 2;

    page.drawLine({ start: { x, y }, end: { x: x + chartW, y }, thickness: 1, color: hex("#cccccc") });

    bars.forEach((bar, i) => {
        const bX       = x + i * groupW + gap;
        const presentH = (bar.presentVal / maxVal) * chartH;
        const absentH  = (bar.absentVal  / maxVal) * chartH;

        if (presentH > 0) page.drawRectangle({ x: bX, y,               width: barW, height: presentH, color: green  });
        if (absentH  > 0) page.drawRectangle({ x: bX, y: y + presentH, width: barW, height: absentH,  color: danger });

        const totalStr = String(bar.totalVal);
        const tw = font.widthOfTextAtSize(totalStr, fontSize);
        page.drawText(totalStr, { x: bX + (barW - tw) / 2, y: y + presentH + absentH + 4, size: fontSize, font, color: hex("#333333") });

        const lw = font.widthOfTextAtSize(bar.label, fontSize - 1);
        page.drawText(bar.label, { x: bX + (barW - lw) / 2, y: y - 13, size: fontSize - 1, font, color: hex("#555555") });
    });
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const org_id = searchParams.get("org_id");
        const key    = searchParams.get("key");

        const CRON_SECRET  = "BioverityAICronSecret";
        const WASENDER_KEY = "45c4351855553c63e57fdca99f068b61d309e8d4537a5da029666516b9cca618";

        if (!org_id) return NextResponse.json({ error: "Missing org_id" }, { status: 400 });
        if (key !== CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const nowSG = new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" });
        const today = new Date(nowSG).toISOString().slice(0, 10);
        const start = `${today}T00:00:00`;
        const end   = `${today}T23:59:59`;

        const { data: recipient } = await supabase.from("alert_recipients").select("phone_number").eq("org_id", org_id).maybeSingle();
        const recipientPhone: string | null = recipient?.phone_number ?? null;

        const { data: orgProfile } = await supabase.from("profiles").select("full_name, organization_logo").eq("org_id", org_id).limit(1).maybeSingle();
        const orgName    = orgProfile?.full_name         ?? "Organisation";
        const orgLogoUrl = orgProfile?.organization_logo ?? null;

        const { data: employees } = await supabase.from("employees").select("id, full_name, employee_id, department").eq("org_id", org_id);

        const { data: webLogs } = await supabase
            .from("web_attendance_logs")
            .select("employee_id, check_in_time, check_out_time, status, attendance_mode")
            .eq("attendance_date", today)
            .in("employee_id", (employees ?? []).map(e => e.id));

        const { data: bioLogs } = await supabase.from("attendance_logs").select("employee_id, event_time").eq("org_id", org_id).gte("event_time", start).lte("event_time", end);

        type EmpRecord = {
            id: string; full_name: string; employee_id: string; department: string;
            checkIn: string | null; checkOut: string | null; method: string;
            status: "Present" | "Absent";
        };

        const records: EmpRecord[] = (employees ?? []).map(emp => {
            const web = (webLogs ?? []).find(l => l.employee_id === emp.id);
            if (web) {
                const fmt = (ts: string | null) => ts ? new Date(ts).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" }) : null;
                return { ...emp, checkIn: fmt(web.check_in_time), checkOut: fmt(web.check_out_time), method: web.attendance_mode ?? "Web", status: "Present" as const };
            }
            const bio = (bioLogs ?? []).filter(l => l.employee_id === emp.id);
            if (bio.length > 0) {
                const sorted = bio.map(l => new Date(l.event_time)).sort((a, b) => a.getTime() - b.getTime());
                const fmt = (d: Date) => d.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Singapore" });
                return { ...emp, checkIn: fmt(sorted[0]), checkOut: sorted.length > 1 ? fmt(sorted[sorted.length - 1]) : null, method: "Biometric", status: "Present" as const };
            }
            return { ...emp, checkIn: null, checkOut: null, method: "–", status: "Absent" as const };
        });

        const totalEmp     = records.length;
        const presentCount = records.filter(r => r.status === "Present").length;
        const absentCount  = totalEmp - presentCount;
        const webCount     = records.filter(r => r.method !== "Biometric" && r.method !== "–").length;
        const bioCount     = records.filter(r => r.method === "Biometric").length;

        const allDepts = Array.from(new Set((employees ?? []).map(e => e.department).filter(Boolean)));
        const deptBars = allDepts.map(dept => ({
            label:      dept.length > 10 ? dept.slice(0, 9) + "…" : dept,
            presentVal: records.filter(r => r.department === dept && r.status === "Present").length,
            absentVal:  records.filter(r => r.department === dept && r.status === "Absent").length,
            totalVal:   records.filter(r => r.department === dept).length,
        }));
        const deptMaxVal = Math.max(...deptBars.map(b => b.totalVal), 1);

        /* ── PDF ── */
        const pdf    = await PDFDocument.create();
        const pageW  = 842;
        const pageH  = 595;
        const M      = 40;

        const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fontReg  = await pdf.embedFont(StandardFonts.Helvetica);
        const fontObl  = await pdf.embedFont(StandardFonts.HelveticaOblique);

        const C = {
            primary:   hex("#0d6efd"),
            danger:    hex("#dc3545"),
            white:     rgb(1, 1, 1),
            dark:      hex("#212529"),
            headerBg:  hex("#f1f3f5"),
            headerTxt: hex("#495057"),
            green:     hex("#198754"),
            purple:    hex("#6f42c1"),
            cyan:      hex("#0dcaf0"),
            rowAlt:    hex("#f0f4ff"),
            divider:   hex("#dee2e6"),
        };

        const drawPageHeader = async (pg: ReturnType<PDFDocument["addPage"]>, title: string) => {
            rect(pg, 0, pageH - 100, pageW, 100, C.headerBg);
            rect(pg, 0, pageH - 103, pageW, 3, C.primary);

            const bvBytes = await fetchImage("https://bioverityai.com/assets/images/logo.png");
            if (bvBytes) {
                try {
                    const bvImg = await pdf.embedPng(bvBytes);
                    const bvDim = bvImg.scale(0.12);
                    pg.drawImage(bvImg, { x: M, y: pageH - 90, width: bvDim.width, height: bvDim.height });
                } catch { /* skip */ }
            }

            const titleW = fontBold.widthOfTextAtSize(title, 20);
            pg.drawText(title, { x: (pageW - titleW) / 2, y: pageH - 48, size: 20, font: fontBold, color: C.headerTxt });

            const dateW = fontReg.widthOfTextAtSize(today, 10);
            pg.drawText(today, { x: (pageW - dateW) / 2, y: pageH - 68, size: 10, font: fontReg, color: C.headerTxt });

            const orgX = pageW - M - 80;
            const orgY = pageH - 88;

            if (orgLogoUrl) {
                const orgBytes = await fetchImage(orgLogoUrl);
                if (orgBytes) {
                    try {
                        const orgImg = await pdf.embedPng(orgBytes);
                        const orgDim = orgImg.scaleToFit(80, 70);
                        pg.drawImage(orgImg, { x: orgX, y: orgY, width: orgDim.width, height: orgDim.height });
                    } catch {
                        pg.drawCircle({ x: orgX + 40, y: orgY + 35, size: 35, color: hex("#dee2e6"), borderColor: hex("#adb5bd"), borderWidth: 2 });
                        const initials = orgName.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
                        const iw = fontBold.widthOfTextAtSize(initials, 18);
                        pg.drawText(initials, { x: orgX + 40 - iw / 2, y: orgY + 28, size: 18, font: fontBold, color: hex("#6c757d") });
                    }
                } else {
                    pg.drawCircle({ x: orgX + 40, y: orgY + 35, size: 35, color: hex("#dee2e6"), borderColor: hex("#adb5bd"), borderWidth: 2 });
                    const initials = orgName.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
                    const iw = fontBold.widthOfTextAtSize(initials, 18);
                    pg.drawText(initials, { x: orgX + 40 - iw / 2, y: orgY + 28, size: 18, font: fontBold, color: hex("#6c757d") });
                }
            } else {
                pg.drawCircle({ x: orgX + 40, y: orgY + 35, size: 35, color: hex("#dee2e6"), borderColor: hex("#adb5bd"), borderWidth: 2 });
                const initials = orgName.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
                const iw = fontBold.widthOfTextAtSize(initials, 18);
                pg.drawText(initials, { x: orgX + 40 - iw / 2, y: orgY + 28, size: 18, font: fontBold, color: hex("#6c757d") });
            }

            const orgNameTrim = orgName.length > 16 ? orgName.slice(0, 15) + "…" : orgName;
            const orgNameW = fontReg.widthOfTextAtSize(orgNameTrim, 9);
            pg.drawText(orgNameTrim, { x: orgX + 40 - orgNameW / 2, y: orgY - 8, size: 9, font: fontReg, color: C.headerTxt });
        };

        /* ══════ PAGE 1 ══════ */
        const page1 = pdf.addPage([pageW, pageH]);
        await drawPageHeader(page1, "BioVerity AI Attendance Report");

        // ── KPI Cards ──
        const kpiY  = pageH - 150;
        const cards = [
            { label: "Total Employees", value: totalEmp,     colour: C.primary },
            { label: "Present",          value: presentCount, colour: C.green   },
            { label: "Absent",           value: absentCount,  colour: C.danger  },
            { label: "Via Web",          value: webCount,     colour: C.cyan    },
            { label: "Via Biometric",    value: bioCount,     colour: C.purple  },
        ];
        const cardW = (pageW - M * 2 - 16) / cards.length;
        cards.forEach((card, i) => {
            const cx = M + i * (cardW + 4);
            rect(page1, cx, kpiY - 55, cardW, 55, card.colour);
            rect(page1, cx, kpiY, cardW, 3, C.white);
            const vw = fontBold.widthOfTextAtSize(String(card.value), 22);
            page1.drawText(String(card.value), { x: cx + (cardW - vw) / 2, y: kpiY - 25, size: 22, font: fontBold, color: C.white });
            const lw = fontReg.widthOfTextAtSize(card.label, 8);
            page1.drawText(card.label, { x: cx + (cardW - lw) / 2, y: kpiY - 45, size: 8, font: fontReg, color: C.white });
        });

        const dividerY = kpiY - 63;
        rect(page1, M, dividerY, pageW - M * 2, 1, C.divider);

        /* ── TWO EQUAL ZONES: Pie (left) + Bar (right) ── */
        // Pushed charts lower: start 40px below the divider instead of 20
        const chartY    = dividerY - 40;
        const chartH    = 220;  // taller zone so charts have more room
        const chartBot  = chartY - chartH;

        const zone1X = M;
        const zone1W = (pageW - M * 2 - 20) / 2;
        const zone2X = zone1X + zone1W + 20;
        const zone2W = zone1W;

        // ── Zone 1: Present vs Absent pie ──
        // Title sits above everything
        const t1 = "Present vs Absent";
        const t1W = fontBold.widthOfTextAtSize(t1, 11);
        page1.drawText(t1, { x: zone1X + (zone1W - t1W) / 2, y: chartY + 8, size: 11, font: fontBold, color: C.dark });

        // Larger pie radius now that we have more vertical space
        const pie1R  = 85;
        const pie1CX = zone1X + zone1W / 2;
        const pie1CY = chartY - 35 - pie1R;  // enough gap below title

        // GREEN slice = present, RED slice = absent
        // When all absent → full red circle; when all present → full green circle; mixed → split
        drawPieChart(page1, pie1CX, pie1CY, pie1R, [
            { value: presentCount, colour: C.green  },
            { value: absentCount,  colour: C.danger },
        ]);

        // Legend below pie
        const legY = pie1CY - pie1R - 18;
        [
            { label: `Present (${presentCount})`, colour: C.green  },
            { label: `Absent (${absentCount})`,   colour: C.danger },
        ].forEach((l, i) => {
            const lx = pie1CX - 60;
            const ly = legY - i * 20;
            rect(page1, lx, ly, 12, 12, l.colour);
            page1.drawText(l.label, { x: lx + 17, y: ly + 2, size: 10, font: fontReg, color: C.dark });
        });

        // ── Zone 2: Dept bar chart ──
        const t2 = "Attendance by Department";
        const t2W = fontBold.widthOfTextAtSize(t2, 11);
        page1.drawText(t2, { x: zone2X + (zone2W - t2W) / 2, y: chartY + 8, size: 11, font: fontBold, color: C.dark });

        // Legend for bar chart
        const legX = zone2X;
        rect(page1, legX,      chartY - 8, 11, 11, C.green);
        page1.drawText("Present", { x: legX + 15, y: chartY - 7, size: 8, font: fontReg, color: C.dark });
        rect(page1, legX + 70, chartY - 8, 11, 11, C.danger);
        page1.drawText("Absent",  { x: legX + 85, y: chartY - 7, size: 8, font: fontReg, color: C.dark });

        // Bar chart: green stacked on bottom (present), red stacked on top (absent)
        drawBarChart(page1, zone2X, chartBot + 30, zone2W, chartH - 50, deptBars, deptMaxVal, fontReg, 9, C.green, C.danger);

        // Footer page 1
        rect(page1, 0, 0, pageW, 22, C.headerBg);
        page1.drawText(`Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toISOString()}`,
            { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt });

        /* ══════ PAGE 2: Detail Table ══════ */
        const page2 = pdf.addPage([pageW, pageH]);
        await drawPageHeader(page2, "BioVerity AI Employee Attendance Details");

        const tY   = pageH - 115;
        const cols = [
            { label: "#",           w: 30  },
            { label: "Employee ID", w: 85  },
            { label: "Full Name",   w: 170 },
            { label: "Department",  w: 120 },
            { label: "Status",      w: 65  },
            { label: "Check-In",    w: 75  },
            { label: "Check-Out",   w: 75  },
            { label: "Method",      w: 80  },
        ];
        const totalColW = cols.reduce((s, c) => s + c.w, 0);
        const tableX    = (pageW - totalColW) / 2;

        const drawTableHeader = (pg: ReturnType<PDFDocument["addPage"]>, headerY: number) => {
            rect(pg, tableX, headerY - 20, totalColW, 22, C.primary);
            let cx = tableX;
            cols.forEach(col => {
                const lw = fontBold.widthOfTextAtSize(col.label, 9);
                pg.drawText(col.label, { x: cx + (col.w - lw) / 2, y: headerY - 14, size: 9, font: fontBold, color: C.white });
                cx += col.w;
            });
        };

        drawTableHeader(page2, tY);

        const rowH      = 20;
        let rowY        = tY - 20;
        let currentPage = page2;

        // FIX 3: Track per-page table boundaries so we can draw borders on each page
        // Store { page, tableTopY, startRowY } for each page used
        type PageTableInfo = {
            pg: ReturnType<PDFDocument["addPage"]>;
            tableTopY: number; // y where header top starts (headerY - 20 + 22 = headerY+2, but we just use headerY - 20 as rect top)
        };
        const pageTableInfos: PageTableInfo[] = [
            { pg: page2, tableTopY: tY - 20 }
        ];

        const addNewTablePage = () => {
            currentPage = pdf.addPage([pageW, pageH]);
            (async () => {
                await drawPageHeader(currentPage, "BioVerity AI Employee Attendance Details");
            })();
            rowY = pageH - 115;
            drawTableHeader(currentPage, rowY);
            pageTableInfos.push({ pg: currentPage, tableTopY: rowY - 20 });
            rowY -= 20;
        };

        records.forEach((rec, idx) => {
            if (rowY - rowH < 30) addNewTablePage();
            rect(currentPage, tableX, rowY - rowH, totalColW, rowH, idx % 2 === 0 ? C.rowAlt : C.white);

            const cells = [String(idx + 1), rec.employee_id, rec.full_name, rec.department ?? "–", rec.status, rec.checkIn ?? "–", rec.checkOut ?? "–", rec.method];
            let cx2 = tableX;
            cells.forEach((cell, ci) => {
                const col   = cols[ci];
                const isSt  = ci === 4;
                const color = isSt ? (rec.status === "Present" ? C.green : C.danger) : C.dark;
                const fnt   = isSt ? fontBold : fontReg;
                const cw    = fnt.widthOfTextAtSize(cell, 9);
                currentPage.drawText(cell, { x: cx2 + (col.w - cw) / 2, y: rowY - rowH + 6, size: 9, font: fnt, color });
                cx2 += col.w;
            });
            currentPage.drawLine({ start: { x: tableX, y: rowY - rowH }, end: { x: tableX + totalColW, y: rowY - rowH }, thickness: 0.3, color: C.divider });
            rowY -= rowH;
        });

        // FIX 3: Draw green border on LEFT, RIGHT, and BOTTOM of table (no top border)
        // The last page's bottom is the current rowY
        // For all pages except the last, the bottom goes to near the footer
        const borderColour = C.green;
        const borderThick  = 1.5;

        pageTableInfos.forEach((info, pageIdx) => {
            const isLastPage = pageIdx === pageTableInfos.length - 1;
            const tableBottomY = isLastPage ? rowY : 30; // last row on last page, or near footer on earlier pages
            const tableTopY    = info.tableTopY + 22; // top of the header rect (visually the very top line, we skip it)

            // Left border
            info.pg.drawLine({
                start: { x: tableX, y: tableBottomY },
                end:   { x: tableX, y: tableTopY },
                thickness: borderThick,
                color: borderColour,
            });
            // Right border
            info.pg.drawLine({
                start: { x: tableX + totalColW, y: tableBottomY },
                end:   { x: tableX + totalColW, y: tableTopY },
                thickness: borderThick,
                color: borderColour,
            });
            // Bottom border
            info.pg.drawLine({
                start: { x: tableX,              y: tableBottomY },
                end:   { x: tableX + totalColW,  y: tableBottomY },
                thickness: borderThick,
                color: borderColour,
            });
        });

        // Footer on all pages
        pdf.getPages().forEach((pg, i) => {
            rect(pg, 0, 0, pageW, 22, C.headerBg);
            pg.drawText(`Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toISOString()}   |   Page ${i + 1} of ${pdf.getPageCount()}`,
                { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt });
        });

        /* ── Upload ── */
        const pdfBytes = await pdf.save();
        const filePath = `${org_id}/attendance-${today}.pdf`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("attendance-reports")
            .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });

        if (uploadError) {
            console.error("UPLOAD ERROR:", uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }
        console.log("UPLOAD SUCCESS:", uploadData);

        const { data: publicUrlData } = supabase.storage.from("attendance-reports").getPublicUrl(filePath);
        const publicUrlFresh = `${publicUrlData.publicUrl}?t=${Date.now()}`;

        if (recipientPhone) {
            const waRes = await fetch("https://www.wasenderapi.com/api/send-message", {
                method: "POST",
                headers: { Authorization: `Bearer ${WASENDER_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({ to: recipientPhone.replace("+", ""), documentUrl: publicUrlFresh, fileName: `attendance-${today}.pdf` }),
            });
            const waText = await waRes.text();
            return NextResponse.json({ success: true, pdfUrl: publicUrlFresh, waStatus: waRes.status, waResponse: waText });
        }

        return NextResponse.json({ success: true, pdfUrl: publicUrlFresh, waStatus: null, waResponse: "No recipient configured — WhatsApp skipped" });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to send daily report" }, { status: 500 });
    }
}