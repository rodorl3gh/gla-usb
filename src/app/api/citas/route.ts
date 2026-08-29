import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getCitas, createCita, updateCitaGoogleEventId, getConfig } from "@/lib/db";
import { isGoogleConnected, createGoogleEvent } from "@/lib/google";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(getCitas());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.fecha || !body.hora) {
      return NextResponse.json(
        { success: false, error: "Nombre, fecha y hora son requeridos" },
        { status: 400 }
      );
    }
    const id = createCita(body);

    // Crear evento en Google Calendar con el correo como invitado (si está conectado)
    let googleSynced = false;
    if (isGoogleConnected() && body.email) {
      try {
        const cfg = getConfig();
        const gid = await createGoogleEvent({
          titulo: `Plática informativa USB — ${body.interes || body.nombre}`,
          descripcion:
            `Plática informativa con ${body.nombre}.\n` +
            `Programa de interés: ${body.interes || "—"}\n` +
            `Teléfono: ${body.telefono || "—"}\n` +
            (body.notas ? `Notas: ${body.notas}\n` : ""),
          fecha: body.fecha,
          hora: body.hora,
          duracion_min: body.duracion_min || 30,
          invitadoEmail: body.email,
        });
        if (gid) {
          updateCitaGoogleEventId(id, gid);
          googleSynced = true;
        }
      } catch (err) {
        console.error("[citas] Error creando evento Google:", err);
      }
    }

    return NextResponse.json({ success: true, id, googleSynced });
  } catch (err) {
    console.error("[citas] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
