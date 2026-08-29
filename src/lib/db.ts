import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "universidad-superior-bajio.db");

export function getMexicoDate(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

export function getMexicoMinutesNow(): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")!.value);
  const min = parseInt(parts.find((p) => p.type === "minute")!.value);
  return h * 60 + min;
}

export function getMexicoTime(): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("busy_timeout = 5000");
  runMigrations(_db);
  return _db;
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS licenciaturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      duracion TEXT DEFAULT '',
      rvoe TEXT DEFAULT '',
      descripcion TEXT DEFAULT '',
      orden INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS maestrias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      duracion TEXT DEFAULT '',
      rvoe TEXT DEFAULT '',
      descripcion TEXT DEFAULT '',
      orden INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia INTEGER NOT NULL,
      apertura TEXT NOT NULL DEFAULT '09:00',
      cierre TEXT NOT NULL DEFAULT '16:00',
      duracion_min INTEGER NOT NULL DEFAULT 30,
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT DEFAULT '',
      email TEXT DEFAULT '',
      interes TEXT DEFAULT '',
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      duracion_min INTEGER NOT NULL DEFAULT 30,
      estado TEXT CHECK(estado IN ('pendiente','confirmada','completada','cancelada')) NOT NULL DEFAULT 'pendiente',
      notas TEXT DEFAULT '',
      google_event_id TEXT DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT DEFAULT '',
      mode TEXT CHECK(mode IN ('AI','HUMAN')) NOT NULL DEFAULT 'AI',
      remote_jid TEXT,
      last_message_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id),
      role TEXT CHECK(role IN ('user','assistant','human')) NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
    CREATE TABLE IF NOT EXISTS connection_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      status TEXT NOT NULL DEFAULT 'disconnected',
      qr_string TEXT,
      pairing_code TEXT,
      phone TEXT,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    INSERT OR IGNORE INTO connection_state (id, status) VALUES (1, 'disconnected');
    CREATE TABLE IF NOT EXISTS agent_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      delay_ms INTEGER NOT NULL DEFAULT 1500,
      temperature REAL NOT NULL DEFAULT 0.7,
      max_history INTEGER NOT NULL DEFAULT 10,
      ia_model TEXT NOT NULL DEFAULT 'deepseek-v4-flash'
    );
    INSERT OR IGNORE INTO agent_config (id) VALUES (1);
    CREATE TABLE IF NOT EXISTS agent_prompt (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      prompt TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Migración: asegurar columnas nuevas en citas
  const citaCols = db.prepare("PRAGMA table_info(citas)").all() as any[];
  const citaNames = citaCols.map((c: any) => c.name);
  if (!citaNames.includes("duracion_min")) {
    db.exec("ALTER TABLE citas ADD COLUMN duracion_min INTEGER NOT NULL DEFAULT 30");
  }
  if (!citaNames.includes("google_event_id")) {
    db.exec("ALTER TABLE citas ADD COLUMN google_event_id TEXT DEFAULT ''");
  }

  // Migración: columna email en conversations
  const convCols = db.prepare("PRAGMA table_info(conversations)").all() as any[];
  const convNames = convCols.map((c: any) => c.name);
  if (!convNames.includes("email")) {
    db.exec("ALTER TABLE conversations ADD COLUMN email TEXT DEFAULT ''");
  }

  seedDefaults(db);
}

const DEFAULT_CONFIG: Record<string, string> = {
  universidad: "Universidad Superior Bajío",
  marca: "USB",
  siglas: "USB",
  eslogan: "Formación Profesional Integral",
  tagline:
    "Forma tu futuro profesional con licenciaturas y maestrías con reconocimiento de validez oficial de estudios (RVOE) en el corazón de Celaya, Guanajuato.",
  telefono: "461 613 0803",
  whatsapp: "524111364713",
  email: "admisiones@universidadsuperiorbajio.edu.mx",
  direccion: "Álvaro Obregón #307 2do. piso",
  colonia: "Zona Centro",
  ciudad: "Celaya",
  estado: "Guanajuato",
  cp: "38000",
  facebook: "Universidad Superior Bajío",
  facebook_url: "https://www.facebook.com/UniversidadSuperiorBajio",
  instagram: "",
  horarios: "Lun–Vie 9:00–16:00",
  dias_atencion: "Lunes a Viernes",
  horario_apertura: "09:00",
  horario_cierre: "16:00",
  google_maps: "https://maps.app.goo.gl/",
};

