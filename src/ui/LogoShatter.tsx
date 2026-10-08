"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/logomodel.gltf";

/* ---------- look ---------- */
const BASE_COLOR = "#07090f";
const GLOW_COLOR = "#0099ff";
const GLOW_PERIOD = 3.2;
const GHOST_COLOR = "#1e3a60";
const GHOST_OPACITY = 0.75;

/* ---------- dhakna ---------- */
// 0 theke 1. Face-er normal jodi kono axis-er dike eto-ta mukh kore thake tahole oita dhakna.
const COVER_NORMAL = 0.6;

/* ---------- intro (load hoye jora lagar animation) ---------- */
const INTRO_DIST = 1.2; // shuru-te dhakna model-er half-width-er koto gun dure thakbe
const INTRO_SPIN = 1.5; // shuru-te koto radian ghurano thakbe
const INTRO_DELAY = 0.35; // load-er pore koto second opekkha
const INTRO_STAGGER = 0.5; // dhakna gulo ek ek kore lagbe, ei shomoyer moddhe
const INTRO_DUR = 0.9; // protita dhakna-r lagte koto second

/* ---------- click & hold ---------- */
const HOLD_DELAY = 2.0; // press korar koto second por kholpa khulbe (ei shomoy screen kapbe)
const OPEN_DIST = 3; // dhakna nijer dik-e koto khulbe (model half-width-er onupat). Screen-er bahire gele kom koro (jemon 0.3)
const OPEN_ROT = 0.15; // khola obosthay shamanno kata (radian)
const FLOAT = 0.02; // khola obosthay bhasha
const WAVE = 0.03; // majh theke pashe khular delay
const SPRING = 30; // khola/bondho howar tan
const DAMP = 9; // beshi = ekdom thire thire thame, kom = ektu dolbe

/* ---------- scroll-e khola ---------- */
const SCROLL_OPEN_START = 0.05; // koto vh scroll korle khulte shuru (0.05 = 5% screen)
const SCROLL_OPEN_END = 0.5; // koto vh-e shopurno khola (beshi = dhire dhire khulbe)
const CLOSE_AT = 0.25; // next section-er top screen-er koto% e ashle jora lagbe (0.25 = upor theke 25%)
const CLOSE_TARGET_ID = "about"; // je section hit korle jora lagbe tar id

/* ---------- screen shake (press kore dhorle HOLD_DELAY dhore) ---------- */
const SCREEN_SHAKE_PX = 8; // shesh-er dike max kampuni (pixel). 0 dile shake bondho
const SCREEN_SHAKE_TARGET: "canvas" | "page" = "canvas"; // "page" dile pura page kapbe
const MODEL_SHAKE = 0.04; // model nijeo ektu kapbe (0 = bondho)

/* ---------- orbit ---------- */
const ORBIT_SIZE = 3.6;
const ORBIT_FLAT = 0.08;
const ORBIT_TILT = 5;
const ORBIT_DEPTH = 0.15;
const ORBIT_SPEED = 0.1;
const ORBIT_MARKERS = 3;
const ORBIT_COLOR = "#000000";
const ORBIT_LINE_OPACITY = 0.1;
const MARKER_SIZE = 0.01;

/* ---------- sound ---------- */
const SOUND_ENABLED = true;
const SOUND_VOLUME = 0.35;
// chhere dile dhakna jaygar koto kache ele "tak" baje (model half-width-er onupat).
// beshi = aro age baje, kom = aro pore baje
const SNAP_NEAR = 0.04;

