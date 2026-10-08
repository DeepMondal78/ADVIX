"use client";

import React, { useEffect, useRef } from "react";

const HEADING =
  "Advix Technology is a next-gen digital studio engineering high-impact web products through design, code, and innovation.";

const STATS = [
  { value: 50, suffix: "+", label: "Projects shipped" }, // <- nijer number dao
  { value: 5, suffix: "+", label: "Years of craft" },
  { value: 100, suffix: "%", label: "Client focus" },
];

const MARQUEE = [
  "Web Apps",
  "AI Integration",
  "UI / UX Design",
  "Branding",
  "Legacy Modernisation",
  "Custom Software",
];

// --p (0..1) theke ekta element-er progress (start..end-er moddhe 0..1)
const t = (start: number, end: number) =>
  `clamp(0, calc((var(--p) - ${start}) / ${end - start}), 1)`;

const rise = (start: number, end: number, px = 36): React.CSSProperties => ({
  opacity: t(start, end),
  transform: `translateY(calc((1 - ${t(start, end)}) * ${px}px))`,
});

const draw = (start: number, end: number): React.CSSProperties => ({
  transform: `scaleX(${t(start, end)})`,
  transformOrigin: "left center",
});

// 8-point star
const STAR = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 === 0 ? 30 : 13;
  return `${(32 + Math.cos(a) * r).toFixed(2)},${(32 + Math.sin(a) * r).toFixed(2)}`;
}).join(" ");