function seedDefaults(db: Database.Database) {
  const adminUser = process.env.ADMIN_USER || "rodorl3";
  const adminHash =
    process.env.ADMIN_PASS_HASH ||
    "de05eeb2c17c3b90403b412701ded259ce4272b455c6096d37ff8d3967f97904";

  db.prepare(
    "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'admin')"
  ).run(adminUser, adminHash);

  const cfg = db.prepare("INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)");
  for (const [k, v] of Object.entries(DEFAULT_CONFIG)) {
    cfg.run(k, v);
  }

  seedLicenciaturas(db);
  seedMaestrias(db);
  seedHorarios(db);
}

function seedLicenciaturas(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM licenciaturas").get() as any).c;
  if (count > 0) return;
  const licenciaturas: [string, string, string, string][] = [
    ["Psicología", "3 años 4 meses", "R.V.O.E NO 20110104", "Comprende el comportamiento humano y desarrolla habilidades clínicas y de intervención para acompañar procesos de salud mental y bienestar."],
    ["Comercio Internacional y Mercadotecnia", "", "R.V.O.E NO 20090329", "Domina las estrategias de negocios globales, logística y mercadotecnia para impulsar marcas y empresas en mercados nacionales e internacionales."],
    ["Ingeniería en Sistemas y Desarrollo de Software", "", "R.V.O.E NO 20090324", "Diseña, desarrolla y administra soluciones tecnológicas y de software, liderando proyectos de transformación digital."],
    ["Contaduría Pública y Finanzas", "", "R.V.O.E NO 20090326", "Forma expertos en contabilidad, auditoría, fiscal y finanzas con visión estratégica para la toma de decisiones."],
    ["Derecho", "", "R.V.O.E NO 20090325", "Conviértete en un profesional del derecho con sólidas bases jurídicas, ética y capacidad de argumentación para defender la justicia."],
  ];
  const stmt = db.prepare(
    "INSERT INTO licenciaturas (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)"
  );
  licenciaturas.forEach(([nombre, duracion, rvoe, descripcion], i) =>
    stmt.run(nombre, duracion, rvoe, descripcion, i + 1)
  );
}

function seedMaestrias(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM maestrias").get() as any).c;
  if (count > 0) return;
  const maestrias: [string, string, string, string][] = [
    ["Perito Valuador", "", "R.V.O.E NO 2009327", "Especialízate en valuación de bienes muebles e inmuebles con reconocimiento profesional para dictaminar con autoridad técnica."],
    ["Educación Media Superior y Superior", "", "R.V.O.E NO 20090330", "Desarrolla competencias pedagógicas, didácticas y de gestión para transformar la docencia y liderar instituciones educativas."],
    ["Derecho Fiscal", "", "R.V.O.E NO 20110105", "Domina el marco tributario mexicano, la defensa fiscal y la planeación de obligaciones para asesorar a empresas y particulares."],
    ["Criminología", "", "R.V.O.E NO 2009328", "Analiza el fenómeno delictivo desde una perspectiva científica, forense y social para contribuir a la seguridad y la justicia."],
  ];
  const stmt = db.prepare(
    "INSERT INTO maestrias (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)"
  );
  maestrias.forEach(([nombre, duracion, rvoe, descripcion], i) =>
    stmt.run(nombre, duracion, rvoe, descripcion, i + 1)
  );
}

function seedHorarios(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM horarios").get() as any).c;
  if (count > 0) return;
  const stmt = db.prepare(
    "INSERT INTO horarios (dia, apertura, cierre, duracion_min, activo) VALUES (?, ?, ?, ?, ?)"
  );
  // 0=Domingo, 1=Lunes ... 6=Sábado
  for (let dia = 0; dia <= 6; dia++) {
    if (dia >= 1 && dia <= 5) {
      stmt.run(dia, "09:00", "16:00", 30, 1); // Lunes a Viernes 9am-4pm, 30 min
    } else {
      stmt.run(dia, "09:00", "16:00", 30, 0); // Sábado y Domingo cerrados
    }
  }
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export function getUserByUsername(username: string): any {
  return getDb().prepare("SELECT * FROM users WHERE username = ?").get(username);
}

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
export function getConfig(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM site_config").all() as any[];
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}
export function updateConfig(data: Record<string, string>) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO site_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  for (const [k, v] of Object.entries(data)) stmt.run(k, v);
  return getConfig();
}

