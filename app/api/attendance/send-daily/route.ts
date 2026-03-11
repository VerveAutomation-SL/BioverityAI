import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts, PDFOperator, PDFNumber } from "pdf-lib";
import * as ct from "countries-and-timezones";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const op = (name: string, args?: PDFNumber[]) => PDFOperator.of(name as any, args);

function drawPieChart(
    page: ReturnType<PDFDocument["addPage"]>,
    cx: number, cy: number, radius: number,
    slices: { value: number; colour: ReturnType<typeof rgb> }[]
) {
    const total = slices.reduce((s, sl) => s + sl.value, 0);
    if (total === 0) return;
    const nonZero = slices.filter(sl => sl.value > 0);
    if (nonZero.length === 1) {
        page.drawCircle({ x: cx, y: cy, size: radius, color: nonZero[0].colour });
        page.drawCircle({ x: cx, y: cy, size: radius, borderColor: rgb(1, 1, 1), borderWidth: 2 });
        return;
    }
    const colourA = slices[0].colour;
    const colourB = slices[1].colour;
    const fracA = slices[0].value / total;
    const fracB = slices[1].value / total;
    const numCols = Math.ceil(radius * 2) + 1;
    for (let i = 0; i < numCols; i++) {
        const xOff = -radius + (i / (numCols - 1)) * 2 * radius;
        const xPos = cx + xOff;
        const halfH = Math.sqrt(Math.max(0, radius * radius - xOff * xOff));
        if (halfH < 0.5) continue;
        const yBot = cy - halfH;
        const colH = (cy + halfH) - yBot;
        const colW = (2 * radius / numCols) + 1.5;
        const hA = colH * fracA;
        const hB = colH * fracB;
        if (hA > 0) page.drawRectangle({ x: xPos - colW / 2, y: yBot,      width: colW, height: hA + 0.5, color: colourA });
        if (hB > 0) page.drawRectangle({ x: xPos - colW / 2, y: yBot + hA, width: colW, height: hB + 0.5, color: colourB });
    }
    page.drawCircle({ x: cx, y: cy, size: radius, borderColor: rgb(1, 1, 1), borderWidth: 3 });
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
        page.drawText(totalStr, { x: bX + (barW - tw) / 2, y: y + presentH + absentH + 4, size: fontSize,     font, color: hex("#333333") });
        const lw = font.widthOfTextAtSize(bar.label, fontSize - 1);
        page.drawText(bar.label, { x: bX + (barW - lw) / 2, y: y - 13,                    size: fontSize - 1, font, color: hex("#555555") });
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

        // ✅ Single query including country
        const { data: orgProfile } = await supabase
            .from("profiles").select("full_name, organization_logo, country")
            .eq("org_id", org_id).limit(1).maybeSingle();

        const orgName    = orgProfile?.full_name         ?? "Organisation";
        const orgLogoUrl = orgProfile?.organization_logo ?? null;

        // ✅ Dynamic timezone derived from country in profiles table
        const countryMatch = Object.values(ct.getAllCountries()).find(
            (c) => c.name === (orgProfile?.country ?? "")
        );
        const orgTimezone = countryMatch?.timezones?.[0] ?? "Asia/Singapore";

        const nowLocal = new Date().toLocaleString("en-US", { timeZone: orgTimezone });
        const today    = new Date(nowLocal).toISOString().slice(0, 10);
        const start    = `${today}T00:00:00`;
        const end      = `${today}T23:59:59`;

        const { data: recipients } = await supabase
            .from("alert_recipients").select("phone_number").eq("org_id", org_id);

        const { data: employees } = await supabase
            .from("employees").select("id, full_name, employee_id, department").eq("org_id", org_id);

        const { data: webLogs } = await supabase
            .from("web_attendance_logs")
            .select("employee_id, check_in_time, check_out_time, status, attendance_mode, check_in_address, check_out_address")
            .eq("attendance_date", today)
            .in("employee_id", (employees ?? []).map(e => e.id));

        const { data: bioLogs } = await supabase
            .from("attendance_logs").select("employee_id, event_time")
            .eq("org_id", org_id).gte("event_time", start).lte("event_time", end);

        type EmpRecord = {
            id: string; full_name: string; employee_id: string; department: string;
            checkIn: string | null; checkInLoc: string | null;
            checkOut: string | null; checkOutLoc: string | null;
            workingHours: string | null; status: "Present" | "Absent";
            webCount: number; bioCount2: number;
        };

        const fmtTime = (ts: string | null) => ts
            ? new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: orgTimezone })
            : null;

        const calcHours = (cinMs: number | null, coutMs: number | null) => {
            if (!cinMs || !coutMs) return null;
            const diff = coutMs - cinMs;
            if (diff <= 0) return null;
            return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
        };

        const records: EmpRecord[] = (employees ?? [])
            .sort((a, b) => a.employee_id.localeCompare(b.employee_id, undefined, { numeric: true, sensitivity: "base" }))
            .map(emp => {
                type Event = { ts: Date; timeStr: string; location: string; source: "web" | "bio" };
                const events: Event[] = [];
                const web = (webLogs ?? []).find(l => l.employee_id === emp.id);
                if (web) {
                    const postal = (addr: string | null) => { const m = addr?.match(/\b(\d{6})\b/); return m ? m[1] : "WEB"; };
                    if (web.check_in_time)  events.push({ ts: new Date(web.check_in_time),  timeStr: fmtTime(web.check_in_time)!,  location: postal(web.check_in_address),  source: "web" });
                    if (web.check_out_time) events.push({ ts: new Date(web.check_out_time), timeStr: fmtTime(web.check_out_time)!, location: postal(web.check_out_address), source: "web" });
                }
                (bioLogs ?? []).filter(l => l.employee_id === emp.id).forEach(l => {
                    events.push({ ts: new Date(l.event_time), timeStr: fmtTime(l.event_time)!, location: "Office", source: "bio" });
                });
                if (events.length === 0)
                    return { ...emp, checkIn: null, checkInLoc: null, checkOut: null, checkOutLoc: null, workingHours: null, status: "Absent" as const, webCount: 0, bioCount2: 0 };
                events.sort((a, b) => a.ts.getTime() - b.ts.getTime());
                const first = events[0], last = events[events.length - 1];
                const hasOut = events.length > 1;
                return {
                    ...emp,
                    checkIn:      first.timeStr,
                    checkInLoc:   first.location,
                    checkOut:     hasOut ? last.timeStr  : null,
                    checkOutLoc:  hasOut ? last.location : null,
                    workingHours: calcHours(first.ts.getTime(), hasOut ? last.ts.getTime() : null),
                    status:       "Present" as const,
                    webCount:     web ? 1 : 0,
                    bioCount2:    (bioLogs ?? []).filter(l => l.employee_id === emp.id).length > 0 ? 1 : 0,
                };
            });

        const totalEmp     = records.length;
        const presentCount = records.filter(r => r.status === "Present").length;
        const absentCount  = totalEmp - presentCount;
        const webCount     = records.filter(r => r.webCount  > 0).length;
        const bioCount     = records.filter(r => r.bioCount2 > 0).length;

        const allDepts   = Array.from(new Set((employees ?? []).map(e => e.department).filter(Boolean)));
        const deptBars   = allDepts.map(dept => ({
            label:      dept.length > 10 ? dept.slice(0, 9) + "…" : dept,
            presentVal: records.filter(r => r.department === dept && r.status === "Present").length,
            absentVal:  records.filter(r => r.department === dept && r.status === "Absent").length,
            totalVal:   records.filter(r => r.department === dept).length,
        }));
        const deptMaxVal = Math.max(...deptBars.map(b => b.totalVal), 1);

        /* ── PDF ── */
        const pdf   = await PDFDocument.create();
        const pageW = 842, pageH = 595, M = 40;

        const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const fontReg  = await pdf.embedFont(StandardFonts.Helvetica);

        const C = {
            primary:   hex("#0d6efd"), danger:    hex("#dc3545"),
            white:     rgb(1, 1, 1),  dark:      hex("#212529"),
            headerBg:  hex("#f1f3f5"), headerTxt: hex("#495057"),
            green:     hex("#198754"), purple:    hex("#6f42c1"),
            cyan:      hex("#0dcaf0"), rowAlt:    hex("#f0f4ff"),
            divider:   hex("#dee2e6"),
        };

        const drawOrgLogo = async (
            pg: ReturnType<PDFDocument["addPage"]>,
            cx: number, cy: number, R: number,
            logoUrl: string | null, name: string
        ) => {
            // No white background — transparent by default
            let embedded = false;

            if (logoUrl) {
                const imgBytes = await fetchImage(logoUrl);
                if (imgBytes) {
                    try {
                        const isJpeg = imgBytes[0] === 0xff && imgBytes[1] === 0xd8;
                        const img    = isJpeg ? await pdf.embedJpg(imgBytes) : await pdf.embedPng(imgBytes);
                        const dim    = img.scaleToFit(R * 2, R * 2);
                        const imgX   = cx - dim.width  / 2;
                        const imgY   = cy - dim.height / 2;
                        // Draw logo directly — no circular clip, no border, no background
                        pg.drawImage(img, { x: imgX, y: imgY, width: dim.width, height: dim.height });
                        embedded = true;
                    } catch (e) {
                        console.warn("Logo embed failed:", e);
                    }
                }
            }

            if (!embedded) {
                const initials = name.split(" ").map((w: string) => w[0] || "").join("").slice(0, 2).toUpperCase();
                const fs = R * 0.65;
                const iw = fontBold.widthOfTextAtSize(initials, fs);
                pg.drawText(initials, { x: cx - iw / 2, y: cy - fs * 0.35, size: fs, font: fontBold, color: C.dark });
            }
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
            pg.drawText(today,  { x: (pageW - dateW)  / 2, y: pageH - 68, size: 10, font: fontReg,  color: C.headerTxt });

            const badgeR  = 30;
            const badgeCX = pageW - M - badgeR;
            const badgeCY = pageH - 52;
            await drawOrgLogo(pg, badgeCX, badgeCY, badgeR, orgLogoUrl, orgName);

            const nameFontSize = 9;
            const nameMaxW     = 160;
            const nameWords    = orgName.split(" ");
            const nameLines: string[] = [];
            let   currentLine  = "";

            for (const word of nameWords) {
                const test = currentLine ? `${currentLine} ${word}` : word;
                if (fontBold.widthOfTextAtSize(test, nameFontSize) <= nameMaxW) {
                    currentLine = test;
                } else {
                    if (currentLine) nameLines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) nameLines.push(currentLine);

            const nameLineH  = nameFontSize + 3;
            // Position name just below the logo circle
            const nameBaseY  = badgeCY - badgeR - 6;

            nameLines.forEach((line, li) => {
                const lw = fontBold.widthOfTextAtSize(line, nameFontSize);
                pg.drawText(line, {
                    x:     badgeCX - lw / 2,
                    y:     nameBaseY - li * nameLineH,
                    size:  nameFontSize,
                    font:  fontBold,
                    color: C.dark,
                });
            });
        };

        /* ══════ PAGE 1 ══════ */
        const page1 = pdf.addPage([pageW, pageH]);
        await drawPageHeader(page1, "BioVerity AI Attendance Report");

        const kpiY  = pageH - 150;
        const cards = [
            { label: "Total Employees", value: totalEmp,     colour: C.primary },
            { label: "Present",         value: presentCount, colour: C.green   },
            { label: "Absent",          value: absentCount,  colour: C.danger  },
            { label: "Via Web",         value: webCount,     colour: C.cyan    },
            { label: "Via Biometric",   value: bioCount,     colour: C.purple  },
        ];
        const cardW = (pageW - M * 2 - 16) / cards.length;
        cards.forEach((card, i) => {
            const cx2 = M + i * (cardW + 4);
            rect(page1, cx2, kpiY - 55, cardW, 55, card.colour);
            const vw  = fontBold.widthOfTextAtSize(String(card.value), 22);
            page1.drawText(String(card.value), { x: cx2 + (cardW - vw)  / 2, y: kpiY - 25, size: 22, font: fontBold, color: C.white });
            const lw2 = fontReg.widthOfTextAtSize(card.label, 8);
            page1.drawText(card.label,         { x: cx2 + (cardW - lw2) / 2, y: kpiY - 45, size: 8,  font: fontReg,  color: C.white });
        });

        const dividerY = kpiY - 63;
        rect(page1, M, dividerY, pageW - M * 2, 1, C.divider);

        const zone1X = M, zone1W = (pageW - M * 2 - 20) / 2;
        const zone2X = zone1X + zone1W + 20, zone2W = zone1W;

        const sharedLegY = 55;
        const legItems   = [
            { label: `Present (${presentCount})`, colour: C.green  },
            { label: `Absent (${absentCount})`,   colour: C.danger },
        ];
        const legBoxSize = 12, legTextGap = 6, legItemGap = 25;
        const legTotalW  = legItems.reduce((s, l) => s + legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10), 0) + legItemGap * (legItems.length - 1);
        let legCurX      = zone1X + (zone1W - legTotalW) / 2;
        legItems.forEach(l => {
            rect(page1, legCurX, sharedLegY, legBoxSize, legBoxSize, l.colour);
            page1.drawText(l.label, { x: legCurX + legBoxSize + legTextGap, y: sharedLegY + 2, size: 10, font: fontReg, color: C.dark });
            legCurX += legBoxSize + legTextGap + fontReg.widthOfTextAtSize(l.label, 10) + legItemGap;
        });

        const pieTitleY   = dividerY - 15;
        const pieTitleStr = "Present vs Absent";
        page1.drawText(pieTitleStr, { x: zone1X + (zone1W - fontBold.widthOfTextAtSize(pieTitleStr, 11)) / 2, y: pieTitleY, size: 11, font: fontBold, color: C.dark });
        drawPieChart(page1, zone1X + zone1W / 2, 215, 90, [
            { value: presentCount, colour: C.green  },
            { value: absentCount,  colour: C.danger },
        ]);

        const barTitleStr = "Attendance by Department";
        page1.drawText(barTitleStr, { x: zone2X + (zone2W - fontBold.widthOfTextAtSize(barTitleStr, 11)) / 2, y: pieTitleY, size: 11, font: fontBold, color: C.dark });
        drawBarChart(page1, zone2X, sharedLegY + 28, zone2W, pieTitleY - 15 - (sharedLegY + 28), deptBars, deptMaxVal, fontReg, 9, C.green, C.danger);

        rect(page1, 0, 0, pageW, 22, C.headerBg);
        page1.drawText(`Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toLocaleString("en-US", { timeZone: orgTimezone })}`,
            { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt });

        /* ══════ PAGE 2: Detail Table ══════ */
        const page2 = pdf.addPage([pageW, pageH]);
        await drawPageHeader(page2, "BioVerity AI Employee Attendance Details");

        const tY   = pageH - 115;
        const cols = [
            { label: "#",           w: 28  }, { label: "Employee ID", w: 80  },
            { label: "Full Name",   w: 150 }, { label: "Department",  w: 110 },
            { label: "Status",      w: 58  }, { label: "Check-In",    w: 110 },
            { label: "Check-Out",   w: 110 }, { label: "Hours",       w: 56  },
        ];
        const totalColW = cols.reduce((s, c) => s + c.w, 0);
        const tableX    = (pageW - totalColW) / 2;

        const drawTableHeader = (pg: ReturnType<PDFDocument["addPage"]>, headerY: number) => {
            rect(pg, tableX, headerY - 20, totalColW, 22, C.primary);
            let cx3 = tableX;
            cols.forEach(col => {
                const lw = fontBold.widthOfTextAtSize(col.label, 9);
                pg.drawText(col.label, { x: cx3 + (col.w - lw) / 2, y: headerY - 14, size: 9, font: fontBold, color: C.white });
                cx3 += col.w;
            });
        };

        drawTableHeader(page2, tY);

        const rowH = 20;
        let rowY = tY - 20, currentPage = page2;
        type PageTableInfo = { pg: ReturnType<PDFDocument["addPage"]>; tableTopY: number };
        const pageTableInfos: PageTableInfo[] = [{ pg: page2, tableTopY: tY - 20 }];

        const addNewTablePage = () => {
            currentPage = pdf.addPage([pageW, pageH]);
            (async () => { await drawPageHeader(currentPage, "BioVerity AI Employee Attendance Details"); })();
            rowY = pageH - 115;
            drawTableHeader(currentPage, rowY);
            pageTableInfos.push({ pg: currentPage, tableTopY: rowY - 20 });
            rowY -= 20;
        };

        records.forEach((rec, idx) => {
            if (rowY - rowH < 30) addNewTablePage();
            rect(currentPage, tableX, rowY - rowH, totalColW, rowH, idx % 2 === 0 ? C.rowAlt : C.white);
            const cinStr  = rec.checkIn  ? `${rec.checkIn}  / ${rec.checkInLoc  ?? "–"}` : "–";
            const coutStr = rec.checkOut ? `${rec.checkOut} / ${rec.checkOutLoc ?? "–"}` : "–";
            const cells   = [String(idx + 1), rec.employee_id, rec.full_name, rec.department ?? "–", rec.status, cinStr, coutStr, rec.workingHours ?? "–"];
            let cx4 = tableX;
            cells.forEach((cell, ci) => {
                const col   = cols[ci];
                const isSt  = ci === 4;
                const color = isSt ? (rec.status === "Present" ? C.green : C.danger) : C.dark;
                const fnt   = isSt ? fontBold : fontReg;
                const cw    = fnt.widthOfTextAtSize(cell, 9);
                currentPage.drawText(cell, { x: cx4 + (col.w - cw) / 2, y: rowY - rowH + 6, size: 9, font: fnt, color });
                cx4 += col.w;
            });
            currentPage.drawLine({ start: { x: tableX, y: rowY - rowH }, end: { x: tableX + totalColW, y: rowY - rowH }, thickness: 0.3, color: C.divider });
            rowY -= rowH;
        });

        pageTableInfos.forEach((info, pageIdx) => {
            const isLastPage   = pageIdx === pageTableInfos.length - 1;
            const tableBottomY = isLastPage ? rowY : 30;
            const tableTopY2   = info.tableTopY + 22;
            info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX,             y: tableTopY2   }, thickness: 1.5, color: C.green });
            info.pg.drawLine({ start: { x: tableX + totalColW, y: tableBottomY }, end: { x: tableX + totalColW, y: tableTopY2   }, thickness: 1.5, color: C.green });
            info.pg.drawLine({ start: { x: tableX,             y: tableBottomY }, end: { x: tableX + totalColW, y: tableBottomY }, thickness: 1.5, color: C.green });
        });

        pdf.getPages().forEach((pg, i) => {
            rect(pg, 0, 0, pageW, 22, C.headerBg);
            pg.drawText(
                `Generated by BioVerity AI  ·  bioverityai.com  ·  ${new Date().toLocaleString("en-US", { timeZone: orgTimezone })}   |   Page ${i + 1} of ${pdf.getPageCount()}`,
                { x: M, y: 6, size: 8, font: fontReg, color: C.headerTxt }
            );
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

        if (recipients && recipients.length > 0) {
            const waResults = [];
            for (const r of recipients) {
                try {
                    const waRes = await fetch("https://www.wasenderapi.com/api/send-message", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${WASENDER_KEY}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                            to: r.phone_number.replace("+", ""),
                            documentUrl: publicUrlFresh,
                            fileName: `attendance-${today}.pdf`,
                        }),
                    });
                    const body = await waRes.text();
                    waResults.push({ phone: r.phone_number, status: waRes.status, response: body });
                } catch (e) {
                    waResults.push({ phone: r.phone_number, status: 500, response: String(e) });
                }
                await new Promise(resolve => setTimeout(resolve, 6000));
            }
            return NextResponse.json({ success: true, pdfUrl: publicUrlFresh, waResults });
        }

        return NextResponse.json({ success: true, pdfUrl: publicUrlFresh, waStatus: null, waResponse: "No recipient configured — WhatsApp skipped" });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to send daily report" }, { status: 500 });
    }
}