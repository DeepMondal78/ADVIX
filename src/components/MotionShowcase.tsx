"use client";

/**
 * Design in Motion: 3D spiral showcase + card grid
 *
 * Timeline (scroll-er shathe):
 *   1) Spiral baam-niche theke shuru hoy, upore uthe dan-upor kon diye bahire chole jay
 *   2) Tarpor upor theke card gulo pore ese 4 ta kore 2 line-e boshe, shathe shathe nana text animate hoy
 *
 * Install: npm i three   (TypeScript hole: npm i -D @types/three)
 */
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ================= CONFIG ================= */
const BG = "#DFE4EF"; // section-er bg
const DARK = "#00010a"; // heading, line, text-er rong
const SCROLL_VH = 1000; // total scroll lomba (barale dhire hobe)
const SMOOTH = 6; // kom = aro makhon/dhire, beshi = druto (4 theke 8 er moddhe rakho)

// Debug: 0 theke 1 er ekta number dile animation oi jaigay thame thakbe (scroll kaj korbe na).
// null dile normal scroll. Code na bodlei URL-e "?p=0.35" diye-o dekhte paro.
// Mota-muti: 0.05 = spiral shuru, 0.2/0.35/0.5 = majh-er frame, 0.65 = spiral bahire, 0.7-0.96 = grid
const DEBUG_P: number | null = null;

const HEADING_TOP = "Design in";
const HEADING_BOTTOM = "Motion";
const SUB = "Exploring ideas through daily design practice.";
const PARAGRAPH =
  "Concepts, explorations, and interface experiments shared openly as part of our creative process.";
const LINK_TEXT = "View on Dribbble";
const LINK_HREF = "https://dribbble.com";

// ---- grid section-er text ----
const GRID_LABEL = "(02) Selected explorations";
const GRID_HEADING = "Ideas that move, pixels that matter.";
const GRID_PARAGRAPH =
  "Every card is a small experiment: a layout, a motion, a mood. Made daily, refined in the open.";
const PILLS = [
  { t: "UI", x: "6%", y: "30%", r: -8, a: 0.5 },
  { t: "Motion", x: "92%", y: "27%", r: 7, a: 0.58 },
  { t: "Brand", x: "4%", y: "66%", r: 5, a: 0.66 },
  { t: "AI", x: "95%", y: "69%", r: -6, a: 0.74 },
];
const STATS = [
  { n: 8, pad: 2, label: "Shots this week" },
  { n: 365, pad: 3, label: "Days of practice" },
];
const MARQUEE = ["Concepts", "Interfaces", "Motion", "Branding", "Experiments"];

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO =
  "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

// ---- spiral-er shape (radius = 1 dhore, baki sob radius-er ongsho) ----
const HELIX_STEP = 31.3; // ek card theke porer card-e spiral koto degree ghore
const PITCH = -0.14; // ek card theke porer card-e koto upor/niche jay (rinatmok = niche)
const CARD_ANGLE = 30.3; // protita card spiral-er koto degree jure. HELIX_STEP-er cheye 1 degree kom = card gulo prai gaye gaye
const CARD_H = 0.4; // card-er height
const GRID_COUNT = 8; // grid-e prothom koyta card dekhabe (4 ta kore 2 line = 8)
/* ---- shesh-e spiral track dhore upore uthe jay ---- */
const SCREW_START = 2.4; // spiral-er koto-tomo frame (0..4) theke uthte shuru kore. Komale aro age
const SCREW_RISE = 3.4; // koto upore uthe jabe. Shesh-e ekhono kichu dekha gele barao
const SCREW_EASE = 1.6; // 1 = shoman speed, beshi = shuru-te aro dhire ar shesh-e aro druto
const HEAD_SPLIT = 0.85; // heading duita kotota soray (stage width-er ongsho). Beshi = aro dure
const RING_SHIFT = 1; // orbit line card-er shathe ektu aage/pichone mone hole 1.1 ba 0.9 koro

/**
 * Card gulo ei order-e boshe (prothom card = spiral-er shuru).
 * img: "/motion/1.jpg" dile chhobi boshbe, na dile nijer design-kora card toiri hobe.
 */
