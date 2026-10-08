"use client";
import { useEffect, useRef, useState } from "react";

type LoaderProps = {
  /** Time (ms) for the drawing + counter to go from 1% to 100% */
  duration?: number;
  /** Called the moment the reveal starts (flip your page's "revealed" state here) */
  onComplete?: () => void;
};

const INK = "#FFFFFF";
const BG = "#00010A";
const LINE = "#FFFFFF";

const FRAME = 183; // frame box size in px
const SQ = 11; // corner square size in px
const HOLD_MS = 450; // rest on 100% before the reveal
const EXIT_MS = 1600; // box -> full screen

// Logo geometry, traced from the original artwork (box is 183 x 183)
const STEM =
  "M93.4 46.1 L90.4 45 L87.8 45 L85.5 46 L83.2 48.6 L44.4 132.6 L44.6 133.2 L60.2 129.6 L60.8 129.1 L73.5 103 L103.8 102.8 L103.8 101.9 L98 90.8 L80.5 90.6 L79.8 90.1 L79.8 89.1 L96.8 54 L96.8 49.6 L95.5 47.8 Z";
const LEG =
  "M104.5 90.5 L104.2 91.6 L122.2 129 L123.5 129.8 L138.6 133.1 L138.8 132 L119.4 92.1 Z";
const DOT = { cx: 101.1, cy: 75.2, r: 9.1 };

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const easeInOutQuad = (x: number) =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutQuart = (x: number) =>
  x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;

