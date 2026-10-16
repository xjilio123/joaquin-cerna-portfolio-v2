import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content";
import { milestones } from "@/content/milestones";
import { isLocale, t, tr } from "@/lib/i18n";
import { curveValue } from "@/lib/chart";

export const alt = "Joaquín Cerna Rojas — Data Analytics & Business Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "assets/og", file));

/** The chart from the hero, drawn as SVG: the same curve through the same milestones. */
function chartPath(width: number, height: number) {
  const steps = 48;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [t * width, height - curveValue(t) * height] as const;
  });
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return { line, area };
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "es";
  const [display, mono, sans] = await Promise.all([
    font("BricolageGrotesque-Bold.ttf"),
    font("GeistMono-Medium.ttf"),
    font("Geist-Regular.ttf"),
  ]);
  const W = 420;
  const H = 230;
  const { line, area } = chartPath(W, H);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(ellipse at 80% 30%, #17244d 0%, #0b0c0f 60%)",
          color: "#f2f0ea",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: 22, letterSpacing: 4, color: "#6b93ff" }}>
          <span>{tr("hero.eyebrow", locale).toUpperCase()}</span>
          <span style={{ color: "#a3a9b5" }}>JCR</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bricolage Grotesque", fontSize: 108, lineHeight: 0.9, letterSpacing: -4 }}>
              <span>Joaquín</span>
              <span>Cerna Rojas</span>
            </div>
            <span style={{ fontSize: 30, color: "#a3a9b5", maxWidth: 560 }}>{profile.headline[locale].join(" ")}</span>
          </div>

          <svg width={W + 20} height={H + 20} viewBox={`-10 -10 ${W + 20} ${H + 20}`}>
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4d7cfe" stopOpacity="0.35" />
                <stop offset="1" stopColor="#4d7cfe" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#fill)" />
            <path d={line} fill="none" stroke="#6b93ff" strokeWidth="4" strokeLinecap="round" />
            {milestones.map((m) => (
              <circle key={m.id} cx={m.t * W} cy={H - curveValue(m.t) * H} r="7" fill="#6b93ff" />
            ))}
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: 20, color: "#a3a9b5" }}>
          <span>{t(profile.location, locale)}</span>
          <span>joaquin-cerna.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: display, weight: 700, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
        { name: "Geist", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