let audioCtx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;
let lastSnap = 0;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function getNoise(ctx: AudioContext) {
  if (!noiseBuf) {
    const len = Math.floor(ctx.sampleRate * 1.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

// jora lagar "tak" sound: choto thump + choto click
function playSnap() {
  if (!SOUND_ENABLED) return;
  const ctx = getAudio();
  // browser jodi audio unlock na kore thake, tahole chup thakbe
  if (!ctx || ctx.state !== "running") return;

  const now = performance.now();
  if (now - lastSnap < 35) return; // ek shathe onek gulo na baje
  lastSnap = now;

  const t0 = ctx.currentTime;

  // thump
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.08);
  const g = ctx.createGain();
  g.gain.setValueAtTime(SOUND_VOLUME * 0.9, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.15);

  // click
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3500;
  bp.Q.value = 1.2;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(SOUND_VOLUME * 0.6, t0);
  ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.04);
  src.connect(bp).connect(ng).connect(ctx.destination);
  src.start(t0, Math.random());
  src.stop(t0 + 0.05);
}

// khular shomoy halka "tink"
function playTinkle() {
  if (!SOUND_ENABLED) return;
  const ctx = getAudio();
  if (!ctx || ctx.state !== "running") return;
  const t0 = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 2500 + Math.random() * 3500;

  const gain = ctx.createGain();
  const v = SOUND_VOLUME * (0.08 + Math.random() * 0.1);
  gain.gain.setValueAtTime(v, t0);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    t0 + 0.12 + Math.random() * 0.15,
  );

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.3);
}

type MouseState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean;
  down: boolean;
};

type Model = { cx: number; cy: number; halfW: number; halfH: number };

type Piece = {
  mesh: THREE.Mesh;
  pos: THREE.BufferAttribute;
  nor: THREE.BufferAttribute | null;
  restPos: Float32Array;
  restNor: Float32Array;
  triCount: number;
  scale: number;
  chunkOf: Uint32Array; // triangle -> chunk (0 = body, 1..6 = +x,-x,+y,-y,+z,-z dhakna)
  ldir: Float32Array; // chunk-er bahirer dik (mesh-local), n*3
  n: number;
  anyMov: boolean;
  // per chunk
  mov: Uint8Array; // 1 = dhakna (uthbe), 0 = body (thakbe)
  cen: Float32Array; // chunk center, mesh-local
  rest: Float32Array; // chunk center, model-space
  off: Float32Array;
  vel: Float32Array;
  axis: Float32Array;
  rnd: Float32Array;
  ang: Float32Array;
  angV: Float32Array;
  wait: Float32Array;
  active: Uint8Array;
  pend: Uint8Array;
  open: Uint8Array; // 1 = ekhon khola thakbe
  snd: Uint8Array; // 1 = ei bar-er jora lagar sound baja hoye geche
  dirty: Uint8Array;
  quat: Float32Array;
  // khola-r target
  tgt: Float32Array;
  tgtAng: Float32Array;
  // intro
  iOff: Float32Array;
  iAng: Float32Array;
  iDelay: Float32Array;
  iDone: Uint8Array;
};

const _q = new THREE.Quaternion();
const _ax = new THREE.Vector3();
const _v = new THREE.Vector3();
const _p = new THREE.Vector3();
const _d = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _n = new THREE.Vector3();

function createDeterministicRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ekta triangle-ke tar chunk-er rigid transform diye lekho
function writeTri(p: Piece, t: number) {
  const c = p.chunkOf[t];
  const k = c * 3;
  _q.set(
    p.quat[c * 4],
    p.quat[c * 4 + 1],
    p.quat[c * 4 + 2],
    p.quat[c * 4 + 3],
  );

  for (let j = 0; j < 3; j++) {
    const vi = t * 3 + j;
    const b = vi * 3;

    _v.set(
      p.restPos[b] - p.cen[k],
      p.restPos[b + 1] - p.cen[k + 1],
      p.restPos[b + 2] - p.cen[k + 2],
    ).applyQuaternion(_q);
    p.pos.setXYZ(
      vi,
      p.cen[k] + p.off[k] + _v.x,
      p.cen[k + 1] + p.off[k + 1] + _v.y,
      p.cen[k + 2] + p.off[k + 2] + _v.z,
    );

    if (p.nor) {
      _v.set(p.restNor[b], p.restNor[b + 1], p.restNor[b + 2]).applyQuaternion(
        _q,
      );
      p.nor.setXYZ(vi, _v.x, _v.y, _v.z);
    }
  }
}

