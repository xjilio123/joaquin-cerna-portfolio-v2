"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

const read = () => format.format(new Date());

/** Live local time in Lima. Rendered only on the client, so it never mismatches. */
export function LimaClock({ label }: { label: string }) {
  const time = useSyncExternalStore(subscribe, read, () => null);
  return (
    <span className="inline-flex items-center gap-2" title={label}>
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      <span>
        Lima <span className="tabular-nums text-fg">{time ?? "--:--"}</span>
        <span className="sr-only"> · {label}</span>
      </span>
    </span>
  );
}
