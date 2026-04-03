import React, { useState } from 'react'
import styles from './Navbar.module.css'
import apiClient from '../api'

export default function Navbar({ onExport, annotationCount, images, hasAnnotations }) {
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
         const errorMsg = error.response?.data?.error || 'Failed to generate dataset'
         setExportStatus(`✗ ${errorMsg}`)
         console.error('YOLO generation error:', error)
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
            images: images.map(img => ({
               image_id: img.id,
               annotations: img.annotations || []
            }))
         }

         const response = await apiClient.post('/api/images/bulk/annotations/', bulkData)

         setExportStatus(`✓ ${response.data.total_annotations} annotations submitted across ${response.data.total_images} images`)
         setTimeout(() => setExportStatus(null), 4000)
      } catch (error) {
         const errorMsg = error.response?.data?.error || 'Failed to submit annotations'
         setExportStatus(`✗ ${errorMsg}`)
         console.error('Bulk submission error:', error)
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
