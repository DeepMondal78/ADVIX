"use client";

import React, { useEffect, useRef, useState } from "react";

/* ================= CONFIG ================= */
const VIDEO_SRC = "/VideoPanel.mp4"; // public folder-er file. Khali thakle animated gradient dekhabe
const POSTER = ""; // optional: "/poster.jpg"
const DARK = "#00010A";
const ACCENT = "#0099ff";
const EYEBROW = "Showreel 2026";
const TITLE = "Watch us build.";
const SUB = "A quick look at how ideas become real products.";
const XF = 0.5; // video loop-er crossfade shomoy (second)

/* ---- soundtrack config ---- */
const BPM = 96; // druto/dhire korte
const MASTER_VOL = 0.55; // shobar upor-er volume (0..1)
const PAD_VOL = 0.22; // ambient pad
const KICK_VOL = 0.55; // bass pulse
const PLUCK_VOL = 0.16; // sparkle notes
const HAT_VOL = 0.05; // halka tick
const WHOOSH_VOL = 0.12; // sweep
/* ========================================= */

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const vv = (a: number, b: number) => `clamp(0, calc((var(--v) - ${a}) / ${b - a}), 1)`;

/* ================= procedural soundtrack ================= */
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// 4 bar-er chord progression: Am9 -> Fmaj7 -> C -> G
const CHORDS = [
  { pad: [45, 52, 60, 64], arp: [57, 60, 64, 67, 71, 72] },
  { pad: [41, 48, 57, 60], arp: [53, 57, 60, 64, 65, 69] },
  { pad: [48, 55, 60, 64], arp: [55, 60, 64, 67, 72, 76] },
  { pad: [43, 50, 59, 62], arp: [55, 59, 62, 67, 71, 74] },
];
const ARP_STEPS = [0, 3, 6, 8, 11, 14];

type Soundtrack = {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  isRunning: () => boolean;
};

