"use client";

import React, { useEffect, useRef, useState } from "react";

/* ================= CONFIG: ekhane bodlale pura section bodlabe ================= */
const PAGE = "#DFE4EF"; // niche exploration band-er bg
const DARK = "#00010a";
const SCROLL_PER_PROJECT = 170; // protita project-er jonno koto svh scroll (barale dhire hobe)
const CLOSE_SCROLL = 130; // shesh-er closing screen-er jonno koto svh scroll

// ei gulo placeholder. nijer project dao.
// img: "/work/one.jpg" dile gradient-er jayga-y tomar chhobi boshbe
const WORK = [
  {
    title: "Northwind Studio",
    cat: "Website",
    year: "2025",
    desc: "A calm, fast portfolio site for an architecture studio.",
    tags: ["Design", "Next.js"],
    href: "#",
    img: "",
    from: "#1d3b78",
    to: "#060b1a",
  },
  {
    title: "Atlas Finance",
    cat: "Product",
    year: "2025",
    desc: "A dashboard that makes money data easy to read.",
    tags: ["UI/UX", "React"],
    href: "#",
    img: "",
    from: "#4b2c82",
    to: "#0b0716",
  },
  {
    title: "Moss & Fern",
    cat: "Brand + Web",
    year: "2024",
    desc: "A new identity and online shop for a plant studio.",
    tags: ["Branding", "Shop"],
    href: "#",
    img: "",
    from: "#1f6a50",
    to: "#04110c",
  },
  {
    title: "Orbit Labs",
    cat: "AI Product",
    year: "2024",
    desc: "A simple front door for a complex AI tool.",
    tags: ["AI", "WebGL"],
    href: "#",
    img: "",
    from: "#8a3a2c",
    to: "#170806",
  },
  {
    title: "Paper Plane",
    cat: "Mobile App",
    year: "2023",
    desc: "A quiet note-taking app built around one gesture.",
    tags: ["iOS", "Android"],
    href: "#",
    img: "",
    from: "#6b6a2a",
    to: "#121208",
  },
];

const INTRO_EYEBROW = "Selected work";
const INTRO_TITLE = "Our work.";

// shesh-er closing screen
const CLOSE_TEXT = "Discover our complete collection of digital experiences, brands, and platforms.";
const CLOSE_LINK_LABEL = "View all projects";
const CLOSE_LINK_HREF = "#";

const EXPLORE_LABEL = "Exploration";
const EXPLORE_TITLE = "Ideas in progress.";
const EXPLORE_INTRO = "Small experiments and studies. Some become projects, some stay ideas.";
const EXPLORE = [
  { title: "Liquid Cursor", tag: "WebGL", note: "A cursor that behaves like water.", href: "#" },
  { title: "Type in Motion", tag: "Typography", note: "Letters that react to scroll.", href: "#" },
  { title: "Grid Study", tag: "Layout", note: "Twelve ways to break a grid.", href: "#" },
  { title: "Particle Field", tag: "Canvas", note: "A calm field of tiny moving dots.", href: "#" },
];
/* ============================================================================== */

const N = WORK.length;
const EASE = "cubic-bezier(0.22,1,0.36,1)";
const EASE_DRAW = "cubic-bezier(0.65,0,0.35,1)";

// scroll timeline (protita project-er 0..1 er moddhe)
const ENTER_B = 0.4; // 0 -> 0.4 : dan theke majhe ashe
const GROW_A = 0.46; // 0.46 -> 0.8 : boro hoye puro screen
const GROW_B = 0.8;
const ACT_AT = 0.74; // ei ponto-r por text animate hoy

// closing screen timeline (0..1)
const CLOSE_UNITS = CLOSE_SCROLL / SCROLL_PER_PROJECT;
const TOTAL_UNITS = N + CLOSE_UNITS;
const CLOSE_A = 0.12; // wipe shuru
const CLOSE_B = 0.62; // wipe shesh
const CLOSE_ACT = 0.52; // ei ponto-r por text animate hoy

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, "0");

