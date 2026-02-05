"use client";

import { useState } from "react";
import { Home } from "@/components/pages/home";
import { LayoutSelect } from "@/components/pages/layout-select";
import { CameraBooth } from "@/components/pages/camera-booth";
import { PhotoCustomize } from "@/components/pages/photo-customize";
import { DesignSelect, type FrameType } from "@/components/pages/design-select";
import { PrintPage } from "@/components/pages/print-page";

type AppPage = "home" | "layout" | "camera" | "customize" | "design" | "print";

interface CameraState {
  photos: string[];
  layout: "single" | "double";
  frame: FrameType;
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<AppPage>("home");
  const [cameraState, setCameraState] = useState<CameraState>({
    photos: [],
    layout: "single",
    frame: "frame1",
  });

  const handleStartClick = () => {
    setCurrentPage("layout");
  };

  const handleLayoutSelect = (layout: "single" | "double") => {
    setCameraState((prev) => ({ ...prev, layout }));
    setCurrentPage("camera");
  };

  const handlePhotosCapture = (photos: string[]) => {
    setCameraState((prev) => ({ ...prev, photos }));
    setCurrentPage("customize");
  };

  const handleCustomizeComplete = (filteredPhotos: string[]) => {
    setCameraState((prev) => ({ ...prev, photos: filteredPhotos }));
    setCurrentPage("design");
  };

  const handleDesignComplete = (frame: FrameType) => {
    setCameraState((prev) => ({ ...prev, frame }));
    setCurrentPage("print");
  };

  const handleReset = () => {
    setCurrentPage("home");
    setCameraState({
      photos: [],
      layout: "single",
      frame: "frame1",
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {currentPage === "home" && <Home onStart={handleStartClick} />}
      {currentPage === "layout" && (
        <LayoutSelect onSelectLayout={handleLayoutSelect} />
      )}
      {currentPage === "camera" && (
        <CameraBooth
          layout={cameraState.layout}
          onPhotosCapture={handlePhotosCapture}
        />
      )}
      {currentPage === "customize" && (
        <PhotoCustomize
          photos={cameraState.photos}
          layout={cameraState.layout}
          onComplete={handleCustomizeComplete}
        />
      )}
      {currentPage === "design" && (
        <DesignSelect
          photos={cameraState.photos}
          layout={cameraState.layout}
          onComplete={handleDesignComplete}
        />
      )}
      {currentPage === "print" && (
        <PrintPage
          photos={cameraState.photos}
          frame={cameraState.frame}
          layout={cameraState.layout}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
