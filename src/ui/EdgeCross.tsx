"use client";

type Props = {
  side?: "right" | "left";
  rotated?: boolean; // true dile "+" er jayga-y "✕" hoy
  size?: number; // px
};

export default function EdgeCross({ side = "right", rotated = false, size = 20 }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-1/2 z-[60] -translate-y-1/2 mix-blend-difference ${
        side === "right" ? "right-3 sm:right-5" : "left-3 sm:left-5"
      }`}
    >
      <div className="relative" style={{ width: size, height: size, transform: rotated ? "rotate(45deg)" : "none" }}>
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white" />
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white" />
      </div>
    </div>
  );
}