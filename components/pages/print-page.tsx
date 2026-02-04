"use client";

import { useRef, useState, useEffect } from "react";
import { type DesignType, designs } from "./design-select";
import { QRCodeSVG } from "qrcode.react";
import { uploadPhotoStrip } from "@/lib/supabase";

interface PrintPageProps {
  photos: string[];
  design: DesignType;
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

// Helper to parse gradient colors
const parseGradientColors = (gradient: string): string[] => {
  const colorMatches = gradient.match(/#[a-fA-F0-9]{6}/g);
  return colorMatches || ["#ffffff", "#f0f0f0"];
};

export function PrintPage({ photos, design, layout, onReset }: PrintPageProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const designConfig = designs[design];
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [uploadError, setUploadError] = useState<string>("");

  // Generate photo strip image and upload to Supabase
  useEffect(() => {
    const generateAndUploadPhotoStrip = async () => {
      setIsGenerating(true);
      setUploadError("");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 2x6 inches at 300 DPI
      const stripWidth = 600;
      const stripHeight = 1800;
      canvas.width = stripWidth;
      canvas.height = stripHeight;

      const borderWidth = 15;
      const padding = 36;
      const photoGap = 24;
      const photoWidth = stripWidth - padding * 2;
      const photoHeight = photoWidth * (3 / 4); // 4:3 aspect ratio
      const footerHeight = 80;

      // Draw gradient background
      const gradientColors = parseGradientColors(designConfig.background);
      const gradient = ctx.createLinearGradient(0, 0, 0, stripHeight);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(0.5, gradientColors[1] || gradientColors[0]);
      gradient.addColorStop(1, gradientColors[2] || gradientColors[0]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, stripWidth, stripHeight);

      // Draw border
      ctx.strokeStyle = designConfig.borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        borderWidth / 2,
        borderWidth / 2,
        stripWidth - borderWidth,
        stripHeight - borderWidth,
      );

      // Draw theme-specific decorations
      if (design === "valentine") {
        // Floating hearts
        ctx.font = "50px serif";
        const hearts = ["❤", "💕", "♥", "💕", "❤", "♥"];
        const positions = [
          { x: 25, y: 80 },
          { x: stripWidth - 70, y: 130 },
          { x: 20, y: stripHeight * 0.28 },
          { x: stripWidth - 60, y: stripHeight * 0.42 },
          { x: 30, y: stripHeight * 0.58 },
          { x: stripWidth - 70, y: stripHeight * 0.72 },
        ];
        positions.forEach((pos, i) => {
          ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
          ctx.fillText(hearts[i % hearts.length], pos.x, pos.y);
        });
      }

      if (design === "marquee") {
        // Draw inner border shadow for marquee effect
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 36;
        ctx.strokeRect(18, 18, stripWidth - 36, stripHeight - 36);

        // Draw marquee lights
        ctx.fillStyle = "#FFD700";
        const lightRadius = 12;

        // Top and bottom lights
        for (let i = 0; i < 7; i++) {
          const x = 60 + i * ((stripWidth - 120) / 6);
          // Top
          ctx.beginPath();
          ctx.arc(x, 24, lightRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = "#FFD700";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
          // Bottom
          ctx.beginPath();
          ctx.arc(x, stripHeight - 24, lightRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Left and right lights
        for (let i = 0; i < 12; i++) {
          const y = 80 + i * ((stripHeight - 160) / 11);
          // Left
          ctx.beginPath();
          ctx.arc(24, y, lightRadius, 0, Math.PI * 2);
          ctx.shadowColor = "#FFD700";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
          // Right
          ctx.beginPath();
          ctx.arc(stripWidth - 24, y, lightRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (design === "candy") {
        // Draw candy stripes at top and bottom
        const stripeHeight = 84;
        const stripeWidth = 24;

        for (let x = 0; x < stripWidth; x += stripeWidth * 2) {
          // Top stripes
          ctx.fillStyle = "#ff69b4";
          ctx.fillRect(x, 0, stripeWidth, stripeHeight);
          ctx.fillStyle = "#ffb6c1";
          ctx.fillRect(x + stripeWidth, 0, stripeWidth, stripeHeight);

          // Bottom stripes
          ctx.fillStyle = "#ff69b4";
          ctx.fillRect(
            x,
            stripHeight - stripeHeight,
            stripeWidth,
            stripeHeight,
          );
          ctx.fillStyle = "#ffb6c1";
          ctx.fillRect(
            x + stripeWidth,
            stripHeight - stripeHeight,
            stripeWidth,
            stripeHeight,
          );
        }
      }

      if (design === "neon") {
        // Add inner glow effect
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 60;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 12;
        ctx.strokeRect(20, 20, stripWidth - 40, stripHeight - 40);
        ctx.shadowBlur = 0;
      }

      // Calculate starting Y position to center photos
      let startY = design === "candy" ? 100 : padding + 20;
      const availableHeight =
        design === "candy"
          ? stripHeight - 200 - footerHeight // Account for candy stripes
          : stripHeight - startY - footerHeight;
      const totalPhotosHeight =
        photos.length * photoHeight + (photos.length - 1) * photoGap;
      startY = startY + (availableHeight - totalPhotosHeight) / 2;

      // Draw photos
      for (let index = 0; index < photos.length; index++) {
        const src = photos[index];
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const y = startY + index * (photoHeight + photoGap);

            // Draw photo border/frame
            ctx.strokeStyle = designConfig.photoBorder;
            ctx.lineWidth = 9;

            if (design === "neon") {
              ctx.shadowColor = "#ff00ff";
              ctx.shadowBlur = 24;
            } else if (design === "marquee") {
              ctx.shadowColor = "#d4af37";
              ctx.shadowBlur = 30;
            }

            ctx.strokeRect(padding - 4, y - 4, photoWidth + 8, photoHeight + 8);
            ctx.shadowBlur = 0;

            // Draw photo (cover fit)
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

            ctx.drawImage(
              img,
              sx,
              sy,
              sw,
              sh,
              padding,
              y,
              photoWidth,
              photoHeight,
            );
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        });
      }

      // Draw footer text
      ctx.fillStyle = designConfig.textColor;
      ctx.font = "bold 36px Arial, sans-serif";
      ctx.textAlign = "center";

      if (design === "neon") {
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 20;
      }

      const footerY = design === "candy" ? stripHeight - 50 : stripHeight - 35;
      ctx.fillText(designConfig.footerText, stripWidth / 2, footerY);
      ctx.shadowBlur = 0;

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
  }, [photos, design, designConfig]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = downloadUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!downloadUrl) return;

    const printWindow = window.open("", "", "height=800,width=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAUSAiC Photo Strip</title>
        <style>
          @page {
            size: 2in 6in;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f0f0;
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
            img {
              width: 2in;
              height: 6in;
            }
          }
        </style>
      </head>
      <body>
        <img src="${downloadUrl}" alt="Photo Strip" />
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
          {/* Print Preview - CSS styled */}
          <div
            ref={printRef}
            className={`relative w-28 md:w-36 rounded-xl p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:scale-[1.02] ${
              design === "valentine"
                ? "bg-gradient-to-b from-[#8b0000] via-[#dc143c] to-[#8b0000] border-[5px] border-white"
                : design === "marquee"
                  ? "bg-gradient-to-b from-[#2c1810] via-[#5c3a1f] to-[#2c1810] border-[5px] border-[#8b4513] shadow-[inset_0_0_20px_rgba(255,215,0,0.6),0_0_30px_rgba(255,215,0,0.3)]"
                  : design === "candy"
                    ? "bg-gradient-to-b from-[#fff0f5] via-[#ffe4e9] to-[#fff0f5] border-[5px] border-[#ff69b4]"
                    : design === "neon"
                      ? "bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] border-[5px] border-[#00ffff] shadow-[inset_0_0_20px_#00ffff,0_0_30px_rgba(0,255,255,0.4)]"
                      : design === "vintage"
                        ? "bg-gradient-to-b from-[#f5e6d3] via-[#e8d7c3] to-[#f5e6d3] border-[5px] border-[#8b7355]"
                        : "bg-gradient-to-b from-white to-[#f8f9fa] border-[5px] border-[#2c3e50]"
            }`}
          >
            {/* Valentine hearts */}
            {design === "valentine" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
                {["❤", "💕", "♥", "💕", "❤", "♥"].map((heart, i) => (
                  <div
                    key={i}
                    className="absolute text-xl opacity-60 animate-pulse"
                    style={{
                      top: `${[5, 5, 30, 50, 70, 90][i]}%`,
                      left: i % 2 === 0 ? "5%" : undefined,
                      right: i % 2 === 1 ? "5%" : undefined,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    {heart}
                  </div>
                ))}
              </div>
            )}

            {/* Marquee lights */}
            {design === "marquee" && (
              <div className="absolute inset-0 pointer-events-none z-[5]">
                {[12, 25, 38, 51, 64, 77, 90].map((left, i) => (
                  <div
                    key={`top-${i}`}
                    className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
                    style={{ left: `${left}%`, top: "8px" }}
                  />
                ))}
                {[12, 25, 38, 51, 64, 77, 90].map((left, i) => (
                  <div
                    key={`bottom-${i}`}
                    className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
                    style={{ left: `${left}%`, bottom: "8px" }}
                  />
                ))}
                {[10, 25, 40, 55, 70, 85].map((top, i) => (
                  <div
                    key={`left-${i}`}
                    className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
                    style={{ left: "8px", top: `${top}%` }}
                  />
                ))}
                {[10, 25, 40, 55, 70, 85].map((top, i) => (
                  <div
                    key={`right-${i}`}
                    className="absolute w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_8px_#FFD700,0_0_12px_#FFD700] animate-pulse"
                    style={{ right: "8px", top: `${top}%` }}
                  />
                ))}
              </div>
            )}

            {/* Candy stripes */}
            {design === "candy" && (
              <>
                <div
                  className="absolute top-0 left-0 right-0 h-7 z-[5]"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #ff69b4 0px, #ff69b4 8px, #ffb6c1 8px, #ffb6c1 16px)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-7 z-[5]"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #ff69b4 0px, #ff69b4 8px, #ffb6c1 8px, #ffb6c1 16px)",
                  }}
                />
              </>
            )}

            <div className="flex flex-col gap-1 relative z-10">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className={`overflow-hidden rounded ${
                    design === "valentine"
                      ? "border-[3px] border-[#ffb6c1] shadow-[0_0_20px_rgba(255,182,193,0.4)]"
                      : design === "marquee"
                        ? "border-[3px] border-[#d4af37] shadow-[0_4px_15px_rgba(0,0,0,0.5),0_0_20px_rgba(255,215,0,0.5)]"
                        : design === "candy"
                          ? "border-[3px] border-[#ffb6c1] shadow-sm"
                          : design === "neon"
                            ? "border-[3px] border-[#ff00ff] shadow-[0_0_8px_#ff00ff,inset_0_0_8px_rgba(255,0,255,0.2)]"
                            : design === "vintage"
                              ? "border-[3px] border-[#a0826d] rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                              : "border-[3px] border-[#34495e] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div
              className={`mt-1.5 text-center text-[6px] font-bold tracking-wider relative z-10 ${
                design === "valentine"
                  ? "text-white"
                  : design === "marquee"
                    ? "text-[#ffd700]"
                    : design === "candy"
                      ? "text-[#c71585]"
                      : design === "neon"
                        ? "text-[#00ff00] drop-shadow-[0_0_10px_#00ff00]"
                        : design === "vintage"
                          ? "text-[#5c4033] font-mono"
                          : "text-[#2c3e50]"
              }`}
            >
              {designConfig.footerText}
            </div>
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
                  <p className="text-xs">Scan to download</p>

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