// kholar delay set koro (majh theke pashe)
function blast(pieces: Piece[], model: Model) {
  for (const p of pieces) {
    if (!p.anyMov) continue;
    for (let c = 0; c < p.n; c++) {
      if (!p.mov[c]) continue;
      const dx = Math.abs(p.rest[c * 3] - model.cx);
      p.wait[c] = dx * WAVE + Math.random() * 0.1;
      p.pend[c] = 1;
    }
  }
}

// delay shesh hole dhakna nijer dik-e khule bhasbe
function openChunk(p: Piece, c: number) {
  p.open[c] = 1;
  p.active[c] = 1;
  p.snd[c] = 0; // chhere dile abar sound bajbe
  if (Math.random() < 0.7) setTimeout(playTinkle, Math.random() * 120);
}

function makeXTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.strokeStyle = "#ffffff";
  g.lineWidth = 6;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(14, 14);
  g.lineTo(50, 50);
  g.moveTo(50, 14);
  g.lineTo(14, 50);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// duto cross kora ellipse, tar opor x gulo line dhore chotachuti kore
function Orbits({ a, cx, cy }: { a: number; cx: number; cy: number }) {
  const b = a * ORBIT_FLAT;
  const sprites = useRef<(THREE.Sprite | null)[]>([]);

  const { geo, tex } = useMemo(() => {
    const pts: number[] = [];
    const seg = 256;
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      pts.push(Math.cos(t) * a, Math.sin(t) * b, 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pts), 3),
    );
    return { geo, tex: makeXTexture() };
  }, [a, b]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let e = 0; e < 2; e++) {
      for (let m = 0; m < ORBIT_MARKERS; m++) {
        const s = sprites.current[e * ORBIT_MARKERS + m];
        if (!s) continue;
        const dir = e === 0 ? 1 : -1;
        const ang =
          t * ORBIT_SPEED * dir * (1 + m * 0.15) +
          (m / ORBIT_MARKERS) * Math.PI * 2 +
          e;
        s.position.set(Math.cos(ang) * a, Math.sin(ang) * b, 0);
      }
    }
  });

  const tilt = (ORBIT_TILT * Math.PI) / 180;

  return (
    <group position={[cx, cy, 0]}>
      {[0, 1].map((e) => (
        <group
          key={e}
          rotation={[
            0,
            e === 0 ? ORBIT_DEPTH : -ORBIT_DEPTH,
            e === 0 ? -tilt : tilt,
          ]}
        >
          <lineLoop geometry={geo}>
            <lineBasicMaterial
              color={ORBIT_COLOR}
              transparent
              opacity={ORBIT_LINE_OPACITY}
              depthWrite={false}
              toneMapped={false}
            />
          </lineLoop>
          {Array.from({ length: ORBIT_MARKERS }).map((_, m) => (
            <sprite
              key={m}
              ref={(el) => {
                sprites.current[e * ORBIT_MARKERS + m] = el;
              }}
              scale={[a * MARKER_SIZE * 2, a * MARKER_SIZE * 2, 1]}
            >
              <spriteMaterial
                map={tex}
                color={ORBIT_COLOR}
                transparent
                opacity={ORBIT_LINE_OPACITY}
                depthWrite={false}
                toneMapped={false}
              />
            </sprite>
          ))}
        </group>
      ))}
    </group>
  );
}

