'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LayoutSelectProps {
  onSelectLayout: (layout: 'vertical' | 'horizontal') => void
}

export function LayoutSelect({ onSelectLayout }: LayoutSelectProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-12 px-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-balance text-center text-4xl font-bold text-foreground md:text-5xl">
          Choose Your Layout
        </h1>
        <p className="text-center text-muted-foreground">
          Select how you want your photos arranged
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        {/* Vertical Layout */}
        <Card className="cursor-pointer border-2 transition-all hover:border-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex flex-col gap-2">
              <div className="h-12 w-8 rounded border-2 border-foreground" />
              <div className="h-12 w-8 rounded border-2 border-foreground" />
              <div className="h-12 w-8 rounded border-2 border-foreground" />
              <div className="h-12 w-8 rounded border-2 border-foreground" />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-center text-xl font-semibold text-foreground">
                Vertical Strip
              </h3>
              <Button
                onClick={() => onSelectLayout('vertical')}
                className="w-full"
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Horizontal Layout */}
        <Card className="cursor-pointer border-2 transition-all hover:border-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex gap-2">
              <div className="h-8 w-12 rounded border-2 border-foreground" />
              <div className="h-8 w-12 rounded border-2 border-foreground" />
              <div className="h-8 w-12 rounded border-2 border-foreground" />
              <div className="h-8 w-12 rounded border-2 border-foreground" />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-center text-xl font-semibold text-foreground">
                Horizontal Strip
              </h3>
              <Button
                onClick={() => onSelectLayout('horizontal')}
                className="w-full"
              >
                Select
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
