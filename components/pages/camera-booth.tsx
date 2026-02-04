"use client";

import { useEffect, useRef, useState } from "react";

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

  const totalPhotosToCapture = 3;
  const requiredPhotos = 3; // Frame has 4 photo slots

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
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white" />
          <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">
            Initializing Camera
          </h2>
          <p className="text-sm font-light text-black/50 dark:text-white/50">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (permission === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/20 dark:border-white/20">
            <svg
              className="h-8 w-8 text-black/40 dark:text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">
            Camera Access Required
          </h2>
          <p className="text-sm font-light text-black/50 dark:text-white/50 max-w-xs">
            Please allow camera access in your browser settings to continue
          </p>
        </div>
      </div>
    );
  }

  // Photo Selection Phase
  if (phase === "selecting") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 overflow-hidden">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
            Select Your Photos
          </h1>
          <p className="mt-2 text-sm font-light text-white/60">
            Choose {requiredPhotos} photos for your strip
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
              {selectedPhotos.length} / {requiredPhotos}
            </span>
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl w-full">
          {capturedPhotos.map((photo, index) => {
            const isSelected = selectedPhotos.includes(index);
            const selectionOrder = selectedPhotos.indexOf(index) + 1;
            const canSelect =
              selectedPhotos.length < requiredPhotos || isSelected;

            return (
              <button
                key={index}
                onClick={() => handlePhotoSelect(index)}
                disabled={!canSelect}
                className={`group relative aspect-[4/3] overflow-hidden rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-[0.98]"
                    : canSelect
                      ? "hover:scale-[1.02] hover:ring-1 hover:ring-white/30"
                      : "opacity-30 cursor-not-allowed"
                }`}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black text-lg font-semibold">
                      {selectionOrder}
                    </div>
                  </div>
                )}
                {!isSelected && canSelect && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full border-2 border-white/0 group-hover:border-white/60 transition-colors" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={selectedPhotos.length !== requiredPhotos}
            className="group relative px-12 py-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-lg font-medium tracking-wide text-white uppercase">
              Continue
            </span>
            <span className="absolute bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-white transition-all duration-300 group-hover:w-full group-disabled:w-0" />
          </button>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Capturing / Ready Phase
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-black p-4 overflow-hidden">
      {/* Flash Effect Overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-flash" />
      )}

      {/* Video Stream */}
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-80 w-80 md:h-[400px] md:w-[400px] object-cover -scale-x-100"
          />

          {/* Countdown Display */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 ">
              <div className="text-[120px] font-extralight text-white tabular-nums">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Photo Counter */}
        <div className="text-center">
          <p className="text-sm font-light tracking-widest text-white/60 uppercase">
            {phase === "capturing" ? "Capturing" : "Ready"}
          </p>
          <p className="mt-1 text-2xl font-light tabular-nums text-white">
            {phase === "capturing"
              ? `${photoCount} / ${totalPhotosToCapture}`
              : `${totalPhotosToCapture} Photos`}
          </p>
        </div>
      </div>

      {/* Photo Thumbnails During Capture */}
      {phase === "capturing" && capturedPhotos.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center max-w-md">
          {capturedPhotos.map((photo, index) => (
            <div
              key={index}
              className="h-14 w-14 overflow-hidden rounded-xl border border-white/20 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
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
      {phase === "ready" && (
        <button onClick={handleStart} className="group relative mt-4">
          <span className="animate-blink text-lg font-medium tracking-widest text-white/80 uppercase transition-all group-hover:text-white group-hover:tracking-[0.3em]">
            Start Capture
          </span>
          <span className="absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-white transition-all duration-500 group-hover:w-full" />
        </button>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
