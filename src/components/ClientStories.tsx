"use client";

import React, { useEffect, useId, useRef, useState } from "react";

/* ================= CONFIG ================= */
const PAGE = "#DFE4EF"; // section-er bg
const BAND = "#C0C9D5"; // dheu-er agey-r patla band
const DARK = "#0b0f17";
const ACCENT = "#0099ff";

const REVEAL_VH = 120; // dheu uthe ashte koto scroll (Capabilities-er tail-er shathe mile thakte hobe)
const TRACK_VH_PER_CARD = 80; // protita card-er jonno koto scroll (barale dhire hobe)
const HOLD_VH = 45; // shesh card porar jonno extra jayga
const SMOOTH = 4; // kom = aro makhon/dhire

const EYEBROW = "Client stories";
const HEADING = ["What our", "clients say."];
const INTRO = "Real projects, real people and the numbers they shared with us.";

// ei gulo placeholder. nijer client-er golpo dao. img: "/clients/aanya.jpg" dile avatar-e chhobi boshbe
const STORIES = [
  {
    client: "Northwind Studio",
    sector: "Architecture",
    quote: "They turned a vague idea into a website our own clients compliment every week.",
    name: "Aanya Rao",
    role: "Founder",
    metric: 142,
    decimals: 0,
    prefix: "+",
    suffix: "%",
    label: "More enquiries",
    theme: "dark",
    img: "",
  },
  {
    client: "Atlas Finance",
    sector: "Fintech",
    quote: "Calm, fast and precise. Weekly reporting went from two days to a few minutes.",
    name: "Dev Malhotra",
    role: "Head of Product",
    metric: 8,
    decimals: 0,
    prefix: "",
    suffix: "x",
    label: "Faster reporting",
    theme: "light",
    img: "",
  },
  {
    client: "Moss & Fern",
    sector: "Retail",
    quote: "Our online shop finally feels like our studio. Sales doubled in the first quarter.",
    name: "Ishita Sen",
    role: "Co-founder",
    metric: 2.1,
    decimals: 1,
    prefix: "",
    suffix: "x",
    label: "Sales growth",
    theme: "steel",
    img: "",
  },
  {
    client: "Orbit Labs",
    sector: "AI Product",
    quote: "They explained the hard parts simply, then shipped before the deadline.",
    name: "Karan Mehta",
    role: "CTO",
    metric: 21,
    decimals: 0,
    prefix: "",
    suffix: "d",
    label: "From brief to launch",
    theme: "blue",
    img: "",
  },
] as const;
/* ========================================= */

const N = STORIES.length;
const TRACK_VH = N * TRACK_VH_PER_CARD;

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const EASE_DRAW = "cubic-bezier(0.65,0,0.35,1)";

const THEMES = {
  dark: { bg: DARK, fg: "#ffffff", sub: "rgba(255,255,255,0.62)", line: "rgba(255,255,255,0.22)" },
  light: { bg: "#ffffff", fg: DARK, sub: "rgba(11,15,23,0.6)", line: "rgba(11,15,23,0.14)" },
  steel: { bg: BAND, fg: DARK, sub: "rgba(11,15,23,0.62)", line: "rgba(11,15,23,0.2)" },
  blue: { bg: ACCENT, fg: "#ffffff", sub: "rgba(255,255,255,0.82)", line: "rgba(255,255,255,0.32)" },
} as const;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const pad = (n: number) => String(n).padStart(2, "0");
const initials = (s: string) =>
  s
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


