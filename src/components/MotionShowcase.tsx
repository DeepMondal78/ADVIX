"use client";

/**
 * Design in Motion: 3D curved showcase
 * Install: npm i three   (TypeScript hole: npm i -D @types/three)
 */
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ================= CONFIG ================= */
const BG = "#C3C3C3"; // section-er bg
const DARK = "#434343"; // heading, line, text-er rong
const SCROLL_VH = 600; // total scroll lomba (barale dhire hobe)
const SMOOTH = 5; // kom = aro makhon/dhire, beshi = druto (4 theke 8 er moddhe rakho)

// Debug: 0 theke 1 er ekta number dile animation oi frame-e thame thakbe (scroll kaj korbe na).
// null dile normal scroll. Code na bodlei URL-e "?p=0.67" diye-o dekhte paro.
const DEBUG_P: number | null = null;

const HEADING_TOP = "Design in";
const HEADING_BOTTOM = "Motion";
const SUB = "Exploring ideas through daily design practice.";
const PARAGRAPH =
  "Concepts, explorations, and interface experiments shared openly as part of our creative process.";
const LINK_TEXT = "View on Dribbble";
const LINK_HREF = "https://dribbble.com";

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

const CARD_H = 0.5; // card-er height (ring-er radius-er ongsho)
const CARD_ANGLE = 38; // protita card ring-er koto degree jure (9 ta card = 40 degree kore, 2 degree fanka)

/**
 * Ring-e card gulo ei order-e boshe (ghurle ei order-e ashe).
 * img: "/motion/1.jpg" dile chhobi boshbe, na dile nijer design-kora card toiri hobe.
 */
type Card = { title: string; tag: string; bg: string; bg2?: string; fg: string; accent: string; img?: string };
const CARDS: Card[] = [
  { title: "AI", tag: "Loose sketches to visualisations", bg: "#F1F7F5", fg: "#111111", accent: "#ff5a1f" },
  { title: "We bring imagination to life", tag: "Our story", bg: "#d6cac4", bg2: "#b9a9a2", fg: "#2a2220", accent: "#8a6a5c" },
  { title: "Elegance", tag: "Product detail", bg: "#0d0e10", bg2: "#50555c", fg: "#ffffff", accent: "#ffffff" },
  { title: "Building the future of music", tag: "Experiences", bg: "#ffffff", bg2: "#e4e6e8", fg: "#111111", accent: "#ff5a1f" },
  { title: "Snank", tag: "Style defines character", bg: "#4a2a22", fg: "#ffffff", accent: "#e9b44c" },
  { title: "Studio", tag: "Frame by frame", bg: "#ffffff", fg: "#111111", accent: "#e8553d" },
  { title: "Novaglam", tag: "Vintage fashion studio", bg: "#f3b2d1", bg2: "#c0508f", fg: "#ffffff", accent: "#ffffff" },
  { title: "2026", tag: "New trends", bg: "#EEF3F1", fg: "#111111", accent: "#0099ff" },
  { title: "Designed for every note", tag: "Sound", bg: "#26303a", bg2: "#7b8794", fg: "#ffffff", accent: "#ffffff" },
];

/**
 * Ring-er pose scroll-er shathe (q = 0..1). Heading ar orbit line-er moto 4 ta frame (0, 1/3, 2/3, 1).
 * p = [spin, tiltX, rollZ, x, y, cameraDistance]   (x, y, distance = ring-er radius-er ongsho)
 * Majh-er (2/3) frame-ta screenshot theke andaj kora, nijer chokhe milie nio.
 */
const POSES: { q: number; p: number[] }[] = [
  { q: 0, p: [-2.502, -0.053, 0.469, -0.943, -0.749, 5.116] },
  { q: 1 / 3, p: [-4.453, 0.165, 0.186, -0.212, -0.695, 4.428] },
  { q: 2 / 3, p: [-6.283, 0.1, -0.2, 0.0, 0.1, 3.0] },
  { q: 1, p: [-7.602, 0.021, -0.287, 0.041, 0.069, 2.832] },
];

/** Heading duita ulto dike soray (stage width-er ongsho). 4 ta frame, soman duroto */
const TOP_DX = [-0.305, -0.158, -0.005, 0.11]; // "DESIGN IN" baam theke dane
const BOT_DX = [0.305, 0.158, 0.01, -0.14]; // "MOTION" dan theke baame

