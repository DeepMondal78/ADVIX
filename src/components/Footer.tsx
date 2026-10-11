"use client";

/**
 * Studio Footer (advix.com-er footer-er structure onujayi)
 * Dependency nai. Tailwind lagbe (aager component-er moto).
 * Shob text niche CONFIG-e, ekhane bodlale-i hoye jabe.
 */
import React, { useEffect, useRef } from "react";

/* ================= CONFIG ================= */
const BG = "#00010a";
const FG = "#f2f2ee";
const MUTED = "rgba(242,242,238,0.55)";
const LINE = "rgba(242,242,238,0.16)";
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO =
  "'SF Mono', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

const BRAND = "ADVIX"; // shesh-er boro wordmark
const HEADING = ["Designed to", "mean something."];
const CTA_TEXT = "Discuss Your Project";
const CTA_HREF = "mailto:hello@advix.com";
const CALL_TEXT = "Book a 30-minute call";
const CALL_HREF = "https://calendly.com/hello-advix/30min";
const TAGLINE =
  "Websites, AI products, brands, and systems built for clarity, scale and impact.";
const EST = "Est. 2012";
const YEARS = ["14+ years shaping", "digital direction."];
const EMAIL = "hello@advix.com";
const PHONE = "+91 9875462314";
const NAV = [
  { t: "Work", h: "/work" },
  { t: "Services", h: "/services" },
  { t: "About", h: "/about" },
  { t: "Contact", h: "/contact" },
];
const SOCIAL = [
  { t: "Linkedin", h: "https://www.linkedin.com/company/advixstudio/" },
  { t: "Facebook", h: "https://www.facebook.com/advixstudio/" },
  { t: "Dribbble", h: "https://dribbble.com/advixstudio" },
  { t: "Instagram", h: "https://www.instagram.com/advixstudio/" },
];
const MARQUEE = ["Inspire", "Innovate", "Impact"];
const YEAR = new Date().getFullYear();
/* ========================================= */

/** Link: hover-e text upore uthe niche theke notun text ashe */
function RollLink({
  href,
  children,
  external,
}: {
  href: string;
  children: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="sf-roll"
    >
      <span className="sf-roll-in" data-t={children}>
        {children}
      </span>
    </a>
  );
}

