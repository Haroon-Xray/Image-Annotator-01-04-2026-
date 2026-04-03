import { useState, useCallback } from 'react'

let idCounter = 1
const genId = () => `box_${idCounter++}`

const BOX_COLORS = [
  '#7c6af7','#34d399','#fbbf24','#f87171',
  '#60a5fa','#f472b6','#a78bfa','#2dd4bf',
]

export function useAnnotations() {
  const [images, setImages] = useState([])
  const [activeImageId, setActiveImageId] = useState(null)
  const [annotations, setAnnotations] = useState({})
  const [selectedBoxId, setSelectedBoxId] = useState(null)

  const activeImage = images.find(img => img.id === activeImageId) || null
  const activeAnnotations = annotations[activeImageId] || []

  const addImages = useCallback((files) => {
    const newImages = files.map(file => ({
      id: genId(), name: file.name, url: URL.createObjectURL(file), width: 0, height: 0
    }))
    setImages(prev => [...prev, ...newImages])
    setAnnotations(prev => {
      const updated = { ...prev }
      newImages.forEach(img => { updated[img.id] = [] })
      return updated
    })
    setActiveImageId(prev => prev ?? newImages[0]?.id ?? null)
  }, [])

  const setImageDimensions = useCallback((id, width, height) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, width, height } : img))
  }, [])

  const addAnnotation = useCallback((imageId, box) => {
    const color = BOX_COLORS[(annotations[imageId]?.length || 0) % BOX_COLORS.length]
    const newBox = { id: genId(), label: 'object', color, ...box }
    setAnnotations(prev => ({ ...prev, [imageId]: [...(prev[imageId] || []), newBox] }))
    setSelectedBoxId(newBox.id)
  }, [annotations])

  const updateAnnotation = useCallback((imageId, boxId, changes) => {
    setAnnotations(prev => ({
      ...prev,
      [imageId]: (prev[imageId] || []).map(b => b.id === boxId ? { ...b, ...changes } : b),
    }))
  }, [])

  const deleteAnnotation = useCallback((imageId, boxId) => {
    setAnnotations(prev => ({ ...prev, [imageId]: (prev[imageId] || []).filter(b => b.id !== boxId) }))
    setSelectedBoxId(prev => prev === boxId ? null : prev)
  }, [])

  const clearAnnotations = useCallback((imageId) => {
    setAnnotations(prev => ({ ...prev, [imageId]: [] }))
    setSelectedBoxId(null)
  }, [])

  const removeImage = useCallback((id) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      setActiveImageId(cur => cur === id ? (updated[0]?.id || null) : cur)
      return updated
    })
    setAnnotations(prev => { const u = { ...prev }; delete u[id]; return u })
  }, [])

  const exportJSON = useCallback(() => {
    const data = {}
    images.forEach(img => {
      data[img.name] = (annotations[img.id] || []).map(({ id, color, ...rest }) => rest)
    })
    return JSON.stringify(data, null, 2)
  }, [images, annotations])

  return {
    images, activeImageId, setActiveImageId, activeImage, activeAnnotations,
    annotations, selectedBoxId, setSelectedBoxId, addImages, setImageDimensions,
    addAnnotation, updateAnnotation, deleteAnnotation, clearAnnotations, removeImage, exportJSON,
  }
}
