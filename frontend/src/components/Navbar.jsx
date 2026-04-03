import React, { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'
import apiClient from '../api'

export default function Navbar({ onExport, annotationCount, images, annotations, hasAnnotations }) {
   const [isExporting, setIsExporting] = useState(false)
   const [exportStatus, setExportStatus] = useState(null)
   const statusTimeoutRef = useRef(null)

   // Cleanup timeout on component unmount
   useEffect(() => {
      return () => {
         if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current)
         }
      }
   }, [])

   // Helper function to set status with guaranteed 5-second display
   const setStatusWithTimeout = (message, duration = 5000) => {
      if (statusTimeoutRef.current) {
         clearTimeout(statusTimeoutRef.current)
      }
      setExportStatus(message)
      statusTimeoutRef.current = setTimeout(() => {
         setExportStatus(null)
         statusTimeoutRef.current = null
      }, duration)
   }

   const handleGenerateYOLO = async () => {
      if (!images.length || !hasAnnotations) {
         alert('Please upload images and add annotations first')
         return
      }

      setIsExporting(true)
      setStatusWithTimeout('Uploading images and generating YOLO dataset...')

      try {
         console.log('Starting YOLO generation process')
         console.log('Images:', images)
         
         // Step 1: Upload all images if needed
         const uploadedImageIds = []
         
         for (const image of images) {
            // Check if this is a local image (string ID) or already uploaded (numeric ID)
            if (typeof image.id === 'number') {
               uploadedImageIds.push(image.id)
            } else {
               // Need to upload this image
               const formData = new FormData()
               try {
                  const response = await fetch(image.url)
                  const blob = await response.blob()
                  formData.append('image_file', blob, image.name)
                  formData.append('name', image.name)
                  
                  const uploadResult = await apiClient.post('/images/', formData, {
                     headers: { 'Content-Type': 'multipart/form-data' }
                  })
                  console.log('Uploaded image:', uploadResult.data)
                  uploadedImageIds.push(uploadResult.data.id)
               } catch (uploadErr) {
                  console.error(`Failed to upload image ${image.name}:`, uploadErr)
                  throw new Error(`Failed to upload image: ${image.name}`)
               }
            }
         }
         
         console.log('Uploaded image IDs:', uploadedImageIds)
         
         // Step 2: Submit bulk annotations first if any
         if (uploadedImageIds.length > 0) {
            const imageIdMap = {}
            images.forEach((img, idx) => {
               imageIdMap[img.id] = uploadedImageIds[idx]
            })
            
            const bulkData = {
               images: images
                  .filter(img => annotations[img.id] && annotations[img.id].length > 0)
                  .map(img => ({
                     image_id: imageIdMap[img.id],
                     annotations: annotations[img.id].map(ann => ({
                        label: ann.label || 'object',
                        class_id: ann.class_id || 0,
                        x_center: ann.x || 0.5,
                        y_center: ann.y || 0.5,
                        width: ann.w || 0.5,
                        height: ann.h || 0.5
                     }))
                  }))
            }
            
            if (bulkData.images.length > 0) {
               console.log('Submitting annotations before YOLO...')
               await apiClient.post('/images/bulk/annotations/', bulkData)
            }
         }
         
         // Step 3: Generate YOLO dataset
         const yoloPayload = {
            image_ids: uploadedImageIds,
            output_dir: 'dataset'
         }
         console.log('YOLO payload:', yoloPayload)
         
         const response = await apiClient.post('/images/yolo/generate/', yoloPayload)
         console.log('YOLO response:', response.data)

         setStatusWithTimeout(`✓ Dataset generated! ${response.data.images_copied} images, ${response.data.total_annotations} annotations`)
      } catch (error) {
         console.error('YOLO generation error - Status:', error.response?.status)
         console.error('YOLO generation error - Data:', error.response?.data)
         let errorMsg = 'Failed to generate dataset'
         if (error.response?.data?.error) {
            errorMsg = error.response.data.error
         } else if (error.response?.data?.detail) {
            errorMsg = error.response.data.detail
         } else if (error.message) {
            errorMsg = error.message
         }
         setStatusWithTimeout(`✗ ${errorMsg}`)
      } finally {
         setIsExporting(false)
      }
   }

   const handleBulkSubmit = async () => {
      if (!images.length || !hasAnnotations) {
         alert('Please upload images and add annotations first')
         return
      }

      setIsExporting(true)
      setStatusWithTimeout('Uploading images and submitting annotations...')

      try {
         console.log('Starting bulk submit process')
         console.log('Images:', images)
         console.log('Annotations:', annotations)
         
         // Step 1: Upload all images that don't have a database ID yet
         const imageIdMap = {} // Maps local ID to database ID
         
         for (const image of images) {
            // Check if this image has numeric ID (already in database)
            // or string ID like 'box_1' (local only)
            if (typeof image.id === 'number') {
               imageIdMap[image.id] = image.id
            } else {
               // Need to upload this image
               const formData = new FormData()
               // Get the File object from the image URL
               try {
                  const response = await fetch(image.url)
                  const blob = await response.blob()
                  formData.append('image_file', blob, image.name)
                  formData.append('name', image.name)
                  
                  // Upload image
                  const uploadResult = await apiClient.post('/images/', formData, {
                     headers: { 'Content-Type': 'multipart/form-data' }
                  })
                  console.log('Uploaded image:', uploadResult.data)
                  imageIdMap[image.id] = uploadResult.data.id
               } catch (uploadErr) {
                  console.error(`Failed to upload image ${image.name}:`, uploadErr)
                  throw new Error(`Failed to upload image: ${image.name}`)
               }
            }
         }
         
         console.log('Image ID mapping:', imageIdMap)
         
         // Step 2: Prepare bulk annotation data with correct image IDs
         const bulkData = {
            images: images
               .filter(img => annotations[img.id] && annotations[img.id].length > 0)
               .map(img => ({
                  image_id: imageIdMap[img.id], // Use database ID
                  annotations: annotations[img.id].map(ann => ({
                     label: ann.label || 'object',
                     class_id: ann.class_id || 0,
                     x_center: ann.x || 0.5,
                     y_center: ann.y || 0.5,
                     width: ann.w || 0.5,
                     height: ann.h || 0.5
                  }))
               }))
         }

         console.log('Bulk data to submit:', bulkData)

         if (!bulkData.images.length) {
            setStatusWithTimeout('✗ No annotations to submit', 2000)
            setIsExporting(false)
            return
         }

         // Step 3: Submit annotations
         const response = await apiClient.post('/images/bulk/annotations/', bulkData)
         console.log('Submission response:', response.data)

         setStatusWithTimeout(`✓ ${response.data.total_annotations} annotations submitted across ${response.data.total_images} images`)
      } catch (error) {
         console.error('Bulk submission error:', error.response?.data || error.message)
         let errorMsg = 'Failed to submit annotations'
         if (error.response?.data?.error) {
            errorMsg = error.response.data.error
         } else if (error.response?.data?.detail) {
            errorMsg = error.response.data.detail
         } else if (error.message) {
            errorMsg = error.message
         }
         setStatusWithTimeout(`✗ ${errorMsg}`)
      } finally {
         setIsExporting(false)
      }
   }

   return (
      <nav className={styles.navbar}>
         <div className={styles.brand}>
            <div className={styles.logo}>
               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="2 1" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#7c6af7" strokeWidth="1.5" />
               </svg>
            </div>
            <span className={styles.title}>Image Annotator</span>
            {annotationCount > 0 && <span className={styles.badge}>{annotationCount} boxes</span>}
         </div>

         <div className={styles.actions}>
            <button className={styles.exportBtn} onClick={onExport} disabled={isExporting}>
               Export JSON
            </button>
            {images.length > 0 && (
               <>
                  <button
                     className={styles.actionBtn}
                     onClick={handleBulkSubmit}
                     disabled={isExporting || !hasAnnotations}
                     title="Submit all annotations to backend"
                  >
                     📤 Submit
                  </button>
                  <button
                     className={styles.actionBtn}
                     onClick={handleGenerateYOLO}
                     disabled={isExporting || !hasAnnotations}
                     title="Generate YOLO dataset"
                  >
                     🚀 Generate YOLO
                  </button>
               </>
            )}
         </div>

         {exportStatus && (
            <div className={`${styles.status} ${exportStatus.startsWith('✓') ? styles.success : styles.error}`}>
               {exportStatus}
            </div>
         )}
      </nav>
   )
}
