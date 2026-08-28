import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const SALT = "universidad-superior-bajio_salt_";
const TOKEN_SECRET =
  process.env.AUTH_TOKEN_SECRET || "usb-superior-bajio-token-secret-2026";

export type Role = "admin";

export function hashPassword(pass: string): string {
  return createHash("sha256").update(SALT + pass).digest("hex");
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(createHmac("sha256", TOKEN_SECRET).update(payload).digest());
}

export function signToken(username: string, role: Role): string {
  const payload = b64url(
    JSON.stringify({ u: username, r: role, iat: Date.now() })
  );
  return `${payload}.${sign(payload)}`;
}

export interface VerifiedToken {
  valid: boolean;
  role: Role | null;
  username: string | null;
}

export function verifyToken(token: string | null | undefined): VerifiedToken {
  const invalid: VerifiedToken = { valid: false, role: null, username: null };
  if (!token) return invalid;
  const parts = token.split(".");
  if (parts.length !== 2) return invalid;
  const [payload, signature] = parts;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return invalid;
  try {
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );
    return {
      valid: true,
      role: (data.r as Role) || null,
      username: data.u || null,
    };
  } catch {
    return invalid;
  }
}

export function getAuthFromRequest(request: NextRequest): VerifiedToken {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return { valid: false, role: null, username: null };
  return verifyToken(authHeader.slice(7));
}
