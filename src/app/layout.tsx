import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://universidadsuperiorbajio.edu.mx"),
  title: "Universidad Superior Bajío — Celaya, Guanajuato",
  description:
    "Universidad Superior Bajío (USB). Licenciaturas y maestrías con reconocimiento de validez oficial de estudios (RVOE) en Celaya, Guanajuato. Formación Profesional Integral. Agenda tu plática informativa.",
  icons: {
    icon: "/logo-square.jpg",
    apple: "/logo-square.jpg",
  },
  openGraph: {
    title: "Universidad Superior Bajío — Celaya, Guanajuato",
    description:
      "Licenciaturas y maestrías con RVOE en Celaya, Guanajuato. Formación Profesional Integral. Agenda tu plática informativa.",
    images: ["/logo-square.jpg"],
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
