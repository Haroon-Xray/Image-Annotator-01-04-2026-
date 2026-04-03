import React, { useState } from 'react'
import styles from './Navbar.module.css'
import apiClient from '../api'

export default function Navbar({ onExport, annotationCount, images, annotations, hasAnnotations }) {
   const [isExporting, setIsExporting] = useState(false)
   const [exportStatus, setExportStatus] = useState(null)

   const handleGenerateYOLO = async () => {
      if (!images.length || !hasAnnotations) {
         alert('Please upload images and add annotations first')
         return
      }

      setIsExporting(true)
      setExportStatus('Generating YOLO dataset...')

      try {
         const imageIds = images.map(img => img.id)
         const response = await apiClient.post('/api/images/yolo/generate/', {
            image_ids: imageIds,
            output_dir: 'dataset'
         })

         setExportStatus(`✓ Dataset generated! ${response.data.images_copied} images, ${response.data.total_annotations} annotations`)
         setTimeout(() => setExportStatus(null), 4000)
      } catch (error) {
         console.error('YOLO generation error:', error.response?.data || error.message)
         const errorMsg = error.response?.data?.error || error.response?.data?.[0] || error.message || 'Failed to generate dataset'
         setExportStatus(`✗ ${errorMsg}`)
         setTimeout(() => setExportStatus(null), 4000)
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
      setExportStatus('Submitting annotations...')

      try {
         // Prepare data for bulk submission
         const bulkData = {
            images: images
               .filter(img => annotations[img.id] && annotations[img.id].length > 0)
               .map(img => ({
                  image_id: img.id,
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

         if (!bulkData.images.length) {
            setExportStatus('✗ No annotations to submit')
            setTimeout(() => setExportStatus(null), 2000)
            setIsExporting(false)
            return
         }

         const response = await apiClient.post('/api/images/bulk/annotations/', bulkData)

         setExportStatus(`✓ ${response.data.total_annotations} annotations submitted across ${response.data.total_images} images`)
         setTimeout(() => setExportStatus(null), 4000)
      } catch (error) {
         console.error('Bulk submission error:', error.response?.data || error.message)
         const errorMsg = error.response?.data?.error || error.response?.data?.[0] || error.message || 'Failed to submit annotations'
         setExportStatus(`✗ ${errorMsg}`)
         setTimeout(() => setExportStatus(null), 4000)
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
