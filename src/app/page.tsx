"use client";
import { useState } from "react";
import Loader from "../components/Loader";
import Hero from "../components/Hero";
import About from "../components/About";
import KeyFacts from "../components/KeyFacts";
import SelectedWork from "../components/SelectedWork";
import Capabilities from "../components/Capabilities";
import ClientStories from "../components/ClientStories";
import MotionShowcase from "../components/MotionShowcase";
import Footer from "../components/Footer";
// import EdgeCross from "../ui/EdgeCross";
// import Services from "@/components/Services";
// import Project from "@/components/Project";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <Loader onComplete={() => setRevealed(true)} />

      {/* Main content eases in from the right as the loader slides off to the left */}
      <div
        className="flex flex-col w-full"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "none" : "translateX(80px)",
          transition:
            "opacity 1000ms ease 450ms, transform 1300ms cubic-bezier(0.22, 1, 0.36, 1) 450ms",
        }}
      >
        <Hero />
        <About />
        <KeyFacts />
        <SelectedWork />
        <Capabilities />
        <ClientStories />
        <MotionShowcase />
        <Footer />
        {/* <EdgeCross side="right" /> */}
        {/* <Services /> */}
        {/* <Project /> */}
      </div>
    </div>
  );
}