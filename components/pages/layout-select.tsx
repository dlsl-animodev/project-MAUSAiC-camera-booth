"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LayoutSelectProps {
  onSelectLayout: (layout: "single" | "double") => void;
}

export function LayoutSelect({ onSelectLayout }: LayoutSelectProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-12 px-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-balance text-center text-4xl font-bold text-foreground md:text-5xl">
          Choose Your Layout
        </h1>
        <p className="text-center text-muted-foreground">
          Select how you want your photos arranged
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        {/* Single Strip - 4 photos */}
        <Card className="cursor-pointer border-2 transition-all hover:border-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex flex-col gap-2">
              <div className="h-10 w-8 rounded border-2 border-foreground" />
              <div className="h-10 w-8 rounded border-2 border-foreground" />
              <div className="h-10 w-8 rounded border-2 border-foreground" />
              <div className="h-10 w-8 rounded border-2 border-foreground" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-center text-xl font-semibold text-foreground">
                Single Strip
              </h3>
              <p className="text-sm text-muted-foreground">4 photos</p>
              <Button
                onClick={() => onSelectLayout("single")}
                className="mt-2 w-full"
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Short Strip - 2 photos */}
        <Card className="cursor-pointer border-2 transition-all hover:border-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex flex-col gap-2">
              <div className="h-10 w-8 rounded border-2 border-foreground" />
              <div className="h-10 w-8 rounded border-2 border-foreground" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-center text-xl font-semibold text-foreground">
                Short Strip
              </h3>
              <p className="text-sm text-muted-foreground">2 photos</p>
              <Button
                onClick={() => onSelectLayout("double")}
                className="mt-2 w-full"
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
