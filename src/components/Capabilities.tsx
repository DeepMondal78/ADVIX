"use client";

import React, { useEffect, useRef, useState } from "react";
import VideoPanel from "./VideoPanel";

/* ================= CONFIG ================= */
const BG = "#DFE4EF"; // card section-er bg
const DARK = "#0b0f17";
const ACCENT = "#0099ff";
const SCROLL_VH = 560; // total scroll lomba (barale dhire hobe)
const SMOOTH = 5; // koto druto follow korbe. kom = aro makhon/dhire, beshi = druto (4 theke 8 er moddhe rakho)
const CROSS_ROTATE = 360; // section slide shesh hole cross koto degree ghurbe (45 = "+" theke "✕", aro halka chaile 20)

const LABEL = "What we do";
const HEADING = "Three ways we turn ideas into products.";

const CARDS = [
  {
    n: "01",
    title: "Web & Product",
    text: "Fast, scalable websites and apps built with clean code.",
  },
  {
    n: "02",
    title: "AI Integration",
    text: "Smart automation added to the tools you already use.",
  },
  {
    n: "03",
    title: "Brand & Design",
    text: "Identity and interfaces that feel sharp and consistent.",
  },
];
/* ========================================= */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

// --p (0..1) theke element-er progress
const t = (a: number, b: number) =>
  `clamp(0, calc((var(--p) - ${a}) / ${b - a}), 1)`;
const rise = (a: number, b: number, px = 24): React.CSSProperties => ({
  opacity: t(a, b),
  transform: `translateY(calc((1 - ${t(a, b)}) * ${px}px))`,
});

function ArtWeb() {
  const bars = [0.9, 0.62, 0.78, 0.45];
  return (
    <div className="mx-auto w-[78%] rounded-xl border border-white/15 bg-white/5 p-3">
      <div className="mb-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-white/40" />
        ))}
      </div>
      <div className="space-y-2">
        {bars.map((w, i) => (
          <div
            key={i}
            className="h-2.5 origin-left rounded-full"
            style={{
              width: `${w * 100}%`,
              background: i === 0 ? ACCENT : "rgba(255,255,255,0.25)",
              transform: `scaleX(${t(0.3 + i * 0.05, 0.55 + i * 0.05)})`,
            }}
          />
        ))}
      </div>
      <div
        className="mt-3 h-14 rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}55, transparent)`,
        }}
      />
    </div>
  );
}

function ArtAI() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto h-full max-h-[150px] w-full"
      fill="none"
    >
      <g className="cap-spin" style={{ transformOrigin: "50px 50px" }}>
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="#fff"
          strokeOpacity="0.5"
          strokeWidth="0.5"
          strokeDasharray="1.5 3"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          const x = 50 + Math.cos(a) * 36;
          const y = 50 + Math.sin(a) * 36;
          return (
            <g key={i}>
              <line
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="#fff"
                strokeOpacity="0.5"
                strokeWidth="0.4"
              />
              <circle cx={x} cy={y} r="3" fill="#fff" />
            </g>
          );
        })}
      </g>
      <circle cx="50" cy="50" r="9" fill="#fff" />
    </svg>
  );
}

function ArtBrand() {
  const c = [ACCENT, DARK, "#ff6b4a"];
  return (
    <div
      className="relative mx-auto h-[130px] w-[160px]"
      style={{ transform: "rotate(calc(var(--p) * 120deg))" }}
    >
      {c.map((col, i) => (
        <span
          key={i}
          className="absolute h-[84px] w-[84px] rounded-full mix-blend-multiply"
          style={{
            background: col,
            opacity: 0.85,
            left: `${i * 32}px`,
            top: i === 1 ? "0px" : "34px",
          }}
        />
      ))}
    </div>
  );
}

const THEMES = [
  { bg: DARK, fg: "#fff", sub: "rgba(255,255,255,0.65)", art: <ArtWeb /> },
  { bg: ACCENT, fg: "#fff", sub: "rgba(255,255,255,0.8)", art: <ArtAI /> },
  { bg: "#ffffff", fg: DARK, sub: "rgba(11,15,23,0.6)", art: <ArtBrand /> },
];