type Card = {
  title: string;
  tag: string;
  bg: string;
  bg2?: string;
  fg: string;
  accent: string;
  img?: string;
};
const CARDS: Card[] = [
  {
    title: "AI",
    tag: "Loose sketches to visualisations",
    bg: "#F1F7F5",
    fg: "#111111",
    accent: "#ff5a1f",
  },
  {
    title: "We bring imagination to life",
    tag: "Our story",
    bg: "#d6cac4",
    bg2: "#b9a9a2",
    fg: "#2a2220",
    accent: "#8a6a5c",
  },
  {
    title: "Elegance",
    tag: "Product detail",
    bg: "#0d0e10",
    bg2: "#50555c",
    fg: "#ffffff",
    accent: "#ffffff",
  },
  {
    title: "Building the future of music",
    tag: "Experiences",
    bg: "#ffffff",
    bg2: "#e4e6e8",
    fg: "#111111",
    accent: "#ff5a1f",
  },
  {
    title: "Snank",
    tag: "Style defines character",
    bg: "#4a2a22",
    fg: "#ffffff",
    accent: "#e9b44c",
  },
  {
    title: "Studio",
    tag: "Frame by frame",
    bg: "#ffffff",
    fg: "#111111",
    accent: "#e8553d",
  },
  {
    title: "Novaglam",
    tag: "Vintage fashion studio",
    bg: "#f3b2d1",
    bg2: "#c0508f",
    fg: "#ffffff",
    accent: "#ffffff",
  },
  {
    title: "2026",
    tag: "New trends",
    bg: "#EEF3F1",
    fg: "#111111",
    accent: "#0099ff",
  },
  {
    title: "Designed for every note",
    tag: "Sound",
    bg: "#26303a",
    bg2: "#7b8794",
    fg: "#ffffff",
    accent: "#ffffff",
  },
];

/**
 * Spiral-er pose, 5 ta frame (soman duroto). Frame 1-4 = spiral, frame 5 = upor-dan kon diye bahire.
 * [spin, tiltX, rollZ, x, y, cameraDistance]   (x, y, distance = spiral-er radius-er ongsho)
 * Frame 1-4 screenshot theke fit kora. Frame 5 = shob card screen-er baire.
 */
const POSES: number[][] = [
  [-1.944, -0.156, -0.695, -0.279, -1.471, 2.331],
  [-4.106, 0.147, -0.11, -0.208, -0.959, 3.957],
  [-5.813, 0.104, -0.254, 0.175, -0.415, 3.526],
  [-7.293, 0.034, 0.002, 0.02, -0.215, 2.8],
  [-7.293, 0.034, 0.002, 0.02, -0.215, 2.8],
];
const POSE_ARR = [0, 1, 2, 3, 4, 5].map((k) => POSES.map((f) => f[k]));

/** Patla orbit line: 2 ta ellipse (canvas 1900 x 840 dhore). protita-r 5 ta frame-er value */
const RINGS = [
  {
    cx: [1500, 765, 980, 960, 960],
    cy: [60, -20, 133, 230, 230],
    rx: [560, 340, 640, 640, 640],
    ry: [120, 120, 45, 215, 215],
    rot: [-22, -4, 10, 18, 18],
    draw: [0.14, 0.22, 0.3, 1, 1],
    alpha: [1, 1, 1, 1, 1],
  },
  {
    cx: [1620, 1000, 990, 956, 956],
    cy: [200, 260, 350, 545, 545],
    rx: [560, 420, 640, 640, 640],
    ry: [100, 90, 175, 190, 190],
    rot: [-30, -10, 0, 17, 17],
    draw: [0.14, 0.25, 0.35, 1, 1],
    alpha: [1, 1, 1, 1, 1],
  },
];
/* ========================================= */

