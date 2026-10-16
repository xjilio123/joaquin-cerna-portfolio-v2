"use client";

import { useEffect } from "react";
import { setLenis } from "@/lib/scroll";

/**
 * Scroll-driven motion for the whole page, loaded after first paint so GSAP
 * and Lenis never delay the content. Marks <html data-motion> while running,
 * which switches on the `fx:` layouts (e.g. the horizontal experience track).
 *
 *   1. Lenis smooth scroll — mouse and trackpad only; touch keeps native momentum
 *   2. [data-scrub] paragraphs light up word by word as they scroll through
 *   3. [data-hscroll] pins and slides its [data-hscroll-track] sideways (lg+)
 *   4. [data-count] numbers count up the first time they are seen
 *   5. [data-tilt] elements lean towards the cursor in 3D
 *
 * Nothing runs with reduced motion; the static page is complete without it.
 */
export function MotionLayer() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];
    let disposed = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      // Only now: if the libraries never arrive, the page stays in its static form.
      html.setAttribute("data-motion", "");

      // 1 ── Smooth scroll
      if (finePointer) {
        const lenis = new Lenis({ lerp: 0.11, anchors: { offset: -16 }, autoRaf: false });
        setLenis(lenis);
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // A modal dialog freezes the page behind it.
        const syncDialogs = () => (document.querySelector("dialog[open]") ? lenis.stop() : lenis.start());
        const dialogs = new MutationObserver(syncDialogs);
        dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

        cleanups.push(() => {
          dialogs.disconnect();
          gsap.ticker.remove(tick);
          lenis.destroy();
          setLenis(null);
        });
      }

      const context = gsap.context(() => {
        // 2 ── Words that light up
        gsap.utils.toArray<HTMLElement>("[data-scrub]").forEach((paragraph) => {
          gsap.fromTo(
            paragraph.querySelectorAll(".scrub-word"),
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.05,
              scrollTrigger: { trigger: paragraph, start: "top 82%", end: "bottom 48%", scrub: 0.4 },
            },
          );
        });

        // 3 ── Horizontal experience, desktop only
        const media = gsap.matchMedia();
        media.add("(min-width: 1024px)", () => {
          const section = document.querySelector<HTMLElement>("[data-hscroll]");
          const track = section?.querySelector<HTMLElement>("[data-hscroll-track]");
          if (!section || !track) return;
          const distance = () => {
            const styles = getComputedStyle(section);
            const inner = section.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
            return Math.max(0, track.scrollWidth - inner);
          };
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        });
      });
      cleanups.push(() => context.revert());

      // 4 ── Counters
      const counters = document.querySelectorAll<HTMLElement>("[data-count]");
      const countObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            countObserver.unobserve(entry.target);
            const element = entry.target as HTMLElement;
            const target = Number(element.dataset.count);
            const state = { value: 0 };
            gsap.to(state, {
              value: target,
              duration: 1.6,
              ease: "power3.out",
              onUpdate: () => {
                element.textContent = String(Math.round(state.value));
              },
            });
          }
        },
        { threshold: 0.6 },
      );
      counters.forEach((element) => {
        if (Number.isNaN(Number(element.dataset.count))) return;
        element.textContent = "0";
        countObserver.observe(element);
      });
      cleanups.push(() => {
        countObserver.disconnect();
        counters.forEach((element) => {
          element.textContent = element.dataset.count ?? element.textContent;
        });
      });

      // 5 ── Tilt (delegated, so cards created later by filters tilt too)
      if (finePointer) {
        const movers = new WeakMap<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();
        let current: HTMLElement | null = null;
        const moverFor = (element: HTMLElement) => {
          let mover = movers.get(element);
          if (!mover) {
            gsap.set(element, { transformPerspective: 900 });
            mover = {
              x: gsap.quickTo(element, "rotationX", { duration: 0.6, ease: "power3.out" }),
              y: gsap.quickTo(element, "rotationY", { duration: 0.6, ease: "power3.out" }),
            };
            movers.set(element, mover);
          }
          return mover;
        };
        const release = () => {
          if (!current) return;
          const mover = moverFor(current);
          mover.x(0);
          mover.y(0);
          current = null;
        };
        const onMove = (event: PointerEvent) => {
          const element = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
          if (element !== current) release();
          if (!element) return;
          current = element;
          const rect = element.getBoundingClientRect();
          const strength = element.dataset.tilt === "strong" ? 9 : 5;
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          const mover = moverFor(element);
          mover.x(-py * strength);
          mover.y(px * strength);
        };
        document.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", release);
        cleanups.push(() => {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerleave", release);
        });
      }

      // Late layout changes (fonts, images) move trigger positions.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh);
      cleanups.push(() => window.removeEventListener("load", refresh));
      refresh();
    })();

    return () => {
      disposed = true;
      cleanups.reverse().forEach((cleanup) => cleanup());
      html.removeAttribute("data-motion");
    };
  }, []);

  return null;
}