export default function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const counters = Array.from(
      el.querySelectorAll<HTMLElement>("[data-count]"),
    );
    let raf = 0;

    const update = () => {
      raf = 0;
      let p = 1;
      if (!reduce) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (window.innerWidth >= 1024) {
          // pinned mode: section-er scroll distance dhore
          p = -r.top / Math.max(1, (r.height - vh) * 0.7);
        } else {
          p = (vh - r.top) / (r.height + vh * 0.2);
        }
        p = Math.min(1, Math.max(0, p));
      }
      el.style.setProperty("--p", p.toFixed(4));

      // number count-up (0.45 .. 0.8)
      const k = Math.min(1, Math.max(0, (p - 0.45) / 0.35));
      const e = 1 - Math.pow(1 - k, 3);
      counters.forEach((c) => {
        const target = Number(c.dataset.count);
        c.textContent = String(Math.round(target * e));
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const words = HEADING.split(" ");
  const marqueeItems = [...MARQUEE, ...MARQUEE, ...MARQUEE];

  return (
    <section
      id="about"
      ref={ref}
      className="relative w-full overflow-x-clip text-[#00010A] font-[Poppins] lg:h-[300vh]"
    >
      <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center overflow-hidden px-4 sm:px-8 py-20 lg:py-0">
        {/* halka glow background */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/4 h-120 w-120 rounded-full bg-[#7f8fd8]/20 blur-[120px]"
          style={{ transform: "translateY(calc(var(--p) * -120px))" }}
        />

        <div className="relative mx-auto w-full max-w-300 grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-x-6 gap-y-10 lg:gap-y-12">
          {/* ---- Row 1 bame: label + line + x ---- */}
          <div
            className="order-1 lg:order-0 flex items-center gap-3 lg:self-start lg:pt-3"
            style={{ opacity: t(0, 0.1) }}
          >
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-tight text-[#4a4f5c] whitespace-nowrap">
              The Advix Story
            </span>
            <span
              className="relative h-px flex-1 bg-[#4a4f5c]/70"
              style={draw(0, 0.2)}
            />
            <span
              className="text-[#4a4f5c] text-lg leading-none -ml-1"
              style={{ opacity: t(0.15, 0.25) }}
            >
              ×
            </span>
          </div>

          {/* ---- Row 1 dane: heading (shobdo fill hoy) ---- */}
          <h2 className="order-2 lg:order-none text-[clamp(28px,3.9vw,60px)] font-medium leading-[1.12] tracking-[-0.02em]">
            {words.map((w, i) => {
              const start = 0.04 + (i / words.length) * 0.38;
              const k = t(start, start + 0.08);
              return (
                <span
                  key={i}
                  className="inline-block mr-[0.28em]"
                  style={{
                    color: `color-mix(in srgb, #00010A calc(${k} * 100%), #b3b8c8)`,
                    transform: `translateY(calc((1 - ${k}) * 14px))`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </h2>

          {/* ---- Row 2 bame: star + orbit ring ---- */}
          <div className="order-3 lg:order-none flex justify-center items-center lg:py-2">
            <div
              className="relative h-28 w-28"
              style={{
                opacity: t(0.15, 0.35),
                transform: `scale(calc(0.4 + 0.6 * ${t(0.15, 0.4)}))`,
              }}
            >
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full"
                aria-hidden
                style={{ transform: "rotate(calc(var(--p) * -240deg))" }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="#00010A"
                  strokeOpacity="0.35"
                  strokeWidth="0.6"
                  strokeDasharray="2 4"
                />
                <circle cx="50" cy="3" r="2.2" fill="#00010A" />
              </svg>
              <svg
                viewBox="0 0 64 64"
                className="absolute inset-0 m-auto h-16 w-16"
                fill="none"
                aria-hidden
                style={{ transform: "rotate(calc(var(--p) * 220deg))" }}
              >
                <polygon
                  points={STAR}
                  stroke="#00010A"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="32" r="7.5" fill="#00010A" />
              </svg>
            </div>
          </div>

          {/* dane-r cell: stats */}
          <div className="order-6 lg:order-none grid grid-cols-3 gap-4 lg:pl-[22%] lg:self-center">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={rise(0.45 + i * 0.05, 0.62 + i * 0.05, 24)}
              >
                <div className="text-[clamp(26px,3vw,44px)] font-semibold leading-none tracking-tight tabular-nums">
                  <span data-count={s.value}>0</span>
                  {s.suffix}
                </div>
                <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-[#4a4f5c]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Row 3 bame: tagline ---- */}
          <div className="order-4 lg:order-none text-sm sm:text-base font-medium uppercase leading-snug tracking-tight">
            {[
              "We develop for scale,",
              "Clean code first, craft always,",
              "Built to perform",
            ].map((line, i) => (
              <div key={i} className="overflow-hidden">
                <div style={rise(0.5 + i * 0.06, 0.68 + i * 0.06, 28)}>
                  {line}
                </div>
              </div>
            ))}
          </div>

          {/* ---- Row 3 dane: paragraph + link + line ---- */}
          <div className="order-5 lg:order-none lg:pl-[22%] flex flex-col">
            <p
              className="text-sm sm:text-base font-normal leading-snug"
              style={rise(0.55, 0.75)}
            >
              Our mission is to bridge complex logic with seamless digital
              design, building high-performance web products that drive real
              business growth without corporate friction.
            </p>

            <a
              href="#"
              className="group relative mt-5 inline-flex w-fit items-center gap-6 pb-1 text-[11px] uppercase tracking-[0.2em]"
              style={rise(0.65, 0.82, 20)}
            >
              More about us
              <span className="transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
              <span className="absolute inset-x-0 bottom-0 h-px bg-[#00010A]/30" />
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[#00010A] transition-transform duration-500 group-hover:scale-x-100" />
            </a>

            <div
              className="mt-10 h-px w-full lg:w-[calc(100%+12%)] lg:-ml-[12%] bg-[#00010A]/40"
              style={draw(0.7, 0.95)}
            />
          </div>
        </div>

        {/* ---- Marquee: scroll-er shathe sore ---- */}
        <div
          className="relative mt-14 lg:mt-12 -mx-4 sm:-mx-8 overflow-hidden"
          style={{ opacity: t(0.6, 0.85) }}
          aria-hidden
        >
          <div
            className="flex w-max items-center gap-10 whitespace-nowrap text-[clamp(22px,3vw,44px)] font-medium tracking-tight text-[#00010A]/15"
            style={{ transform: "translateX(calc(var(--p) * -28%))" }}
          >
            {marqueeItems.map((m, i) => (
              <span key={i} className="flex items-center gap-10">
                {m}
                <svg
                  className="h-4 w-4 text-[#00010A]/25"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