// ─────────────────────────────────────────────
// SETTINGS (clave-valor para tokens OAuth, etc.)
// ─────────────────────────────────────────────
export function getSetting(key: string): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as any;
  return row?.value ?? "";
}
export function setSetting(key: string, value: string) {
  getDb()
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, value);
}

// ─────────────────────────────────────────────
// LICENCIATURAS
// ─────────────────────────────────────────────
export function getLicenciaturas(): any[] {
  return getDb().prepare("SELECT * FROM licenciaturas WHERE activo = 1 ORDER BY orden, id").all();
}
export function getLicenciaturasAll(): any[] {
  return getDb().prepare("SELECT * FROM licenciaturas ORDER BY orden, id").all();
}
export function getLicenciaturaById(id: number): any {
  return getDb().prepare("SELECT * FROM licenciaturas WHERE id = ?").get(id);
}
export function createLicenciatura(data: any): number {
  const db = getDb();
  const maxRow = db.prepare("SELECT MAX(orden) as m FROM licenciaturas").get() as any;
  const r = db
    .prepare("INSERT INTO licenciaturas (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)")
    .run(data.nombre, data.duracion || "", data.rvoe || "", data.descripcion || "", (maxRow?.m ?? 0) + 1);
  return Number(r.lastInsertRowid);
}
export function updateLicenciatura(id: number, data: any) {
  const a = getLicenciaturaById(id);
  if (!a) return;
  getDb()
    .prepare("UPDATE licenciaturas SET nombre=?, duracion=?, rvoe=?, descripcion=?, orden=?, activo=? WHERE id=?")
    .run(
      data.nombre ?? a.nombre,
      data.duracion ?? a.duracion,
      data.rvoe ?? a.rvoe,
      data.descripcion ?? a.descripcion,
      data.orden ?? a.orden,
      data.activo !== undefined ? data.activo : a.activo,
      id
    );
}
export function deleteLicenciatura(id: number) {
  getDb().prepare("DELETE FROM licenciaturas WHERE id = ?").run(id);
}

// ─────────────────────────────────────────────
// MAESTRÍAS
// ─────────────────────────────────────────────
export function getMaestrias(): any[] {
  return getDb().prepare("SELECT * FROM maestrias WHERE activo = 1 ORDER BY orden, id").all();
}
export function getMaestriasAll(): any[] {
  return getDb().prepare("SELECT * FROM maestrias ORDER BY orden, id").all();
}
export function getMaestriaById(id: number): any {
  return getDb().prepare("SELECT * FROM maestrias WHERE id = ?").get(id);
}
export function createMaestria(data: any): number {
  const db = getDb();
  const maxRow = db.prepare("SELECT MAX(orden) as m FROM maestrias").get() as any;
  const r = db
    .prepare("INSERT INTO maestrias (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)")
    .run(data.nombre, data.duracion || "", data.rvoe || "", data.descripcion || "", (maxRow?.m ?? 0) + 1);
  return Number(r.lastInsertRowid);
}
export function updateMaestria(id: number, data: any) {
  const a = getMaestriaById(id);
  if (!a) return;
  getDb()
    .prepare("UPDATE maestrias SET nombre=?, duracion=?, rvoe=?, descripcion=?, orden=?, activo=? WHERE id=?")
    .run(
      data.nombre ?? a.nombre,
      data.duracion ?? a.duracion,
      data.rvoe ?? a.rvoe,
      data.descripcion ?? a.descripcion,
      data.orden ?? a.orden,
      data.activo !== undefined ? data.activo : a.activo,
      id
    );
}
export function deleteMaestria(id: number) {
  getDb().prepare("DELETE FROM maestrias WHERE id = ?").run(id);
}

