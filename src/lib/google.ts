import { google } from "googleapis";
import type { OAuth2Client, Credentials } from "google-auth-library";
import { getSetting, setSetting } from "./db";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const TOKEN_KEY = "google_tokens";

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

export function getOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function exchangeCode(code: string): Promise<void> {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  const existing = loadTokens();
  const merged: Credentials = { ...(existing || {}), ...tokens };
  if (!merged.refresh_token && existing?.refresh_token) merged.refresh_token = existing.refresh_token;
  setSetting(TOKEN_KEY, JSON.stringify(merged));
}

function loadTokens(): Credentials | null {
  const raw = getSetting(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Credentials;
  } catch {
    return null;
  }
}

export function isGoogleConnected(): boolean {
  const tokens = loadTokens();
  return Boolean(tokens && (tokens.refresh_token || tokens.access_token));
}

export function disconnectGoogle(): void {
  setSetting(TOKEN_KEY, "");
}

export function getAuthedClient(): OAuth2Client | null {
  if (!isGoogleConfigured()) return null;
  const tokens = loadTokens();
  if (!tokens) return null;
  const client = getOAuthClient();
  client.setCredentials(tokens);
  client.on("tokens", (newTokens) => {
    const current = loadTokens() || {};
    const merged = { ...current, ...newTokens };
    setSetting(TOKEN_KEY, JSON.stringify(merged));
  });
  return client;
}

export interface GoogleEventInput {
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora: string;
  duracion_min: number;
  invitadoEmail?: string;
}

function buildNaiveDateTime(fecha: string, hora: string, addMinutes = 0): string {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm + addMinutes, 0));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:00`;
}

export async function createGoogleEvent(input: GoogleEventInput): Promise<string | null> {
  const auth = getAuthedClient();
  if (!auth) return null;

  const calendar = google.calendar({ version: "v3", auth });
  const startNaive = buildNaiveDateTime(input.fecha, input.hora, 0);
  const endNaive = buildNaiveDateTime(input.fecha, input.hora, input.duracion_min || 30);

  const attendees = input.invitadoEmail
    ? [{ email: input.invitadoEmail }]
    : undefined;

  const res = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: input.invitadoEmail ? "all" : "none",
    requestBody: {
      summary: input.titulo,
      description: input.descripcion || "",
      start: { dateTime: startNaive, timeZone: "America/Mexico_City" },
      end: { dateTime: endNaive, timeZone: "America/Mexico_City" },
      attendees,
    },
  });
  return res.data.id || null;
}