function Logo({
  mouse,
  wrap,
  scroll,
}: {
  mouse: { current: MouseState };
  wrap: { current: HTMLDivElement | null };
  scroll: { current: number };
}) {
  const group = useRef<THREE.Group>(null);
  const shaking = useRef(false);
  const held = useRef(false);
  const opened = useRef(false); // HOLD_DELAY shesh hoye kholpa khule geche kina
  const holdStart = useRef(0);
  const blastAmt = useRef(0);
  const rotY = useRef(0);
  const introFor = useRef<Piece[] | null>(null);
  const introStart = useRef(0);
  const introBusy = useRef(true);
  const { scene } = useGLTF(MODEL);

  const uniforms = useRef({
    uTime: { value: 0 },
    uGlow: { value: new THREE.Color(GLOW_COLOR) },
  });

  const { root, pieces, ghostMat, model } = useMemo(() => {
    const root = scene.clone(true);
    root.updateMatrixWorld(true);

    const material = new THREE.MeshPhysicalMaterial({
      color: BASE_COLOR,
      roughness: 0.35,
      metalness: 0.5,
      transmission: 0,
      thickness: 1.2,
      side: THREE.DoubleSide,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.current.uTime;
      shader.uniforms.uGlow = uniforms.current.uGlow;

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vWorldPos;",
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vLocalPos = transformed;
           vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uTime;
           uniform vec3 uGlow;
           varying vec3 vLocalPos;
           varying vec3 vWorldPos;`,
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
           {
             float phase = fract(uTime / ${GLOW_PERIOD.toFixed(1)});
             float scanPos = mix(-4.0, 4.0, phase);
             float dist = abs((vWorldPos.y * 0.5 + vWorldPos.x * 0.5) - scanPos);
             float band = smoothstep(0.0, 1.0, 1.0 - dist / 0.8);
             band = pow(band, 3.0);

             vec3 blueWhiteGlow = mix(uGlow, vec3(0.8, 0.95, 1.0), band * 0.6);
             float fr = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.0);

             totalEmissiveRadiance += blueWhiteGlow * (band * 7.0 + fr * 0.4);
           }`,
        );
    };
    material.customProgramCacheKey = () => "plastic-fiber-sequential-glow";

    const ghostMat = new THREE.LineBasicMaterial({
      color: GHOST_COLOR,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    ghostMat.visible = false;

    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });

    const pieces: Piece[] = [];
    const s = new THREE.Vector3();
    const rng = createDeterministicRng(0x5eeda1);

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const mesh of meshes) {
      const toLocal = mesh.matrixWorld.clone().invert();
      const normalMat = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);

      let geo = mesh.geometry.clone();
      if (geo.index) geo = geo.toNonIndexed();
      mesh.geometry = geo;
      mesh.material = material;
      mesh.frustumCulled = false;

      const pos = geo.getAttribute("position") as THREE.BufferAttribute;
      const nor = (geo.getAttribute("normal") ??
        null) as THREE.BufferAttribute | null;
      pos.setUsage(THREE.DynamicDrawUsage);
      nor?.setUsage(THREE.DynamicDrawUsage);

      const restPos = new Float32Array(pos.count * 3);
      const restNor = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        restPos[i * 3] = pos.getX(i);
        restPos[i * 3 + 1] = pos.getY(i);
        restPos[i * 3 + 2] = pos.getZ(i);
        if (nor) {
          restNor[i * 3] = nor.getX(i);
          restNor[i * 3 + 1] = nor.getY(i);
          restNor[i * 3 + 2] = nor.getZ(i);
        }
      }

      const triCount = Math.floor(pos.count / 3);

      const triL = new Float32Array(triCount * 3);
      const triC = new Float32Array(triCount * 3);
      const triN = new Float32Array(triCount * 3);

      for (let t = 0; t < triCount; t++) {
        const b = t * 9;
        _a.set(restPos[b], restPos[b + 1], restPos[b + 2]);
        _b.set(restPos[b + 3], restPos[b + 4], restPos[b + 5]);
        _c.set(restPos[b + 6], restPos[b + 7], restPos[b + 8]);

        triL[t * 3] = (_a.x + _b.x + _c.x) / 3;
        triL[t * 3 + 1] = (_a.y + _b.y + _c.y) / 3;
        triL[t * 3 + 2] = (_a.z + _b.z + _c.z) / 3;

        _p.set(triL[t * 3], triL[t * 3 + 1], triL[t * 3 + 2]).applyMatrix4(
          mesh.matrixWorld,
        );
        triC[t * 3] = _p.x;
        triC[t * 3 + 1] = _p.y;
        triC[t * 3 + 2] = _p.z;

        _n.subVectors(_b, _a)
          .cross(_v.subVectors(_c, _a))
          .applyMatrix3(normalMat)
          .normalize();
        triN[t * 3] = _n.x;
        triN[t * 3 + 1] = _n.y;
        triN[t * 3 + 2] = _n.z;

        minX = Math.min(minX, _p.x);
        maxX = Math.max(maxX, _p.x);
        minY = Math.min(minY, _p.y);
        maxY = Math.max(maxY, _p.y);
      }

      // ---- chunk: 0 = body, 1..6 = +x,-x,+y,-y,+z,-z dik-er dhakna ----
      const n = 7;
      const chunkOf = new Uint32Array(triCount);
      const cnt = new Float32Array(n);
      const cen = new Float32Array(n * 3);
      const rest = new Float32Array(n * 3);

      // chunk-er bahirer dik (model-space) -> mesh-local
      const ldir = new Float32Array(n * 3);
      for (let c = 1; c < n; c++) {
        const a = (c - 1) >> 1;
        _d.set(0, 0, 0);
        _d.setComponent(a, (c - 1) & 1 ? -1 : 1);
        _d.transformDirection(toLocal);
        ldir[c * 3] = _d.x;
        ldir[c * 3 + 1] = _d.y;
        ldir[c * 3 + 2] = _d.z;
      }

      for (let t = 0; t < triCount; t++) {
        let c = 0;
        const ax = Math.abs(triN[t * 3]);
        const ay = Math.abs(triN[t * 3 + 1]);
        const az = Math.abs(triN[t * 3 + 2]);
        const mx = Math.max(ax, ay, az);
        if (mx > COVER_NORMAL) {
          const a = ax === mx ? 0 : ay === mx ? 1 : 2;
          c = 1 + a * 2 + (triN[t * 3 + a] > 0 ? 0 : 1);
        }
        chunkOf[t] = c;
        cnt[c]++;
        for (let a = 0; a < 3; a++) {
          cen[c * 3 + a] += triL[t * 3 + a];
          rest[c * 3 + a] += triC[t * 3 + a];
        }
      }

      const mov = new Uint8Array(n);
      for (let c = 0; c < n; c++) {
        if (cnt[c] > 0) {
          for (let a = 0; a < 3; a++) {
            cen[c * 3 + a] /= cnt[c];
            rest[c * 3 + a] /= cnt[c];
          }
        }
        mov[c] = c > 0 && cnt[c] > 0 ? 1 : 0;
      }

      const axis = new Float32Array(n * 3);
      const rnd = new Float32Array(n);
      for (let c = 0; c < n; c++) {
        _ax.set(rng() - 0.5, rng() - 0.5, rng() - 0.5);
        if (_ax.lengthSq() < 1e-4) _ax.set(0, 0, 1);
        _ax.normalize();
        axis[c * 3] = _ax.x;
        axis[c * 3 + 1] = _ax.y;
        axis[c * 3 + 2] = _ax.z;
        rnd[c] = rng();
      }

      // ---- ghost outline: shudhu dhakna-r triangle gulor ----
      const movPos: number[] = [];
      for (let t = 0; t < triCount; t++) {
        if (!mov[chunkOf[t]]) continue;
        for (let j = 0; j < 9; j++) movPos.push(restPos[t * 9 + j]);
      }
      if (movPos.length > 0) {
        const eg = new THREE.BufferGeometry();
        eg.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(movPos), 3),
        );
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(eg, 22),
          ghostMat,
        );
        edges.frustumCulled = false;
        edges.renderOrder = 1;
        mesh.add(edges);
      }

      mesh.getWorldScale(s);

      const quat = new Float32Array(n * 4);
      for (let c = 0; c < n; c++) quat[c * 4 + 3] = 1; // identity

      pieces.push({
        mesh,
        pos,
        nor,
        restPos,
        restNor,
        triCount,
        scale: Math.abs(s.x) || 1,
        chunkOf,
        ldir,
        n,
        anyMov: mov.some((v) => v === 1),
        mov,
        cen,
        rest,
        off: new Float32Array(n * 3),
        vel: new Float32Array(n * 3),
        axis,
        rnd,
        ang: new Float32Array(n),
        angV: new Float32Array(n),
        wait: new Float32Array(n),
        active: new Uint8Array(n),
        pend: new Uint8Array(n),
        open: new Uint8Array(n),
        snd: new Uint8Array(n),
        dirty: new Uint8Array(n),
        quat,
        tgt: new Float32Array(n * 3),
        tgtAng: new Float32Array(n),
        iOff: new Float32Array(n * 3),
        iAng: new Float32Array(n),
        iDelay: new Float32Array(n),
        iDone: new Uint8Array(n),
      });
    }

    const model: Model = {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      halfW: (maxX - minX) / 2 || 1,
      halfH: (maxY - minY) / 2 || 1,
    };

    // khola-r target: protita dhakna nijer dik-e shamanno shore jabe
    for (const p of pieces) {
      const dist = (model.halfW * OPEN_DIST) / p.scale;
      for (let c = 1; c < p.n; c++) {
        if (!p.mov[c]) continue;
        for (let a = 0; a < 3; a++) p.tgt[c * 3 + a] = p.ldir[c * 3 + a] * dist;
        p.tgtAng[c] = (rng() - 0.5) * 2 * OPEN_ROT;
      }
    }

    return { root, pieces, ghostMat, model };
  }, [scene]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const time = state.clock.elapsedTime;
    const m = mouse.current;

    uniforms.current.uTime.value = time;

    // scroll theke khola-r poriman (0..1). Intro cholar shomoy 0
    const scrollAmt = introBusy.current ? 0 : scroll.current;

    // ---- intro setup: prothom frame-e dhakna gulo dure boshiye dao ----
    if (introFor.current !== pieces) {
      introFor.current = pieces;
      introStart.current = time;
      introBusy.current = true;
      for (const p of pieces) {
        if (!p.anyMov) continue;
        const dist = (model.halfW * INTRO_DIST) / p.scale;
        for (let c = 0; c < p.n; c++) {
          if (!p.mov[c]) continue;
          const k = c * 3;
          for (let a = 0; a < 3; a++) {
            p.iOff[k + a] =
              p.ldir[k + a] * dist * (0.8 + Math.random() * 0.4) +
              (Math.random() - 0.5) * dist * 0.3;
          }
          p.iAng[c] = (Math.random() - 0.5) * 2 * INTRO_SPIN;
          p.iDelay[c] = INTRO_DELAY + Math.random() * INTRO_STAGGER;
          p.iDone[c] = 0;
          p.active[c] = 1;
        }
      }
    }

    // ---- click & hold ----
    if (m.down && !held.current && !introBusy.current) {
      held.current = true;
      opened.current = false;
      holdStart.current = time;
    } else if (!m.down && held.current) {
      held.current = false;
      opened.current = false;
      for (const p of pieces) {
        p.pend.fill(0);
        p.open.fill(0); // sob dhakna ashe jabe
      }
    }
    const isHeld = held.current;
    const holdT = time - holdStart.current;

    // HOLD_DELAY por kholpa khulte shuru korbe
    if (isHeld && !opened.current && holdT >= HOLD_DELAY) {
      opened.current = true;
      blast(pieces, model);
    }
    const hasOpened = opened.current;
    const charging = isHeld && !hasOpened; // press korar por, khular age kapar shomoy
    const charge = Math.min(1, holdT / HOLD_DELAY);

    // ---- screen shake: HOLD_DELAY dhore, dhire dhire bere ----
    const shakeEl =
      SCREEN_SHAKE_TARGET === "page" ? document.body : wrap.current;
    if (shakeEl) {
      if (charging && SCREEN_SHAKE_PX > 0) {
        const amp = SCREEN_SHAKE_PX * (0.3 + 0.7 * charge);
        const sx = (Math.random() - 0.5) * 2 * amp;
        const sy = (Math.random() - 0.5) * 2 * amp;
        const sr = (Math.random() - 0.5) * 2 * amp * 0.05;
        shakeEl.style.transform = `translate(${sx}px, ${sy}px) rotate(${sr}deg)`;
        shaking.current = true;
      } else if (shaking.current) {
        shakeEl.style.transform = "";
        shaking.current = false;
      }
    }

    blastAmt.current +=
      (Math.max(hasOpened ? 1 : 0, scrollAmt) - blastAmt.current) *
      Math.min(1, dt * (hasOpened || scrollAmt > 0.05 ? 10 : 3.0));
    ghostMat.opacity = blastAmt.current * GHOST_OPACITY;
    ghostMat.visible = ghostMat.opacity > 0.01;

    // ---- group: shudhu auto-rotate ----
    if (group.current) {
      const g = group.current;

      rotY.current += dt * 0.3;

      m.dx = 0;
      m.dy = 0;

      const k = Math.min(1, dt * 5);
      g.rotation.y += (rotY.current - g.rotation.y) * k;

      if (charging && MODEL_SHAKE > 0) {
        const sh = (0.3 + 0.7 * charge) * MODEL_SHAKE;
        g.position.x = (Math.random() - 0.5) * sh;
        g.position.y = (Math.random() - 0.5) * sh;
      } else {
        g.position.set(0, 0, 0);
      }
    }

    const decay = Math.exp(-DAMP * dt);
    let busy = false;

    for (const p of pieces) {
      if (!p.anyMov) continue;

      const s = p.scale;
      let any = false;

      for (let c = 0; c < p.n; c++) {
        if (!p.mov[c]) continue;
        const k = c * 3;

        if (!p.iDone[c]) {
          // ---- intro: dur theke ese jora lagbe ----
          const u = Math.min(
            1,
            Math.max(0, (time - introStart.current - p.iDelay[c]) / INTRO_DUR),
          );
          const r = 1 - u * u * u; // dhire shuru, shesh-e druto -> "snap"
          for (let a = 0; a < 3; a++) p.off[k + a] = p.iOff[k + a] * r;
          p.ang[c] = p.iAng[c] * r;

          if (u >= 1) {
            p.iDone[c] = 1;
            p.active[c] = 0;
            p.off.fill(0, k, k + 3);
            p.vel.fill(0, k, k + 3);
            p.ang[c] = 0;
            p.angV[c] = 0;
            playSnap();
          } else {
            busy = true;
          }
        } else {
          // ---- khola (HOLD_DELAY-r por) / chhere dile ashe jabe ----
          if (hasOpened && p.pend[c]) {
            p.wait[c] -= dt;
            if (p.wait[c] <= 0) {
              p.pend[c] = 0;
              openChunk(p, c);
            }
          }

          if (scrollAmt > 0.001) p.active[c] = 1;
          if (!p.active[c]) continue;

          const amt = p.open[c] === 1 ? 1 : scrollAmt; // hold = purno khola, noile scroll onujayi
          const isOpen = amt > 0.02;
          if (amt > 0.3) p.snd[c] = 0; // abar jora lagle sound bajbe
          const w = p.rnd[c] * 30;

          for (let a = 0; a < 3; a++) {
            let tg = p.tgt[k + a] * amt;
            if (isOpen && a < 2) {
              tg +=
                (Math.sin(
                  time * (a === 0 ? 0.7 : 0.6) + w * (a === 0 ? 1 : 1.3),
                ) *
                  model.halfW *
                  FLOAT) /
                s;
            }
            p.vel[k + a] += (tg - p.off[k + a]) * SPRING * dt;
            p.vel[k + a] *= decay;
            p.off[k + a] += p.vel[k + a] * dt;
          }

          const tgA = p.tgtAng[c] * amt;
          p.angV[c] += (tgA - p.ang[c]) * SPRING * dt;
          p.angV[c] *= decay;
          p.ang[c] += p.angV[c] * dt;

          if (!isOpen) {
            const offW =
              Math.sqrt(p.off[k] ** 2 + p.off[k + 1] ** 2 + p.off[k + 2] ** 2) *
              s;

            // jaygar kache pouchhaleii "tak" sound (spring thamar opekkha na kore)
            if (!p.snd[c] && offW < model.halfW * SNAP_NEAR) {
              p.snd[c] = 1;
              playSnap();
            }

            const velW =
              Math.sqrt(p.vel[k] ** 2 + p.vel[k + 1] ** 2 + p.vel[k + 2] ** 2) *
              s;
            if (
              offW < 0.003 &&
              velW < 0.02 &&
              Math.abs(p.ang[c]) < 0.003 &&
              Math.abs(p.angV[c]) < 0.03
            ) {
              p.off.fill(0, k, k + 3);
              p.vel.fill(0, k, k + 3);
              p.ang[c] = 0;
              p.angV[c] = 0;
              p.active[c] = 0; // ei frame-e shesh baar rest pose lekha hobe
            }
          }
        }

        _ax.set(p.axis[k], p.axis[k + 1], p.axis[k + 2]);
        _q.setFromAxisAngle(_ax, p.ang[c]);
        p.quat[c * 4] = _q.x;
        p.quat[c * 4 + 1] = _q.y;
        p.quat[c * 4 + 2] = _q.z;
        p.quat[c * 4 + 3] = _q.w;

        p.dirty[c] = 1;
        any = true;
      }

      if (any) {
        for (let t = 0; t < p.triCount; t++) {
          if (p.dirty[p.chunkOf[t]]) writeTri(p, t);
        }
        p.dirty.fill(0);
        p.pos.needsUpdate = true;
        if (p.nor) p.nor.needsUpdate = true;
      }
    }

    introBusy.current = busy;
  });

  return (
    <>
      <group ref={group} scale={[0.75, 0.75, 0.75]} rotation={[0, 0.3, 0]}>
        <primitive object={root} />
      </group>
      <group scale={[0.75, 0.75, 0.75]}>
        <Orbits a={model.halfW * ORBIT_SIZE} cx={model.cx} cy={model.cy} />
      </group>
    </>
  );
}

