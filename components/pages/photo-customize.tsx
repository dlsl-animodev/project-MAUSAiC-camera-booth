"use client";

import { useState } from "react";

interface PhotoCustomizeProps {
  photos: string[];
  layout: "single" | "double";
  onComplete: (filteredPhotos: string[]) => void;
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

export type FilterType = "normal" | "bnw" | "brown" | "film";

interface FilterConfig {
  label: string;
  emoji: string;
  previewFilter: string; // CSS filter for preview
}

export const filters: Record<FilterType, FilterConfig> = {
  normal: {
    label: "Normal",
    emoji: "✨",
    previewFilter: "contrast(1.15) saturate(1.1) brightness(1.02)",
  },
  bnw: {
    label: "B&W",
    emoji: "🖤",
    previewFilter: "grayscale(100%) contrast(1.3)",
  },
  brown: {
    label: "Brown",
    emoji: "🤎",
    previewFilter: "grayscale(100%) sepia(40%) contrast(1.2)",
  },
  film: {
    label: "Film",
    emoji: "🎞️",
    previewFilter: "contrast(0.95) saturate(0.85) brightness(1.05)",
  },
};

// Apply XMP-based filter to image using canvas pixel manipulation
const applyXMPFilter = (
  imageSrc: string,
  filterType: FilterType,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply filter based on XMP preset values
      switch (filterType) {
        case "normal":
          // Vertical Normal: Contrast +36, Clarity -20, Vibrance +36
          applyNormalFilter(data);
          break;
        case "bnw":
          // Vertical BnW: Grayscale with custom gray mixer, Contrast +58, Grain
          applyBnWFilter(data);
          break;
        case "brown":
          // Vertical Brown: Grayscale with sepia tone
          applyBrownFilter(data);
          break;
        case "film":
          // Vertical Film: Analog look with faded blacks, grain
          applyFilmFilter(data);
          break;
      }

      ctx.putImageData(imageData, 0, 0);

      // Add grain for certain filters
      if (
        filterType === "bnw" ||
        filterType === "brown" ||
        filterType === "film"
      ) {
        addGrain(ctx, canvas.width, canvas.height, 0.08);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

// Normal filter: Vibrant with boosted colors
function applyNormalFilter(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Boost contrast
    r = clamp(((r / 255 - 0.5) * 1.25 + 0.5) * 255);
    g = clamp(((g / 255 - 0.5) * 1.25 + 0.5) * 255);
    b = clamp(((b / 255 - 0.5) * 1.25 + 0.5) * 255);

    // Boost vibrance (increase saturation of less saturated colors)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const vibranceAmount = 0.3 * (1 - saturation);

    const avg = (r + g + b) / 3;
    r = clamp(r + (r - avg) * vibranceAmount);
    g = clamp(g + (g - avg) * vibranceAmount);
    b = clamp(b + (b - avg) * vibranceAmount);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

// B&W filter with custom gray mixer based on XMP
function applyBnWFilter(data: Uint8ClampedArray) {
  // Gray mixer values from XMP: Red -18, Orange +2, Yellow -27, Green -16, Aqua -13, Blue -4, Purple +9, Magenta +3
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Custom luminance calculation based on gray mixer
    let gray = r * 0.25 + g * 0.55 + b * 0.2;

    // Apply contrast (+58 from XMP)
    gray = clamp(((gray / 255 - 0.5) * 1.45 + 0.5) * 255);

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

// Brown/Sepia filter
function applyBrownFilter(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Convert to grayscale first
    let gray = r * 0.25 + g * 0.55 + b * 0.2;

    // Apply contrast
    gray = clamp(((gray / 255 - 0.5) * 1.35 + 0.5) * 255);

    // Apply sepia/brown tone
    data[i] = clamp(gray * 1.1); // Red boost
    data[i + 1] = clamp(gray * 0.95); // Green slightly reduced
    data[i + 2] = clamp(gray * 0.75); // Blue reduced for warmth
  }
}

// Film filter: Analog look with faded blacks and muted colors
function applyFilmFilter(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Fade the blacks (lift shadows)
    r = clamp(r * 0.92 + 20);
    g = clamp(g * 0.92 + 18);
    b = clamp(b * 0.92 + 22);

    // Slightly desaturate
    const avg = (r + g + b) / 3;
    r = clamp(r * 0.85 + avg * 0.15);
    g = clamp(g * 0.85 + avg * 0.15);
    b = clamp(b * 0.85 + avg * 0.15);

    // Add slight color cast
    r = clamp(r * 1.02);
    b = clamp(b * 0.98);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

// Add film grain effect
function addGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 255;
    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  }

  ctx.putImageData(imageData, 0, 0);
}

export function PhotoCustomize({
  photos,
  layout,
  onComplete,
}: PhotoCustomizeProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("normal");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);

    // Apply XMP-based filter to all photos
    const filteredPhotos = await Promise.all(
      photos.map((photo) => applyXMPFilter(photo, selectedFilter)),
    );

    setIsProcessing(false);
    onComplete(filteredPhotos);
  };

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
            Add Filter
          </h1>
          <p className="animate-fade-in-up-delay-1 text-xs font-light tracking-wide text-black/50 dark:text-white/50">
            Enhance your photos
          </p>
        </div>

        {/* Photo Strip Preview */}
        <div className="animate-fade-in-up-delay-2 relative rounded-xl bg-black p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col gap-1 w-28 md:w-36">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border-2 border-white/20"
                style={{
                  filter: filters[selectedFilter].previewFilter,
                }}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Filter Selection */}
        <div className="animate-fade-in-up-delay-3 w-full max-w-sm">
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(filters) as Array<[FilterType, FilterConfig]>).map(
              ([filterKey, filterConfig]) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedFilter(filterKey)}
                  className={`group flex flex-col items-center gap-1 rounded-xl p-3 transition-all duration-300 ${
                    selectedFilter === filterKey
                      ? "bg-black dark:bg-white text-white dark:text-black scale-105"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
                  }`}
                >
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110">
                    {filterConfig.emoji}
                  </span>
                  <span className="text-[10px] font-medium tracking-wide">
                    {filterConfig.label}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="group relative disabled:opacity-50"
        >
          <span className="text-base font-medium tracking-widest text-black/80 dark:text-white/80 uppercase transition-all group-hover:text-black dark:group-hover:text-white group-hover:tracking-[0.3em]">
            {isProcessing ? "Processing..." : "Continue"}
          </span>
          <span className="absolute -bottom-1.5 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-500 group-hover:w-full group-disabled:w-0" />
        </button>
      </div>
    </div>
  );
}
