"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CameraBoothProps {
  layout: "single" | "double";
  onPhotosCapture: (photos: string[]) => void;
}

export function CameraBooth({ layout, onPhotosCapture }: CameraBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

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

  const maxPhotos = layout === "single" ? 4 : 3;

  // Auto capture every 3 seconds when capturing
  useEffect(() => {
    if (!isCapturing) return;

    if (photoCount >= maxPhotos) {
      setIsCapturing(false);
      return;
    }

    // Show countdown
    setCountdown(3);
    let count = 3;
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
  }, [isCapturing, photoCount]);

  // Handle completion when we have required photos
  useEffect(() => {
    if (photos.length === maxPhotos && !isCapturing) {
      onPhotosCapture(photos);
    }
  }, [photos, isCapturing, onPhotosCapture, maxPhotos]);

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
    setPhotos((prev) => [...prev, photoData]);
    setPhotoCount((prev) => prev + 1);
  };

  const handleStart = () => {
    setPhotos([]);
    setPhotoCount(0);
    setCountdown(null);
    setIsCapturing(true);
  };

  const handleRetry = () => {
    setPhotos([]);
    setPhotoCount(0);
    setCountdown(null);
    setIsCapturing(false);
  };

  const handleContinue = () => {
    if (photos.length > 0) {
      onPhotosCapture(photos);
    }
  };

  if (permission === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
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
      <div className="flex h-screen w-full items-center justify-center">
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

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-foreground p-4">
      {/* Flash Effect Overlay */}
      {showFlash && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-flash" />
      )}

      {/* Video Stream */}
      <div className="relative flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-96 w-96 rounded-lg border-4 border-background object-cover -scale-x-100"
        />

        {/* Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
            <div className="flex h-96 w-96 items-center justify-center">
              <div className="text-9xl font-bold text-background drop-shadow-lg">
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Photo Counter */}
        <div className="text-2xl font-bold text-background">
          Photos: {photos.length} / {maxPhotos}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {!isCapturing && photos.length === 0 && (
          <Button
            onClick={handleStart}
            size="lg"
            className="h-14 w-48 bg-background text-foreground hover:bg-muted"
          >
            Start Capture
          </Button>
        )}

        {photos.length > 0 && !isCapturing && (
          <div className="flex gap-4">
            <Button
              onClick={handleRetry}
              variant="outline"
              size="lg"
              className="h-14 w-32 border-2 border-background text-background hover:bg-background/20 bg-transparent"
            >
              Retry
            </Button>
            <Button
              onClick={handleContinue}
              size="lg"
              className="h-14 w-32 bg-background text-foreground hover:bg-muted"
            >
              Continue
            </Button>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
