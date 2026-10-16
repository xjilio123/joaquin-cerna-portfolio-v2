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
 *   3b. [data-process] pins while its stage turns a raw table into a dashboard (lg+)
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

        // 2b ── Section titles fill in, accent lines draw across section edges
        gsap.utils.toArray<HTMLElement>("[data-fill]").forEach((title) => {
          gsap.fromTo(
            title,
            { "--fill": "0%" },
            { "--fill": "100%", ease: "none", scrollTrigger: { trigger: title, start: "top 88%", end: "top 38%", scrub: 0.3 } },
          );
        });
        gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((line) => {
          gsap.fromTo(
            line,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { trigger: line, start: "top 96%", end: "top 45%", scrub: 0.4 } },
          );
        });

        // Pins are created in page order (Método comes before Experiencia) so
        // each one measures its start after the spacer of the one above.
        const media = gsap.matchMedia();

        // 3b ── Process story, desktop only: raw table → clean → star schema → dashboard
        media.add("(min-width: 1024px)", () => {
          const section = document.querySelector<HTMLElement>("[data-process]");
          if (!section) return;
          const q = gsap.utils.selector(section);
          const bodies = q("[data-step-body]");
          const dots = q("[data-process-dot]");
          const DIM = 0.32;
          const activate = (step: number, at: string) => {
            tl.to(bodies, { opacity: (i: number) => (i === step ? 1 : DIM), duration: 0.3 }, at);
            tl.to(dots[step], { borderColor: "var(--accent)", backgroundColor: "var(--accent)", duration: 0.2 }, at);
          };

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: section, start: "top top", end: "+=320%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
          });
          tl.set(bodies, { opacity: (i: number) => (i === 0 ? 1 : DIM) })
            .set(dots[0], { borderColor: "var(--accent)", backgroundColor: "var(--accent)" })
            .fromTo(q("[data-process-rail]"), { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 4.6 }, 0)
            .to({}, { duration: 0.5 }, 0);

          // 02 Clean: wrong cells swap for their fixed value, unfixable rows get struck out.
          tl.addLabel("clean", 0.6);
          activate(1, "clean");
          tl.to(q("[data-raw]"), { opacity: 0, y: -6, stagger: 0.04, duration: 0.35 }, "clean")
            .fromTo(q("[data-clean]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.35 }, "clean+=0.1")
            .fromTo(q("[data-status]"), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.3 }, "clean+=0.35")
            .fromTo(q("[data-strike]"), { scaleX: 0 }, { scaleX: 1, stagger: 0.1, duration: 0.35 }, "clean+=0.5")
            .to(q("[data-dropped]"), { opacity: 0.45, duration: 0.3 }, "clean+=0.6");

          // 03 Model: the table folds into the fact table, the dimensions link in.
          tl.addLabel("model", 2);
          activate(2, "model");
          tl.to(q('[data-layer="table"]'), { opacity: 0, scale: 0.55, duration: 0.45 }, "model")
            .fromTo(q('[data-layer="model"]'), { opacity: 0 }, { opacity: 1, duration: 0.15 }, "model+=0.25")
            .fromTo(q("[data-fact]"), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35 }, "model+=0.25")
            .fromTo(q("[data-link]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.08, duration: 0.35 }, "model+=0.5")
            .fromTo(q("[data-dim]"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.3 }, "model+=0.65");

          // 04 Decide: the model gives way to the dashboard; bars rise, KPI lands.
          tl.addLabel("decide", 3.3);
          activate(3, "decide");
          tl.to(q('[data-layer="model"]'), { opacity: 0, scale: 0.92, duration: 0.35 }, "decide")
            .fromTo(q('[data-layer="dash"]'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, "decide+=0.2")
            .fromTo(q("[data-bar]"), { scaleY: 0 }, { scaleY: 1, stagger: 0.06, duration: 0.4, ease: "power3.out" }, "decide+=0.3")
            .fromTo(q("[data-kpi]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, "decide+=0.55")
            .to({}, { duration: 0.6 });
        });

        // 3 ── Horizontal experience, desktop only
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

      // Arriving on /en#certifications (a language switch, a shared link): the
      // browser jumps to the anchor before the pins add their scroll length, so
      // the section drifts further down. Land again after every refresh until
      // the visitor scrolls on their own.
      const anchor = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (anchor) {
        // Measured a frame after the refresh, once ScrollTrigger has put the scroll position back.
        const land = () =>
          requestAnimationFrame(() => window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY - 16, behavior: "instant" }));
        const release = () => {
          ScrollTrigger.removeEventListener("refresh", land);
          for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(type, release);
        };
        ScrollTrigger.addEventListener("refresh", land);
        for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(type, release, { passive: true });
        const timer = setTimeout(release, 4000);
        cleanups.push(() => {
          clearTimeout(timer);
          release();
        });
      }
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
