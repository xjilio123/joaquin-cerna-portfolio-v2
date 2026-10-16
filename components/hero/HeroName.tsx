import { Fragment, type CSSProperties } from "react";

/**
 * The name, split into characters that rise out of a mask one after another.
 * Words stay unbreakable; the full name is exposed once to assistive tech.
 */
const LINES = ["Joaquín", "Cerna Rojas"];

/** Characters with a running index across both lines, for the stagger. */
const STRUCTURE = (() => {
  let index = 0;
  return LINES.map((line) =>
    line.split(" ").map((word) => [...word].map((char) => ({ char, index: index++ }))),
  );
})();

export function HeroName() {
  return (
    <h1
      aria-label={LINES.join(" ")}
      className="font-display text-[clamp(3.6rem,12vw,11rem)] font-bold leading-[0.88] tracking-[-0.045em] text-fg"
    >
      {STRUCTURE.map((words, l) => (
        <span key={LINES[l]} aria-hidden className="hero-line">
          {words.map((chars, w) => (
            <Fragment key={w}>
              {/* The space sits between word boxes: inside an inline-block it would collapse. */}
              {w > 0 ? " " : null}
              <span className="inline-block whitespace-nowrap">
                {chars.map(({ char, index }) => (
                  <span key={index} className="hero-char" style={{ "--i": index } as CSSProperties}>
                    {char}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      ))}
    </h1>
  );
}
