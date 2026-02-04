"use client";

import { Button } from "@/components/ui/button";

interface HomeProps {
  onStart: () => void;
}

export function Home({ onStart }: HomeProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-12 px-4 overflow-hidden">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-8">
          {/* Logo 1 */}
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-foreground bg-background">
            <span className="text-3xl font-bold text-foreground">📷</span>
          </div>

          {/* Logo 2 */}
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-foreground bg-foreground">
            <span className="text-3xl font-bold text-background">✨</span>
          </div>
        </div>
        <h1 className="text-balance text-center text-5xl font-bold text-foreground md:text-6xl">
          MAUSAiC-camera-booth
        </h1>
        <p className="text-balance text-center text-lg text-muted-foreground">
          Create beautiful photo strips instantly
        </p>
      </div>

      {/* Start Button */}
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button
          onClick={onStart}
          size="lg"
          className="h-16 text-lg font-semibold"
        >
          Click to Start
        </Button>
      </div>
    </div>
  );
}
