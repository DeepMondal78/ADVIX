"use client";

import React, { useEffect, useRef, useState } from "react";

/* ================= CONFIG: ekhane bodlale pura section bodlabe ================= */
const BG = "#00010A"; // section background (shader-o ei color e boro hoy)
const INK = "#ffffff"; // main text
const MUTED = "rgba(255,255,255,0.58)"; // halka text
const LINE = "rgba(255,255,255,0.16)"; // divider / border
const ACCENT = "#FFFFFF"; // shader glow

const EYEBROW = "Key facts";
const HEADING = ["Less talk.", "More proof."];
const INTRO = "A snapshot of our experience and impact.";

const STATS = [
  { label: "Featured & awards", desc: "Featured on top design platforms worldwide.", value: 50, decimals: 0, suffix: "+", fill: 0.62 },
  { label: "Projects completed", desc: "90% of our clients come back for a second project.", value: 1.5, decimals: 1, suffix: "K+", fill: 0.9 },
  { label: "Team members", desc: "Different skills. One standard.", value: 20, decimals: 0, suffix: "+", fill: 0.4 },
];

const PARTNERS_LABEL = "Our business partners";
const PARTNERS = ["Credible", "Yellowtail", "Luxury Presence", "Technis", "Ockto", "Northwind"]; // <- nijer partner naam
/* ============================================================================== */

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const EASE_DRAW = "cubic-bezier(0.65,0,0.35,1)";
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/* ---------------- shader: liquid iris (bg animation) ---------------- */
const VERT = `
attribute vec2 a;
varying vec2 vUv;
void main(){ vUv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uP;
uniform float uTime;
uniform float uHover;
uniform vec3 uBg;
uniform vec3 uAccent;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;

  vec2 c = vec2(0.5) + (uMouse - 0.5) * 0.18;
  vec2 p = (uv - c) * vec2(asp, 1.0);
  float r = length(p);
  float ang = atan(p.y, p.x);

  float life = sin(uP * 3.14159);
  float n = fbm(p * 3.2 + vec2(uTime * 0.12, -uTime * 0.09));
  float wob = (n - 0.5) * 0.42 * life + sin(ang * 7.0 + uTime * 2.2) * 0.028 * life;

  vec2 mp = (uv - uMouse) * vec2(asp, 1.0);
  float dm = length(mp);
  wob += sin(dm * 34.0 - uTime * 4.0) * exp(-dm * 5.0) * 0.02 * uHover * life;

  float R = uP * (asp * 0.65 + 0.7);
  float d = r - wob;
  float fill = (1.0 - smoothstep(R - 0.004, R + 0.004, d)) * step(0.001, uP);

  float inside = R - d;

  vec3 col = uBg;
  col += uAccent * exp(-max(inside, 0.0) * 20.0) * 0.95 * (1.0 - uP * uP);
  float rings = smoothstep(0.93, 1.0, sin(inside * 70.0 - uTime * 2.0));
  col += uAccent * rings * exp(-inside * 7.0) * 0.28 * (1.0 - uP);
  col += (hash(uv * uRes + uTime) - 0.5) * 0.03;

  gl_FragColor = vec4(col * fill, fill);
}
`;

