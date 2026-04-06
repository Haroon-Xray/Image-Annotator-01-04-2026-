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
      const sep = '='.repeat(70)
      console.log('\n' + sep)
      console.log('[YOLO] Starting YOLO generation')
      console.log(sep)

      if (!images.length || !hasAnnotations) {
         console.warn('[YOLO] Missing images or annotations')
         alert('Please upload images and add annotations first')
         return
      }

      console.log(`[YOLO] Images: ${images.length}`)
      console.log(`[YOLO] Has annotations: ${hasAnnotations}`)
      console.log('[YOLO] Images data:', images)
      console.log('[YOLO] Annotations data:', annotations)

      setIsExporting(true)
      setStatusWithTimeout('Uploading images and generating YOLO dataset...')

      try {
         console.log('[YOLO] Step 1: Uploading images if needed')

         // Step 1: Upload all images if needed
         const uploadedImageIds = []

         for (const image of images) {
            console.log(`[YOLO]   Processing image: ${image.name}, ID type: ${typeof image.id}`)

            // Check if this is a local image (string ID) or already uploaded (numeric ID)
            if (typeof image.id === 'number') {
               console.log(`[YOLO]   ✓ Image ${image.id} already uploaded`)
               uploadedImageIds.push(image.id)
            } else {
               // Need to upload this image
               console.log(`[YOLO]   ↑ Uploading image: ${image.name}`)
               const formData = new FormData()
               try {
                  const response = await fetch(image.url)
                  const blob = await response.blob()
                  formData.append('image_file', blob, image.name)
                  formData.append('name', image.name)

                  const uploadResult = await apiClient.post('/images/', formData, {
                     headers: { 'Content-Type': 'multipart/form-data' }
                  })
                  console.log(`[YOLO]   ✓ Uploaded image: ${uploadResult.data.id}`)
                  uploadedImageIds.push(uploadResult.data.id)
               } catch (uploadErr) {
                  console.error(`[YOLO]   ✗ Upload failed: ${image.name}`, uploadErr)
                  throw new Error(`Failed to upload image: ${image.name}`)
               }
            }
         }

         console.log(`[YOLO] Step 1 complete. Uploaded IDs: ${uploadedImageIds.join(', ')}`)

         // Step 2: Submit bulk annotations first if any
         console.log('[YOLO] Step 2: Submitting bulk annotations')

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
                        x_center: (ann.x || 0) + (ann.w || 0) / 2,  // center X coordinate
                        y_center: (ann.y || 0) + (ann.h || 0) / 2,  // center Y coordinate
                        width: ann.w || 0.5,
                        height: ann.h || 0.5
                     }))
                  }))
            }

            console.log('[YOLO] Bulk data:', bulkData)

            if (bulkData.images.length > 0) {
               console.log(`[YOLO]   ↑ Submitting annotations for ${bulkData.images.length} images`)
               const bulkResult = await apiClient.post('/images/bulk/annotations/', bulkData)
               console.log('[YOLO]   ✓ Bulk annotations submitted:', bulkResult.data)
            } else {
               console.log('[YOLO]   No annotations to submit')
            }
         }

         // Step 3: Generate YOLO dataset and download file
         console.log('[YOLO] Step 3: Generating YOLO dataset')

         const yoloPayload = {
            image_ids: uploadedImageIds,
            output_dir: 'dataset'
         }
         console.log('[YOLO] YOLO payload:', yoloPayload)
         console.log(`[YOLO] ↑ Requesting YOLO generation for ${uploadedImageIds.length} image(s)`)

         const response = await apiClient.post('/images/yolo/generate/', yoloPayload, {
            responseType: 'blob'
         })

         console.log('[YOLO] ✓ Received response from server')
         console.log('=== YOLO Response ===')
         console.log('Response status:', response.status)
         console.log('Response headers:', response.headers)
         console.log('Blob size:', response.data.size)
         console.log('Blob type:', response.data.type)

         // Check if blob is actually valid
         if (!response.data || response.data.size === 0) {
            throw new Error('Received empty blob from server - no file data')
         }

         // Check if response looks like an error (text instead of binary)
         if (response.data.type === 'text/plain' || response.data.type === 'application/json') {
            console.warn('[YOLO] WARNING: Received text response instead of file!')
            const text = await response.data.text()
            console.warn('[YOLO] Response text:', text)
            throw new Error(`Server returned error: ${text}`)
         }

         // Get filename from response headers or use default
         const contentDisposition = response.headers['content-disposition'] || ''
         let filename = uploadedImageIds.length > 1 ? 'yolo_dataset.zip' : 'yolo_labels.txt'

         if (contentDisposition) {
            console.log('Content-Disposition:', contentDisposition)
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
            if (filenameMatch) {
               filename = filenameMatch[1]
               console.log('Extracted filename:', filename)
            }
         }

         // Get metadata from response headers (headers are lowercase in axios)
         let imagesCount = parseInt(response.headers['x-images-count']) || uploadedImageIds.length
         let annotationsCount = parseInt(response.headers['x-total-annotations']) || 0

         console.log('Images count from header:', imagesCount, 'type:', typeof imagesCount)
         console.log('Annotations count from header:', annotationsCount, 'type:', typeof annotationsCount)
         console.log('Final filename:', filename)
         console.log('Uploaded image IDs:', uploadedImageIds)

         // Create blob download
         console.log(`[YOLO] ↓ Triggering file download: ${filename}`)
         const url = window.URL.createObjectURL(response.data)
         const link = document.createElement('a')
         link.href = url
         link.setAttribute('download', filename)
         console.log('Setting download attribute to:', filename)
         document.body.appendChild(link)
         link.click()
         document.body.removeChild(link)
         window.URL.revokeObjectURL(url)

         console.log('[YOLO] ✓ File downloaded:', filename)
         setStatusWithTimeout(`✓ Dataset generated and downloaded! ${imagesCount} images, ${annotationsCount} annotations`)
         console.log('=' * 50 + '\n')
      } catch (error) {
         console.error('=== YOLO GENERATION ERROR ===')
         console.error('Full error object:', error)
         console.error('Error message:', error.message)
         console.error('Error status:', error.response?.status)
         console.error('Error data:', error.response?.data)
         console.error('Error config:', error.config)
         console.error('Stack:', error.stack)

         let errorMsg = 'Failed to generate dataset'

         // Try to extract detailed error message
         if (error.response?.data?.error) {
            errorMsg = error.response.data.error
         } else if (error.response?.data?.detail) {
            errorMsg = error.response.data.detail
         } else if (error.response?.data) {
            // Log raw response data
            console.error('Raw response data:', error.response.data)
            errorMsg = `Server error (${error.response.status}): ${JSON.stringify(error.response.data)}`
         } else if (error.message) {
            errorMsg = error.message
         }

         console.error('Final error message:', errorMsg)
         setStatusWithTimeout(`✗ ${errorMsg}`)
         console.log(sep + '\n')
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
            <span className={styles.title}>Images Ann</span>
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
