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
    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT DEFAULT '',
      email TEXT DEFAULT '',
      interes TEXT DEFAULT '',
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL,
      estado TEXT CHECK(estado IN ('pendiente','confirmada','completada','cancelada')) NOT NULL DEFAULT 'pendiente',
      notas TEXT DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
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
  horarios: "Lun–Vie 9:00–18:00 · Sábado 9:00–14:00",
  dias_atencion: "Lunes a Sábado",
  horario_apertura: "09:00",
  horario_cierre: "18:00",
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
    "INSERT OR IGNORE INTO licenciaturas (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)"
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
    "INSERT OR IGNORE INTO maestrias (nombre, duracion, rvoe, descripcion, orden) VALUES (?, ?, ?, ?, ?)"
  );
  maestrias.forEach(([nombre, duracion, rvoe, descripcion], i) =>
    stmt.run(nombre, duracion, rvoe, descripcion, i + 1)
  );
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
      "INSERT INTO citas (nombre, telefono, email, interes, fecha, hora, notas) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.nombre,
      data.telefono || "",
      data.email || "",
      data.interes || "",
      data.fecha,
      data.hora,
      data.notas || ""
    );
  return Number(r.lastInsertRowid);
}
export function updateCita(id: number, data: any) {
  const c = getCitaById(id);
  if (!c) return;
  getDb()
    .prepare(
      "UPDATE citas SET nombre=?, telefono=?, email=?, interes=?, fecha=?, hora=?, estado=?, notas=? WHERE id=?"
    )
    .run(
      data.nombre ?? c.nombre,
      data.telefono ?? c.telefono,
      data.email ?? c.email,
      data.interes ?? c.interes,
      data.fecha ?? c.fecha,
      data.hora ?? c.hora,
      data.estado ?? c.estado,
      data.notas ?? c.notas,
      id
    );
}
export function updateCitaEstado(id: number, estado: string) {
  getDb().prepare("UPDATE citas SET estado = ? WHERE id = ?").run(estado, id);
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
  // 0 = Domingo (cerrado), 6 = Sábado (hasta 14:00)
  if (day === 0) return [];

  const citasDelDia = getDb()
    .prepare("SELECT hora FROM citas WHERE fecha = ? AND estado != 'cancelada'")
    .all(fecha) as any[];
  const ocupadas = new Set(citasDelDia.map((c) => c.hora));

  const hoy = getMexicoDate();
  const ahoraMin = fecha === hoy ? getMexicoMinutesNow() : 0;

  const bloques: { start: number; end: number }[] =
    day === 6
      ? [{ start: 9 * 60, end: 14 * 60 }]
      : [{ start: 9 * 60, end: 18 * 60 }];

  const disponibles: string[] = [];
  for (const b of bloques) {
    for (let t = b.start; t + 60 <= b.end; t += 60) {
      const slot = minutesToTime(t);
      if (fecha === hoy && t < ahoraMin) continue;
      if (!ocupadas.has(slot)) disponibles.push(slot);
    }
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
  return { citasHoy, citasPendientes, totalCitas, totalLicenciaturas, totalMaestrias };
}
