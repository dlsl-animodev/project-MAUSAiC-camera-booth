"use client";

import { useState } from "react";

interface PhotoCustomizeProps {
  photos: string[];
  layout: "single" | "double";
  onComplete: (filteredPhotos: string[]) => void;
}

type FilterType =
  | "none"
  | "grayscale"
  | "sepia"
  | "invert"
  | "brightness"
  | "contrast";

interface FilterConfig {
  filter: string;
  label: string;
  emoji: string;
}

const filters: Record<FilterType, FilterConfig> = {
  none: { filter: "", label: "Original", emoji: "✨" },
  grayscale: { filter: "grayscale(100%)", label: "B&W", emoji: "🖤" },
  sepia: { filter: "sepia(100%)", label: "Sepia", emoji: "🤎" },
  invert: { filter: "invert(100%)", label: "Invert", emoji: "🔄" },
  brightness: { filter: "brightness(1.2)", label: "Bright", emoji: "☀️" },
  contrast: { filter: "contrast(1.3)", label: "Vivid", emoji: "💎" },
};

// Apply filter to image using canvas
const applyFilterToImage = (
  imageSrc: string,
  filterValue: string,
): Promise<string> => {
  return new Promise((resolve) => {
    if (!filterValue) {
      resolve(imageSrc);
      return;
    }

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
      ctx.filter = filterValue;
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
};

export function PhotoCustomize({
  photos,
  layout,
  onComplete,
}: PhotoCustomizeProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("none");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    setIsProcessing(true);
    const filterValue = filters[selectedFilter].filter;

    // Apply filter to all photos
    const filteredPhotos = await Promise.all(
      photos.map((photo) => applyFilterToImage(photo, filterValue)),
    );

    setIsProcessing(false);
    onComplete(filteredPhotos);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black px-6">
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
                  filter: filters[selectedFilter].filter,
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
          <div className="grid grid-cols-6 gap-2">
            {(Object.entries(filters) as Array<[FilterType, FilterConfig]>).map(
              ([filterKey, filterConfig]) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedFilter(filterKey)}
                  className={`group flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-300 ${
                    selectedFilter === filterKey
                      ? "bg-black dark:bg-white text-white dark:text-black scale-105"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white"
                  }`}
                >
                  <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                    {filterConfig.emoji}
                  </span>
                  <span className="text-[8px] font-medium tracking-wide">
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
