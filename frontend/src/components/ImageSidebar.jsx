import React, { useRef } from 'react'
import styles from './ImageSidebar.module.css'

export default function ImageSidebar({ images, activeImageId, onSelect, onUpload, onRemove, annotations }) {
   const inputRef = useRef(null)

   const handleFiles = (e) => {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
      if (files.length) onUpload(files)
      e.target.value = ''
   }

   return (
      <aside className={styles.sidebar}>
         <div className={styles.header}>
            <span className={styles.label}>Images</span>
            {images.length > 0 && <span className={styles.count}>{images.length}</span>}
         </div>

         <div className={styles.dropZone}
            onClick={() => inputRef.current.click()}
            onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (f.length) onUpload(f) }}
            onDragOver={e => e.preventDefault()}
         >
            <div className={styles.dropIcon}>
               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
               </svg>
            </div>
            <div className={styles.dropText}>Upload images</div>
            <div className={styles.dropHint}>PNG · JPG · WEBP</div>
            <input ref={inputRef} type="file" accept="image/*" multiple className={styles.fileInput} onChange={handleFiles} />
         </div>

         <div className={styles.list}>
            {images.length === 0 && <div className={styles.empty}>No images yet</div>}
            {images.map(img => {
               const boxCount = (annotations[img.id] || []).length
               const isActive = img.id === activeImageId
               const isUploading = img.uploading
               return (
                  <div key={img.id} className={`${styles.item} ${isActive ? styles.active : ''} ${isUploading ? styles.uploading : ''}`} onClick={() => onSelect(img.id)}>
                     <div className={styles.thumb}>
                        <img src={img.url} alt={img.name} className={styles.thumbImg} />
                        {boxCount > 0 && <span className={styles.thumbBadge}>{boxCount}</span>}
                        {isUploading && <span className={styles.uploadingBadge}>⏳</span>}
                     </div>
                     <div className={styles.itemMeta}>
                        <span className={styles.imgName}>{img.name}</span>
                        <span className={styles.imgBoxes}>
                           {isUploading
                              ? 'uploading...'
                              : (boxCount === 0 ? 'no boxes' : `${boxCount} box${boxCount !== 1 ? 'es' : ''}`)
                           }
                        </span>
                     </div>
                     <button
                        className={styles.removeBtn}
                        onClick={e => { e.stopPropagation(); onRemove(img.id) }}
                        disabled={isUploading}
                     >
                        ×
                     </button>
                  </div>
               )
            })}
         </div>
      </aside>
   )
}
