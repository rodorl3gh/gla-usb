import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getDb();
    const citas = db.prepare("SELECT * FROM citas ORDER BY created_at DESC").all();
    const licenciaturas = db.prepare("SELECT * FROM licenciaturas ORDER BY orden").all();
    const maestrias = db.prepare("SELECT * FROM maestrias ORDER BY orden").all();

    const wb = XLSX.utils.book_new();

    const wsCitas = XLSX.utils.json_to_sheet(citas as any[]);
    XLSX.utils.book_append_sheet(wb, wsCitas, "Citas");
    const wsLic = XLSX.utils.json_to_sheet(licenciaturas as any[]);
    XLSX.utils.book_append_sheet(wb, wsLic, "Licenciaturas");
    const wsMae = XLSX.utils.json_to_sheet(maestrias as any[]);
    XLSX.utils.book_append_sheet(wb, wsMae, "Maestrias");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="usb-database.xlsx"',
      },
    });
  } catch (err) {
    console.error("[export] Error:", err);
    return NextResponse.json({ error: "Error al generar el archivo" }, { status: 500 });
  }
}
