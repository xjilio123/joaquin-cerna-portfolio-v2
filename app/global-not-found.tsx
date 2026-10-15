import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { PREPAINT_SCRIPT } from "@/lib/preferences";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 — Joaquín Cerna Rojas",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="es" suppressHydrationWarning className={`${bricolage.variable} ${geist.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body className="grid min-h-svh place-items-center px-6">
        <div className="text-center">
          <p className="font-display text-[clamp(6rem,20vw,14rem)] font-bold leading-none tracking-[-0.05em] text-accent">
            404
          </p>
          <p className="mt-4 text-muted">Esta página no existe · This page does not exist</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/es" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg">
              Ir al inicio
            </Link>
            <Link href="/en" className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-fg">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
