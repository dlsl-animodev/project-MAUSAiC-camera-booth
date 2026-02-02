'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface PhotoCustomizeProps {
  photos: string[]
  layout: 'vertical' | 'horizontal'
  onComplete: () => void
}

type FilterType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'invert'
  | 'brightness'
  | 'contrast'

interface FilterConfig {
  filter: string
  label: string
}

const filters: Record<FilterType, FilterConfig> = {
  none: { filter: '', label: 'Original' },
  grayscale: { filter: 'grayscale(100%)', label: 'Grayscale' },
  sepia: { filter: 'sepia(100%)', label: 'Sepia' },
  invert: { filter: 'invert(100%)', label: 'Invert' },
  brightness: { filter: 'brightness(1.2)', label: 'Bright' },
  contrast: { filter: 'contrast(1.3)', label: 'Vivid' },
}

export function PhotoCustomize({
  photos,
  layout,
  onComplete,
}: PhotoCustomizeProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none')

  const stripStyle =
    layout === 'vertical'
      ? 'flex-col w-48 md:w-64'
      : 'flex-row h-48 md:h-64'

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-4 py-8">
      {/* Title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-balance text-center text-4xl font-bold text-foreground md:text-5xl">
          Customize Your Strip
        </h1>
        <p className="text-muted-foreground">
          Choose a filter and finalize your photos
        </p>
      </div>

      {/* Photo Strip Preview */}
      <Card className="w-full max-w-lg border-2 border-foreground bg-foreground p-6">
        <CardContent className="p-0">
          <div className={`flex gap-2 justify-center ${stripStyle}`}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border-2 border-background"
                style={{
                  filter: filters[selectedFilter].filter,
                }}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Selection */}
      <div className="w-full max-w-2xl">
        <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
          Choose a Filter
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(Object.entries(filters) as Array<[FilterType, FilterConfig]>).map(
            ([filterKey, filterConfig]) => (
              <button
                key={filterKey}
                onClick={() => setSelectedFilter(filterKey)}
                className={`rounded-lg border-2 px-4 py-3 text-center font-medium transition-all ${
                  selectedFilter === filterKey
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground hover:border-foreground'
                }`}
              >
                {filterConfig.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full max-w-sm gap-4">
        <Button
          onClick={() => setSelectedFilter('none')}
          variant="outline"
          className="flex-1"
        >
          Reset
        </Button>
        <Button onClick={onComplete} className="flex-1">
          Continue to Print
        </Button>
      </div>
    </div>
  )
}
