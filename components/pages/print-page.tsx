"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type DesignType, designs } from "./design-select";

interface PrintPageProps {
  photos: string[];
  design: DesignType;
  layout: "single" | "double";
  onReset: () => void;
}

export function PrintPage({ photos, design, layout, onReset }: PrintPageProps) {
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
              className="mt-2 text-center text-sm font-bold tracking-wider"
              style={{ color: designConfig.textColor }}
            >
              📸 PHOTO BOOTH
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
        <p>Print to save your memories</p>
      </div>
    </div>
  );
}