export default function Capabilities() {
  const outerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [videoOn, setVideoOn] = useState(false);

  useEffect(() => {
  const el = outerRef.current;
  const layer = layerRef.current;
  if (!el || !layer) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let target = 0; // scroll-er asol position (0..1)
  let cur = 0; // dhire dhire target-er dike jachhe
  let raf = 0;
  let last = 0;
  let lastOn = false;

  const readTarget = () => {
    const r = el.getBoundingClientRect();
    const total = Math.max(1, r.height - window.innerHeight);
    target = reduce ? 1 : clamp(-r.top / total);
  };

  const apply = (q: number) => {
    const p = seg(q, 0, 0.4); // card animation
    const s = ease(seg(q, 0.46, 0.9)); // section bame sore jay (age 0.6-0.88, ekhon lomba range)
    const v = seg(q, 0.84, 1); // video text

    el.style.setProperty("--p", p.toFixed(4));
    el.style.setProperty("--s", s.toFixed(4));
    el.style.setProperty("--v", v.toFixed(4));
    layer.style.pointerEvents = s > 0.9 ? "none" : "auto";

    const on = s > 0.05;
    if (on !== lastOn) {
      lastOn = on;
      setVideoOn(on);
    }
  };

  const loop = (now: number) => {
    const dt = Math.min(0.064, (now - last) / 1000);
    last = now;
    // dhire dhire target-er dike jay (makhon-er moto)
    cur += (target - cur) * (1 - Math.exp(-dt * SMOOTH));
    if (Math.abs(target - cur) < 0.0002) cur = target;
    apply(cur);
    // target-e pouchhe gele loop thamiye dei (CPU bachay)
    raf = cur === target ? 0 : requestAnimationFrame(loop);
  };

  const kick = () => {
    readTarget();
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  readTarget();
  cur = target;
  apply(cur);

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  return () => {
    window.removeEventListener("scroll", kick);
    window.removeEventListener("resize", kick);
    if (raf) cancelAnimationFrame(raf);
  };
}, []);

  const words = HEADING.split(" ");

  return (
    <div
      id="capabilities"
      ref={outerRef}
      className="relative z-10 w-full font-[Poppins]"
      style={{ height: `${SCROLL_VH}svh` }}
    >
      <style>{`
        @keyframes cap-spin { to { transform: rotate(360deg); } }
        .cap-spin { animation: cap-spin 24s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .cap-spin { animation: none; } }
      `}</style>

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* niche: video section (section sore gele ei ta dekha jay) */}
        <div className="absolute inset-0 z-0">
          <VideoPanel active={videoOn} />
        </div>

        {/* upor: card section, dane theke bame sore jay */}
        <div
          ref={layerRef}
          className="absolute inset-0 z-10 flex flex-col justify-center overflow-hidden px-4 sm:px-8"
          style={{
            background: BG,
            color: DARK,
            transform: "translate3d(calc(var(--s) * -100%), 0, 0)",
            boxShadow: "20px 0 60px rgba(0,0,0,0.25)",
            willChange: "transform",
          }}
        >
          {/* cross: layer-er bhitore, page-er dan kinare attach. layer soralei shathe soray, shudhu nijer jaigay ghore */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-2.5 top-1/2 z-30 -translate-y-1/2 mix-blend-difference"
          >
            <div
              className="relative h-5 w-5"
              style={{
                transform: `rotate(calc(var(--s) * ${CROSS_ROTATE}deg))`,
                willChange: "transform",
              }}
            >
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white" />
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1200px]">
            {/* heading */}
            <div
              style={{ opacity: t(0, 0.1) }}
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-tight text-[#4a4f5c]"
            >
              <span className="whitespace-nowrap">{LABEL}</span>
              <span
                className="h-px flex-1 origin-left bg-[#4a4f5c]/60"
                style={{ transform: `scaleX(${t(0, 0.2)})` }}
              />
            </div>

            <h2 className="mt-5 max-w-[900px] text-[clamp(26px,4.2vw,68px)] font-medium leading-[1.05] tracking-[-0.035em]">
              {words.map((w, i) => {
                const a = 0.02 + (i / words.length) * 0.2;
                const k = t(a, a + 0.06);
                return (
                  <span
                    key={i}
                    className="mr-[0.25em] inline-block"
                    style={{
                      color: `color-mix(in srgb, ${DARK} calc(${k} * 100%), #b3b8c8)`,
                      transform: `translateY(calc((1 - ${k}) * 14px))`,
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </h2>

            {/* 3 cards */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
              {CARDS.map((c, i) => {
                const a = 0.18 + i * 0.12;
                const k = t(a, a + 0.28);
                const th = THEMES[i];
                return (
                  <div
                    key={c.n}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] p-4 md:h-[44svh] md:min-h-[300px] md:p-6"
                    style={{
                      background: th.bg,
                      color: th.fg,
                      opacity: k,
                      transform: `translateY(calc((1 - ${k}) * 90px)) rotate(calc((1 - ${k}) * ${(i - 1) * 7}deg)) scale(calc(0.9 + 0.1 * ${k}))`,
                    }}
                  >
                    <div
                      className="flex items-center justify-between text-xs font-semibold tracking-[0.2em]"
                      style={{ color: th.sub }}
                    >
                      <span>{c.n}</span>
                      <span className="text-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">
                        ↗
                      </span>
                    </div>

                    <div className="hidden flex-1 items-center py-3 md:flex">
                      <div
                        className="w-full"
                        style={{ opacity: t(a + 0.1, a + 0.3) }}
                      >
                        {th.art}
                      </div>
                    </div>

                    <div style={rise(a + 0.12, a + 0.32, 18)}>
                      <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                        {c.title}
                      </h3>
                      <p
                        className="mt-1 max-w-[280px] text-xs leading-snug md:text-sm"
                        style={{ color: th.sub }}
                      >
                        {c.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
