"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const openRef = useRef(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const links = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Project", href: "#projects" },
    { label: "Contact Us", href: "#contact" },
  ];

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Esc dile menu bondho, boro screen-e gele auto bondho
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // scroll: niche = lukao, upore = dekhao, top-e shob-shomoy dekhao
  useEffect(() => {
    const THRESHOLD = 8; // choto nora-chora ignore korbe
    lastY.current = window.scrollY;

    const update = () => {
      ticking.current = false;
      const y = Math.max(0, window.scrollY);
      const diff = y - lastY.current;

      if (y < 20) {
        setHidden(false);
      } else if (Math.abs(diff) > THRESHOLD) {
        if (diff > 0) {
          setHidden(true);
          if (openRef.current) setOpen(false); // niche scroll-e menu bondho
        } else {
          setHidden(false);
        }
        lastY.current = y;
      }
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shineBtn =
    "group relative overflow-hidden bg-white text-[#333] rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_18px_rgba(255,255,255,0.55)]";

  const shine = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-zinc-400/60 to-transparent transition-all duration-700 ease-out group-hover:left-[150%]"
    />
  );

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-[6.75vw] lg:pt-[38px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
        hidden && !open ? "-translate-y-[150%]" : "translate-y-0"
      }`}
    >
      <div className="relative mx-auto max-w-[1800px]">
        <nav className="relative flex items-center justify-between bg-[#03030a] rounded-full h-14 sm:h-16 lg:h-22 pl-4 pr-2.5 sm:pl-6 sm:pr-3 lg:pl-8 lg:pr-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2"
            onClick={() => setOpen(false)}
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              viewBox="0 0 32 32"
              fill="none"
              aria-label="advix logo"
            >
              <line
                x1="8"
                y1="28"
                x2="20"
                y2="8"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="27" cy="27" r="5.5" fill="white" />
            </svg>
            <span className="text-2xl sm:text-3xl leading-none font-[Syne] font-bold tracking-tight text-white">
              advix
            </span>
          </Link>

          {/* Center pills (desktop) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-6 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 xl:px-6 py-1 rounded-full bg-[#4a4a4a] border border-white/80 text-white text-sm xl:text-base font-semibold hover:bg-[#5c5c5c] transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Get Started (sm and up) */}
            <a
              href="#contact"
              className={`${shineBtn} hidden sm:inline-block px-4 py-2 text-sm lg:text-base whitespace-nowrap`}
            >
              <span className="relative z-10">Get Started</span>
              {shine}
            </a>

            {/* Hamburger (below lg) */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              data-open={open}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#4a4a4a] border border-white/80 flex items-center justify-center"
            >
              <svg
                className="burger w-6 h-6 sm:w-7 sm:h-7 overflow-visible"
                viewBox="20 1.5 160 120"
                fill="none"
                stroke="white"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line
                  className="patty"
                  x1="50"
                  y1="61"
                  x2="150"
                  y2="61"
                  pathLength={100}
                />
                <path
                  className="buns"
                  pathLength={100}
                  d="M50,29h96c27,0,48-1,34,40-18.12,53.08-48.64,23.86-48.64,23.86L60.64,22.14"
                />
                <path
                  className="buns"
                  pathLength={100}
                  d="M50,94h96c27,0,48,1,34-40C161.88,1,131.36,30.17,131.36,30.17L60.64,100.88"
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile / tablet dropdown */}
        <div
          className={`lg:hidden absolute left-0 right-0 top-full mt-3 origin-top transition-all duration-300 ${
            open
              ? "opacity-100 scale-y-100 pointer-events-auto"
              : "opacity-0 scale-y-95 pointer-events-none"
          }`}
        >
          <div className="bg-[#03030a] rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="w-full text-center px-6 py-2.5 rounded-full bg-[#4a4a4a] border border-white/80 text-white text-base font-semibold hover:bg-[#5c5c5c] transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Get Started (only very small screens, bar-e jayga nei) */}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className={`${shineBtn} sm:hidden w-full text-center px-4 py-2.5 text-base`}
            >
              <span className="relative z-10">Get Started</span>
              {shine}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}