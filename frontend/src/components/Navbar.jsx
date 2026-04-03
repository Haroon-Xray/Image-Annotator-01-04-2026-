import React from 'react'
import styles from './Navbar.module.css'

export default function Navbar({ onExport, annotationCount }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5" strokeDasharray="2 1"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="#c4b5fd" strokeWidth="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="#7c6af7" strokeWidth="1.5"/>
          </svg>
        </div>
        <span className={styles.title}>Image Annotator</span>
        {annotationCount > 0 && <span className={styles.badge}>{annotationCount} boxes</span>}
      </div>
      <button className={styles.exportBtn} onClick={onExport}>Export JSON</button>
    </nav>
  )
}