/** Strip reveal: niche theke upore overlap hoye uthe, mota-soru alternate (objectBoundingBox: 0..1) */
const STRIPS = [0.17, 0.06, 0.16, 0.07, 0.17, 0.08, 0.17, 0.12]; // NICHE theke UPORE, jog fol = 1
const STRIP_SPAN = 0.42; // protita strip-er shomoy. beshi = aro overlap, aro makhon
const STRIP_LAG = 0.06; // soru strip mota-r koto pichone chase korbe
function wavePath(e: number, _ph: number) {
  let d = "";
  let yb = 1; // current strip-er bottom edge (niche theke shuru)
  const n = STRIPS.length;
  STRIPS.forEach((h, j) => {
    const delay = (j / (n - 1)) * (1 - STRIP_SPAN - STRIP_LAG) + (j % 2) * STRIP_LAG;
    const x = clamp((e - delay) / STRIP_SPAN);
    const k = -(Math.cos(Math.PI * x) - 1) / 2; // sine easing
    const top = yb - h * k;
    if (k > 0) {
      // 0.003 overlap, jeno strip-er majhe hairline na ashe
      d += `M0,${(yb + 0.003).toFixed(4)} L1,${(yb + 0.003).toFixed(4)} L1,${top.toFixed(4)} L0,${top.toFixed(4)} Z `;
    }
    yb -= h;
  });
  return d || "M0,1.1 L1,1.1 L1,1.05 L0,1.05 Z";
}

/** Protita akkhor niche theke uthe ashe */
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

