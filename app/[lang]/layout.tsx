import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { PreferencesSync } from "@/components/theme/PreferencesSync";
import { profile } from "@/content";
import { LOCALES, isLocale, t } from "@/lib/i18n";
import { PREPAINT_SCRIPT } from "@/lib/preferences";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!isLocale(locale)) return {};

  const title = `${profile.shortName} — Data Analytics & Business Intelligence`;
  const description = t(profile.metaDescription, locale);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { "es-PE": "/es", en: "/en", "x-default": "/es" },
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/${locale}`,
      siteName: profile.shortName,
      locale: locale === "es" ? "es_PE" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#f2f0ea" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body className="min-h-svh">
        <PreferencesSync />
        {children}
      </body>
    </html>
  );
}
