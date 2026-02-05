"use client";

import { useRef, useState, useEffect } from "react";
import { type FrameType, frames } from "./design-select";
import { QRCodeSVG } from "qrcode.react";
import { uploadPhotoStrip } from "@/lib/supabase";

interface PrintPageProps {
  photos: string[];
  frame: FrameType;
  layout: "single" | "double";
  onReset: () => void;
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

export function PrintPage({ photos, frame, layout, onReset }: PrintPageProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const frameConfig = frames[frame];
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [uploadError, setUploadError] = useState<string>("");

  // Generate photo strip image by compositing photos onto frame
  useEffect(() => {
    const generateAndUploadPhotoStrip = async () => {
      setIsGenerating(true);
      setUploadError("");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Load frame image first to get its dimensions
      const frameImg = new window.Image();
      frameImg.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = () => reject(new Error("Failed to load frame"));
        frameImg.src = frameConfig.src;
      });

      // Use frame's natural dimensions to maintain aspect ratio
      // Scale up if needed to ensure good print quality (at least 600px wide)
      const scale = Math.max(1, 600 / frameImg.naturalWidth);
      const stripWidth = Math.round(frameImg.naturalWidth * scale);
      const stripHeight = Math.round(frameImg.naturalHeight * scale);
      canvas.width = stripWidth;
      canvas.height = stripHeight;

      // Draw frame first (as background)
      ctx.drawImage(frameImg, 0, 0, stripWidth, stripHeight);

      // Draw photos on top (in the frame slots)
      for (
        let index = 0;
        index < Math.min(photos.length, frameConfig.slots);
        index++
      ) {
        const pos = frameConfig.photoPositions[index];
        if (!pos) continue;

        const photoSrc = photos[index];

        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // Calculate photo position in pixels
            const photoX = (pos.left / 100) * stripWidth;
            const photoY = (pos.top / 100) * stripHeight;
            const photoWidth = (pos.width / 100) * stripWidth;
            const photoHeight = (pos.height / 100) * stripHeight;

            // Draw photo with cover fit
            const aspectRatio = img.width / img.height;
            const targetAspect = photoWidth / photoHeight;
            let sx = 0,
              sy = 0,
              sw = img.width,
              sh = img.height;

            if (aspectRatio > targetAspect) {
              sw = img.height * targetAspect;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / targetAspect;
              sy = (img.height - sh) / 2;
            }

            // Apply heart clip if needed
            if (frameConfig.shape === "heart") {
              ctx.save();
              ctx.beginPath();
              // Draw heart shape using polygon points (matching CSS clip-path exactly)
              const points = [
                [0.5, 0.1],
                [0.65, 0],
                [0.8, 0],
                [0.9, 0.05],
                [0.97, 0.12],
                [1, 0.22],
                [1, 0.35],
                [0.95, 0.5],
                [0.85, 0.65],
                [0.7, 0.8],
                [0.5, 0.95],
                [0.3, 0.8],
                [0.15, 0.65],
                [0.05, 0.5],
                [0, 0.35],
                [0, 0.22],
                [0.03, 0.12],
                [0.1, 0.05],
                [0.2, 0],
                [0.35, 0],
              ];
              points.forEach(([px, py], i) => {
                const x = photoX + px * photoWidth;
                const y = photoY + py * photoHeight;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.closePath();
              ctx.clip();
            }

            ctx.drawImage(
              img,
              sx,
              sy,
              sw,
              sh,
              photoX,
              photoY,
              photoWidth,
              photoHeight,
            );

            if (frameConfig.shape === "heart") {
              ctx.restore();
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = photoSrc;
        });
      }

      // Convert to blob and upload to Supabase
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const publicUrl = await uploadPhotoStrip(blob);
            if (publicUrl) {
              setDownloadUrl(publicUrl);
            } else {
              setUploadError("Failed to upload. Try downloading directly.");
              setDownloadUrl(URL.createObjectURL(blob));
            }
          } catch (error) {
            console.error("Upload error:", error);
            setUploadError("Failed to upload. Try downloading directly.");
            setDownloadUrl(URL.createObjectURL(blob));
          }
          setIsGenerating(false);
        }
      }, "image/png");
    };

    generateAndUploadPhotoStrip();

    return () => {
      if (downloadUrl && downloadUrl.startsWith("blob:")) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [photos, frame, frameConfig]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = downloadUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!downloadUrl) return;

    const printWindow = window.open("", "", "height=800,width=1200");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAUSAiC Photo Strip</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0.25in;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: white;
          }
          .print-container {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 0.25in;
            padding: 0;
          }
          img {
            width: 2in;
            height: 6in;
            object-fit: contain;
          }
          @media print {
            body {
              background: white;
            }
            .print-container {
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: flex-start;
              gap: 0.25in;
            }
            img {
              width: 2in;
              height: 6in;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <img src="${downloadUrl}" alt="Photo Strip 1" />
          <img src="${downloadUrl}" alt="Photo Strip 2" />
          <img src="${downloadUrl}" alt="Photo Strip 3" />
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black px-4">
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

      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="animate-fade-in-up text-center text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
            Your Strip
          </h1>
          <p className="animate-fade-in-up-delay-1 text-xs font-light tracking-wide text-black/50 dark:text-white/50">
            Scan QR to download
          </p>
        </div>

        <div className="animate-fade-in-up-delay-2 flex gap-6 items-center">
          {/* Print Preview */}
          <div
            ref={printRef}
            className="relative w-28 md:w-36 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.02] rounded-lg overflow-hidden"
            style={{ aspectRatio: "2/6" }}
          >
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white" />
              </div>
            ) : downloadUrl ? (
              <img
                src={downloadUrl}
                alt="Photo Strip Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-3">
            {isGenerating ? (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white" />
              </div>
            ) : downloadUrl ? (
              <div>
                <div className="rounded-xl bg-white p-2.5 shadow-lg">
                  <p className="text-xs text-center mb-1">Scan to download</p>
                  <QRCodeSVG
                    value={downloadUrl}
                    size={100}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>
            ) : null}
            {uploadError && (
              <p className="text-[10px] font-light text-black/50 dark:text-white/50 text-center max-w-28">
                {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="animate-fade-in-up-delay-3 flex gap-6">
          <button
            onClick={handlePrint}
            disabled={!downloadUrl}
            className="group relative px-6 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium tracking-widest text-black/80 dark:text-white/80 uppercase transition-all group-hover:text-black dark:group-hover:text-white">
              Print
            </span>
            <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-300 group-hover:w-full group-disabled:w-0" />
          </button>

          <button onClick={onReset} className="group relative px-6 py-2">
            <span className="text-sm font-medium tracking-widest text-black/50 dark:text-white/50 uppercase transition-all group-hover:text-black dark:group-hover:text-white">
              Start Over
            </span>
            <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
