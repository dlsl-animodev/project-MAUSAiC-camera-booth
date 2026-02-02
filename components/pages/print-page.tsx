"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type DesignType, designs } from "./design-select";

interface PrintPageProps {
  photos: string[];
  design: DesignType;
  onReset: () => void;
}

export function PrintPage({ photos, design, onReset }: PrintPageProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const designConfig = designs[design];

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "", "height=800,width=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photo Booth Strip</title>
        <style>
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
            padding: 20px;
          }
          .photo-strip {
            background: ${designConfig.backgroundColor};
            border: 4px solid ${designConfig.borderColor};
            padding: 16px;
            width: 280px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .photo-frame {
            border: 2px solid ${designConfig.borderColor};
            border-radius: 4px;
            overflow: hidden;
          }
          .photo-frame img {
            width: 100%;
            aspect-ratio: 4/3;
            object-fit: cover;
            display: block;
          }
          .footer {
            text-align: center;
            margin-top: 8px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 2px;
            color: ${designConfig.textColor};
            font-family: Arial, sans-serif;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .photo-strip {
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="photo-strip">
          ${photos
            .slice(0, 4)
            .map(
              (photo, index) => `
            <div class="photo-frame">
              <img src="${photo}" alt="Photo ${index + 1}" />
            </div>
          `,
            )
            .join("")}
          <div class="footer">📸 PHOTO BOOTH</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Photo strip dimensions (2x6 inch at 150 DPI)
    const stripWidth = 300;
    const photoHeight = 150;
    const padding = 16;
    const gap = 8;
    const footerHeight = 40;
    const stripHeight = padding * 2 + photoHeight * 4 + gap * 3 + footerHeight;

    canvas.width = stripWidth;
    canvas.height = stripHeight;

    // Background
    ctx.fillStyle = designConfig.backgroundColor;
    ctx.fillRect(0, 0, stripWidth, stripHeight);

    // Border
    ctx.strokeStyle = designConfig.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, stripWidth - 4, stripHeight - 4);

    // Load and draw photos
    const loadImages = photos.slice(0, 4).map((src, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const y = padding + index * (photoHeight + gap);
          const photoWidth = stripWidth - padding * 2;

          // Draw photo border
          ctx.strokeStyle = designConfig.borderColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(padding - 1, y - 1, photoWidth + 2, photoHeight + 2);

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
    });

    Promise.all(loadImages).then(() => {
      // Footer text
      ctx.fillStyle = designConfig.textColor;
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("📸 PHOTO BOOTH", stripWidth / 2, stripHeight - padding);

      // Download
      const link = document.createElement("a");
      link.download = "photo-strip.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-balance text-center text-4xl font-bold text-foreground md:text-5xl">
          Your Photo Strip
        </h1>
        <p className="text-muted-foreground">Ready to print your memories</p>
      </div>

      {/* Print Preview */}
      <Card
        className="w-full max-w-xs border-4 p-4"
        style={{
          borderColor: designConfig.borderColor,
          backgroundColor: designConfig.backgroundColor,
        }}
      >
        <CardContent className="p-0">
          <div ref={printRef} className="flex flex-col gap-2">
            {photos.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-sm"
                style={{ border: `2px solid ${designConfig.borderColor}` }}
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
              className="mt-2 text-center text-sm font-bold tracking-wider"
              style={{ color: designConfig.textColor }}
            >
              📸 MAUSAiC
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex w-full max-w-md flex-col gap-3 md:flex-row md:gap-4">
        <Button
          onClick={handlePrint}
          size="lg"
          className="h-12 flex-1 text-base font-semibold"
        >
          🖨️ Print
        </Button>

        <Button
          onClick={handleDownload}
          size="lg"
          variant="secondary"
          className="h-12 flex-1 text-base font-semibold"
        >
          📥 Download
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="h-12 flex-1 text-base font-semibold bg-transparent"
        >
          🔄 Start Over
        </Button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Your photo strip is ready!</p>
        <p>Print or download to save your memories</p>
      </div>
    </div>
  );
}
