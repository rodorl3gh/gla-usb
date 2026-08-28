import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signToken } from "@/lib/auth";
import { getUserByUsername } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    const user = getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const inputHash = hashPassword(password);
    if (inputHash !== user.password_hash) {
      return NextResponse.json(
        { success: false, error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = signToken(user.username, user.role);
    return NextResponse.json({
      success: true,
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    console.error("[auth/login] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