// ─────────────────────────────────────────────
// HORARIOS
// ─────────────────────────────────────────────
export function getHorarios(): any[] {
  return getDb().prepare("SELECT * FROM horarios ORDER BY dia").all();
}
export function updateHorario(id: number, data: any) {
  const h = getDb().prepare("SELECT * FROM horarios WHERE id = ?").get(id) as any;
  if (!h) return;
  getDb()
    .prepare("UPDATE horarios SET apertura=?, cierre=?, duracion_min=?, activo=? WHERE id=?")
    .run(
      data.apertura ?? h.apertura,
      data.cierre ?? h.cierre,
      data.duracion_min ?? h.duracion_min,
      data.activo !== undefined ? data.activo : h.activo,
      id
    );
}

// ─────────────────────────────────────────────
// CITAS
// ─────────────────────────────────────────────
export function getCitas(): any[] {
  return getDb().prepare("SELECT * FROM citas ORDER BY fecha DESC, hora ASC").all();
}
export function getCitasByFecha(fecha: string): any[] {
  return getDb()
    .prepare("SELECT * FROM citas WHERE fecha = ? ORDER BY hora ASC")
    .all(fecha);
}
export function getCitaById(id: number): any {
  return getDb().prepare("SELECT * FROM citas WHERE id = ?").get(id);
}
export function createCita(data: any): number {
  const r = getDb()
    .prepare(
      "INSERT INTO citas (nombre, telefono, email, interes, fecha, hora, duracion_min, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.nombre,
      data.telefono || "",
      data.email || "",
      data.interes || "",
      data.fecha,
      data.hora,
      data.duracion_min || 30,
      data.notas || ""
    );
  return Number(r.lastInsertRowid);
}
export function updateCita(id: number, data: any) {
  const c = getCitaById(id);
  if (!c) return;
  getDb()
    .prepare(
      "UPDATE citas SET nombre=?, telefono=?, email=?, interes=?, fecha=?, hora=?, duracion_min=?, estado=?, notas=?, google_event_id=? WHERE id=?"
    )
    .run(
      data.nombre ?? c.nombre,
      data.telefono ?? c.telefono,
      data.email ?? c.email,
      data.interes ?? c.interes,
      data.fecha ?? c.fecha,
      data.hora ?? c.hora,
      data.duracion_min ?? c.duracion_min,
      data.estado ?? c.estado,
      data.notas ?? c.notas,
      data.google_event_id ?? c.google_event_id,
      id
    );
}
export function updateCitaEstado(id: number, estado: string) {
  getDb().prepare("UPDATE citas SET estado = ? WHERE id = ?").run(estado, id);
}
export function updateCitaGoogleEventId(id: number, googleEventId: string) {
  getDb().prepare("UPDATE citas SET google_event_id = ? WHERE id = ?").run(googleEventId, id);
}
export function deleteCita(id: number) {
  getDb().prepare("DELETE FROM citas WHERE id = ?").run(id);
}
export function getCitasDelDia(): any[] {
  const hoy = getMexicoDate();
  return getDb()
    .prepare("SELECT * FROM citas WHERE fecha = ? AND estado != 'cancelada' ORDER BY hora ASC")
    .all(hoy);
}