/* ---------------- helpers ---------------- */
function useInView<T extends Element>(threshold = 0.2) {
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
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function useCount(on: boolean, value: number, decimals: number, delay = 0, ms = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!on) {
      el.textContent = (0).toFixed(decimals);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + delay;
    const loop = (now: number) => {
      const k = clamp((now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 4); // easeOutQuart
      el.textContent = (value * e).toFixed(decimals);
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [on, value, decimals, delay, ms]);
  return ref;
}

function FadeUp({
  on,
  delay = 0,
  y = 28,
  className,
  children,
}: {
  on: boolean;
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateY(${y}px)`,
        transition: `opacity 900ms ${EASE} ${delay}ms, transform 1000ms ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- frame: border draws itself + 4 spinning corner boxes ---------------- */
function Frame({ on }: { on: boolean }) {
  const STEP = 500;
  const DUR = 600;

  const line = (pos: React.CSSProperties, origin: string, axis: "X" | "Y", i: number) => (
    <span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        background: "rgba(255,255,255,0.6)",
        transformOrigin: origin,
        transform: on ? "scale(1)" : axis === "X" ? "scaleX(0)" : "scaleY(0)",
        transition: `transform ${DUR}ms ${EASE_DRAW} ${i * STEP}ms`,
        ...pos,
      }}
    />
  );

  const corner = (pos: React.CSSProperties, i: number) => (
    <span
      aria-hidden
      className="pointer-events-none absolute z-20"
      style={{
        width: 11,
        height: 11,
        marginLeft: -5.5,
        marginTop: -5.5,
        transform: on ? "scale(1)" : "scale(0)",
        transition: `transform 600ms ${EASE} ${i * STEP}ms`,
        ...pos,
      }}
    >
      <span className="kf-corner block h-full w-full" style={{ background: INK }} />
    </span>
  );

  return (
    <>
      {line({ top: 0, left: 0, width: "100%", height: 1 }, "left", "X", 0)}
      {line({ top: 0, right: 0, width: 1, height: "100%" }, "top", "Y", 1)}
      {line({ bottom: 0, right: 0, width: "100%", height: 1 }, "right", "X", 2)}
      {line({ bottom: 0, left: 0, width: 1, height: "100%" }, "bottom", "Y", 3)}

      {corner({ top: 0, left: 0 }, 0)}
      {corner({ top: 0, left: "100%" }, 1)}
      {corner({ top: "100%", left: "100%" }, 2)}
      {corner({ top: "100%", left: 0 }, 3)}
    </>
  );
}

/* ---------------- one column of the panel ---------------- */
function Column({
  stat,
  index,
  on,
}: {
  stat: (typeof STATS)[number];
  index: number;
  on: boolean;
}) {
  const numRef = useCount(on, stat.value, stat.decimals, 1700 + index * 180);
  const elRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = elRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const d = 1500 + index * 180; // content starts after the frame has drawn

  return (
    <div
      ref={elRef}
      onPointerMove={onMove}
      className="group relative flex min-h-[320px] flex-col justify-between overflow-hidden p-6 sm:p-8 lg:min-h-[480px]"
    >
      {/* vertical / horizontal divider that draws itself */}
      {index > 0 && (
        <>
          <span
            aria-hidden
            className="absolute left-0 top-0 hidden h-full w-px origin-top lg:block"
            style={{
              background: LINE,
              transform: on ? "scaleY(1)" : "scaleY(0)",
              transition: `transform 1200ms ${EASE_DRAW} ${1000 + index * 150}ms`,
            }}
          />
          <span
            aria-hidden
            className="absolute left-0 top-0 h-px w-full origin-left lg:hidden"
            style={{
              background: LINE,
              transform: on ? "scaleX(1)" : "scaleX(0)",
              transition: `transform 1200ms ${EASE_DRAW} ${1000 + index * 150}ms`,
            }}
          />
        </>
      )}

      {/* hover spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.09), transparent 62%)",
        }}
      />

      {/* top: index + label */}
      <div
        className="relative flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em]"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(14px)",
          transition: `opacity 900ms ${EASE} ${d}ms, transform 1000ms ${EASE} ${d}ms`,
        }}
      >
        <span>{stat.label}</span>
        <span style={{ color: MUTED }}>{String(index + 1).padStart(2, "0")}</span>
      </div>

      {/* middle: giant number */}
      <div
        className="relative flex items-start leading-[0.82] tracking-[-0.06em] tabular-nums"
        style={{
          fontSize: "clamp(84px, 9vw, 132px)",
          fontWeight: 300,
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(40px)",
          transition: `opacity 1000ms ${EASE} ${d + 100}ms, transform 1200ms ${EASE} ${d + 100}ms`,
        }}
      >
        <span ref={numRef}>0</span>
        <span className="ml-1 mt-[0.08em] text-[0.3em] font-normal tracking-normal">{stat.suffix}</span>
      </div>

      {/* bottom: description + small meter */}
      <div
        className="relative"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(18px)",
          transition: `opacity 900ms ${EASE} ${d + 250}ms, transform 1000ms ${EASE} ${d + 250}ms`,
        }}
      >
        <p className="max-w-[260px] text-sm leading-relaxed" style={{ color: MUTED }}>
          {stat.desc}
        </p>
        <div className="mt-6 h-px w-full" style={{ background: LINE }}>
          <span
            className="block h-[3px] -translate-y-px origin-left transition-[height] duration-300 group-hover:h-[5px]"
            style={{
              width: `${stat.fill * 100}%`,
              background: INK,
              transform: on ? "scaleX(1)" : "scaleX(0)",
              transition: `transform 1600ms ${EASE_DRAW} ${d + 450}ms, height 300ms ease`,
              transformOrigin: "left",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- main ---------------- */
export default function KeyFacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false); // bg circle prai bhore gele true
  const [noGl, setNoGl] = useState(false);

  const [headRef, headSeen] = useInView<HTMLDivElement>(0.3);
  const [panelRef, panelSeen] = useInView<HTMLDivElement>(0.2);
  const [partRef, partSeen] = useInView<HTMLDivElement>(0.4);

  const headOn = ready && headSeen;
  const panelOn = ready && panelSeen;
  const partOn = ready && partSeen;

  /* ---- WebGL background ---- */
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });

    const fallback = () => {
      setNoGl(true);
      setReady(true);
    };
    if (!gl) {
      fallback();
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      fallback();
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      fallback();
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uMouse = U("uMouse"), uP = U("uP"), uTime = U("uTime");
    const uHover = U("uHover"), uBg = U("uBg"), uAccent = U("uAccent");
    gl.uniform3f(uBg, ...hexToRgb(BG));
    gl.uniform3f(uAccent, ...hexToRgb(ACCENT));
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    let target = 0;
    let cur = 0;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let hoverT = 0;
    let hover = 0;
    let readyNow = false;
    let running = false;
    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();

    const update = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const enter = clamp((vh - r.top) / vh);
      target = reduce ? 1 : clamp((enter - 0.2) / 0.7);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      hoverT = 1;
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      cur = reduce ? 1 : cur + (target - cur) * Math.min(1, dt * 4);
      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 8);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 8);
      hoverT = Math.max(0, hoverT - dt * 0.5);
      hover += (hoverT - hover) * Math.min(1, dt * 6);

      resize();
      gl.uniform1f(uP, cur);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform1f(uHover, hover);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (cur > 0.85 && !readyNow) {
        readyNow = true;
        setReady(true);
      } else if (cur < 0.4 && readyNow) {
        readyNow = false;
        setReady(false);
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(section);

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  const marquee = [...PARTNERS, ...PARTNERS];

  return (
    <section id="facts" ref={sectionRef} className="relative z-10 w-full overflow-x-clip" style={{ color: INK }}>
      <style>{`
        @keyframes kf-corner-spin { to { transform: rotate(360deg); } }
        @keyframes kf-marquee { to { transform: translateX(-50%); } }
        .kf-corner { animation: kf-corner-spin 7s linear infinite; }
        .kf-marquee-track { animation: kf-marquee 34s linear infinite; }
        .kf-marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .kf-corner, .kf-marquee-track { animation: none; }
        }
      `}</style>

      {/* WebGL bg layer: sticky, section-er pichone thake */}
      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-0 -mb-[100vh] h-screen w-full"
        style={{ background: noGl ? BG : "transparent" }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-24 sm:px-8 lg:py-32">
        {/* ---- Heading: eyebrow + boro heading, intro dane niche ---- */}
        <div ref={headRef} className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <FadeUp on={headOn} y={14}>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: MUTED }}>
                <span className="inline-block h-2 w-2" style={{ background: INK }} />
                {EYEBROW}
              </div>
            </FadeUp>
            <h2
              className="mt-6 font-medium leading-[0.95] tracking-[-0.05em]"
              style={{ fontSize: "clamp(52px, 8vw, 128px)" }}
            >
              {HEADING.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <span
                    className="block"
                    style={{
                      transform: headOn ? "translateY(0)" : "translateY(110%)",
                      transition: `transform 1100ms ${EASE} ${150 + i * 140}ms`,
                    }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <FadeUp on={headOn} delay={500} y={18}>
            <p className="max-w-[280px] text-base leading-relaxed" style={{ color: MUTED }}>
              {INTRO}
            </p>
          </FadeUp>
        </div>

        {/* ---- One framed panel, 3 columns ---- */}
        <div ref={panelRef} className="relative mt-14 lg:mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {STATS.map((s, i) => (
              <Column key={s.label} stat={s} index={i} on={panelOn} />
            ))}
          </div>
          <Frame on={panelOn} />
        </div>

        {/* ---- Partners: label baame, marquee dane ---- */}
        <div ref={partRef} className="relative mt-20 lg:mt-28">
          <span
            aria-hidden
            className="absolute left-0 top-0 h-px w-full origin-left"
            style={{
              background: LINE,
              transform: partOn ? "scaleX(1)" : "scaleX(0)",
              transition: `transform 1300ms ${EASE_DRAW}`,
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-px w-full origin-right"
            style={{
              background: LINE,
              transform: partOn ? "scaleX(1)" : "scaleX(0)",
              transition: `transform 1300ms ${EASE_DRAW} 200ms`,
            }}
          />

          <div className="grid items-center lg:grid-cols-[240px_1fr]">
            <FadeUp on={partOn} y={12}>
              <div
                className="px-1 py-6 text-xs font-semibold uppercase tracking-[0.2em] lg:py-10"
                style={{ color: MUTED }}
              >
                {PARTNERS_LABEL}
              </div>
            </FadeUp>

            <div
              className="overflow-hidden py-4 lg:py-8"
              style={{
                opacity: partOn ? 1 : 0,
                transition: `opacity 1000ms ${EASE} 300ms`,
                maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
              }}
            >
              <div className="kf-marquee-track flex w-max items-center">
                {marquee.map((p, i) => (
                  <span key={i} className="flex items-center">
                    <span
                      className="px-8 text-2xl font-medium tracking-tight transition-colors duration-300 hover:!text-white sm:px-12 sm:text-3xl"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {p}
                    </span>
                    <span className="kf-corner inline-block h-2 w-2" style={{ background: INK }} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}