/** Patla orbit line: 2 ta ellipse. protita-r 4 ta frame-er value (viewBox 1900 x 840) */
const RINGS = [
  { cx: [1500, 765, 980, 960], cy: [60, -20, 133, 230], rx: [560, 340, 640, 640], ry: [120, 120, 45, 215], rot: [-22, -4, 10, 18], draw: [0.14, 0.22, 0.3, 1] },
  { cx: [1620, 1000, 990, 956], cy: [200, 260, 350, 545], rx: [560, 420, 640, 640], ry: [100, 90, 175, 190], rot: [-30, -10, 0, 17], draw: [0.14, 0.25, 0.35, 1] },
];
/* ========================================= */

const N_CARDS = CARDS.length;
const DELTA = (Math.PI * 2) / N_CARDS;
const ANGLE = THREE.MathUtils.degToRad(CARD_ANGLE);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/** soman duroter frame-er moddhe linear interpolation */
function frames(arr: number[], p: number) {
  const x = clamp(p) * (arr.length - 1);
  const i = Math.min(arr.length - 2, Math.floor(x));
  const t = x - i;
  return arr[i] * (1 - t) + arr[i + 1] * t;
}

/** POSES-er moddhe interpolation */
function poseAt(q: number): number[] {
  const n = POSES.length;
  if (q <= POSES[0].q) return POSES[0].p;
  if (q >= POSES[n - 1].q) return POSES[n - 1].p;
  let i = 0;
  while (q > POSES[i + 1].q) i++;
  const a = POSES[i];
  const b = POSES[i + 1];
  const t = (q - a.q) / (b.q - a.q);
  return a.p.map((v, k) => v * (1 - t) + b.p[k] * t);
}

/** Ellipse-er ek ordhek, baam prant theke shuru (dir = 1 upor, -1 niche) */
function ringHalf(cx: number, cy: number, rx: number, ry: number, rotDeg: number, dir: 1 | -1) {
  const tau = (rotDeg * Math.PI) / 180;
  const c = Math.cos(tau);
  const s = Math.sin(tau);
  const N = 64;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const th = Math.PI + dir * Math.PI * (i / N);
    const ex = rx * Math.cos(th);
    const ey = ry * Math.sin(th);
    d += `${i ? " L" : "M"}${(cx + ex * c - ey * s).toFixed(1)},${(cy + ex * s + ey * c).toFixed(1)}`;
  }
  return d;
}

/* ---------- card texture (canvas diye toiri, chhobi na thakle) ---------- */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  words.forEach((w) => {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  });
  if (cur) lines.push(cur);
  return lines;
}

