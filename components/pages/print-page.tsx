'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PrintPageProps {
  photos: string[]
  onReset: () => void
}

export function PrintPage({ photos, onReset }: PrintPageProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    const printContent = printRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Snap Booth Print</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .print-container {
            background: white;
            padding: 40px;
            border: 3px solid black;
          }
          .photo-strip {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .photo-strip img {
            width: 200px;
            height: auto;
            border: 2px solid black;
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-weight: bold;
            font-size: 18px;
            letter-spacing: 2px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${printContent}
          <div class="footer">SNAP BOOTH</div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleDownload = () => {
    if (!printRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on content
    canvas.width = 400
    canvas.height = 200 * photos.length + 100

    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw photos
    const photoSize = 200
    const gap = 16

    photos.forEach((photo, index) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const y = index * (photoSize + gap) + 50
        ctx.drawImage(img, 100, y, photoSize, photoSize)

        if (index === photos.length - 1) {
          // Add footer text
          ctx.fillStyle = 'black'
          ctx.font = 'bold 20px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('SNAP BOOTH', canvas.width / 2, canvas.height - 20)

          // Download
          const link = document.createElement('a')
          link.href = canvas.toDataURL('image/png')
          link.download = 'snap-booth.png'
          link.click()
        }
      }
      img.src = photo
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-balance text-center text-4xl font-bold text-foreground md:text-5xl">
          Your Photo Strip
        </h1>
        <p className="text-muted-foreground">
          Ready to print or download your memories
        </p>
      </div>

      {/* Print Preview */}
      <Card className="w-full max-w-lg border-4 border-foreground bg-foreground p-8">
        <CardContent className="p-0">
          <div
            ref={printRef}
            className="flex flex-col items-center gap-4 bg-white"
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                className="w-48 overflow-hidden rounded-lg border-2 border-foreground"
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="h-48 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex w-full max-w-2xl flex-col gap-3 md:flex-row md:gap-4">
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
          className="h-12 flex-1 text-base font-semibold"
        >
          ⬇️ Download
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="h-12 flex-1 text-base font-semibold bg-transparent"
        >
          🔄 New Photos
        </Button>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Your photo strip is ready!</p>
        <p>Click Print to print directly or Download to save as image</p>
      </div>
    </div>
  )
}
