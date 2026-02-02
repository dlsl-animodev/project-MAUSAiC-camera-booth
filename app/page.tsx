'use client'

import { useState } from 'react'
import { Home } from '@/components/pages/home'
import { LayoutSelect } from '@/components/pages/layout-select'
import { CameraBooth } from '@/components/pages/camera-booth'
import { PhotoCustomize } from '@/components/pages/photo-customize'
import { PrintPage } from '@/components/pages/print-page'

type AppPage = 'home' | 'layout' | 'camera' | 'customize' | 'print'

interface CameraState {
  photos: string[]
  layout: 'vertical' | 'horizontal'
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')
  const [cameraState, setCameraState] = useState<CameraState>({
    photos: [],
    layout: 'vertical',
  })

  const handleStartClick = () => {
    setCurrentPage('layout')
  }

  const handleLayoutSelect = (layout: 'vertical' | 'horizontal') => {
    setCameraState((prev) => ({ ...prev, layout }))
    setCurrentPage('camera')
  }

  const handlePhotosCapture = (photos: string[]) => {
    setCameraState((prev) => ({ ...prev, photos }))
    setCurrentPage('customize')
  }

  const handleCustomizeComplete = () => {
    setCurrentPage('print')
  }

  const handleReset = () => {
    setCurrentPage('home')
    setCameraState({
      photos: [],
      layout: 'vertical',
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {currentPage === 'home' && <Home onStart={handleStartClick} />}
      {currentPage === 'layout' && (
        <LayoutSelect onSelectLayout={handleLayoutSelect} />
      )}
      {currentPage === 'camera' && (
        <CameraBooth
          layout={cameraState.layout}
          onPhotosCapture={handlePhotosCapture}
        />
      )}
      {currentPage === 'customize' && (
        <PhotoCustomize
          photos={cameraState.photos}
          layout={cameraState.layout}
          onComplete={handleCustomizeComplete}
        />
      )}
      {currentPage === 'print' && (
        <PrintPage photos={cameraState.photos} onReset={handleReset} />
      )}
    </main>
  )
}
