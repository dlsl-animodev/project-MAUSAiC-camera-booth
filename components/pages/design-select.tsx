"use client";

import { useState } from "react";

interface DesignSelectProps {
  photos: string[];
  layout: "single" | "double";
  onComplete: (design: DesignType) => void;
}

export type DesignType =
  | "valentine"
  | "marquee"
  | "candy"
  | "neon"
  | "vintage"
  | "classic";

interface DesignConfig {
  name: string;
  emoji: string;
  stripClass: string;
  frameClass: string;
  footerClass: string;
  footerText: string;
  // For canvas rendering
  background: string;
  borderColor: string;
  photoBorder: string;
  textColor: string;
  decoration?: string;
}

export const designs: Record<DesignType, DesignConfig> = {
  valentine: {
    name: "Valentine",
    emoji: "❤️",
    stripClass:
      "bg-gradient-to-b from-[#8b0000] via-[#dc143c] to-[#8b0000] border-[5px] border-white",
    frameClass:
      "border-[3px] border-[#ffb6c1] rounded shadow-[0_0_20px_rgba(255,182,193,0.4)]",
    footerClass: "text-white",
    footerText: "Photobooth by MAUSAiC",
    background:
      "linear-gradient(180deg, #8b0000 0%, #dc143c 50%, #8b0000 100%)",
    borderColor: "#ffffff",
    photoBorder: "#ffb6c1",
    textColor: "#ffffff",
    decoration: "hearts",
  },
  marquee: {
    name: "Marquee",
    emoji: "⭐",
    stripClass:
      "bg-gradient-to-b from-[#2c1810] via-[#5c3a1f] to-[#2c1810] border-[5px] border-[#8b4513] shadow-[inset_0_0_20px_rgba(255,215,0,0.6),0_0_30px_rgba(255,215,0,0.3)]",
    frameClass:
      "border-[3px] border-[#d4af37] rounded shadow-[0_4px_15px_rgba(0,0,0,0.5),0_0_20px_rgba(255,215,0,0.5)]",
    footerClass: "text-[#ffd700]",
    footerText: "Photobooth by MAUSAiC",
    background:
      "linear-gradient(180deg, #2c1810 0%, #5c3a1f 50%, #2c1810 100%)",
    borderColor: "#8b4513",
    photoBorder: "#d4af37",
    textColor: "#ffd700",
    decoration: "marquee",
  },
  candy: {
    name: "Candy",
    emoji: "🍬",
    stripClass:
      "bg-gradient-to-b from-[#fff0f5] via-[#ffe4e9] to-[#fff0f5] border-[5px] border-[#ff69b4]",
    frameClass: "border-[3px] border-[#ffb6c1] rounded shadow-sm",
    footerClass: "text-[#c71585]",
    footerText: "Photobooth by MAUSAiC",
    background:
      "linear-gradient(180deg, #fff0f5 0%, #ffe4e9 50%, #fff0f5 100%)",
    borderColor: "#ff69b4",
    photoBorder: "#ffb6c1",
    textColor: "#c71585",
    decoration: "candy",
  },
  neon: {
    name: "Neon",
    emoji: "⚡",
    stripClass:
      "bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] border-[5px] border-[#00ffff] shadow-[inset_0_0_20px_#00ffff,0_0_30px_rgba(0,255,255,0.4)]",
    frameClass:
      "border-[3px] border-[#ff00ff] rounded shadow-[0_0_8px_#ff00ff,inset_0_0_8px_rgba(255,0,255,0.2)]",
    footerClass: "text-[#00ff00] drop-shadow-[0_0_10px_#00ff00]",
    footerText: "Photobooth by MAUSAiC",
    background:
      "linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)",
    borderColor: "#00ffff",
    photoBorder: "#ff00ff",
    textColor: "#00ff00",
    decoration: "neon",
  },
  vintage: {
    name: "Vintage",
    emoji: "📽️",
    stripClass:
      "bg-gradient-to-b from-[#f5e6d3] via-[#e8d7c3] to-[#f5e6d3] border-[5px] border-[#8b7355]",
    frameClass:
      "border-[3px] border-[#a0826d] rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.15)]",
    footerClass: "text-[#5c4033] font-mono",
    footerText: "Photobooth by MAUSAiC",
    background:
      "linear-gradient(180deg, #f5e6d3 0%, #e8d7c3 50%, #f5e6d3 100%)",
    borderColor: "#8b7355",
    photoBorder: "#a0826d",
    textColor: "#5c4033",
  },
  classic: {
    name: "Classic",
    emoji: "✨",
    stripClass:
      "bg-gradient-to-b from-white to-[#f8f9fa] border-[5px] border-[#2c3e50]",
    frameClass:
      "border-[3px] border-[#34495e] rounded shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
    footerClass: "text-[#2c3e50]",
    footerText: "Photobooth by MAUSAiC",
    background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
    borderColor: "#2c3e50",
    photoBorder: "#34495e",
    textColor: "#2c3e50",
  },
};