export function getHorasDisponibles(fecha: string): string[] {
  const day = new Date(fecha + "T12:00:00").getDay();
  const horario = getDb().prepare("SELECT * FROM horarios WHERE dia = ?").get(day) as any;
  if (!horario || !horario.activo) return [];

  const citasDelDia = getDb()
    .prepare("SELECT hora, duracion_min FROM citas WHERE fecha = ? AND estado != 'cancelada'")
    .all(fecha) as any[];

  // Marcar rangos ocupados por citas existentes
  const ocupados = new Set<string>();
  for (const c of citasDelDia) {
    const start = timeToMinutes(c.hora);
    const dur = c.duracion_min || horario.duracion_min || 30;
    for (let t = start; t < start + dur; t += horario.duracion_min || 30) {
      ocupados.add(minutesToTime(t));
    }
  }

  const hoy = getMexicoDate();
  const ahoraMin = fecha === hoy ? getMexicoMinutesNow() : 0;

  const inicio = timeToMinutes(horario.apertura);
  const fin = timeToMinutes(horario.cierre);
  const dur = horario.duracion_min || 30;

  const disponibles: string[] = [];
  for (let t = inicio; t + dur <= fin; t += dur) {
    const slot = minutesToTime(t);
    if (fecha === hoy && t < ahoraMin) continue;
    if (!ocupados.has(slot)) disponibles.push(slot);
  }
  return disponibles;
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
export function getDashboardStats(): any {
  const db = getDb();
  const hoy = getMexicoDate();
  const citasHoy = (db
    .prepare("SELECT COUNT(*) as c FROM citas WHERE fecha = ? AND estado != 'cancelada'")
    .get(hoy) as any).c;
  const citasPendientes = (db
    .prepare("SELECT COUNT(*) as c FROM citas WHERE estado = 'pendiente'")
    .get() as any).c;
  const totalCitas = (db.prepare("SELECT COUNT(*) as c FROM citas").get() as any).c;
  const totalLicenciaturas = (db.prepare("SELECT COUNT(*) as c FROM licenciaturas WHERE activo = 1").get() as any).c;
  const totalMaestrias = (db.prepare("SELECT COUNT(*) as c FROM maestrias WHERE activo = 1").get() as any).c;
  const totalConversaciones = (db.prepare("SELECT COUNT(*) as c FROM conversations").get() as any).c;
  return { citasHoy, citasPendientes, totalCitas, totalLicenciaturas, totalMaestrias, totalConversaciones };
}

// ─────────────────────────────────────────────
// CONVERSACIONES / CHAT WHATSAPP
// ─────────────────────────────────────────────
export function getConnectionState(): any {
  const row = getDb()
    .prepare("SELECT status, qr_string, pairing_code, phone FROM connection_state WHERE id = 1")
    .get() as any;
  if (!row) return null;
  return {
    status: row.status,
    qrString: row.qr_string ?? null,
    pairingCode: row.pairing_code ?? null,
    phone: row.phone ?? null,
  };
}
export function setConnectionState(state: {
  status: string;
  qrString?: string | null;
  pairingCode?: string | null;
  phone?: string | null;
}) {
  getDb()
    .prepare(
      "UPDATE connection_state SET status = ?, qr_string = ?, pairing_code = ?, phone = ?, updated_at = unixepoch() WHERE id = 1"
    )
    .run(state.status, state.qrString ?? null, state.pairingCode ?? null, state.phone ?? null);
}

export function getConversations(): any[] {
  return getDb()
    .prepare(
      `SELECT c.*, m.content AS last_message, m.role AS last_role
       FROM conversations c
       LEFT JOIN (SELECT conversation_id, content, role FROM messages WHERE id IN (SELECT MAX(id) FROM messages GROUP BY conversation_id)) m
       ON m.conversation_id = c.id
       ORDER BY c.last_message_at DESC`
    )
    .all();
}
export function getConversationById(id: number): any {
  return getDb().prepare("SELECT * FROM conversations WHERE id = ?").get(id);
}
export function upsertConversation(phone: string, name?: string, remoteJid?: string) {
  getDb()
    .prepare(
      "INSERT INTO conversations (phone, name, remote_jid, last_message_at) VALUES (?, ?, ?, unixepoch()) ON CONFLICT(phone) DO UPDATE SET name = COALESCE(?, name), remote_jid = COALESCE(?, remote_jid), last_message_at = unixepoch()"
    )
    .run(phone, name ?? null, remoteJid ?? null, name ?? null, remoteJid ?? null);
}
export function findOrCreateConversation(phone: string, name?: string, remoteJid?: string): any {
  const db = getDb();
  let conv = db.prepare("SELECT * FROM conversations WHERE phone = ?").get(phone) as any;
  if (!conv) {
    upsertConversation(phone, name, remoteJid);
    conv = db.prepare("SELECT * FROM conversations WHERE phone = ?").get(phone) as any;
  } else if (name && !conv.name) {
    db.prepare("UPDATE conversations SET name = ? WHERE id = ?").run(name, conv.id);
  }
  if (remoteJid && !conv.remote_jid) {
    db.prepare("UPDATE conversations SET remote_jid = ? WHERE id = ?").run(remoteJid, conv.id);
  }
  return conv;
}
export function setConversationMode(id: number, mode: "AI" | "HUMAN") {
  getDb().prepare("UPDATE conversations SET mode = ? WHERE id = ?").run(mode, id);
}
export function setConversationEmail(id: number, email: string) {
  getDb().prepare("UPDATE conversations SET email = ? WHERE id = ?").run(email, id);
}
export function deleteConversation(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM messages WHERE conversation_id = ?").run(id);
  db.prepare("DELETE FROM conversations WHERE id = ?").run(id);
}
export function getMessages(convId: number, limit = 50): any[] {
  return getDb()
    .prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?")
    .all(convId, limit);
}
export function insertMessage(convId: number, role: "user" | "assistant" | "human", content: string) {
  getDb()
    .prepare("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)")
    .run(convId, role, content);
  getDb().prepare("UPDATE conversations SET last_message_at = unixepoch() WHERE id = ?").run(convId);
}

// ─────────────────────────────────────────────
// AGENT CONFIG
// ─────────────────────────────────────────────
export function getAgentConfig(): any {
  return getDb().prepare("SELECT * FROM agent_config WHERE id = 1").get() as any;
}
export function setAgentConfig(config: {
  delay_ms?: number;
  temperature?: number;
  max_history?: number;
  ia_model?: string;
}) {
  const cur = getAgentConfig();
  getDb()
    .prepare(
      "UPDATE agent_config SET delay_ms = ?, temperature = ?, max_history = ?, ia_model = ? WHERE id = 1"
    )
    .run(
      config.delay_ms ?? cur.delay_ms,
      config.temperature ?? cur.temperature,
      config.max_history ?? cur.max_history,
      config.ia_model ?? cur.ia_model
    );
}
export function getAgentPrompt(): string {
  const row = getDb().prepare("SELECT prompt FROM agent_prompt WHERE id = 1").get() as any;
  return row?.prompt ?? "";
}
export function setAgentPrompt(prompt: string) {
  getDb()
    .prepare(
      "INSERT INTO agent_prompt (id, prompt, updated_at) VALUES (1, ?, unixepoch()) ON CONFLICT(id) DO UPDATE SET prompt = ?, updated_at = unixepoch()"
    )
    .run(prompt, prompt);
}

// ─────────────────────────────────────────────
// CONTEXTO DEL SISTEMA (para el agente IA)
// ─────────────────────────────────────────────
export function buildSchoolContext(): string {
  const cfg = getConfig();
  const lic = getLicenciaturas();
  const mae = getMaestrias();
  const horarios = getHorarios().filter((h: any) => h.activo);

  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  let ctx = `=== INFORMACIÓN OFICIAL DE LA UNIVERSIDAD ===\n`;
  ctx += `Nombre: ${cfg.universidad} (${cfg.marca})\n`;
  ctx += `Eslogan: ${cfg.eslogan}\n`;
  ctx += `Dirección: ${cfg.direccion}, Col. ${cfg.colonia}, ${cfg.ciudad}, ${cfg.estado} C.P. ${cfg.cp}\n`;
  ctx += `Teléfono: ${cfg.telefono}\n`;
  ctx += `Email: ${cfg.email}\n`;
  ctx += `Facebook: ${cfg.facebook}\n\n`;

  ctx += `=== LICENCIATURAS E INGENIERÍA ===\n`;
  lic.forEach((l: any) => {
    ctx += `* ${l.nombre}${l.duracion ? " (" + l.duracion + ")" : ""}${l.rvoe ? " — " + l.rvoe : ""}\n`;
    if (l.descripcion) ctx += `  ${l.descripcion}\n`;
  });

  ctx += `\n=== MAESTRÍAS ===\n`;
  mae.forEach((m: any) => {
    ctx += `* ${m.nombre}${m.duracion ? " (" + m.duracion + ")" : ""}${m.rvoe ? " — " + m.rvoe : ""}\n`;
    if (m.descripcion) ctx += `  ${m.descripcion}\n`;
  });

  ctx += `\n=== HORARIOS DE ATENCIÓN (pláticas informativas) ===\n`;
  horarios.forEach((h: any) => {
    ctx += `* ${dias[h.dia]}: ${h.apertura} a ${h.cierre} (citas de ${h.duracion_min} min)\n`;
  });

  return ctx;
}
