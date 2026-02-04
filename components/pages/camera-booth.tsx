"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface CameraBoothProps {
  layout: "single" | "double";
  onPhotosCapture: (photos: string[]) => void;
}

type Phase = "ready" | "capturing" | "selecting";

export function CameraBooth({ layout, onPhotosCapture }: CameraBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const totalPhotosToCapture = 9;
  const requiredPhotos = layout === "single" ? 4 : 3;

  // Request camera permission
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        streamRef.current = stream;
        setPermission(true);
      } catch (error) {
        console.error("Camera permission denied:", error);
        setPermission(false);
      }
    };

    requestPermission();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Attach stream to video element when permission is granted
  useEffect(() => {
    if (permission && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permission]);

  // Auto capture photos during capturing phase
  useEffect(() => {
    if (phase !== "capturing") return;

    if (photoCount >= totalPhotosToCapture) {
      setPhase("selecting");
      return;
    }

    // Show countdown
    setCountdown(2);
    let count = 2;
    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [phase, photoCount]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);

    const photoData = canvas.toDataURL("image/jpeg");
    setCapturedPhotos((prev) => [...prev, photoData]);
    setPhotoCount((prev) => prev + 1);
  };

  const handleStart = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setPhotoCount(0);
    setCountdown(null);
    setPhase("capturing");
  };

  const handleRetry = () => {
    setCapturedPhotos([]);
    setSelectedPhotos([]);
    setPhotoCount(0);
    setCountdown(null);
    setPhase("ready");
  };

  const handlePhotoSelect = (index: number) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length < requiredPhotos) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (selectedPhotos.length === requiredPhotos) {
      const selected = selectedPhotos
        .sort((a, b) => a - b)
        .map((index) => capturedPhotos[index]);
      onPhotosCapture(selected);
    }
  };

  if (permission === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Loading Camera...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we access your camera
          </p>
        </div>
      </div>
    );
  }

  if (permission === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Camera Permission Required
          </h2>
          <p className="text-muted-foreground">
            Please allow camera access to use the photo booth
          </p>
        </div>
      </div>
    );
  }

  // Photo Selection Phase
  if (phase === "selecting") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-foreground p-4 overflow-hidden">
        {/* Title */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-background md:text-3xl">
            Select Your Photos
          </h1>
          <p className="text-background/70">
            Choose {requiredPhotos} photos for your strip ({selectedPhotos.length}/{requiredPhotos} selected)
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-2xl w-full">
          {capturedPhotos.map((photo, index) => {
            const isSelected = selectedPhotos.includes(index);
            const selectionOrder = selectedPhotos.indexOf(index) + 1;
            const canSelect = selectedPhotos.length < requiredPhotos || isSelected;

            return (
              <button
                key={index}
                onClick={() => handlePhotoSelect(index)}
                disabled={!canSelect}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg border-4 transition-all ${
                  isSelected
                    ? "border-green-500 ring-2 ring-green-500"
                    : canSelect
                    ? "border-background/50 hover:border-background"
                    : "border-background/20 opacity-50 cursor-not-allowed"
                }`}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                      {selectionOrder}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-4">
          <Button
            onClick={handleRetry}
            variant="outline"
            size="lg"
            className="h-12 w-32 border-2 border-background text-background hover:bg-background/20 bg-transparent"
          >
            Retake
          </Button>
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={selectedPhotos.length !== requiredPhotos}
            className="h-12 w-32 bg-background text-foreground hover:bg-muted disabled:opacity-50"
          >
            Continue
          </Button>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Capturing / Ready Phase
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-foreground p-4 overflow-hidden">
      {/* Flash Effect Overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-flash" />
      )}

      {/* Video Stream */}
      <div className="relative flex flex-col items-center gap-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-80 w-80 md:h-96 md:w-96 rounded-lg border-4 border-background object-cover -scale-x-100"
        />

        {/* Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
            <div className="flex h-80 w-80 md:h-96 md:w-96 items-center justify-center">
              <div className="text-9xl font-bold text-background drop-shadow-lg">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Photo Counter */}
        <div className="text-xl font-bold text-background">
          {phase === "capturing" 
            ? `Capturing: ${photoCount} / ${totalPhotosToCapture}` 
            : "Ready to capture 9 photos"}
        </div>
      </div>

      {/* Photo Thumbnails During Capture */}
      {phase === "capturing" && capturedPhotos.length > 0 && (
        <div className="flex gap-1 flex-wrap justify-center max-w-md">
          {capturedPhotos.map((photo, index) => (
            <div
              key={index}
              className="h-12 w-12 overflow-hidden rounded border-2 border-background"
            >
              <img
                src={photo}
                alt={`Captured ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {phase === "ready" && (
          <Button
            onClick={handleStart}
            size="lg"
            className="h-14 w-48 bg-background text-foreground hover:bg-muted"
          >
            Start Capture
          </Button>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