function paintCard(cv: HTMLCanvasElement, c: Card, i: number, img?: HTMLImageElement) {
  const W = cv.width;
  const H = cv.height;
  const ctx = cv.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  if (img) {
    const r = Math.max(W / img.width, H / img.height);
    const w = img.width * r;
    const h = img.height * r;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    return;
  }

  if (c.bg2) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c.bg);
    g.addColorStop(1, c.bg2);
    ctx.fillStyle = g;
  } else ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  // gol outline
  ctx.strokeStyle = c.accent;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3;
  [
    [W * 0.88, H * 0.02, W * 0.36],
    [W * 0.06, H * 1.0, W * 0.24],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // top: 3 ta dot + number
  ctx.fillStyle = c.fg;
  ctx.globalAlpha = 0.45;
  [0, 1, 2].forEach((k) => {
    ctx.beginPath();
    ctx.arc(70 + k * 30, 76, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 0.6;
  ctx.font = `600 30px ${MONO}`;
  ctx.textAlign = "right";
  ctx.fillText(String(i + 1).padStart(2, "0"), W - 64, 88);
  ctx.textAlign = "left";

  // accent dot
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(W - 120, H * 0.5, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // title (boro, niche-baam-e)
  ctx.fillStyle = c.fg;
  ctx.textBaseline = "alphabetic";
  const maxW = W * 0.82;
  let size = 200;
  let lines: string[] = [];
  for (; size >= 56; size -= 6) {
    ctx.font = `600 ${size}px ${FONT}`;
    lines = wrapText(ctx, c.title, maxW);
    if (lines.length * size * 0.95 <= H * 0.48 && lines.every((l) => ctx.measureText(l).width <= maxW)) break;
  }
  if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = `${(-size * 0.04).toFixed(1)}px`;
  const baseY = H - 150 - (lines.length - 1) * size * 0.95;
  lines.forEach((l, k) => ctx.fillText(l, 64, baseY + k * size * 0.95));
  if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";

  // tag
  ctx.globalAlpha = 0.75;
  ctx.font = `400 34px ${FONT}`;
  ctx.fillText(c.tag, 64, H - 72);
  ctx.globalAlpha = 1;
}

/** Protita akkhor niche theke uthe ashe (--h variable diye) */
function Line({ text, start }: { text: string; start: number }) {
  let n = start;
  return (
    <span className="block whitespace-nowrap">
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom last:mr-0">
          {word.split("").map((ch, ci) => {
            const a = (n++ * 0.045).toFixed(3);
            const k = `clamp(0, calc((var(--h) - ${a}) / 0.35), 1)`;
            return (
              <span key={ci} className="inline-block" style={{ transform: `translateY(calc((1 - ${k}) * 110%))` }}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export default function MotionShowcase3D() {
  const outerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!outer || !stage || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // debug frame: code-er DEBUG_P, na hole URL-er ?p=0.67
    let debugP: number | null = DEBUG_P;
    const qp = new URLSearchParams(window.location.search).get("p");
    if (qp !== null && qp !== "" && !Number.isNaN(Number(qp))) debugP = clamp(Number(qp));

    /* ---------- three.js scene ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 60);

    // outer (position + roll) > mid (tilt) > inner (spin)
    const outerG = new THREE.Group();
    const midG = new THREE.Group();
    const innerG = new THREE.Group();
    outerG.add(midG);
    midG.add(innerG);
    scene.add(outerG);

    const disposables: { dispose: () => void }[] = [];
    const images: HTMLImageElement[] = [];

    CARDS.forEach((c, i) => {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 768;
      paintCard(cv, c, i);

      // bairer face: shoja texture
      const texOut = new THREE.CanvasTexture(cv);
      texOut.colorSpace = THREE.SRGBColorSpace;
      texOut.anisotropy = 8;
      // bhitorer face: u ulte dei, jeno bhitor theke porle-o shoja dekhay
      const texIn = new THREE.CanvasTexture(cv);
      texIn.colorSpace = THREE.SRGBColorSpace;
      texIn.anisotropy = 8;
      texIn.wrapS = THREE.RepeatWrapping;
      texIn.repeat.x = -1;
      texIn.offset.x = 1;

      const geo = new THREE.CylinderGeometry(1, 1, CARD_H, 28, 1, true, i * DELTA - ANGLE / 2, ANGLE);
      const matOut = new THREE.MeshBasicMaterial({ map: texOut, side: THREE.FrontSide, toneMapped: false });
      const matIn = new THREE.MeshBasicMaterial({ map: texIn, side: THREE.BackSide, toneMapped: false });
      innerG.add(new THREE.Mesh(geo, matOut), new THREE.Mesh(geo, matIn));
      disposables.push(geo, matOut, matIn, texOut, texIn);

      if (c.img) {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
          paintCard(cv, c, i, im);
          texOut.needsUpdate = true;
          texIn.needsUpdate = true;
        };
        im.src = c.img;
        images.push(im);
      }
    });

    /* ---------- size ---------- */
    let W = 1;
    let H = 1;
    let vh = window.innerHeight;
    const resize = () => {
      vh = window.innerHeight;
      W = stage.clientWidth || 1;
      H = stage.clientHeight || 1;
      renderer.setSize(W, H, false);
      const asp = W / H;
      // fov width-er shathe scale hoy (heading-er vw-er shathe mile thake)
      const tanH = clamp(Math.tan(THREE.MathUtils.degToRad(15)) * (1904 / 834) / asp, 0.05, 1.19);
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanH));
      camera.aspect = asp;
      camera.updateProjectionMatrix();
    };

    /* ---------- scroll ---------- */
    let target = 0; // scroll-er asol position (0..1)
    let cur = 0; // dhire dhire target-er dike jachhe
    let raf = 0;
    let running = false;
    let last = performance.now();

    const readTarget = () => {
      if (debugP !== null) {
        target = debugP;
        return;
      }
      const r = outer.getBoundingClientRect();
      const total = Math.max(1, r.height - vh);
      // section screen-er ADHA-te dhukle-i heading-er animation shuru hoy
      target = reduce ? 1 : clamp((-r.top + vh * 0.5) / (total + vh * 0.5));
    };

    const render = (q: number) => {
      // debug frame-e shob animation ekshathe full dekhabe
      const h = debugP !== null ? 1 : seg(q, 0.02, 0.2); // heading akkhor
      const f = debugP !== null ? 1 : seg(q, 0.12, 0.26); // subtitle, paragraph, link
      const p = debugP !== null ? debugP : seg(q, 0.12, 0.92); // animation-er main progress (4 ta frame)

      outer.style.setProperty("--h", h.toFixed(4));
      outer.style.setProperty("--f", f.toFixed(4));

      // heading duita ulto dike soray
      if (topRef.current) topRef.current.style.transform = `translate(-50%,-50%) translate3d(${(frames(TOP_DX, p) * W).toFixed(1)}px,0,0)`;
      if (botRef.current) botRef.current.style.transform = `translate(-50%,-50%) translate3d(${(frames(BOT_DX, p) * W).toFixed(1)}px,0,0)`;

      // orbit line
      RINGS.forEach((rg, k) => {
        const cx = frames(rg.cx, p);
        const cy = frames(rg.cy, p);
        const rx = frames(rg.rx, p);
        const ry = frames(rg.ry, p);
        const rot = frames(rg.rot, p);
        const dr = frames(rg.draw, p);
        [1, -1].forEach((dir, j) => {
          const el = ringRefs.current[k * 2 + j];
          if (!el) return;
          el.setAttribute("d", ringHalf(cx, cy, rx, ry, rot, dir as 1 | -1));
          el.style.strokeDashoffset = String(1 - dr);
        });
      });

      // 3D ring
      const [spin, rx, rz, tx, ty, d] = poseAt(p);
      innerG.rotation.y = spin;
      midG.rotation.x = rx;
      outerG.rotation.z = rz;
      outerG.position.set(tx, ty, 0);
      camera.position.set(0, 0, d);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      // scroll event-er upor nirbhor na hoye protita frame-e position pori
      // (smooth-scroll library / alada scroll container thakleo kaj korbe)
      readTarget();
      cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * SMOOTH));
      if (Math.abs(target - cur) < 0.0002) cur = target;
      render(cur);
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => readTarget();
    const onResize = () => {
      resize();
      readTarget();
      render(cur);
    };

    resize();
    readTarget();
    cur = target;
    render(cur);

    const ro = new ResizeObserver(() => {
      resize();
      render(cur);
    });
    ro.observe(stage);

    // screen-er kache thakle-i loop cholbe (CPU/GPU bachay)
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
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
    io.observe(outer);

    // capture: true => kono nested scroll container scroll korle-o dhora porbe
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      images.forEach((im) => (im.onload = null));
      disposables.forEach((x) => x.dispose());
      renderer.dispose();
    };
  }, []);

  const fade = (px = 14): React.CSSProperties => ({
    opacity: "var(--f)",
    transform: `translateY(calc((1 - var(--f)) * ${px}px))`,
  });

  const headStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    fontFamily: FONT,
    fontSize: "6.9vw",
    fontWeight: 500,
    lineHeight: 0.9,
    letterSpacing: "-0.065em",
    textTransform: "uppercase",
    color: DARK,
    willChange: "transform",
  };

  return (
    <section id="motion" ref={outerRef} className="relative z-30 w-full" style={{ height: `${SCROLL_VH}svh`, background: BG, color: DARK }}>
      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ background: BG }}>
        {/* pichone patla orbit line (scroll-er shathe ghore, baam prant theke aanka hoy) */}
        <svg
          aria-hidden
          viewBox="0 0 1900 840"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          fill="none"
        >
          {[0, 1, 2, 3].map((k) => (
            <path
              key={k}
              ref={(el) => {
                ringRefs.current[k] = el;
              }}
              d="M0,0"
              stroke={DARK}
              strokeWidth="1.1"
              strokeOpacity="0.8"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}
        </svg>

        {/* heading (card-er pichone) */}
        <h2 className="sr-only">
          {HEADING_TOP} {HEADING_BOTTOM}
        </h2>
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          <div ref={topRef} style={{ ...headStyle, top: "35.4%" }}>
            <Line text={HEADING_TOP} start={0} />
          </div>
          <p
            className="absolute left-1/2 top-[45.8%] w-[280px] -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-normal uppercase leading-[1.2] sm:text-[14.5px]"
            style={{ ...fade(14), fontFamily: FONT, color: "#1f1f1f" }}
          >
            {SUB}
          </p>
          <div ref={botRef} style={{ ...headStyle, top: "56.3%" }}>
            <Line text={HEADING_BOTTOM} start={HEADING_TOP.replace(/ /g, "").length} />
          </div>
        </div>

        {/* 3D card ring (heading-er upore) */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" />

        {/* baam-niche: paragraph */}
        <p
          className="absolute bottom-[8.5svh] left-6 z-30 max-w-[290px] text-[14px] leading-[1.15] sm:left-9 sm:text-[17px]"
          style={{ ...fade(16), fontFamily: FONT }}
        >
          {PARAGRAPH}
        </p>

        {/* dan-niche: link */}
        <a
          href={LINK_HREF}
          target="_blank"
          rel="noreferrer"
          className="group absolute bottom-[8.5svh] right-6 z-30 flex items-center gap-4 border-b border-current pb-1.5 text-[11px] uppercase tracking-[0.06em] sm:right-9 sm:text-[13px]"
          style={{ ...fade(16), fontFamily: MONO }}
        >
          {LINK_TEXT}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