/** Element nijei screen-e dhukar thik age trigger hoy */
function useInView<T extends Element>(threshold = 0.1, margin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, margin]);
  return [ref, seen] as const;
}

/** Protita akkhor niche theke uthe ashe (mask reveal) */
function SplitChars({ text, on, start = 0, step = 45 }: { text: string; on: boolean; start?: number; step?: number }) {
  let n = 0;
  return (
    <>
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-[0.22em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
          {word.split("").map((ch, ci) => {
            const delay = start + n++ * step;
            return (
              <span
                key={ci}
                className="inline-block"
                style={{
                  transform: on ? "translateY(0)" : "translateY(118%)",
                  transition: `transform 1200ms ${EASE} ${delay}ms`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

/* ---------------- pinned scroll showcase ---------------- */
function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]); // 0..N-1 = project, N = closing
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closeRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  const [introRefIn, introSeen] = useInView<HTMLDivElement>(0.25, "0px");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let sw = 0;
    let sh = 0;
    let target = 0;
    let cur = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let lastActive = -2;
    let lastIdx = -1;

    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      sw = clamp(vw * 0.42, 250, 560);
      if (vw < 640) sw = vw * 0.7;
      sh = Math.min(sw * 0.74, vh * 0.58);
    };

    const readTarget = () => {
      const r = container.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? clamp(-r.top / total) : 0;
    };

    // React re-render chhara, shorashori DOM-e likhi -> scroll-e jhatka lage na
    const render = (p: number) => {
      const g = p * TOTAL_UNITS;
      const us = WORK.map((_, i) => clamp(g - i));
      const uc = clamp((g - N) / CLOSE_UNITS);
      const closeGrow = easeInOutCubic(seg(uc, CLOSE_A, CLOSE_B));
      const grows = us.map((u) => easeInOutCubic(seg(u, GROW_A, GROW_B)));

      let act = -1;
      let cnt = 0;

      WORK.forEach((_, i) => {
        const u = us[i];
        const enter = easeInOutCubic(seg(u, 0, ENTER_B));
        const grow = grows[i];
        const nextGrow = i < N - 1 ? grows[i + 1] : closeGrow;

        // 1) dan dike theke majhe ashe
        const x = (1 - enter) * (vw / 2 + sw / 2 + 40);
        const layer = layerRefs.current[i];
        if (layer) layer.style.transform = `translate3d(${x.toFixed(2)}px,0,0) scale(${(1 - 0.05 * nextGrow).toFixed(4)})`;

        // 2) clip-path: chhoto card -> puro screen
        const l = lerp((vw - sw) / 2, 0, grow);
        const t = lerp((vh - sh) / 2, 0, grow);
        const card = cardRefs.current[i];
        if (card)
          card.style.clipPath = `inset(${t.toFixed(2)}px ${l.toFixed(2)}px ${t.toFixed(2)}px ${l.toFixed(2)}px round ${lerp(20, 0, grow).toFixed(2)}px)`;

        // 3) bhitore-r chhobi dhire zoom-out hoy
        const bg = bgRefs.current[i];
        if (bg) bg.style.transform = `scale(${lerp(1.22, 1, grow).toFixed(4)})`;

        // 4) porer card (ba closing screen) ashle ager card dark hoy
        const dim = dimRefs.current[i];
        if (dim) dim.style.opacity = (0.6 * nextGrow).toFixed(3);

        // 5) chhoto card-er caption
        const cap = capRefs.current[i];
        if (cap) cap.style.opacity = (1 - seg(u, GROW_A, GROW_A + 0.1)).toFixed(3);

        if (u >= ACT_AT) act = i;
        if (u >= 0.5) cnt = i;
      });

      // closing screen: niche theke wipe hoye uthe ashe
      const cl = closeRef.current;
      if (cl) {
        const r = lerp(48, 0, closeGrow);
        cl.style.clipPath = `inset(${((1 - closeGrow) * 100).toFixed(3)}% 0 0 0 round ${r.toFixed(2)}px ${r.toFixed(2)}px 0 0)`;
      }
      if (uc >= CLOSE_ACT) act = N;

      // closing ashle dark HUD (frame, counter, line) fade out hoy
      if (hudRef.current) hudRef.current.style.opacity = (1 - seg(closeGrow, 0, 0.6)).toFixed(3);

      if (act !== lastActive) {
        lastActive = act;
        layerRefs.current.forEach((l, i) => {
          if (!l) return;
          l.dataset.on = i === act ? "1" : "0";
          l.toggleAttribute("inert", i !== act);
        });
      }
      if (cnt !== lastIdx) {
        lastIdx = cnt;
        if (counterRef.current) counterRef.current.textContent = pad(cnt + 1);
      }

      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(g / N).toFixed(4)})`;

      // intro: scroll-e upore uthe fade hoy
      const ip = seg(g, 0.02, 0.42);
      if (introRef.current) {
        introRef.current.style.opacity = (1 - ip).toFixed(3);
        introRef.current.style.transform = `translate3d(0,${(-ip * 70).toFixed(2)}px,0) scale(${(1 - ip * 0.06).toFixed(4)})`;
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      // makhon-er moto dhire follow kore (mouse-wheel-er dhap-gulo smooth hoye jay)
      cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - cur) < 0.00008) cur = target;
      render(cur);
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => readTarget();
    const onResize = () => {
      measure();
      readTarget();
      render(cur);
    };

    measure();
    readTarget();
    cur = target;
    render(cur);

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!running) {
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(loop);
          }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    io.observe(container);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const d = (ms: number) => ({ ["--d" as string]: ms }) as React.CSSProperties;
  const closeWords = CLOSE_TEXT.split(" ");
  const linkDelay = 150 + closeWords.length * 55 + 250;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${N * SCROLL_PER_PROJECT + CLOSE_SCROLL + 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden text-white" style={{ background: DARK }}>
        {/* ---- intro: "Our work." (akkhor niche theke uthe ashe) ---- */}
        <div ref={introRef} className="absolute inset-0 z-0" style={{ willChange: "transform, opacity" }}>
          <div ref={introRefIn} className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60"
              style={{
                opacity: introSeen ? 1 : 0,
                transform: introSeen ? "none" : "translateY(16px)",
                transition: `opacity 900ms ${EASE} 100ms, transform 1000ms ${EASE} 100ms`,
              }}
            >
              <span className="sw-spin inline-block h-2 w-2 bg-white" />
              {INTRO_EYEBROW}
            </div>

            <h2
              className="mt-6 font-medium leading-[0.92] tracking-[-0.055em]"
              style={{ fontSize: "clamp(64px, 14vw, 240px)" }}
            >
              <SplitChars text={INTRO_TITLE} on={introSeen} start={250} step={55} />
            </h2>

            {/* nijer theke ankha line */}
            <span
              aria-hidden
              className="mt-10 block h-px w-[min(320px,60vw)] origin-left bg-white/40"
              style={{
                transform: introSeen ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 1500ms ${EASE_DRAW} 900ms`,
              }}
            />

            <div
              className="mt-8 flex flex-col items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60"
              style={{
                opacity: introSeen ? 1 : 0,
                transition: `opacity 1000ms ${EASE} 1300ms`,
              }}
            >
              Scroll
              <span className="relative block h-12 w-px overflow-hidden bg-white/20">
                <span className="sw-drop absolute left-0 top-0 block h-1/2 w-full bg-white" />
              </span>
            </div>
          </div>
        </div>

        {/* ---- project cards ---- */}
        {WORK.map((w, i) => (
          <div
            key={w.title}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            data-on="0"
            // inert: shudhu active card-er link click kora jay
            {...({ inert: true } as object)}
            className="sw-layer absolute inset-0"
            style={{ zIndex: i + 1, transform: "translate3d(110vw,0,0)", willChange: "transform" }}
          >
            <div
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 overflow-hidden"
              style={{ background: DARK, willChange: "clip-path" }}
            >
              {/* background */}
              <div
                ref={(el) => {
                  bgRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ willChange: "transform" }}
              >
                {w.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.img} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${w.from}, ${w.to})` }} />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.25))" }}
                />
                {/* boro outline number */}
                <div
                  aria-hidden
                  className="sw-num absolute -right-[2vw] top-[8%] select-none font-medium leading-none tracking-[-0.06em]"
                  style={{
                    fontSize: "clamp(220px, 42vw, 720px)",
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(255,255,255,0.22)",
                  }}
                >
                  {pad(i + 1)}
                </div>
              </div>

              {/* next card / closing screen ashle dark hoye jay */}
              <div
                ref={(el) => {
                  dimRefs.current[i] = el;
                }}
                className="pointer-events-none absolute inset-0 bg-black"
                style={{ opacity: 0 }}
              />

              {/* chhoto card-er majhe-r caption */}
              <div
                ref={(el) => {
                  capRefs.current[i] = el;
                }}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                  {pad(i + 1)} / {pad(N)}
                </span>
                <span className="text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{w.title}</span>
              </div>

              {/* puro text (card boro hole ek ek kore animate hoy) */}
              <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-24 sm:px-14 lg:px-[72px] lg:pb-28">
                <div className="overflow-hidden pb-1">
                  <div
                    className="sw-line flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/80"
                    style={d(0)}
                  >
                    <span>{w.cat}</span>
                    <span className="h-px w-8 bg-white/50" />
                    <span>{w.year}</span>
                  </div>
                </div>

                <h3
                  className="mt-4 max-w-[1100px] font-medium leading-[0.92] tracking-[-0.055em]"
                  style={{ fontSize: "clamp(52px, 10.5vw, 176px)" }}
                >
                  <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                    <span className="sw-line block" style={d(120)}>
                      {w.title}
                    </span>
                  </span>
                </h3>

                <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
                  <p
                    className="sw-fade max-w-[380px] font-serif text-lg italic leading-snug text-white/85 sm:text-xl"
                    style={d(420)}
                  >
                    {w.desc}
                  </p>

                  <div className="sw-fade flex flex-wrap items-center gap-3" style={d(540)}>
                    <a
                      href={w.href}
                      className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b0f17] transition-transform duration-300 hover:scale-[1.04]"
                    >
                      View project
                      <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
                    </a>
                    {w.tags.map((t) => (
                      <span
                        key={t}
                        className="hidden rounded-full border border-white/35 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 sm:inline-block"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ---- closing screen: 5 no project-er por ---- */}
        <div
          ref={(el) => {
            layerRefs.current[N] = el;
          }}
          data-on="0"
          {...({ inert: true } as object)}
          className="sw-layer absolute inset-0"
          style={{ zIndex: N + 1 }}
        >
          <div
            ref={closeRef}
            className="absolute inset-0 flex items-center justify-center px-6"
            style={{
              clipPath: "inset(100% 0 0 0 round 48px 48px 0 0)",
              background: `radial-gradient(ellipse 85% 75% at 50% 50%, #DFE4EF 0%, ${PAGE} 100%)`,
              color: DARK,
              willChange: "clip-path",
            }}
          >
            {/* dark frame + ghurno kon-er box (loader-er motif) */}
            <div aria-hidden className="pointer-events-none absolute inset-3 border sm:inset-5" style={{ borderColor: "rgba(11,15,23,0.2)" }}>
              {[
                { top: 0, left: 0 },
                { top: 0, left: "100%" },
                { top: "100%", left: "100%" },
                { top: "100%", left: 0 },
              ].map((pos, k) => (
                <span key={k} className="absolute h-[11px] w-[11px]" style={{ marginLeft: -5.5, marginTop: -5.5, ...pos }}>
                  <span className="sw-spin block h-full w-full" style={{ background: DARK }} />
                </span>
              ))}
            </div>

            <div className="relative flex max-w-[780px] flex-col items-center text-center">
              <p
                className="font-medium leading-[1.08] tracking-[-0.045em]"
                style={{ fontSize: "clamp(30px, 4.4vw, 68px)" }}
              >
                {closeWords.map((word, wi) => (
                  <span key={wi} className="mr-[0.24em] inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
                    <span className="sw-line inline-block" style={d(100 + wi * 55)}>
                      {word}
                    </span>
                  </span>
                ))}
              </p>

              <div className="sw-fade mt-12" style={d(linkDelay)}>
                <a
                  href={CLOSE_LINK_HREF}
                  className="group relative inline-flex items-center gap-10 pb-3 font-mono text-[13px] uppercase tracking-[0.08em] sm:text-sm"
                >
                  {CLOSE_LINK_LABEL}
                  <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                  <span
                    aria-hidden
                    className="sw-uline absolute bottom-0 left-0 h-px w-full"
                    style={{ ...d(linkDelay + 150), background: DARK }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ---- HUD: frame + counter + progress (closing ashle fade out) ---- */}
        <div ref={hudRef} className="pointer-events-none absolute inset-0 z-[40]">
          {/* frame + 4 ghurno kon-er box (loader-er motif) */}
          <div aria-hidden className="absolute inset-3 border border-white/25 sm:inset-5">
            {[
              { top: 0, left: 0 },
              { top: 0, left: "100%" },
              { top: "100%", left: "100%" },
              { top: "100%", left: 0 },
            ].map((pos, k) => (
              <span key={k} className="absolute h-[11px] w-[11px]" style={{ marginLeft: -5.5, marginTop: -5.5, ...pos }}>
                <span className="sw-spin block h-full w-full bg-white" />
              </span>
            ))}
          </div>

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-8 pt-9 text-white sm:px-14 sm:pt-12 lg:px-[72px]">
            <div className="text-xs font-semibold uppercase tracking-[0.22em]">Selected work</div>
            <div className="flex items-baseline gap-2 text-xs font-semibold tabular-nums tracking-[0.2em]">
              <span ref={counterRef} className="text-2xl font-light tracking-[-0.03em] sm:text-3xl">
                01
              </span>
              <span className="text-white/60">/ {pad(N)}</span>
            </div>
          </div>

          {/* scroll progress line */}
          <div className="absolute inset-x-0 bottom-0 px-8 pb-9 sm:px-14 sm:pb-12 lg:px-[72px]">
            <div className="relative h-[2px] w-full bg-white/25">
              <div ref={barRef} className="absolute inset-0 origin-left bg-white" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- exploration band (light) ---------------- */
function Exploration() {
  // protita ongsho nijei observe kore: heading screen-e ashar thik age animate hoy
  const [headRef, headSeen] = useInView<HTMLDivElement>(0.1, "0px 0px -15% 0px");
  const [gridRef, gridSeen] = useInView<HTMLDivElement>(0.05, "0px 0px -12% 0px");
  const rule = "rgba(11,15,23,0.25)";

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-24 sm:px-8 lg:py-32" style={{ color: DARK }}>
      <div ref={headRef} className="mb-12 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <div>
          <div
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{
              opacity: headSeen ? 1 : 0,
              transform: headSeen ? "none" : "translateY(14px)",
              transition: `opacity 900ms ${EASE}, transform 1000ms ${EASE}`,
            }}
          >
            <span className="sw-spin inline-block h-2 w-2" style={{ background: DARK }} />
            {EXPLORE_LABEL}
          </div>

          <h3
            className="mt-5 font-medium leading-[0.95] tracking-[-0.05em]"
            style={{ fontSize: "clamp(40px, 6.4vw, 104px)" }}
          >
            <SplitChars text={EXPLORE_TITLE} on={headSeen} start={150} step={32} />
          </h3>
        </div>

        <p
          className="max-w-[340px] text-sm leading-relaxed"
          style={{
            opacity: headSeen ? 0.7 : 0,
            transform: headSeen ? "none" : "translateY(18px)",
            transition: `opacity 1000ms ${EASE} 600ms, transform 1100ms ${EASE} 600ms`,
          }}
        >
          {EXPLORE_INTRO}
        </p>
      </div>

      <div ref={gridRef} className="relative">
        <span
          aria-hidden
          className="absolute left-0 top-0 h-px w-full origin-left"
          style={{
            background: rule,
            transform: gridSeen ? "scaleX(1)" : "scaleX(0)",
            transition: `transform 1300ms ${EASE_DRAW} 100ms`,
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE.map((t, i) => (
            <a
              key={t.title}
              href={t.href}
              className="group relative block overflow-hidden"
              style={{
                opacity: gridSeen ? 1 : 0,
                transform: gridSeen ? "none" : "translateY(36px)",
                transition: `opacity 1000ms ${EASE} ${250 + i * 110}ms, transform 1100ms ${EASE} ${250 + i * 110}ms`,
              }}
            >
              {i > 0 && <span aria-hidden className="absolute left-0 top-0 hidden h-full w-px lg:block" style={{ background: rule }} />}
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-full lg:hidden" style={{ background: rule }} />

              {/* hover: dark panel niche theke uthe ashe */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-y-100"
                style={{ background: DARK }}
              />

              <div className="relative flex min-h-[260px] flex-col justify-between p-6 transition-colors duration-500 group-hover:text-white sm:p-8 lg:min-h-[340px]">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]">
                  <span className="opacity-60">{pad(i + 1)}</span>
                  <span>{t.tag}</span>
                </div>

                <div>
                  <h4 className="text-3xl font-medium leading-[1] tracking-[-0.04em] sm:text-4xl">{t.title}</h4>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <p className="max-w-[200px] font-serif text-base italic leading-snug opacity-70">{t.note}</p>
                    <span
                      aria-hidden
                      className="text-2xl transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-right"
          style={{
            background: rule,
            transform: gridSeen ? "scaleX(1)" : "scaleX(0)",
            transition: `transform 1300ms ${EASE_DRAW} 350ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- main ---------------- */
export default function SelectedWork() {
  return (
    // NOTE: overflow-hidden dilam na, noyto sticky pin kaj korbe na (overflow-x-clip thik ache)
    <section id="work" className="relative z-10 w-full overflow-x-clip" style={{ background: PAGE }}>
      <style>{`
        @keyframes sw-spin { to { transform: rotate(360deg); } }
        @keyframes sw-drop {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .sw-spin { animation: sw-spin 7s linear infinite; }
        .sw-drop { animation: sw-drop 1.8s cubic-bezier(0.65,0,0.35,1) infinite; }

        /* card-er text: JS shudhu data-on bodlay, baaki shob CSS (scroll-e re-render nai) */
        .sw-line {
          transform: translateY(118%);
          transition: transform 350ms ease;
        }
        .sw-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .sw-num {
          opacity: 0;
          transform: translateX(70px);
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .sw-uline {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 300ms ease;
        }
        .sw-layer[data-on="1"] .sw-line {
          transform: translateY(0);
          transition: transform 1200ms ${EASE} calc(var(--d, 0) * 1ms);
        }
        .sw-layer[data-on="1"] .sw-fade {
          opacity: 1;
          transform: none;
          transition: opacity 1000ms ${EASE} calc(var(--d, 0) * 1ms),
                      transform 1100ms ${EASE} calc(var(--d, 0) * 1ms);
        }
        .sw-layer[data-on="1"] .sw-num {
          opacity: 1;
          transform: none;
          transition: opacity 1400ms ${EASE} 200ms, transform 1500ms ${EASE} 200ms;
        }
        .sw-layer[data-on="1"] .sw-uline {
          transform: scaleX(1);
          transition: transform 1300ms ${EASE_DRAW} calc(var(--d, 0) * 1ms);
        }

        @media (prefers-reduced-motion: reduce) {
          .sw-spin, .sw-drop { animation: none; }
        }
      `}</style>

      <Showcase />
      <Exploration />
    </section>
  );
}