import React, { useState, useEffect, useCallback } from 'react'
import { useAnnotations } from './hooks/useAnnotations'
import Navbar from './components/Navbar'
import ImageSidebar from './components/ImageSidebar'
import Toolbar from './components/Toolbar'
import AnnotationCanvas from './components/AnnotationCanvas'
import AnnotationsPanel from './components/AnnotationsPanel'
import styles from './App.module.css'

export default function App() {
  const [tool, setTool] = useState('draw')
  const {
    images, activeImageId, setActiveImageId, activeImage,
    activeAnnotations, annotations, selectedBoxId, setSelectedBoxId,
    addImages, setImageDimensions, addAnnotation, updateAnnotation,
    deleteAnnotation, clearAnnotations, removeImage, exportJSON,
  } = useAnnotations()

  useEffect(() => {
    if (!activeImage) return
    const img = new Image()
    img.onload = () => setImageDimensions(activeImage.id, img.naturalWidth, img.naturalHeight)
    img.src = activeImage.url
  }, [activeImage?.id])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'd' || e.key === 'D') setTool('draw')
      if (e.key === 's' || e.key === 'S') setTool('select')
      if (e.key === 'Escape') setSelectedBoxId(null)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBoxId && activeImageId) deleteAnnotation(activeImageId, selectedBoxId)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (activeImageId && activeAnnotations.length > 0) {
          deleteAnnotation(activeImageId, activeAnnotations[activeAnnotations.length - 1].id)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedBoxId, activeImageId, activeAnnotations, deleteAnnotation, setSelectedBoxId])

  const handleExport = useCallback(() => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'annotations.json'; a.click()
    URL.revokeObjectURL(url)
  }, [exportJSON])

  const totalBoxes = Object.values(annotations).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className={styles.app}>
      <Navbar onExport={handleExport} annotationCount={totalBoxes} />
      <div className={styles.body}>
        <ImageSidebar
          images={images} activeImageId={activeImageId}
          onSelect={setActiveImageId} onUpload={addImages}
          onRemove={removeImage} annotations={annotations}
        />
        <div className={styles.center}>
          <Toolbar
            tool={tool} setTool={setTool} imageName={activeImage?.name}
            onUndo={() => {
              if (activeImageId && activeAnnotations.length > 0)
                deleteAnnotation(activeImageId, activeAnnotations[activeAnnotations.length - 1].id)
            }}
            onClearAll={() => activeImageId && clearAnnotations(activeImageId)}
          />
          <AnnotationCanvas
            image={activeImage} annotations={activeAnnotations}
            selectedBoxId={selectedBoxId} onSelectBox={setSelectedBoxId}
            tool={tool}
            onAddBox={(box) => activeImageId && addAnnotation(activeImageId, box)}
            onUpdateBox={(boxId, changes) => activeImageId && updateAnnotation(activeImageId, boxId, changes)}
          />
        </div>
        <AnnotationsPanel
          annotations={activeAnnotations} selectedBoxId={selectedBoxId}
          onSelect={setSelectedBoxId}
          onUpdate={(boxId, changes) => activeImageId && updateAnnotation(activeImageId, boxId, changes)}
          onDelete={(boxId) => activeImageId && deleteAnnotation(activeImageId, boxId)}
          exportJSON={exportJSON}
          imageWidth={activeImage?.width} imageHeight={activeImage?.height}
        />
      </div>
    </div>
  )
}