const N_CARDS = CARDS.length;
const STEP = THREE.MathUtils.degToRad(HELIX_STEP);
const ANGLE = THREE.MathUtils.degToRad(CARD_ANGLE);
const MID = (N_CARDS - 1) / 2; // spiral-er majh-er card (y = 0 ekhane)

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/** Catmull-Rom spline: frame-er moddhe smooth (kono jhoka/atke jawa nai) */
function cr(arr: number[], s: number) {
  const n = arr.length;
  const x = clamp(s, 0, n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = x - i;
  const p0 = arr[Math.max(0, i - 1)];
  const p1 = arr[i];
  const p2 = arr[i + 1];
  const p3 = arr[Math.min(n - 1, i + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * i-tomo card-er geometry: spiral ribbon-er ekta tukro.
 * Spiral continuous, tai card-er upor-niche edge-o spiral-er dhal onujayi chole,
 * ar pasher card-er edge-er shathe thik mile jay (gaye gaye thake).
 */
function helixPatch(i: number) {
  const SX = 24; // bend smooth rakhar jonno
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const a0 = i * STEP - ANGLE / 2;
  for (let row = 0; row <= 1; row++) {
    for (let x = 0; x <= SX; x++) {
      const u = x / SX;
      const phi = a0 + u * ANGLE;
      const cy = PITCH * (phi / STEP - MID) + (row - 0.5) * CARD_H;
      pos.push(Math.sin(phi), cy, Math.cos(phi));
      uv.push(u, row);
    }
  }
  for (let x = 0; x < SX; x++) {
    const a = x;
    const b = x + 1;
    const c = x + SX + 1;
    const d = x + SX + 2;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
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

function paintCard(
  cv: HTMLCanvasElement,
  c: Card,
  i: number,
  img?: HTMLImageElement,
) {
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
    if (
      lines.length * size * 0.95 <= H * 0.48 &&
      lines.every((l) => ctx.measureText(l).width <= maxW)
    )
      break;
  }
  if ("letterSpacing" in ctx)
    (ctx as unknown as { letterSpacing: string }).letterSpacing =
      `${(-size * 0.04).toFixed(1)}px`;
  const baseY = H - 150 - (lines.length - 1) * size * 0.95;
  lines.forEach((l, k) => ctx.fillText(l, 64, baseY + k * size * 0.95));
  if ("letterSpacing" in ctx)
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";

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
        <span
          key={wi}
          className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom last:mr-0"
        >
          {word.split("").map((ch, ci) => {
            const a = (n++ * 0.045).toFixed(3);
            const k = `clamp(0, calc((var(--h) - ${a}) / 0.35), 1)`;
            return (
              <span
                key={ci}
                className="inline-block"
                style={{ transform: `translateY(calc((1 - ${k}) * 110%))` }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** Grid-er heading: protita shobdo niche theke uthe ashe (--g variable diye) */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => {
        const a = (0.1 + i * 0.03).toFixed(3);
        const k = `clamp(0, calc((var(--g) - ${a}) / 0.14), 1)`;
        return (
          <span
            key={i}
            className="mr-[0.25em] inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom"
          >
            <span
              className="inline-block"
              style={{ transform: `translateY(calc((1 - ${k}) * 110%))` }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </>
  );
}

export default function MotionShowcase3D() {
  const outerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const parRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const statRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    const glCanvas = glRef.current;
    const ringCanvas = ringRef.current;
    const gridLayer = gridRef.current;
    if (!outer || !stage || !glCanvas || !ringCanvas || !gridLayer) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // debug: code-er DEBUG_P, na hole URL-er ?p=0.35
    let debugP: number | null = DEBUG_P;
    const qp = new URLSearchParams(window.location.search).get("p");
    if (qp !== null && qp !== "" && !Number.isNaN(Number(qp)))
      debugP = clamp(Number(qp));

    /* ---------- three.js scene ---------- */
    const renderer = new THREE.WebGLRenderer({
      canvas: glCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
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

    const setDomImage = (
      i: number,
      cv: HTMLCanvasElement,
      fallback?: string,
    ) => {
      const el = imgRefs.current[i];
      if (!el) return;
      try {
        el.src = cv.toDataURL("image/jpeg", 0.92);
      } catch {
        if (fallback) el.src = fallback; // canvas tainted hole direct URL
      }
    };

    CARDS.forEach((c, i) => {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 788;
      paintCard(cv, c, i);
      if (i < GRID_COUNT) setDomImage(i, cv, c.img);

      // bairer face: shoja texture
      const texOut = new THREE.CanvasTexture(cv);
      texOut.colorSpace = THREE.SRGBColorSpace;
      texOut.anisotropy = 4;
      // bhitorer face: u ulte dei, jeno bhitor theke porle-o shoja dekhay
      const texIn = new THREE.CanvasTexture(cv);
      texIn.colorSpace = THREE.SRGBColorSpace;
      texIn.anisotropy = 4;
      texIn.wrapS = THREE.RepeatWrapping;
      texIn.repeat.x = -1;
      texIn.offset.x = 1;

      const geo = helixPatch(i);
      const matOut = new THREE.MeshBasicMaterial({
        map: texOut,
        side: THREE.FrontSide,
        toneMapped: false,
      });
      const matIn = new THREE.MeshBasicMaterial({
        map: texIn,
        side: THREE.BackSide,
        toneMapped: false,
      });
      innerG.add(new THREE.Mesh(geo, matOut), new THREE.Mesh(geo, matIn));
      disposables.push(geo, matOut, matIn, texOut, texIn);

      if (c.img) {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => {
          paintCard(cv, c, i, im);
          texOut.needsUpdate = true;
          texIn.needsUpdate = true;
          if (i < GRID_COUNT) setDomImage(i, cv, c.img);
        };
        im.src = c.img;
        images.push(im);
      }
    });

    /* ---------- size ---------- */
    let W = 1;
    let H = 1;
    let vh = window.innerHeight;
    let dpr = 1;
    const ringCtx = ringCanvas.getContext("2d")!;
    const resize = () => {
      vh = window.innerHeight;
      W = stage.clientWidth || 1;
      H = stage.clientHeight || 1;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(W, H, false);
      ringCanvas.width = Math.round(W * dpr);
      ringCanvas.height = Math.round(H * dpr);
      const asp = W / H;
      // fov width-er shathe scale hoy (heading-er vw-er shathe mile thake)
      const tanH = clamp(
        (Math.tan(THREE.MathUtils.degToRad(15)) * (1904 / 834)) / asp,
        0.05,
        1.19,
      );
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tanH));
      camera.aspect = asp;
      camera.updateProjectionMatrix();
    };

    /* ---------- orbit line (2D canvas, DOM ghaata nai tai halka) ---------- */
    const drawRings = (s: number) => {
      ringCtx.setTransform(1, 0, 0, 1, 0, 0);
      ringCtx.clearRect(0, 0, ringCanvas.width, ringCanvas.height);
      const sc = Math.max(W / 1900, H / 840);
      const ox = (W - 1900 * sc) / 2;
      const oy = (H - 840 * sc) / 2;
      ringCtx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
      ringCtx.strokeStyle = DARK;
      ringCtx.lineWidth = 1.1 / sc;
      RINGS.forEach((rg) => {
        const al = clamp(cr(rg.alpha, s));
        const dr = clamp(cr(rg.draw, s));
        if (al < 0.01 || dr < 0.002) return;
        const cx = cr(rg.cx, s);
        const cy = cr(rg.cy, s);
        const rx = cr(rg.rx, s);
        const ry = cr(rg.ry, s);
        const rot = (cr(rg.rot, s) * Math.PI) / 180;
        ringCtx.globalAlpha = 0.8 * al;
        ringCtx.beginPath();
        ringCtx.ellipse(
          cx,
          cy,
          rx,
          ry,
          rot,
          Math.PI,
          Math.PI + Math.PI * dr,
          false,
        );
        ringCtx.stroke();
        ringCtx.beginPath();
        ringCtx.ellipse(
          cx,
          cy,
          rx,
          ry,
          rot,
          Math.PI,
          Math.PI - Math.PI * dr,
          true,
        );
        ringCtx.stroke();
      });
    };

    /* ---------- scroll ---------- */
    let target = 0; // scroll-er asol position (0..1)
    let cur = 0; // dhire dhire target-er dike jachhe
    let raf = 0;
    let last = 0;
    let glOn = true;
    let gridOn = false;

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
      // s = spiral-er frame (0..4): 1 frame = 0.15 q
      const s = clamp((q - 0.05) / 0.15, 0, 4);
      // ease-in: shuru-te speed 0, dhire dhire barbe, tai kono jotka thakbe na
      const exL = Math.pow(seg(s, SCREW_START, 4), SCREW_EASE);
      const hh = seg(q, 0, 0.05); // heading akkhor
      const intro = seg(q, 0.03, 0.09); // subtitle, paragraph, link ashe
      const g = seg(q, 0.66, 0.96); // grid animation
      // heading ar text grid-er card pora shuru hole dhire dhire mile jay
      const away = 1 - seg(g, 0.05, 0.35);

      outer.style.setProperty("--h", hh.toFixed(4));
      outer.style.setProperty("--g", g.toFixed(4));

      /* ---- heading: spiral uthte shuru korle duita line dui dike soray ---- */
      if (topRef.current) {
        topRef.current.style.transform = `translate(-50%,-50%) translate3d(${(-exL * HEAD_SPLIT * W).toFixed(1)}px,0,0)`;
        topRef.current.style.opacity = away.toFixed(3);
      }
      if (botRef.current) {
        botRef.current.style.transform = `translate(-50%,-50%) translate3d(${(exL * HEAD_SPLIT * W).toFixed(1)}px,0,0)`;
        botRef.current.style.opacity = away.toFixed(3);
      }
      if (subRef.current) {
        subRef.current.style.opacity = (intro * away).toFixed(3);
        subRef.current.style.transform = `translate(-50%,-50%) translateY(${((1 - intro) * 14).toFixed(1)}px)`;
      }
      const io = (intro * away).toFixed(3);
      const iy = ((1 - intro) * 16).toFixed(1);
      if (paraRef.current) {
        paraRef.current.style.opacity = io;
        paraRef.current.style.transform = `translateY(${iy}px)`;
      }
      if (linkRef.current) {
        linkRef.current.style.opacity = io;
        linkRef.current.style.transform = `translateY(${iy}px)`;
        linkRef.current.style.pointerEvents = away > 0.5 ? "auto" : "none";
      }

      /* ---- 3D spiral: shape ek-i thake, card gulo helix-er track dhore ghure ghure upore uthe jay ---- */
      // koto ghurle koto upore uthbe, spiral-er pitch theke hishab kora (tai shape bodlay na)
      const exSpin = -((SCREW_RISE * STEP) / Math.abs(PITCH)) * exL;
      innerG.position.y = PITCH * (exSpin / STEP);
      glCanvas.style.transform = "none";

      const showGL = s < 3.995;
      if (showGL !== glOn) {
        glOn = showGL;
        glCanvas.style.visibility = showGL ? "visible" : "hidden";
        ringCanvas.style.visibility = showGL ? "visible" : "hidden";
      }
      if (showGL) {
        innerG.rotation.y = cr(POSE_ARR[0], s) + exSpin;
        midG.rotation.x = cr(POSE_ARR[1], s);
        outerG.rotation.z = cr(POSE_ARR[2], s);
        outerG.position.set(cr(POSE_ARR[3], s), cr(POSE_ARR[4], s), 0);
        camera.position.set(0, 0, cr(POSE_ARR[5], s));
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        innerG.updateWorldMatrix(true, false);

        // spiral-er axis-er point ta screen-e asholey koto uthlo, orbit line-o tototai uthbe
        let shiftPx = 0;
        if (exL > 0.0005) {
          const py = innerG.position.y;
          const now = new THREE.Vector3(0, 0, 0)
            .applyMatrix4(innerG.matrixWorld)
            .project(camera);
          const before = new THREE.Vector3(0, -py, 0)
            .applyMatrix4(innerG.matrixWorld)
            .project(camera);
          shiftPx = -((now.y - before.y) * H * RING_SHIFT) / 2;
        }
        ringCanvas.style.transform =
          shiftPx !== 0
            ? `translate3d(0px, ${shiftPx.toFixed(1)}px, 0)`
            : "none";

        renderer.render(scene, camera);
        drawRings(s);
      }

      /* ---- grid ---- */
      const showGrid = g > 0.0005;
      if (showGrid !== gridOn) {
        gridOn = showGrid;
        gridLayer.style.visibility = showGrid ? "visible" : "hidden";
      }
      if (showGrid) {
        for (let k = 0; k < GRID_COUNT; k++) {
          const item = itemRefs.current[k];
          const card = cardRefs.current[k];
          const par = parRefs.current[k];
          if (!item || !card || !par) continue;
          const c0 = k * 0.05;
          const raw = seg(g, c0, c0 + 0.4);
          const c = 1 - Math.pow(1 - raw, 3); // ease-out
          const dir = k % 2 === 0 ? -1 : 1;
          card.style.transform = `translate3d(0,${(-(1 - c) * vh * 1.25).toFixed(1)}px,0) rotateX(${((1 - c) * 38).toFixed(2)}deg) rotateZ(${((1 - c) * dir * 9).toFixed(2)}deg) scale(${(1 + (1 - c) * 0.18).toFixed(4)})`;
          card.style.opacity = clamp(raw * 3).toFixed(3);
          par.style.transform = `translate3d(0,${((1 - c) * -8).toFixed(2)}%,0) scale(${(1 + (1 - c) * 0.25).toFixed(4)})`;
          item.style.setProperty("--c", c.toFixed(4));
        }
        // count-up
        const cn = 1 - Math.pow(1 - seg(g, 0.62, 0.95), 3);
        STATS.forEach((st, k) => {
          const el = statRefs.current[k];
          if (el)
            el.textContent = String(Math.round(st.n * cn)).padStart(
              st.pad,
              "0",
            );
        });
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      readTarget();
      cur = reduce
        ? target
        : cur + (target - cur) * (1 - Math.exp(-dt * SMOOTH));
      if (Math.abs(target - cur) < 0.00005) cur = target;
      render(cur);
      // target-e pouchhe gele loop thamiye dei (CPU/GPU bachay)
      raf = cur === target ? 0 : requestAnimationFrame(loop);
    };

    const kick = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      readTarget();
      render(cur);
      kick();
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

    // capture: true => kono nested scroll container scroll korle-o dhora porbe
    window.addEventListener("scroll", kick, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", kick, { capture: true });
      window.removeEventListener("resize", onResize);
      images.forEach((im) => (im.onload = null));
      disposables.forEach((x) => x.dispose());
      renderer.dispose();
    };
  }, []);

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
    willChange: "transform, opacity",
  };

  const marq = Array.from({ length: 4 }).flatMap(() => MARQUEE);

  return (
    <section
      id="motion"
      ref={outerRef}
      className="relative z-30 w-full"
      style={{ height: `${SCROLL_VH}svh`, background: BG, color: DARK }}
    >
      <style>{`
        .ms-wrap { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:space-between; padding:5.5svh 4vw 2.5svh; font-family:${FONT}; }
        .ms-head { display:flex; align-items:flex-end; justify-content:space-between; gap:3vw; width:100%; }
        .ms-label { display:flex; align-items:center; gap:12px; font:500 11px/1 ${MONO}; letter-spacing:.12em; text-transform:uppercase;
          opacity:clamp(0, calc(var(--g) / 0.08), 1); }
        .ms-rule { display:block; height:1px; width:min(18vw,240px); background:currentColor; opacity:.5; transform-origin:left;
          transform:scaleX(clamp(0, calc((var(--g) - 0.02) / 0.15), 1)); }
        .ms-title { margin-top:1.4svh; font-size:clamp(26px,3.4vw,68px); font-weight:500; line-height:1.02; letter-spacing:-0.045em; }
        .ms-para { max-width:300px; font-size:14px; line-height:1.3;
          opacity:clamp(0, calc((var(--g) - 0.12) / 0.15), 1);
          transform:translateY(calc((1 - clamp(0, calc((var(--g) - 0.12) / 0.15), 1)) * 16px)); }

        .ms-grid { --cw:clamp(120px, min(21.5vw, calc((100svh - 340px) * 0.6667)), 420px);
          display:grid; grid-template-columns:repeat(4, var(--cw)); gap:14px 1.1vw; justify-content:center; perspective:1600px; }
        .ms-item { position:relative; width:var(--cw); perspective:1400px; }
        .ms-card { width:var(--cw); aspect-ratio:4/3; overflow:hidden; border-radius:4px; background:#d6d6d6; will-change:transform,opacity; opacity:0;
          box-shadow:0 24px 50px -28px rgba(0,0,0,.45); }
        .ms-par { width:100%; height:100%; will-change:transform; }
        .ms-par img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .7s cubic-bezier(.22,1,.36,1); }
        .ms-item:hover .ms-par img { transform:scale(1.06); }
        .ms-cap { width:var(--cw); padding-top:8px; font-size:12px; line-height:1.2;
          --k:clamp(0, calc((var(--c) - 0.75) * 4), 1); opacity:var(--k); transform:translateY(calc((1 - var(--k)) * 14px)); }
        .ms-cap-line { display:block; height:1px; background:currentColor; opacity:.35; margin-bottom:8px; transform-origin:left; transform:scaleX(var(--k)); }
        .ms-cap-row { display:flex; justify-content:space-between; gap:8px; align-items:baseline; }
        .ms-cap-row b { font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ms-cap-row i { font:400 11px/1 ${MONO}; font-style:normal; opacity:.6; white-space:nowrap; }
        .ms-cap-tag { margin-top:3px; opacity:.6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .ms-foot { display:flex; align-items:center; gap:2vw; font:500 11px/1 ${MONO}; letter-spacing:.1em; text-transform:uppercase;
          opacity:clamp(0, calc((var(--g) - 0.55) / 0.15), 1); }
        .ms-stat { display:flex; align-items:baseline; gap:10px; white-space:nowrap; }
        .ms-stat span.n { font:500 24px/1 ${FONT}; letter-spacing:-0.03em; }
        .ms-marq { flex:1; overflow:hidden; mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent); }
        .ms-marq-track { display:flex; width:max-content; animation:ms-marq 40s linear infinite; }
        .ms-marq-track span { padding-right:2.2rem; white-space:nowrap; }
        .ms-marq-track span::after { content:"✦"; margin-left:2.2rem; opacity:.55; }
        @keyframes ms-marq { to { transform:translateX(-50%); } }

        .ms-pill { position:absolute; z-index:50; pointer-events:none; }
        .ms-pill > div { padding:8px 16px; border-radius:999px; background:${DARK}; color:#fff; font:500 11px/1 ${MONO}; letter-spacing:.1em; text-transform:uppercase;
          animation:ms-float 4.5s ease-in-out infinite; }
        @keyframes ms-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }

        @media (max-width: 767px) {
          .ms-grid { --cw:43vw; grid-template-columns:repeat(2, var(--cw)); gap:10px 3vw; }
          .ms-cap { display:none; }
          .ms-para, .ms-pill { display:none; }
          .ms-wrap { padding-top:4svh; }
          .ms-title { font-size:7vw; }
        }
        @media (prefers-reduced-motion: reduce) { .ms-marq-track, .ms-pill > div { animation:none; } }
      `}</style>

      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ background: BG }}
      >
        {/* pichone patla orbit line */}
        <canvas
          ref={ringRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />

        {/* heading (card-er pichone) */}
        <h2 className="sr-only">
          {HEADING_TOP} {HEADING_BOTTOM}
        </h2>
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          <div ref={topRef} style={{ ...headStyle, top: "35.4%" }}>
            <Line text={HEADING_TOP} start={0} />
          </div>
          <p
            ref={subRef}
            className="absolute left-1/2 top-[45.8%] w-[280px] text-center text-[11px] font-normal uppercase leading-[1.2] sm:text-[14.5px]"
            style={{
              fontFamily: FONT,
              color: "#1f1f1f",
              opacity: 0,
              transform: "translate(-50%,-50%)",
            }}
          >
            {SUB}
          </p>
          <div ref={botRef} style={{ ...headStyle, top: "56.3%" }}>
            <Line
              text={HEADING_BOTTOM}
              start={HEADING_TOP.replace(/ /g, "").length}
            />
          </div>
        </div>

        {/* 3D spiral (heading-er upore) */}
        <canvas
          ref={glRef}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        />

        {/* baam-niche: paragraph */}
        <p
          ref={paraRef}
          className="absolute bottom-[8.5svh] left-6 z-30 max-w-[290px] text-[14px] leading-[1.15] sm:left-9 sm:text-[17px]"
          style={{ fontFamily: FONT, opacity: 0 }}
        >
          {PARAGRAPH}
        </p>

        {/* dan-niche: link */}
        <a
          ref={linkRef}
          href={LINK_HREF}
          target="_blank"
          rel="noreferrer"
          className="group absolute bottom-[8.5svh] right-6 z-30 flex items-center gap-4 border-b border-current pb-1.5 text-[11px] uppercase tracking-[0.06em] sm:right-9 sm:text-[13px]"
          style={{ fontFamily: MONO, opacity: 0 }}
        >
          {LINK_TEXT}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </a>

        {/* ===== spiral-er por: upor theke card pore 4 x 2 grid ===== */}
        <div
          ref={gridRef}
          className="absolute inset-0 z-40"
          style={{ visibility: "hidden" }}
        >
          <div className="ms-wrap">
            <header className="ms-head">
              <div>
                <div className="ms-label">
                  <span>{GRID_LABEL}</span>
                  <i className="ms-rule" />
                </div>
                <h3 className="ms-title">
                  <Words text={GRID_HEADING} />
                </h3>
              </div>
              <p className="ms-para">{GRID_PARAGRAPH}</p>
            </header>

            <div className="ms-grid">
              {CARDS.slice(0, GRID_COUNT).map((c, k) => (
                <div
                  key={c.title}
                  ref={(el) => {
                    itemRefs.current[k] = el;
                  }}
                  className="ms-item"
                  style={
                    {
                      zIndex: 20 - k,
                      ["--c" as string]: 0,
                    } as React.CSSProperties
                  }
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[k] = el;
                    }}
                    className="ms-card"
                  >
                    <div
                      ref={(el) => {
                        parRefs.current[k] = el;
                      }}
                      className="ms-par"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={(el) => {
                          imgRefs.current[k] = el;
                        }}
                        alt={c.title}
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="ms-cap">
                    <span className="ms-cap-line" />
                    <div className="ms-cap-row">
                      <b>{c.title}</b>
                      <i>{String(k + 1).padStart(2, "0")} ↗</i>
                    </div>
                    <div className="ms-cap-tag">{c.tag}</div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="ms-foot">
              <div className="ms-stat">
                <span
                  className="n"
                  ref={(el) => {
                    statRefs.current[0] = el;
                  }}
                >
                  {String(0).padStart(STATS[0].pad, "0")}
                </span>
                <span>{STATS[0].label}</span>
              </div>
              <div className="ms-marq" aria-hidden>
                <div className="ms-marq-track">
                  {[0, 1].map((rep) => (
                    <React.Fragment key={rep}>
                      {marq.map((m, i) => (
                        <span key={`${rep}-${i}`}>{m}</span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="ms-stat">
                <span
                  className="n"
                  ref={(el) => {
                    statRefs.current[1] = el;
                  }}
                >
                  {String(0).padStart(STATS[1].pad, "0")}
                </span>
                <span>{STATS[1].label}</span>
              </div>
            </footer>
          </div>

          {/* bhashmaan pill/sticker, ek ek kore pop kore */}
          {PILLS.map((p) => {
            const k = `clamp(0, calc((var(--g) - ${p.a}) / 0.12), 1)`;
            return (
              <div
                key={p.t}
                className="ms-pill"
                style={{
                  left: p.x,
                  top: p.y,
                  opacity: k,
                  transform: `translate(-50%,-50%) rotate(${p.r}deg) scale(calc(0.4 + 0.6 * ${k}))`,
                }}
              >
                <div>{p.t}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
