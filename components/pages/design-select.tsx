"use client";

import { useState, useEffect } from "react";

interface DesignSelectProps {
  photos: string[];
  layout: "single" | "double";
  onComplete: (frame: FrameType) => void;
}

// Floating bubble component
const FloatingBubble = ({
  size,
  position,
  delay,
  animation,
}: {
  size: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  delay: string;
  animation: string;
}) => (
  <div
    className={`absolute rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm ${animation}`}
    style={{
      width: size,
      height: size,
      ...position,
      animationDelay: delay,
    }}
  />
);

export type FrameType = "frame2" | "frame3" | "frame4" | "frame5";

interface FrameConfig {
  name: string;
  src: string;
  slots: number; // 3 or 4 photo slots
  shape?: "heart"; // Optional shape for photo clipping
  // Photo slot positions (percentages of strip dimensions)
  photoPositions: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
}

// Frame configurations - positions are percentages
// 2x6 inches at 300 DPI = 600x1800 pixels
export const frames: Record<FrameType, FrameConfig> = {
  frame5: {
    name: "Classic 1",
    src: "/Photostripsnew.png",
    slots: 5,
    photoPositions: [
      { top: 2.2, left: 6.2, width: 87.1, height: 23.3 },
      { top: 26.2, left: 6.2, width: 87.1, height: 23.3 },
      { top: 50.2, left: 6.2, width: 87.1, height: 23.3 },
      { top: 74.4, left: 6.2, width: 87.1, height: 23.3 },
    ],
  },
  frame2: {
    name: "Classic 2",
    src: "/PhotostripsArtboard-2.png",
    slots: 4,
    shape: "heart",
    photoPositions: [
      { top: 6.5, left: 8.7, width: 82.4, height: 23.8 },
      { top: 27.8, left: 8.7, width: 82.4, height: 23.8 },
      { top: 49.4, left: 8.7, width: 82.4, height: 23.8 },
      { top: 70.6, left: 8.7, width: 82.4, height: 23.8 },
    ],
  },
  frame3: {
    name: "Short",
    src: "/PhotostripsArtboard 3.jpg",
    slots: 3,
    photoPositions: [
      { top: 2.3, left: 9.9, width: 80, height: 31.2 },
      { top: 34.45, left: 9.9, width: 80, height: 31.2 },
      { top: 66.5, left: 9.9, width: 80, height: 31.5 },
    ],
  },
  frame4: {
    name: "Classic 3",
    src: "/PhotostripsArtboard 4.jpg",
    slots: 4,
    photoPositions: [
      { top: 1.9, left: 6.4, width: 87.1, height: 23.3 },
      { top: 25.9, left: 6.4, width: 87.1, height: 23.3 },
      { top: 49.95, left: 6.4, width: 87.1, height: 23.3 },
      { top: 74, left: 6.4, width: 87.1, height: 23.3 },
    ],
  },
};

// Get available frames based on layout
const getAvailableFrames = (layout: "single" | "double"): FrameType[] => {
  if (layout === "double") {
    // Only 3-slot frame for double/short layout
    return ["frame3"];
  } else {
    // Only 4-slot frames for single/classic layout
    return ["frame5", "frame4", "frame2"];
  }
};

export function DesignSelect({
  photos,
  layout,
  onComplete,
}: DesignSelectProps) {
  const availableFrames = getAvailableFrames(layout);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(
    availableFrames[0],
  );
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const frame = frames[selectedFrame];

  // Reset selection when layout changes
  useEffect(() => {
    const available = getAvailableFrames(layout);
    if (!available.includes(selectedFrame)) {
      setSelectedFrame(available[0]);
    }
  }, [layout, selectedFrame]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black px-6">
      {/* Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingBubble
          size={300}
          position={{ top: "-5%", left: "-5%" }}
          delay="0s"
          animation="animate-float-bubble"
        />
        <FloatingBubble
          size={200}
          position={{ top: "30%", right: "-5%" }}
          delay="1.5s"
          animation="animate-float-bubble-reverse"
        />
        <FloatingBubble
          size={150}
          position={{ bottom: "5%", left: "5%" }}
          delay="0.5s"
          animation="animate-float-bubble-slow"
        />
        <FloatingBubble
          size={180}
          position={{ bottom: "20%", right: "10%" }}
          delay="2s"
          animation="animate-float-bubble"
        />
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.02] to-black/[0.05] dark:from-transparent dark:via-white/[0.02] dark:to-white/[0.05] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 w-full">
        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="animate-fade-in-up text-center text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
            Choose Frame
          </h1>
          <p className="animate-fade-in-up-delay-1 text-xs font-light tracking-wide text-black/50 dark:text-white/50">
            Select a frame for your strip
          </p>
        </div>

        {/* Frame Preview with Photos */}
        <div className="animate-fade-in-up-delay-2 relative w-32 md:w-40 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.02]">
          {/* Frame Template */}
          <div className="relative" style={{ aspectRatio: "2/6" }}>
            <img
              src={frame.src}
              alt={frame.name}
              className="w-full h-full object-cover rounded-lg"
              onLoad={() => setPreviewLoaded(true)}
            />

            {/* Photo Overlays */}
            {previewLoaded &&
              photos.slice(0, frame.slots).map((photo, index) => {
                const pos = frame.photoPositions[index];
                if (!pos) return null;
                const isHeart = frame.shape === "heart";
                return (
                  <div
                    key={index}
                    className="absolute overflow-hidden"
                    style={{
                      top: `${pos.top}%`,
                      left: `${pos.left}%`,
                      width: `${pos.width}%`,
                      height: `${pos.height}%`,
                      clipPath: isHeart
                        ? "polygon(50% 15%, 55% 10%, 60% 6%, 66% 3%, 73% 1%, 80% 0%, 86% 1%, 91% 4%, 95% 9%, 98% 15%, 100% 22%, 100% 30%, 98% 39%, 94% 48%, 88% 57%, 80% 66%, 70% 76%, 60% 86%, 50% 97%, 40% 86%, 30% 76%, 20% 66%, 12% 57%, 6% 48%, 2% 39%, 0% 30%, 0% 22%, 2% 15%, 5% 9%, 9% 4%, 14% 1%, 20% 0%, 27% 1%, 34% 3%, 40% 6%, 45% 10%)"
                        : undefined,
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="animate-fade-in-up-delay-3 w-full max-w-sm">
          <div
            className={`grid gap-3 ${availableFrames.length === 1 ? "grid-cols-1 max-w-[120px] mx-auto" : "grid-cols-3"}`}
          >
            {availableFrames.map((frameKey) => {
              const frameConfig = frames[frameKey];
              return (
                <button
                  key={frameKey}
                  onClick={() => {
                    if (frameKey !== selectedFrame) {
                      setPreviewLoaded(false);
                      setSelectedFrame(frameKey);
                    }
                  }}
                  className={`group flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 ${
                    selectedFrame === frameKey
                      ? "bg-black dark:bg-white text-white dark:text-black scale-105"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
                  }`}
                >
                  {/* Mini frame preview */}
                  <div className="w-8 h-24 rounded overflow-hidden border border-current/20">
                    <img
                      src={frameConfig.src}
                      alt={frameConfig.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-medium tracking-wide">
                    {frameConfig.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => onComplete(selectedFrame)}
          className="group relative"
        >
          <span className="text-base font-medium tracking-widest text-black/80 dark:text-white/80 uppercase transition-all group-hover:text-black dark:group-hover:text-white group-hover:tracking-[0.3em]">
            Continue
          </span>
          <span className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-500 group-hover:w-full" />
        </button>
      </div>
    </div>
  );
}