export default function Loader({ duration = 6000, onComplete }: LoaderProps) {
  const [gone, setGone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const borderWrapRef = useRef<HTMLDivElement>(null);
  const borderRectRef = useRef<SVGRectElement>(null);
  const cornersWrapRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stemRef = useRef<SVGPathElement>(null);
  const legRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const strokeRef = useRef<SVGGElement>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // lock page scroll while the loader is on screen
  useEffect(() => {
    if (gone) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      ho: html.style.overflow,
      bo: body.style.overflow,
      bt: body.style.touchAction,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    // mobile-e touch diye tana bondho
    const stop = (e: TouchEvent) => e.preventDefault();
    window.addEventListener("touchmove", stop, { passive: false });

    return () => {
      html.style.overflow = prev.ho;
      body.style.overflow = prev.bo;
      body.style.touchAction = prev.bt;
      window.removeEventListener("touchmove", stop);
    };
  }, [gone]);

  useEffect(() => {
    const shell = shellRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    const counter = counterRef.current;
    const borderWrap = borderWrapRef.current;
    const borderRect = borderRectRef.current;
    const cornersWrap = cornersWrapRef.current;
    const stem = stemRef.current;
    const leg = legRef.current;
    const dot = dotRef.current;
    const fill = fillRef.current;
    const strokes = strokeRef.current;
    const root = rootRef.current;
    if (
      !shell ||
      !frame ||
      !content ||
      !counter ||
      !borderWrap ||
      !borderRect ||
      !cornersWrap ||
      !stem ||
      !leg ||
      !dot ||
      !fill ||
      !strokes ||
      !root
    )
      return;

    let raf = 0;
    let completed = false;
    let lastText = "";
    let box = { x: 0, y: 0, w: FRAME, h: FRAME };

    const start = performance.now();
    const exitStart = start + duration + HOLD_MS;

    const measure = () => {
      const r = frame.getBoundingClientRect();
      box = { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    measure();
    window.addEventListener("resize", measure);

    /** Moves the border + the 4 corner squares to the given rectangle */
    const place = (x: number, y: number, w: number, h: number, s: number[]) => {
      borderRect.setAttribute("x", String(x + 0.5));
      borderRect.setAttribute("y", String(y + 0.5));
      borderRect.setAttribute("width", String(Math.max(0, w - 1)));
      borderRect.setAttribute("height", String(Math.max(0, h - 1)));
      const pts = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
      pts.forEach(([cx, cy], i) => {
        const c = cornerRefs.current[i];
        if (c)
          c.style.transform = `translate3d(${cx - SQ / 2}px, ${cy - SQ / 2}px, 0) scale(${s[i]})`;
      });
    };

    const tick = (now: number) => {
      if (now < exitStart) {
        // ---------- LOADING: everything is a smooth function of time ----------
        const t = clamp((now - start) / duration);

        const b = easeInOutSine(seg(t, 0, 0.24)); // border draws itself
        borderRect.style.strokeDashoffset = String(1 - b);
        place(
          box.x,
          box.y,
          box.w,
          box.h,
          [0, 1, 2, 3].map((i) =>
            easeOutCubic(seg(b, i * 0.25, i * 0.25 + 0.1)),
          ),
        );

        stem.style.strokeDashoffset = String(
          1 - easeInOutSine(seg(t, 0.2, 0.56)),
        );
        leg.style.strokeDashoffset = String(
          1 - easeInOutSine(seg(t, 0.5, 0.78)),
        );
        dot.style.strokeDashoffset = String(
          1 - easeInOutSine(seg(t, 0.74, 0.92)),
        );

        const f = easeInOutSine(seg(t, 0.9, 1));
        fill.style.opacity = String(f);
        strokes.style.opacity = String(1 - f);

        const n = Math.max(1, Math.round(100 * easeInOutQuad(t)));
        const text = `${n}%`;
        if (text !== lastText) {
          lastText = text;
          counter.textContent = text;
          root.setAttribute("aria-valuenow", String(n));
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      // ---------- EXIT: the frame grows into the full screen ----------
      if (!completed) {
        completed = true;
        measure();
        onCompleteRef.current?.();
      }

      const e = clamp((now - exitStart) / EXIT_MS);
      const k = easeInOutQuart(e);
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const L = lerp(box.x, 0, k);
      const T = lerp(box.y, 0, k);
      const R = lerp(box.x + box.w, vw, k);
      const B = lerp(box.y + box.h, vh, k);

      place(L, T, R - L, B - T, [1, 1, 1, 1]);

      // cream layer with a rectangular hole -> the page shows through the hole
      shell.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${L}px ${T}px, ${L}px ${B}px, ${R}px ${B}px, ${R}px ${T}px, ${L}px ${T}px)`;

      // logo + counter melt away at the start
      const c = easeOutCubic(seg(e, 0, 0.28));
      content.style.opacity = String(1 - c);
      content.style.transform = `scale(${1 + 0.06 * c})`;

      // border + corners fade as they reach the screen edges
      const edge = 1 - seg(e, 0.78, 1);
      borderWrap.style.opacity = String(edge);
      cornersWrap.style.opacity = String(edge);

      if (e < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setGone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [duration]);

  if (gone) return null;

  const stroke = {
    fill: "none",
    stroke: INK,
    strokeWidth: 1.2,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
  };

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={1}
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      <style>{`
        @keyframes loader-border-pulse {
          0%   { opacity: 0.5; }
          50%  { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @keyframes loader-corner-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-border, .loader-corner { animation: none !important; }
        }
      `}</style>

      {/* Cream layer. In the exit it gets a growing rectangular hole. */}
      <div
        ref={shellRef}
        style={{ position: "absolute", inset: 0, background: BG }}
      />

      {/* Logo + counter (centred) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 96,
            willChange: "transform, opacity",
          }}
        >
          <div
            ref={frameRef}
            style={{ position: "relative", width: FRAME, height: FRAME }}
          >
            <svg
              viewBox="0 0 183 183"
              width={FRAME}
              height={FRAME}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
              aria-hidden="true"
            >
              <g ref={fillRef} fill={INK} style={{ opacity: 0 }}>
                <path d={STEM} />
                <path d={LEG} />
                <circle {...DOT} />
              </g>
              <g ref={strokeRef}>
                <path ref={stemRef} d={STEM} {...stroke} />
                <path ref={legRef} d={LEG} {...stroke} />
                <circle
                  ref={dotRef}
                  {...DOT}
                  {...stroke}
                  transform={`rotate(-90 ${DOT.cx} ${DOT.cy})`}
                />
              </g>
            </svg>
          </div>

          <div
            ref={counterRef}
            style={{
              fontFamily:
                "'Inter', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 0.2,
              color: "#FFFFFF",
            }}
          >
            1%
          </div>
        </div>
      </div>

      {/* Border: full-screen overlay so it can grow from the frame to the screen */}
      <div
        ref={borderWrapRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <svg
          className="loader-border"
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
            animation: "loader-border-pulse 2.4s ease-in-out infinite",
          }}
          aria-hidden="true"
        >
          <rect
            ref={borderRectRef}
            fill="none"
            stroke={LINE}
            strokeWidth={1}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
          />
        </svg>
      </div>

      {/* Four corner squares */}
      <div
        ref={cornersWrapRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            ref={(el) => {
              cornerRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: SQ,
              height: SQ,
              transform: "translate3d(0,0,0) scale(0)",
              willChange: "transform",
            }}
          >
            <span
              className="loader-corner"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                background: "#FFFFFF",
                animation: "loader-corner-spin 7s linear infinite",
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