function createSoundtrack(onState: (running: boolean) => void): Soundtrack | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;

  const ctx: AudioContext = new AC();
  const step16 = 60 / BPM / 4;

  // ---- output chain ----
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  // delay (echo) bus
  const delay = ctx.createDelay(1);
  delay.delayTime.value = step16 * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const dlp = ctx.createBiquadFilter();
  dlp.type = "lowpass";
  dlp.frequency.value = 2400;
  const dOut = ctx.createGain();
  dOut.gain.value = 0.55;
  delay.connect(dlp).connect(fb).connect(delay);
  dlp.connect(dOut).connect(master);

  // noise buffer
  const nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = nbuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  // ---- pad (4 oscillator, filter slow LFO) ----
  const padGain = ctx.createGain();
  padGain.gain.value = PAD_VOL;
  const padLp = ctx.createBiquadFilter();
  padLp.type = "lowpass";
  padLp.frequency.value = 700;
  padLp.Q.value = 2;
  padGain.connect(padLp).connect(master);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.12;
  const lfoAmt = ctx.createGain();
  lfoAmt.gain.value = 420;
  lfo.connect(lfoAmt).connect(padLp.frequency);
  lfo.start();
  const padOsc = [0, 1, 2, 3].map((i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? "triangle" : "sawtooth";
    o.detune.value = (i - 1.5) * 7;
    o.frequency.value = mtof(CHORDS[0].pad[i]);
    const g = ctx.createGain();
    g.gain.value = 0.25;
    o.connect(g).connect(padGain);
    o.start();
    return o;
  });

  // ---- voices ----
  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    g.gain.setValueAtTime(KICK_VOL, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.4);
  };

  const hat = (t: number) => {
    const s = ctx.createBufferSource();
    s.buffer = nbuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(HAT_VOL, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s.connect(hp).connect(g).connect(master);
    s.start(t, Math.random());
    s.stop(t + 0.06);
  };

  const pluck = (t: number, midi: number) => {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = mtof(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(4200, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(PLUCK_VOL, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(lp).connect(g);
    g.connect(master);
    g.connect(delay);
    o.start(t);
    o.stop(t + 0.45);
  };

  const whoosh = (t: number, dur: number) => {
    const s = ctx.createBufferSource();
    s.buffer = nbuf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(250, t);
    bp.frequency.exponentialRampToValueAtTime(5000, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(WHOOSH_VOL, t + dur * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    s.connect(bp).connect(g).connect(master);
    s.start(t, Math.random());
    s.stop(t + dur + 0.3);
  };

  // ---- scheduler ----
  let wanted = false;
  let timer = 0;
  let step = 0;
  let nextT = 0;
  let running = false;

  const schedule = (n: number, t: number) => {
    const bar = Math.floor(n / 16) % 4;
    const s = n % 16;
    const ch = CHORDS[bar];

    if (s === 0) {
      padOsc.forEach((o, i) => o.frequency.setTargetAtTime(mtof(ch.pad[i]), t, 0.35));
      if (bar === 3) whoosh(t, step16 * 14); // 4th bar-e sweep, loop-e ghure jabar age
    }
    if (s === 0 || s === 8 || (s === 10 && bar % 2 === 1)) kick(t);
    if (s % 4 === 2) hat(t);
    if (ARP_STEPS.includes(s)) {
      const idx = (ARP_STEPS.indexOf(s) + bar * 2) % ch.arp.length;
      pluck(t, ch.arp[idx]);
    }
  };

  const tick = () => {
    while (nextT < ctx.currentTime + 0.3) {
      schedule(step, nextT);
      nextT += step16;
      step++;
    }
  };

  const begin = () => {
    if (running || !wanted || ctx.state !== "running") return;
    running = true;
    nextT = ctx.currentTime + 0.08;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(MASTER_VOL, ctx.currentTime, 0.9); // fade in
    timer = window.setInterval(tick, 80);
    onState(true);
  };

  ctx.onstatechange = () => {
    if (ctx.state === "running") begin();
  };

  let stopTimer = 0;

  return {
    start() {
      wanted = true;
      window.clearTimeout(stopTimer);
      ctx.resume().catch(() => {});
      if (ctx.state === "running") begin();
      else window.setTimeout(() => onState(ctx.state === "running"), 250);
    },
    stop() {
      wanted = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); // fade out
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => {
        if (wanted) return;
        window.clearInterval(timer);
        running = false;
        ctx.suspend().catch(() => {});
        onState(false);
      }, 900);
    },
    destroy() {
      wanted = false;
      window.clearInterval(timer);
      window.clearTimeout(stopTimer);
      ctx.onstatechange = null;
      ctx.close().catch(() => {});
    },
    isRunning: () => running,
  };
}
/* ========================================================= */

export default function VideoPanel({ active }: { active: boolean }) {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const curIdx = useRef(0);

  const engine = useRef<Soundtrack | null>(null);
  const [soundOn, setSoundOn] = useState(false); // sound ashole bajche kina
  const wantSound = useRef(true); // user nijer haate off kore ni
  const activeRef = useRef(active);
  const soundOnRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const startSound = () => {
    if (!wantSound.current || !activeRef.current) return;
    if (!engine.current) {
      engine.current = createSoundtrack((r) => {
        soundOnRef.current = r;
        setSoundOn(r);
      });
    }
    engine.current?.start();
  };

  // video: section-e dhukle play, baire gele pause. Seamless loop: duto video crossfade (video muted, sound alada)
  useEffect(() => {
    const vs = [vidA.current, vidB.current];
    const first = vs[curIdx.current];
    if (!first) return;

    if (!active) {
      vs.forEach((v) => v?.pause());
      return;
    }
    vs.forEach((v) => {
      if (v) v.muted = true;
    });
    first.play().catch(() => {});

    const id = window.setInterval(() => {
      const a = vs[curIdx.current];
      const b = vs[1 - curIdx.current];
      if (!a || !b) return;
      const d = a.duration;

      if (isFinite(d) && d > XF * 2 && (d - a.currentTime <= XF || a.ended) && b.paused) {
        b.currentTime = 0;
        b.style.zIndex = "2";
        a.style.zIndex = "1";
        b.play().catch(() => {});
        curIdx.current = 1 - curIdx.current;
        window.setTimeout(() => {
          a.pause();
          a.currentTime = 0;
        }, XF * 1000 + 150);
      }

      vs.forEach((v) => {
        if (!v) return;
        if (v.paused) {
          if (v !== vs[curIdx.current]) v.style.opacity = "0";
          return;
        }
        v.style.opacity = String(Math.min(1, v.currentTime / XF));
      });
    }, 50);

    return () => window.clearInterval(id);
  }, [active]);

  // sound: section-e dhukle fade-in, baire gele fade-out
  useEffect(() => {
    if (active) startSound();
    else engine.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // browser autoplay block korle: prothom click / touch / key press-e sound shuru
  useEffect(() => {
    const unlock = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("button")) return;
      if (soundOnRef.current) return;
      startSound();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchend", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchend", unlock);
      engine.current?.destroy();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = () => {
    if (soundOn) {
      wantSound.current = false;
      engine.current?.stop();
    } else {
      wantSound.current = true;
      startSound();
    }
  };

  const words = TITLE.split(" ");

  return (
    <div className="relative h-full w-full overflow-hidden text-white" style={{ background: DARK }}>
      <style>{`
        @keyframes vp-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%, -8%) scale(1.15); } }
        @keyframes vp-spin { to { transform: rotate(360deg); } }
        @keyframes vp-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); } 50% { box-shadow: 0 0 0 10px rgba(255,255,255,0); } }
        @keyframes vp-eq { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .vp-blob, .vp-spin, .vp-eq { animation: none !important; } }
      `}</style>

      {/* media: section sore gele zoom-out hoy */}
      <div className="absolute inset-0" style={{ transform: "scale(calc(1.25 - 0.25 * var(--s, 1)))" }}>
        {VIDEO_SRC ? (
          <>
            {[vidA, vidB].map((r, i) => (
              <video
                key={i}
                ref={r}
                src={VIDEO_SRC}
                poster={POSTER || undefined}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0, zIndex: i === 0 ? 2 : 1 }}
                muted
                playsInline
                preload="auto"
              />
            ))}
          </>
        ) : (
          <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(135deg,#0a1a3a,#00010A)" }}>
            {[
              { c: ACCENT, l: "10%", t: "15%", s: "46vmax", d: "14s" },
              { c: "#7a3cff", l: "55%", t: "40%", s: "40vmax", d: "18s" },
              { c: "#00d4c8", l: "30%", t: "60%", s: "34vmax", d: "22s" },
            ].map((b, i) => (
              <span
                key={i}
                className="vp-blob absolute rounded-full blur-[110px]"
                style={{
                  left: b.l,
                  top: b.t,
                  width: b.s,
                  height: b.s,
                  background: b.c,
                  opacity: 0.45,
                  animation: `vp-float ${b.d} ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 3,
            background: "linear-gradient(to top, rgba(0,1,10,0.8), rgba(0,1,10,0.15) 55%, rgba(0,1,10,0.45))",
          }}
        />
      </div>

      {/* frame + ghurno kon */}
      <div aria-hidden className="pointer-events-none absolute inset-3 z-[4] border border-white/25 sm:inset-5">
        {[
          { top: 0, left: 0 },
          { top: 0, left: "100%" },
          { top: "100%", left: "100%" },
          { top: "100%", left: 0 },
        ].map((pos, k) => (
          <span key={k} className="absolute h-[11px] w-[11px]" style={{ marginLeft: -5.5, marginTop: -5.5, ...pos }}>
            <span className="vp-spin block h-full w-full bg-white" style={{ animation: "vp-spin 7s linear infinite" }} />
          </span>
        ))}
      </div>

      {/* top bar */}
      <div
        className="absolute inset-x-0 top-0 z-[5] flex items-center justify-between px-8 pt-9 text-xs font-semibold uppercase tracking-[0.22em] sm:px-14 sm:pt-12"
        style={{ opacity: vv(0, 0.3) }}
      >
        <span className="flex items-center gap-3">
          <span className="vp-spin inline-block h-2 w-2 bg-white" style={{ animation: "vp-spin 7s linear infinite" }} />
          {EYEBROW}
        </span>
      </div>

      {/* centre text */}
      <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="font-medium leading-[0.92] tracking-[-0.055em]" style={{ fontSize: "clamp(52px, 11vw, 190px)" }}>
          {words.map((w, i) => (
            <span key={i} className="mr-[0.2em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
              <span
                className="inline-block"
                style={{ transform: `translateY(calc((1 - ${vv(i * 0.15, 0.5 + i * 0.15)}) * 118%))` }}
              >
                {w}
              </span>
            </span>
          ))}
        </h2>
        <p
          className="mt-6 max-w-[380px] text-sm leading-snug text-white/70 sm:text-base"
          style={{ opacity: vv(0.4, 0.8), transform: `translateY(calc((1 - ${vv(0.4, 0.8)}) * 16px))` }}
        >
          {SUB}
        </p>
      </div>

      {/* sound button */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end px-8 pb-9 sm:px-14 sm:pb-12"
        style={{
          opacity: vv(0.5, 1),
          transform: `translateY(calc((1 - ${vv(0.5, 1)}) * 20px))`,
          transition: `opacity 300ms ${EASE}`,
        }}
      >
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur transition-colors hover:bg-white hover:text-[#00010A]"
          style={!soundOn ? { animation: "vp-pulse 1.8s ease-in-out infinite" } : undefined}
        >
          {soundOn ? (
            <span className="flex h-3 items-end gap-[2px]" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="vp-eq block h-full w-[2px] origin-bottom bg-current"
                  style={{ animation: `vp-eq ${0.7 + i * 0.15}s ease-in-out ${i * 0.1}s infinite` }}
                />
              ))}
            </span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
              <path d="M11 6l3 4M14 6l-3 4" />
            </svg>
          )}
          Sound {soundOn ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}