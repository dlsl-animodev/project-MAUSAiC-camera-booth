"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DesignSelectProps {
  photos: string[];
  layout: "single" | "double";
  onComplete: (design: DesignType) => void;
}

export type DesignType =
  | "classic"
  | "modern"
  | "retro"
  | "minimal"
  | "colorful"
  | "elegant";

interface DesignConfig {
  name: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  accent: string;
  pattern?: string;
}

export const designs: Record<DesignType, DesignConfig> = {
  classic: {
    name: "Classic",
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    accent: "#000000",
  },
  modern: {
    name: "Modern",
    borderColor: "#3b82f6",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    accent: "#3b82f6",
  },
  retro: {
    name: "Retro",
    borderColor: "#f59e0b",
    backgroundColor: "#fef3c7",
    textColor: "#92400e",
    accent: "#f59e0b",
  },
  minimal: {
    name: "Minimal",
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    textColor: "#374151",
    accent: "#9ca3af",
  },
  colorful: {
    name: "Colorful",
    borderColor: "#ec4899",
    backgroundColor: "#fdf4ff",
    textColor: "#86198f",
    accent: "#a855f7",
  },
  elegant: {
    name: "Elegant",
    borderColor: "#d4af37",
    backgroundColor: "#1a1a2e",
    textColor: "#d4af37",
    accent: "#d4af37",
  },
};

export function DesignSelect({
  photos,
  layout,
  onComplete,
}: DesignSelectProps) {
  const [selectedDesign, setSelectedDesign] = useState<DesignType>("classic");

  const design = designs[selectedDesign];

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background px-4 overflow-hidden">
      {/* Title */}
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-balance text-center text-2xl font-bold text-foreground md:text-3xl">
          Choose Your Design
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick a frame design for your strip
        </p>
      </div>

      {/* Photo Strip Preview */}
      <Card
        className="border-4 p-3 transition-all duration-300"
        style={{
          borderColor: design.borderColor,
          backgroundColor: design.backgroundColor,
        }}
      >
        <CardContent className="p-0">
          <div className="flex flex-col gap-1.5 w-24 md:w-32">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-sm"
                style={{ border: `2px solid ${design.borderColor}` }}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ))}
            {/* Footer text */}
            <div
              className="mt-1 text-center text-xs font-bold tracking-wider"
              style={{ color: design.textColor }}
            >
              📸 PHOTO BOOTH
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Selection */}
      <div className="w-full max-w-xl">
        <h3 className="mb-2 text-center text-sm font-semibold text-foreground">
          Select a Frame Design
        </h3>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {(Object.entries(designs) as Array<[DesignType, DesignConfig]>).map(
            ([designKey, designConfig]) => (
              <button
                key={designKey}
                onClick={() => setSelectedDesign(designKey)}
                className={`relative overflow-hidden rounded-lg border-2 px-3 py-2 text-center text-sm font-medium transition-all ${
                  selectedDesign === designKey
                    ? "ring-2 ring-foreground ring-offset-2"
                    : "hover:border-foreground"
                }`}
                style={{
                  borderColor: designConfig.borderColor,
                  backgroundColor: designConfig.backgroundColor,
                  color: designConfig.textColor,
                }}
              >
                {designConfig.name}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full max-w-sm gap-4">
        <Button
          onClick={() => setSelectedDesign("classic")}
          variant="outline"
          className="flex-1"
        >
          Reset
        </Button>
        <Button onClick={() => onComplete(selectedDesign)} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