export default function LogoShatter({
  className = "",
}: {
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const mouse = useRef<MouseState>({
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    active: false,
    down: false,
  });
  const scroll = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouse.current.dx = e.movementX;
      mouse.current.dy = e.movementY;
      mouse.current.active = true;
    };
    const onLeave = () => {
      mouse.current.active = false;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      mouse.current.down = true;
      document.body.style.userSelect = "none";
      getAudio();
    };
    const onUp = () => {
      mouse.current.down = false;
      document.body.style.userSelect = "";
    };
    // je-kono interaction-e audio unlock hoye jabe
    const unlock = () => {
      getAudio();
    };

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const onScroll = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      let a = clamp01(
        (y - vh * SCROLL_OPEN_START) /
          (vh * (SCROLL_OPEN_END - SCROLL_OPEN_START)),
      );
      const target = document.getElementById(CLOSE_TARGET_ID);
      if (target && target.getBoundingClientRect().top < vh * CLOSE_AT) a = 0;
      scroll.current = a;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.style.userSelect = "";
      document.body.style.transform = "";
      if (wrap.current) wrap.current.style.transform = "";
    };
  }, []);

  return (
    <div ref={wrap} className={className}>
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{ position: [0, 0, 20], fov: 30 }}
        style={{ pointerEvents: "auto" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[-6, 8, 10]} intensity={2.5} />
        <directionalLight
          position={[7, -4, 6]}
          intensity={1.5}
          color="#0099ff"
        />
        <Suspense fallback={null}>
          <Logo mouse={mouse} wrap={wrap} scroll={scroll} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL);
