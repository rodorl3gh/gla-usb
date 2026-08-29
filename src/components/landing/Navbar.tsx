"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, CalendarDays } from "lucide-react";

interface NavbarProps {
  marca: string;
  telefono: string;
}

const links = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#licenciaturas", label: "Licenciaturas" },
  { href: "/#maestrias", label: "Maestrías" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Navbar({ marca, telefono }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        backgroundColor: scrolled ? "var(--brand-primary)" : "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 50,
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.25)" : "none",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Image src="/logo-square.jpg" alt="Logo USB" width={44} height={44} style={{ objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "1.1rem", letterSpacing: "0.02em" }}>
              {marca}
            </span>
            <span style={{ color: "var(--brand-gold)", fontSize: "0.62rem", letterSpacing: "0.28em", fontWeight: 600 }}>
              UNIVERSIDAD SUPERIOR BAJÍO
            </span>
          </div>
        </Link>

        <nav style={{ alignItems: "center", gap: "1.5rem" }} className="hidden md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ color: "#e8eef3", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
              className="hover:text-[var(--brand-gold)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/agendar"
            className="hidden sm:inline-flex"
            style={{
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "2rem",
              backgroundColor: "var(--brand-gold)",
              color: "#1a1408",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <CalendarDays size={16} /> Agendar plática
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
            aria-label="Menú"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          style={{
            backgroundColor: "var(--brand-primary-dark)",
            padding: "0.5rem 1.5rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                color: "#e8f0f7",
                textDecoration: "none",
                padding: "0.6rem 0",
                fontSize: "0.95rem",
                fontWeight: 500,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/agendar"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.75rem",
              padding: "0.7rem 1.25rem",
              borderRadius: "2rem",
              backgroundColor: "var(--brand-gold)",
              color: "#1a1408",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            <CalendarDays size={16} /> Agendar plática
          </Link>
        </nav>
      )}
    </header>
  );
}
