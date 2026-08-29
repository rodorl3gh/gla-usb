import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, ElementType } from "react";
import {
  Brain,
  Globe2,
  Cpu,
  Calculator,
  Scale,
  Gavel,
  GraduationCap,
  ShieldCheck,
  Search,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  BadgeCheck,
  Award,
  Star,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Users,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Reveal from "@/components/landing/Reveal";
import ScrollbarTheme from "@/components/landing/ScrollbarTheme";
import { getConfig, getLicenciaturas, getMaestrias } from "@/lib/db";

const LIC_ICONS: Record<string, LucideIcon> = {
  psicología: Brain,
  psicologia: Brain,
  "comercio internacional y mercadotecnia": Globe2,
  "ingeniería en sistemas y desarrollo de software": Cpu,
  "ingenieria en sistemas y desarrollo de software": Cpu,
  "contaduría pública y finanzas": Calculator,
  "contaduria publica y finanzas": Calculator,
  derecho: Scale,
};

const MAESTRIA_ICONS: Record<string, LucideIcon> = {
  "perito valuador": Search,
  "educación media superior y superior": GraduationCap,
  "educacion media superior y superior": GraduationCap,
  "derecho fiscal": Gavel,
  criminología: ShieldCheck,
  criminologia: ShieldCheck,
};

function iconFor(nombre: string, map: Record<string, LucideIcon>, fallback: LucideIcon) {
  return map[nombre.trim().toLowerCase()] || fallback;
}

function waLink(whatsapp: string, text: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

function titleCase(s?: string) {
  if (!s) return "";
  return s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export default function Home() {
  const cfg = getConfig();
  const licenciaturas = getLicenciaturas();
  const maestrias = getMaestrias();

  const whatsapp = cfg.whatsapp || "524111364713";
  const wa = waLink(
    whatsapp,
    "Hola, vengo de su página web. Quiero información sobre las licenciaturas y maestrías."
  );

  const valores: { icon: LucideIcon; titulo: string; texto: string }[] = [
    { icon: BadgeCheck, titulo: "RVOE oficial", texto: "Programas con Reconocimiento de Validez Oficial de Estudios ante la SEP." },
    { icon: Users, titulo: "Grupos reducidos", texto: "Atención personalizada y acompañamiento cercano durante toda tu formación." },
    { icon: Award, titulo: "Formación integral", texto: "Formación profesional con valores, ética y visión real del mundo laboral." },
  ];

  const razones = [
    { icon: CheckCircle2, titulo: "Horarios flexibles", texto: "Compatibles con tu trabajo y tu vida." },
    { icon: BookOpen, titulo: "Plan de estudios actualizado", texto: "Diseñado para el mercado laboral actual." },
    { icon: MapPin, titulo: "Ubicación céntrica", texto: "En el corazón de Celaya, Guanajuato." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: cfg.universidad,
    alternateName: cfg.marca,
    slogan: cfg.eslogan,
    description: cfg.tagline,
    url: "https://universidadsuperiorbajio.edu.mx",
    logo: "https://universidadsuperiorbajio.edu.mx/logo-square.jpg",
    telephone: cfg.telefono,
    email: cfg.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: cfg.direccion,
      addressLocality: cfg.ciudad,
      addressRegion: cfg.estado,
      postalCode: cfg.cp,
      addressCountry: "MX",
    },
  };

  return (
    <div style={{ backgroundColor: "#fff", color: "var(--brand-text)", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ScrollbarTheme />

      <Navbar marca={cfg.marca} telefono={cfg.telefono} />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
      </svg>

      {/* -- HERO ----------------------------------- */}
      <section
        id="inicio"
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          backgroundImage: "url(/fondo.avif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.38) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "7rem 1.5rem 6rem", position: "relative", width: "100%" }}>
          <Reveal>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1rem",
                borderRadius: "2rem",
                backgroundColor: "rgba(245,188,25,0.16)",
                border: "1px solid rgba(245,188,25,0.4)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--brand-gold)",
                marginBottom: "1.5rem",
              }}
            >
              <GraduationCap size={14} /> Universidad · {cfg.ciudad}, {cfg.estado}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1
              style={{
                fontSize: "clamp(2.3rem, 5.5vw, 3.6rem)",
                fontWeight: 800,
                margin: "0 0 1.25rem",
                lineHeight: 1.06,
                fontFamily: "var(--font-display)",
                maxWidth: "760px",
              }}
            >
              Forma tu futuro en la{" "}
              <span style={{ color: "var(--brand-gold)" }}>Universidad Superior Bajío</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.6,
                color: "#e8eef3",
                maxWidth: "560px",
                margin: "0 0 2.25rem",
              }}
            >
              {cfg.tagline}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <Link
                href="/agendar"
                className="hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 1.9rem",
                  borderRadius: "2rem",
                  backgroundColor: "var(--brand-gold)",
                  color: "#1a1408",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 12px 30px rgba(245,188,25,0.35)",
                }}
              >
                <CalendarDays size={18} /> Agendar plática informativa
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="hover-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 1.9rem",
                  borderRadius: "2rem",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "3rem" }}>
              {[
                { icon: GraduationCap, label: `${licenciaturas.length} Licenciaturas`, sub: "y 1 ingeniería" },
                { icon: BookOpen, label: `${maestrias.length} Maestrías`, sub: "especializadas" },
                { icon: BadgeCheck, label: "RVOE", sub: "validez oficial" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                  <div
                    style={{
                      width: "2.6rem",
                      height: "2.6rem",
                      borderRadius: "0.8rem",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <s.icon size={18} style={{ color: "var(--brand-gold)" }} />
                  </div>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#c3cdd6" }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider top="#000f26" bottom="#ffffff" />

      {/* -- LICENCIATURAS -------------------------- */}
      <section id="licenciaturas" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
              <span style={{ color: "var(--brand-gold-dark)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Oferta académica
              </span>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 800, margin: "0.75rem 0 0.75rem", fontFamily: "var(--font-display)" }}>
                Licenciaturas e Ingeniería
              </h2>
              <p style={{ color: "var(--brand-text-secondary)", maxWidth: "560px", margin: "0 auto" }}>
                Estudia una carrera profesional con reconocimiento de validez oficial de estudios.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {licenciaturas.map((l: any, i: number) => {
              const Icon = iconFor(l.nombre, LIC_ICONS, GraduationCap);
              return (
                <Reveal key={l.id} delay={(i % 3) * 70}>
                  <div
                    className="hover-lift glass-card"
                    style={{ padding: "1.6rem", display: "flex", flexDirection: "column", height: "100%", borderLeft: "3px solid var(--brand-gold)" }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "0.9rem",
                        backgroundColor: "rgba(0,31,63,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon size={22} color="var(--brand-gold-dark)" />
                    </div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.4rem" }}>{l.nombre}</h3>
                    {l.duracion && (
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brand-gold-dark)", marginBottom: "0.4rem" }}>
                        ⏱ {l.duracion}
                      </div>
                    )}
                    <p style={{ fontSize: "0.85rem", color: "var(--brand-text-secondary)", lineHeight: 1.55, margin: "0 0 1rem", flex: 1 }}>
                      {l.descripcion}
                    </p>
                    {l.rvoe && (
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--brand-text-muted)", letterSpacing: "0.03em" }}>
                        {l.rvoe}
                      </div>
                    )}
                    <Link
                      href={`/agendar?interes=${encodeURIComponent(l.nombre)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        padding: "0.55rem 1rem",
                        borderRadius: "2rem",
                        border: "1.5px solid var(--brand-primary)",
                        color: "var(--brand-primary)",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        alignSelf: "flex-start",
                        marginTop: "1rem",
                      }}
                    >
                      <CalendarDays size={14} /> Me interesa
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider top="#ffffff" bottom="#001f3f" flip />

      {/* -- MAESTRÍAS ------------------------------ */}
      <section id="maestrias" style={{ backgroundColor: "var(--brand-primary)", padding: "5rem 1.5rem", color: "#fff" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
              <span style={{ color: "var(--brand-gold)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Posgrados
              </span>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 800, margin: "0.75rem 0", fontFamily: "var(--font-display)", color: "#fff" }}>
                Maestrías
              </h2>
              <p style={{ color: "var(--brand-text-secondary)", maxWidth: "560px", margin: "0 auto" }}>
                Especialízate y da el siguiente paso en tu desarrollo profesional.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {maestrias.map((m: any, i: number) => {
              const Icon = iconFor(m.nombre, MAESTRIA_ICONS, BookOpen);
              return (
                <Reveal key={m.id} delay={(i % 4) * 60}>
                  <div
                    className="hover-lift"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "1rem",
                      padding: "1.6rem",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderTop: "3px solid var(--brand-gold)",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "0.9rem",
                        backgroundColor: "rgba(245,188,25,0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon size={22} color="var(--brand-gold)" />
                    </div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.4rem", color: "#fff" }}>{m.nombre}</h3>
                    <p style={{ fontSize: "0.85rem", color: "#d5dde5", lineHeight: 1.55, margin: "0 0 1rem", flex: 1 }}>
                      {m.descripcion}
                    </p>
                    {m.rvoe && (
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--brand-gold)", letterSpacing: "0.03em" }}>
                        {m.rvoe}
                      </div>
                    )}
                    <Link
                      href={`/agendar?interes=${encodeURIComponent(m.nombre)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        padding: "0.55rem 1rem",
                        borderRadius: "2rem",
                        border: "1.5px solid var(--brand-gold)",
                        color: "var(--brand-gold)",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        textDecoration: "none",
                        alignSelf: "flex-start",
                        marginTop: "1rem",
                      }}
                    >
                      <CalendarDays size={14} /> Me interesa
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDivider top="#001f3f" bottom="#ffffff" />

      {/* -- NOSOTROS / VALORES --------------------- */}
      <section id="nosotros" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
              <span style={{ color: "var(--brand-gold-dark)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                ¿Por qué la USB?
              </span>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 800, margin: "0.75rem 0", fontFamily: "var(--font-display)" }}>
                {cfg.eslogan}
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {valores.map((v, i) => (
              <Reveal key={v.titulo} delay={i * 80}>
                <div
                  className="hover-lift glass-card"
                  style={{ padding: "2rem", textAlign: "center", height: "100%", borderTop: "3px solid var(--brand-gold)" }}
                >
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "1rem",
                      backgroundColor: "rgba(245,188,25,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.25rem",
                    }}
                  >
                    <v.icon size={26} color="var(--brand-gold-dark)" />
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.6rem" }}>{v.titulo}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--brand-text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    {v.texto}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div
              style={{
                marginTop: "3rem",
                backgroundColor: "var(--brand-primary)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                color: "#fff",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {razones.map((r) => (
                <div key={r.titulo} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <r.icon size={20} style={{ color: "var(--brand-gold)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{r.titulo}.</div>
                    <div style={{ color: "#d5dde5", fontSize: "0.85rem", marginTop: "0.2rem" }}>{r.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider top="#ffffff" bottom="#001f3f" flip />

      {/* -- CONTACTO / CTA ------------------------- */}
      <section id="contacto" style={{ padding: "5rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "#fff" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
              <span style={{ color: "var(--brand-gold)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Contacto
              </span>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.4rem)", fontWeight: 800, margin: "0.75rem 0 0.5rem", fontFamily: "var(--font-display)", color: "#fff" }}>
                Agenda tu plática informativa
              </h2>
              <p style={{ color: "#d5dde5", maxWidth: "520px", margin: "0 auto" }}>
                Conoce nuestras instalaciones y resuelve tus dudas con un asesor académico. Cupo limitado.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <ContactItem icon={Phone} label="Teléfono" value={cfg.telefono} href={`tel:${cfg.telefono.replace(/\s/g, "")}`} />
                <ContactItem icon={WhatsAppIcon} label="WhatsApp" value={cfg.telefono} href={wa} />
                <ContactItem icon={Mail} label="Email" value={cfg.email} href={`mailto:${cfg.email}`} />
                <ContactItem icon={MapPin} label="Dirección" value={`${cfg.direccion}, Col. ${cfg.colonia}, ${cfg.ciudad}, ${cfg.estado} C.P. ${cfg.cp}`} />
                <ContactItem icon={Clock} label="Horario" value={cfg.horarios || `${cfg.dias_atencion} · ${cfg.horario_apertura} a ${cfg.horario_cierre}`} />
                {cfg.facebook && (
                  <ContactItem
                    icon={Facebook}
                    label="Facebook"
                    value={cfg.facebook}
                    href={cfg.facebook_url || `https://facebook.com/${cfg.facebook}`}
                  />
                )}
                <Link
                  href="/agendar"
                  className="hover-lift"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "1rem 1.5rem",
                    borderRadius: "2rem",
                    backgroundColor: "var(--brand-gold)",
                    color: "#1a1408",
                    fontWeight: 700,
                    fontSize: "0.98rem",
                    textDecoration: "none",
                    boxShadow: "0 12px 30px rgba(245,188,25,0.3)",
                  }}
                >
                  <CalendarDays size={18} /> Agendar plática ahora
                </Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <MapCard
                  label={`${titleCase(cfg.ciudad)}, ${titleCase(cfg.estado)}`}
                  address={`${cfg.direccion}, ${cfg.colonia}, ${cfg.ciudad}, ${cfg.estado}`}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -- FOOTER --------------------------------- */}
      <footer style={{ backgroundColor: "#142e42", color: "#d5dde5", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              <Image src="/logo-square.jpg" alt={`Logo ${cfg.universidad}`} width={72} height={72} style={{ objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: "1.2rem" }}>{cfg.marca}</span>
              <span style={{ color: "var(--brand-gold)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>{cfg.eslogan}</span>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", margin: 0, maxWidth: "560px" }}>
            {cfg.direccion}, Col. {cfg.colonia}, {cfg.ciudad}, {cfg.estado} C.P. {cfg.cp}
            <br />
            {cfg.horarios || `${cfg.dias_atencion} · ${cfg.horario_apertura} a ${cfg.horario_cierre}`} · Tel. {cfg.telefono}
          </p>
          <p style={{ fontSize: "0.75rem", opacity: 0.7, margin: 0 }}>
            © {new Date().getFullYear()} {cfg.universidad}. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* -- BOTÓN FLOTANTE WHATSAPP ---------------- */}
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="float-pulse"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 60,
          width: "3.6rem",
          height: "3.6rem",
          borderRadius: "50%",
          backgroundColor: "#25D366",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 28px rgba(37,211,102,0.45)",
          textDecoration: "none",
        }}
      >
        <WhatsAppIcon size={26} />
      </a>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <div
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "0.8rem",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="var(--brand-gold)" />
      </div>
      <div>
        <div style={{ fontSize: "0.72rem", color: "var(--brand-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </div>
        <div style={{ fontWeight: 600, color: "#fff" }}>{value}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", gap: "0.9rem", alignItems: "center", textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>{inner}</div>;
}

function MapCard({ label, address }: { label: string; address: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <MapPin size={16} style={{ color: "var(--brand-gold)" }} />
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>{label}</span>
      </div>
      <div
        style={{
          borderRadius: "1rem",
          overflow: "hidden",
          minHeight: 220,
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <iframe
          title={`Mapa ${label}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 220 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

function WhatsAppIcon({
  size = 20,
  color = "currentColor",
  style,
}: {
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={style}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function WaveDivider({ flip = false }: { top?: string; bottom?: string; flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="wave-divider"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url(/fondo.avif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.32) 100%)",
        }}
      />
      <svg
        className="wave-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      >
        <g className="parallax1">
          <use href="#gentle-wave" x="48" y="0" fill="#142e42" fillOpacity="0.9" />
        </g>
        <g className="parallax2">
          <use href="#gentle-wave" x="48" y="3" fill="#1d3f5a" fillOpacity="0.25" />
        </g>
        <g className="parallax3">
          <use href="#gentle-wave" x="48" y="5" fill="#f5bc19" fillOpacity="0.12" />
        </g>
      </svg>
    </div>
  );
}
