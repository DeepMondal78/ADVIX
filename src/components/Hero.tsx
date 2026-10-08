import React from "react";
import LogoShatter from "../ui/LogoShatter";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[100svh] flex flex-col items-center px-4 pt-32 lg:pt-[170px] pb-16 text-center">
  <LogoShatter className="fixed top-0 left-0 w-full h-[100lvh] -z-10" />

      {/* max-w screen-er % diye, tai boro/choto shob laptop-e same dekhay */}
      <div className="w-full lg:max-w-[min(1400px,78vw)] flex-1 grid grid-cols-1 gap-8 lg:gap-x-4 lg:grid-cols-[1fr_minmax(120px,12vw)_1fr] lg:grid-rows-[auto_1fr]">
        {/* 1) WELCOME TO: majh-er dike (dane) thele dewa */}
        <h1 className="order-1 lg:col-start-1 lg:row-start-1 lg:justify-self-end lg:text-right font-[Helvetica] font-bold uppercase text-[clamp(48px,6.2vw,130px)] leading-[0.95] tracking-[-0.03em] select-none text-[#00010A]">
          Welcome <br />
          to
        </h1>

        {/* 2) advix Technology: majh-er dike (bame) thele dewa, ektu niche nambano */}
        <div className="order-2 lg:col-start-3 lg:row-start-1 lg:row-span-2 flex flex-col items-center lg:items-start lg:text-left lg:justify-start lg:pt-[14vh]">
          <div className="font-[Syne] font-bold lowercase text-[clamp(48px,8vw,150px)] leading-none tracking-[-0.03em] text-[#00010A]">
            advix
          </div>

          <div className="font-[Helvetica] font-bold text-[clamp(48px,6.2vw,115px)] leading-[0.95] tracking-[-0.04em] select-none text-[#00010A]">
            Technology
          </div>

          <div className="mt-4 text-xs sm:text-sm lg:text-base xl:text-lg 2xl:text-xl font-bold uppercase leading-none tracking-wide text-[#00010A]">
            AI-First Software & Digital Solutions
          </div>

          <p className="mt-3 text-2xl sm:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-tight tracking-tight text-[#00010A]">
            Smart Software, Start to Finish.
          </p>
        </div>

        {/* 3) Paragraph: mobile-e shobar niche, desktop-e bame niche */}
        <p className="order-3 lg:col-start-1 lg:row-start-2 lg:self-end lg:justify-self-end lg:text-right mx-auto lg:mx-0 max-w-[560px] lg:max-w-[400px] xl:max-w-[480px] 2xl:max-w-[560px] text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl font-bold leading-snug text-[#808080]">
          We build custom applications, bring AI into the tools you already use,
          and modernise the systems holding you back — along with the websites,
          apps and branding that go around them.
        </p>
      </div>

      {/* Button (ager moto-i, animation same) */}
      <a href="#about" className="btn-border-wrap mt-9">
        <span className="inline-flex items-center justify-center w-[207px] h-[50px] rounded-full bg-[#00010A] hover:bg-zinc-900 text-white text-base font-bold transition-colors">
          Explore Now
        </span>
      </a>
    </section>
  );
}