export default function ClientStories() {
  const uid = useId().replace(/:/g, "");
  const idA = `cs-a-${uid}`;
  const idB = `cs-b-${uid}`;

  const containerRef = useRef<HTMLElement>(null);
  const layerARef = useRef<HTMLDivElement>(null);
  const layerBRef = useRef<HTMLDivElement>(null);
  const pathARef = useRef<SVGPathElement>(null);
  const pathBRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const [ready, setReady] = useState(false); // dheu pass hole true
  const readyRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const layerA = layerARef.current;
    const layerB = layerBRef.current;
    const pathA = pathARef.current;
    const pathB = pathBRef.current;
    const area = areaRef.current;
    const track = trackRef.current;
    if (!container || !layerA || !layerB || !pathA || !pathB || !area || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vh = window.innerHeight;
    let areaW = 0;
    let dx = 0;
    let cardLeft: number[] = [];
    let cardW: number[] = [];
    let target = 0;
    let cur = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let lastIdx = -1;
    const cnt = STORIES.map(() => ({ on: false, t0: 0 }));

    const measure = () => {
      vh = window.innerHeight;
      areaW = area.clientWidth;
      dx = Math.max(0, track.scrollWidth - areaW);
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        cardLeft[i] = c.offsetLeft;
        cardW[i] = c.offsetWidth;
      });
    };

    const readTarget = () => {
      target = -container.getBoundingClientRect().top;
    };

    const render = (s: number, now: number) => {
      const revealPx = (vh * REVEAL_VH) / 100;
      const trackPx = (vh * TRACK_VH) / 100;
      const r = clamp(s / revealPx);
      const tp = clamp((s - revealPx) / trackPx);

      /* ---- 1) SVG clip-path dheu ---- */
      const eB = easeInOutCubic(r);
      const eA = easeInOutCubic(clamp(r * 1.14)); // band ektu agey thake
      const t = now / 1000;

      if (r <= 0.0005) {
        layerA.style.visibility = "hidden";
        layerB.style.visibility = "hidden";
      } else {
        layerB.style.visibility = "visible";
        if (r >= 1) {
          layerA.style.visibility = "hidden";
          layerB.style.clipPath = "none";
        } else {
          layerA.style.visibility = "visible";
          pathA.setAttribute("d", wavePath(eA, t * 1.3 + 0.9));
          pathB.setAttribute("d", wavePath(eB, t * 1.3));
          layerA.style.clipPath = `url(#${idA})`;
          layerB.style.clipPath = `url(#${idB})`;
        }
      }

      /* ---- 2) ready (heading ar left content) ---- */
      const rd = r > 0.55 ? true : r < 0.25 ? false : readyRef.current;
      if (rd !== readyRef.current) {
        readyRef.current = rd;
        setReady(rd);
      }

      /* ---- 3) horizontal track ---- */
      const trackX = -dx * tp;
      track.style.transform = `translate3d(${trackX.toFixed(2)}px,0,0)`;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const left = (cardLeft[i] ?? 0) + trackX;
        const w = cardW[i] ?? 0;
        const c = (left + w / 2) / Math.max(1, areaW); // 0 = baam, 1 = dan

        const rise = clamp((c - 0.6) / 0.55); // dan theke ashar shomoy
        const out = clamp((0.22 - c) / 0.3); // baam-e jawar shomoy
        const ty = rise * 70;
        const rot = rise * 3;
        const sc = (1 - 0.06 * rise) * (1 - 0.05 * out);
        card.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
        card.style.opacity = (1 - 0.55 * out).toFixed(3);

        const art = artRefs.current[i];
        if (art) art.style.transform = `translate3d(${((0.5 - c) * 90).toFixed(2)}px,0,0)`;

        // text animation trigger + count up
        const isOn = readyRef.current && left < areaW * 0.88 && left + w > areaW * 0.04;
        if (isOn !== cnt[i].on) {
          cnt[i].on = isOn;
          card.dataset.on = isOn ? "1" : "0";
          if (isOn) cnt[i].t0 = now + 550;
          else {
            const el = numRefs.current[i];
            if (el) el.textContent = (0).toFixed(STORIES[i].decimals);
          }
        }
        if (cnt[i].on) {
          const el = numRefs.current[i];
          if (el) {
            const k = clamp((now - cnt[i].t0) / 1800);
            const e = 1 - Math.pow(1 - k, 4);
            el.textContent = (STORIES[i].metric * e).toFixed(STORIES[i].decimals);
          }
        }
      });

      /* ---- 4) counter + progress ---- */
      const idx = Math.round(tp * (N - 1));
      if (idx !== lastIdx) {
        lastIdx = idx;
        if (counterRef.current) counterRef.current.textContent = pad(idx + 1);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${tp.toFixed(4)})`;
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * SMOOTH));
      if (Math.abs(target - cur) < 0.05) cur = target;
      render(cur, now);
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => readTarget();
    const onResize = () => {
      measure();
      readTarget();
    };

    measure();
    readTarget();
    cur = target;
    render(cur, performance.now());

    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    ro.observe(area);

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
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [idA, idB]);

  const d = (ms: number) => ({ ["--d" as string]: ms }) as React.CSSProperties;
  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "none" : "translateY(18px)",
    transition: `opacity 1000ms ${EASE} ${delay}ms, transform 1100ms ${EASE} ${delay}ms`,
  });

  return (
    <section
      id="stories"
      ref={containerRef}
      className="relative z-20 w-full"
      // video section-er tail-er upor uthe boshe, jeno video pinned thakte thakte dheu ashe
      style={{
        height: `${REVEAL_VH + TRACK_VH + HOLD_VH + 100}svh`,
        marginTop: `-${100 + REVEAL_VH}svh`,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes cs-spin { to { transform: rotate(360deg); } }
        .cs-spin { animation: cs-spin 7s linear infinite; }

        .cs-line { transform: translateY(118%); transition: transform 300ms ease; }
        .cs-fade { opacity: 0; transform: translateY(18px); transition: opacity 250ms ease, transform 250ms ease; }
        .cs-rule { transform: scaleX(0); transform-origin: left; transition: transform 300ms ease; }

        .cs-card[data-on="1"] .cs-line {
          transform: none;
          transition: transform 1100ms ${EASE} calc(var(--d, 0) * 1ms + 250ms);
        }
        .cs-card[data-on="1"] .cs-fade {
          opacity: 1; transform: none;
          transition: opacity 900ms ${EASE} calc(var(--d, 0) * 1ms), transform 1000ms ${EASE} calc(var(--d, 0) * 1ms);
        }
        .cs-card[data-on="1"] .cs-rule {
          transform: scaleX(1);
          transition: transform 1300ms ${EASE_DRAW} calc(var(--d, 0) * 1ms);
        }
        @media (prefers-reduced-motion: reduce) { .cs-spin { animation: none; } }
      `}</style>

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ pointerEvents: "none" }}>
        {/* SVG clipPath definition (dheu-er shape JS theke update hoy) */}
        <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
          <defs>
            <clipPath id={idA} clipPathUnits="objectBoundingBox">
              <path ref={pathARef} d="M0,1.1 L1,1.1 L1,1.05 L0,1.05 Z" />
            </clipPath>
            <clipPath id={idB} clipPathUnits="objectBoundingBox">
              <path ref={pathBRef} d="M0,1.1 L1,1.1 L1,1.05 L0,1.05 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* dheu-er agey-r patla band */}
        <div
          ref={layerARef}
          aria-hidden
          className="absolute inset-0"
          style={{ background: BAND, visibility: "hidden", willChange: "clip-path" }}
        />

        {/* main layer: dheu pass hole content dekha jay */}
        <div
          ref={layerBRef}
          className="absolute inset-0 overflow-hidden"
          style={{ background: PAGE, color: DARK, visibility: "hidden", pointerEvents: "auto", willChange: "clip-path" }}
        >
          {/* frame + 4 ghurno kon-er box (loader-er motif) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-3 z-30 border sm:inset-5"
            style={{ borderColor: "rgba(11,15,23,0.18)" }}
          >
            {[
              { top: 0, left: 0 },
              { top: 0, left: "100%" },
              { top: "100%", left: "100%" },
              { top: "100%", left: 0 },
            ].map((pos, k) => (
              <span key={k} className="absolute h-[11px] w-[11px]" style={{ marginLeft: -5.5, marginTop: -5.5, ...pos }}>
                <span className="cs-spin block h-full w-full" style={{ background: DARK }} />
              </span>
            ))}
          </div>

          <div className="flex h-full flex-col lg:flex-row">
            {/* ---- baam: heading + counter ---- */}
            <div className="relative z-20 px-8 pb-2 pt-[84px] sm:px-14 lg:flex lg:w-[36vw] lg:shrink-0 lg:flex-col lg:justify-center lg:px-0 lg:pb-0 lg:pl-[72px] lg:pr-8 lg:pt-0">
              <div
                className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]"
                style={fadeIn(0)}
              >
                <span className="cs-spin inline-block h-2 w-2" style={{ background: DARK }} />
                {EYEBROW}
              </div>

              <h2
                className="mt-5 font-medium leading-[0.95] tracking-[-0.05em]"
                style={{ fontSize: "clamp(40px, 6.2vw, 108px)" }}
              >
                {HEADING.map((line, i) => (
                  <span key={i} className="block">
                    <SplitChars text={line} on={ready} start={150 + i * 330} step={34} />
                  </span>
                ))}
              </h2>

              <p className="mt-6 hidden max-w-[320px] text-sm leading-relaxed sm:block" style={{ ...fadeIn(650), opacity: ready ? 0.7 : 0 }}>
                {INTRO}
              </p>

              <div className="mt-6 flex items-center gap-5 lg:mt-12" style={fadeIn(800)}>
                <div className="flex items-baseline gap-2 font-mono text-xs tabular-nums tracking-[0.2em]">
                  <span ref={counterRef} className="text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                    01
                  </span>
                  <span className="opacity-55">/ {pad(N)}</span>
                </div>
                <span className="relative block h-px w-[min(180px,32vw)]" style={{ background: "rgba(11,15,23,0.2)" }}>
                  <span ref={barRef} className="absolute inset-0 origin-left" style={{ background: DARK, transform: "scaleX(0)" }} />
                </span>
              </div>
            </div>

            {/* ---- dan: card track (baam-e halka fade hoye jay) ---- */}
            <div
              ref={areaRef}
              className="relative min-h-0 flex-1 overflow-hidden"
              style={{
                maskImage: "linear-gradient(90deg, transparent 0, #000 7%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 7%)",
              }}
            >
              <div ref={trackRef} className="relative flex h-full items-center gap-4 pr-[10vw] will-change-transform sm:gap-5">
                {STORIES.map((s, i) => {
                  const th = THEMES[s.theme];
                  const words = s.quote.split(" ");
                  return (
                    <article
                      key={s.client}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      data-on="0"
                      className="cs-card relative h-[88%] max-h-[620px] w-[78vw] max-w-[560px] shrink-0 overflow-hidden rounded-[22px] sm:w-[56vw] lg:w-[34vw]"
                      style={{ background: th.bg, color: th.fg, willChange: "transform, opacity" }}
                    >
                      {/* pichone gol outline (parallax) */}
                      <div
                        ref={(el) => {
                          artRefs.current[i] = el;
                        }}
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{ willChange: "transform" }}
                      >
                        <span
                          className="absolute -right-[20%] -top-[14%] aspect-square w-[78%] rounded-full border"
                          style={{ borderColor: th.line }}
                        />
                        <span
                          className="absolute -right-[4%] top-[2%] aspect-square w-[46%] rounded-full border"
                          style={{ borderColor: th.line }}
                        />
                        <span
                          className="absolute -bottom-[18%] -left-[14%] aspect-square w-[52%] rounded-full border"
                          style={{ borderColor: th.line }}
                        />
                      </div>

                      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                        {/* top */}
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em]">
                          <span className="cs-fade flex items-center gap-3" style={d(0)}>
                            <span className="font-mono" style={{ color: th.sub }}>
                              {pad(i + 1)}
                            </span>
                            {s.client}
                          </span>
                          <span className="cs-fade hidden sm:block" style={{ ...d(60), color: th.sub }}>
                            {s.sector}
                          </span>
                        </div>

                        {/* quote */}
                        <div>
                          <span
                            aria-hidden
                            className="cs-fade block font-serif text-[56px] leading-[0.6] sm:text-[72px]"
                            style={{ ...d(100), color: th.sub }}
                          >
                            “
                          </span>
                          <p
                            className="mt-4 font-serif italic leading-[1.2] tracking-[-0.01em]"
                            style={{ fontSize: "clamp(20px, 2.1vw, 33px)" }}
                          >
                            {words.map((w, wi) => (
                              <span key={wi} className="mr-[0.25em] inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
                                <span className="cs-line inline-block" style={d(wi * 26)}>
                                  {w}
                                </span>
                              </span>
                            ))}
                          </p>
                        </div>

                        {/* bottom */}
                        <div>
                          <span className="cs-rule mb-5 block h-px w-full" style={{ ...d(500), background: th.line }} />
                          <div className="flex items-end justify-between gap-4">
                            <div className="cs-fade flex items-center gap-3" style={d(620)}>
                              {s.img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={s.img} alt="" className="h-11 w-11 rounded-full object-cover" />
                              ) : (
                                <span
                                  className="flex h-11 w-11 items-center justify-center rounded-full border text-xs font-semibold tracking-[0.06em]"
                                  style={{ borderColor: th.line }}
                                >
                                  {initials(s.name)}
                                </span>
                              )}
                              <span className="leading-tight">
                                <span className="block text-sm font-semibold">{s.name}</span>
                                <span className="block text-xs" style={{ color: th.sub }}>
                                  {s.role}
                                </span>
                              </span>
                            </div>

                            <div className="cs-fade text-right" style={d(720)}>
                              <div className="flex items-start justify-end leading-none tracking-[-0.05em] tabular-nums" style={{ fontSize: "clamp(40px, 4.6vw, 72px)", fontWeight: 300 }}>
                                {s.prefix && <span className="mr-0.5 mt-[0.08em] text-[0.5em]">{s.prefix}</span>}
                                <span
                                  ref={(el) => {
                                    numRefs.current[i] = el;
                                  }}
                                >
                                  {(0).toFixed(s.decimals)}
                                </span>
                                <span className="ml-0.5 mt-[0.08em] text-[0.42em] font-normal tracking-normal">{s.suffix}</span>
                              </div>
                              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: th.sub }}>
                                {s.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}