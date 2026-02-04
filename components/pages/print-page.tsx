"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type DesignType, designs } from "./design-select";
import { QRCodeSVG } from "qrcode.react";
import { uploadPhotoStrip } from "@/lib/supabase";

interface PrintPageProps {
  photos: string[];
  design: DesignType;
  layout: "single" | "double";
  onReset: () => void;
}

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

      const stripWidth = 400;
      const photoHeight = 200;
      const padding = 20;
      const gap = 10;
      const footerHeight = 50;
      const photoCount = photos.length;
      const stripHeight =
        padding * 2 +
        photoHeight * photoCount +
        gap * (photoCount - 1) +
        footerHeight;

      canvas.width = stripWidth;
      canvas.height = stripHeight;

      // Background
      ctx.fillStyle = designConfig.backgroundColor;
      ctx.fillRect(0, 0, stripWidth, stripHeight);

      // Border
      ctx.strokeStyle = designConfig.borderColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, stripWidth - 6, stripHeight - 6);

      // Load and draw photos
      const loadImages = photos.map((src, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const y = padding + index * (photoHeight + gap);
            const photoWidth = stripWidth - padding * 2;

            // Draw photo border
            ctx.strokeStyle = designConfig.borderColor;
            ctx.lineWidth = 3;
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

      await Promise.all(loadImages);

      // Footer text
      ctx.fillStyle = designConfig.textColor;
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("📸 MAUSAiC", stripWidth / 2, stripHeight - padding);

      // Convert to blob and upload to Supabase
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const publicUrl = await uploadPhotoStrip(blob);
            if (publicUrl) {
              setDownloadUrl(publicUrl);
            } else {
              setUploadError("Failed to upload. Try downloading directly.");
              // Fallback to local blob URL
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
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [photos, designConfig]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = downloadUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "", "height=800,width=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAUSAiC Photo Strip</title>
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

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background px-4 overflow-hidden">
      {/* Title */}
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-balance text-center text-2xl font-bold text-foreground md:text-3xl">
          Your Photo Strip
        </h1>
        <p className="text-sm text-muted-foreground">Scan or print your memories</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Print Preview */}
        <Card
          className="border-4 p-3"
          style={{
            borderColor: designConfig.borderColor,
            backgroundColor: designConfig.backgroundColor,
          }}
        >
          <CardContent className="p-0">
            <div ref={printRef} className="flex flex-col gap-1.5 w-24 md:w-32">
              {photos.map((photo, index) => (
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
                className="mt-1 text-center text-xs font-bold tracking-wider"
                style={{ color: designConfig.textColor }}
              >
                📸 PHOTO BOOTH
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Scan to Download
          </h3>
          {isGenerating ? (
            <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : downloadUrl ? (
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG
                value={downloadUrl}
                size={112}
                level="M"
                includeMargin={false}
              />
            </div>
          ) : null}
          {uploadError && (
            <p className="text-xs text-red-500 text-center max-w-[120px]">{uploadError}</p>
          )}
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            disabled={!downloadUrl}
            className="text-xs"
          >
            📥 Download
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full max-w-md gap-3">
        <Button
          onClick={handlePrint}
          size="lg"
          className="h-12 flex-1 text-base font-semibold"
        >
          🖨️ Print
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
    </div>
  );
}
