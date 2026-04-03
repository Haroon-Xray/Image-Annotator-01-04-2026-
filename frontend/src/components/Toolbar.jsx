import React from 'react'
import styles from './Toolbar.module.css'

export default function Toolbar({ tool, setTool, onUndo, onClearAll, imageName, hasAnnotations }) {
   return (
      <div className={styles.toolbar}>
         <div className={styles.tools}>
            <button className={`${styles.toolBtn} ${tool === 'draw' ? styles.active : ''}`} onClick={() => setTool('draw')}>
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
               </svg>
               Box
            </button>
            <button className={`${styles.toolBtn} ${tool === 'select' ? styles.active : ''}`} onClick={() => setTool('select')}>
               <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l3.5 9 2-3.5L11 9.5 13 8l-3.5-3.5 3.5-2L2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
               </svg>
               Select
            </button>
         </div>
         <div className={styles.divider} />
         <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={onUndo}>
               <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6a4.5 4.5 0 108 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M2 3v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
               Undo
            </button>
            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={onClearAll}>
               <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 3h9M5 3V2h3v1M10 3l-.7 8H3.7L3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
               Clear
            </button>
         </div>
         {imageName && <div className={styles.filename}>{imageName}</div>}
         <div className={styles.hint}>
            {hasAnnotations
               ? '🔒 Zoom locked · Edit boxes or Clear to re-zoom'
               : (tool === 'draw' ? 'Click & drag to draw · Scroll to zoom' : 'Click to select · Drag to move / resize')
            }
         </div>
      </div>
   )
}