export default function StudioFooter() {
  const rootRef = useRef<HTMLElement>(null);

  // screen-e ashle reveal animation chalu
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("sf-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const marq = Array.from({ length: 6 }).flatMap(() => MARQUEE);

  return (
    <footer
      ref={rootRef}
      className="sf relative w-full overflow-hidden"
      style={{ background: BG, color: FG, fontFamily: FONT }}
    >
      <style>{`
        .sf { --d:0s; }
        .sf a { color:inherit; text-decoration:none; }

        /* heading: line dhore niche theke uthe ashe */
        .sf-h { font-size:clamp(44px,9.2vw,168px); font-weight:500; line-height:.92; letter-spacing:-0.055em; }
        .sf-mask { display:block; overflow:hidden; padding-bottom:.1em; margin-bottom:-.1em; }
        .sf-mask > span { display:block; transform:translateY(112%); transition:transform 1.1s cubic-bezier(.16,1,.3,1); transition-delay:var(--d); }
        .sf-in .sf-mask > span { transform:none; }

        /* baki ongsho: halka fade-up */
        .sf-fade { opacity:0; transform:translateY(18px); transition:opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1); transition-delay:var(--d); }
        .sf-in .sf-fade { opacity:1; transform:none; }

        /* CTA pill */
        .sf-cta { position:relative; display:inline-flex; align-items:center; gap:14px; padding:18px 30px; border-radius:999px;
          background:${FG}; color:${BG}; font-size:15px; font-weight:500; overflow:hidden; isolation:isolate; }
        .sf-cta::before { content:""; position:absolute; inset:0; background:#ff5a1f; transform:translateY(101%); transition:transform .5s cubic-bezier(.16,1,.3,1); z-index:-1; }
        .sf-cta:hover::before { transform:none; }
        .sf-cta:hover { color:#fff; }
        .sf-cta i { font-style:normal; display:inline-block; transition:transform .4s cubic-bezier(.16,1,.3,1); }
        .sf-cta:hover i { transform:translateX(5px); }

        .sf-call { display:inline-block; padding-bottom:4px; border-bottom:1px solid ${LINE}; font-size:15px; color:${MUTED}; transition:color .3s, border-color .3s; }
        .sf-call:hover { color:${FG}; border-color:${FG}; }

        /* roll link */
        .sf-roll { display:inline-block; overflow:hidden; vertical-align:bottom; }
        .sf-roll-in { position:relative; display:block; transition:transform .5s cubic-bezier(.16,1,.3,1); }
        .sf-roll-in::after { content:attr(data-t); position:absolute; left:0; top:100%; }
        .sf-roll:hover .sf-roll-in { transform:translateY(-100%); }

        .sf-lbl { font:500 11px/1 ${MONO}; letter-spacing:.12em; text-transform:uppercase; color:${MUTED}; margin-bottom:18px; }
        .sf-col { font-size:17px; line-height:1.55; }
        .sf-col li + li { margin-top:2px; }

        /* marquee */
        .sf-marq { overflow:hidden; border-block:1px solid ${LINE}; }
        .sf-marq-track { display:flex; width:max-content; animation:sf-m 38s linear infinite; }
        .sf-marq-track span { display:flex; align-items:center; padding:20px 0; font-size:clamp(18px,2vw,28px); font-weight:500; letter-spacing:-0.02em; white-space:nowrap; }
        .sf-marq-track span::after { content:"✦"; margin:0 2.4rem; color:#ff5a1f; font-size:.7em; }
        @keyframes sf-m { to { transform:translateX(-50%); } }

        /* giant wordmark: screen-er width bhore */
        .sf-word {
  --ls: 0.08em;
  font-size: clamp(60px, 24vw, 420px);
  font-weight: 600;
  line-height: .78;
  letter-spacing: var(--ls);
  text-align: center;
  white-space: nowrap;
  margin: 0;
  padding-top: .06em;
  padding-left: var(--ls);
  user-select: none;
}

        .sf-top { cursor:pointer; background:none; border:1px solid ${LINE}; color:inherit; border-radius:999px; padding:10px 18px; font:500 11px/1 ${MONO}; letter-spacing:.1em; text-transform:uppercase; transition:background .3s,color .3s; }
        .sf-top:hover { background:${FG}; color:${BG}; }

        .sf a:focus-visible, .sf button:focus-visible { outline:2px solid #ff5a1f; outline-offset:4px; }

        @media (prefers-reduced-motion: reduce) {
          .sf-mask > span, .sf-fade { transition:none; transform:none; opacity:1; }
          .sf-marq-track { animation:none; }
        }
      `}</style>

      {/* ---- upor: boro heading + CTA ---- */}
      <div className="px-[4vw] pb-[10vh] pt-[14vh]">
        <p
          className="sf-lbl sf-fade"
          style={{ ["--d" as string]: "0s" } as React.CSSProperties}
        >
          {EST}
        </p>

        <h2 className="sf-h">
          {HEADING.map((l, i) => (
            <span key={l} className="sf-mask">
              <span
                style={
                  { ["--d" as string]: `${i * 0.12}s` } as React.CSSProperties
                }
              >
                {l}
              </span>
            </span>
          ))}
        </h2>

        <div className="mt-[7vh] flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div
            className="sf-fade flex flex-wrap items-center gap-x-8 gap-y-5"
            style={{ ["--d" as string]: "0.35s" } as React.CSSProperties}
          >
            <a href={CTA_HREF} className="sf-cta">
              {CTA_TEXT}
              <i aria-hidden>→</i>
            </a>
            <a
              href={CALL_HREF}
              target="_blank"
              rel="noreferrer"
              className="sf-call"
            >
              {CALL_TEXT}
            </a>
          </div>
          <p
            className="sf-fade max-w-[340px] text-[17px] leading-[1.3]"
            style={
              {
                color: MUTED,
                ["--d" as string]: "0.45s",
              } as React.CSSProperties
            }
          >
            {TAGLINE}
          </p>
        </div>
      </div>

      {/* ---- marquee ---- */}
      <div className="sf-marq" aria-hidden>
        <div className="sf-marq-track">
          {[0, 1].map((rep) => (
            <React.Fragment key={rep}>
              {marq.map((m, i) => (
                <span key={`${rep}-${i}`}>{m}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ---- info columns ---- */}
      <div
        className="sf-fade grid grid-cols-2 gap-x-6 gap-y-12 px-[4vw] py-[9vh] md:grid-cols-4"
        style={{ ["--d" as string]: "0.2s" } as React.CSSProperties}
      >
        <div className="col-span-2 md:col-span-1">
          <p className="sf-lbl">{EST}</p>
          <p className="sf-col">
            {YEARS[0]}
            <br />
            {YEARS[1]}
          </p>
        </div>

        <div>
          <p className="sf-lbl">Business enquiry</p>
          <ul className="sf-col">
            <li>
              <span style={{ color: MUTED }}>E.</span>{" "}
              <RollLink href={`mailto:${EMAIL}`}>{EMAIL}</RollLink>
            </li>
            <li>
              <span style={{ color: MUTED }}>P.</span>{" "}
              <RollLink href={`tel:${PHONE.replace(/\s/g, "")}`}>
                {PHONE}
              </RollLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="sf-lbl">Menu</p>
          <ul className="sf-col">
            {NAV.map((n) => (
              <li key={n.t}>
                <RollLink href={n.h}>{n.t}</RollLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="sf-lbl">Social</p>
          <ul className="sf-col">
            {SOCIAL.map((s) => (
              <li key={s.t}>
                <RollLink href={s.h} external>
                  {s.t}
                </RollLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- giant wordmark ---- */}
      <div className="px-[2vw]" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="sf-word" aria-hidden>
          {BRAND}
        </p>
      </div>

      {/* ---- bottom bar ---- */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-[4vw] py-6 text-[12px]"
        style={{
          color: MUTED,
          borderTop: `1px solid ${LINE}`,
          fontFamily: MONO,
        }}
      >
        <span>
          © {YEAR} {BRAND}. All rights reserved.
        </span>
        <button
          type="button"
          className="sf-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