// Floating hearts decoration
const FloatingHearts = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
    {["❤", "💕", "♥", "💕", "❤", "♥"].map((heart, i) => (
      <div
        key={i}
        className="absolute text-xl opacity-60 animate-pulse"
        style={{
          top: `${[5, 5, 30, 50, 70, 90][i]}%`,
          left: i % 2 === 0 ? "5%" : undefined,
          right: i % 2 === 1 ? "5%" : undefined,
          animationDelay: `${i * 0.5}s`,
        }}
      >
        {heart}
      </div>
    ))}
  </div>
);

// Marquee lights decoration
const MarqueeLights = () => (
  <div className="absolute inset-0 pointer-events-none z-[5]">
    {/* Top lights */}
    {[12, 25, 38, 51, 64, 77, 90].map((left, i) => (
      <div
        key={`top-${i}`}
        className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
        style={{
          left: `${left}%`,
          top: "8px",
          animationDelay: i % 2 === 0 ? "0s" : "0.75s",
        }}
      />
    ))}
    {/* Bottom lights */}
    {[12, 25, 38, 51, 64, 77, 90].map((left, i) => (
      <div
        key={`bottom-${i}`}
        className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
        style={{
          left: `${left}%`,
          bottom: "8px",
          animationDelay: i % 2 === 0 ? "0s" : "0.75s",
        }}
      />
    ))}
    {/* Left lights */}
    {[10, 25, 40, 55, 70, 85].map((top, i) => (
      <div
        key={`left-${i}`}
        className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
        style={{
          left: "8px",
          top: `${top}%`,
          animationDelay: i % 2 === 0 ? "0s" : "0.75s",
        }}
      />
    ))}
    {/* Right lights */}
    {[10, 25, 40, 55, 70, 85].map((top, i) => (
      <div
        key={`right-${i}`}
        className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
        style={{
          right: "8px",
          top: `${top}%`,
          animationDelay: i % 2 === 0 ? "0s" : "0.75s",
        }}
      />
    ))}
  </div>
);

// Candy stripes decoration
const CandyStripes = () => (
  <>
    <div
      className="absolute top-0 left-0 right-0 h-7 z-[5]"
      style={{
        background:
          "repeating-linear-gradient(90deg, #ff69b4 0px, #ff69b4 8px, #ffb6c1 8px, #ffb6c1 16px)",
      }}
    />
    <div
      className="absolute bottom-0 left-0 right-0 h-7 z-[5]"
      style={{
        background:
          "repeating-linear-gradient(90deg, #ff69b4 0px, #ff69b4 8px, #ffb6c1 8px, #ffb6c1 16px)",
      }}
    />
  </>
);

export function DesignSelect({
  photos,
  layout,
  onComplete,
}: DesignSelectProps) {
  const [selectedDesign, setSelectedDesign] = useState<DesignType>("valentine");

  const design = designs[selectedDesign];

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black px-6">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.05] dark:from-transparent dark:via-white/[0.02] dark:to-white/[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full">
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="animate-fade-in-up text-center text-4xl font-semibold tracking-tight text-black dark:text-white md:text-5xl">
            Choose Frame
          </h1>
          <p className="animate-fade-in-up-delay-1 text-sm font-light tracking-wide text-black/50 dark:text-white/50">
            Select a theme for your photo strip
          </p>
        </div>

        {/* Frame Preview with Photos */}
        <div
          className={`animate-fade-in-up-delay-2 relative w-36 md:w-44 rounded-xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.02] ${design.stripClass}`}
        >
          {/* Decorations */}
          {design.decoration === "hearts" && <FloatingHearts />}
          {design.decoration === "marquee" && <MarqueeLights />}
          {design.decoration === "candy" && <CandyStripes />}

          {/* Photos */}
          <div className="flex flex-col gap-1.5 relative z-10">
            {photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className={`overflow-hidden ${design.frameClass}`}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className={`mt-2 text-center text-[8px] font-bold tracking-wider relative z-10 ${design.footerClass}`}
          >
            {design.footerText}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="animate-fade-in-up-delay-3 w-full max-w-md">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {(Object.entries(designs) as Array<[DesignType, DesignConfig]>).map(
              ([designKey, designConfig]) => (
                <button
                  key={designKey}
                  onClick={() => setSelectedDesign(designKey)}
                  className={`group flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all duration-300 ${
                    selectedDesign === designKey
                      ? "bg-black dark:bg-white text-white dark:text-black scale-105"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
                  }`}
                >
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                    {designConfig.emoji}
                  </span>
                  <span className="text-[10px] font-medium tracking-wide">
                    {designConfig.name}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => onComplete(selectedDesign)}
          className="group relative mt-2"
        >
          <span className="text-lg font-medium tracking-widest text-black/80 dark:text-white/80 uppercase transition-all group-hover:text-black dark:group-hover:text-white group-hover:tracking-[0.3em]">
            Continue
          </span>
          <span className="absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-500 group-hover:w-full" />
        </button>
      </div>
    </div>
  );
}
