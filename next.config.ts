import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
    "sharp",
    "@whiskeysockets/baileys",
    "pino",
    "googleapis",
    "qrcode",
  ],
};

export default nextConfig;
