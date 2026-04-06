import { useState, useCallback } from 'react'
import apiClient from '../api'

let idCounter = 1
const genId = () => `box_${idCounter++}`

const BOX_COLORS = [
   '#7c6af7', '#34d399', '#fbbf24', '#f87171',
   '#60a5fa', '#f472b6', '#a78bfa', '#2dd4bf',
]

export function useAnnotations() {
   const [images, setImages] = useState([])
   const [activeImageId, setActiveImageId] = useState(null)
   const [annotations, setAnnotations] = useState({})
   const [selectedBoxId, setSelectedBoxId] = useState(null)

   const activeImage = images.find(img => img.id === activeImageId) || null
   const activeAnnotations = annotations[activeImageId] || []

   // Auto-save annotation to database if image is uploaded
   const saveAnnotationToDb = useCallback(async (imageId, annotation) => {
      // Only save if image has a numeric ID (uploaded to backend)
      if (typeof imageId !== 'number') {
         console.log(`[AUTO-SAVE] Image ${imageId} not yet uploaded, skipping DB save`)
         return
      }

      try {
         // Convert local annotation format to YOLO format
         // annotation stores: {x, y, w, h} = top-left corner + size (all normalized 0-1)
         // YOLO needs: {x_center, y_center, width, height} = center point + size (all normalized 0-1)
         const annotationData = {
            label: annotation.label || 'object',
            class_id: annotation.class_id || 0,
            x_center: (annotation.x || 0) + (annotation.w || 0) / 2,  // center X
            y_center: (annotation.y || 0) + (annotation.h || 0) / 2,  // center Y
            width: annotation.w || 0.5,
            height: annotation.h || 0.5,
            x: 0,
            y: 0
         }

         console.log(`[AUTO-SAVE] Box: x=${annotation.x}, y=${annotation.y}, w=${annotation.w}, h=${annotation.h}`)
         console.log(`[AUTO-SAVE] YOLO: x_center=${annotationData.x_center}, y_center=${annotationData.y_center}`)
         console.log(`[AUTO-SAVE] Saving annotation for image ${imageId}:`, annotationData)

         // Save single annotation endpoint
         const response = await apiClient.post(`/images/${imageId}/annotations/`, annotationData)
         console.log(`[AUTO-SAVE] ✓ Annotation saved successfully:`, response.data)
      } catch (err) {
         console.error(`[AUTO-SAVE] ✗ Failed to auto-save annotation for image ${imageId}:`, err)
         if (err.response?.data) {
            console.error(`[AUTO-SAVE] Server error:`, err.response.data)
         }
      }
   }, [])

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
      const newBox = {
         id: genId(),
         label: 'object',
         class_id: 0,
         color,
         x: 0,
         y: 0,
         ...box
      }
      setAnnotations(prev => ({ ...prev, [imageId]: [...(prev[imageId] || []), newBox] }))
      setSelectedBoxId(newBox.id)

      // Auto-save to database if image is uploaded
      if (typeof imageId === 'number') {
         saveAnnotationToDb(imageId, newBox)
      }
   }, [annotations, saveAnnotationToDb])

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
