import React, { useState } from 'react'
import styles from './AnnotationsPanel.module.css'

export default function AnnotationsPanel({ annotations, selectedBoxId, onSelect, onUpdate, onDelete, exportJSON, imageWidth, imageHeight }) {
  const [copied, setCopied] = useState(false)
  const px = (val, dim) => Math.round(val * (dim || 1))

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJSON()).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>Annotations</span>
        <span className={styles.count}>{annotations.length}</span>
      </div>

      <div className={styles.list}>
        {annotations.length === 0 && (
          <div className={styles.empty}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2"/>
            </svg>
            <span>Draw a box on the canvas</span>
          </div>
        )}
        {annotations.map((box, i) => {
          const isSel = box.id === selectedBoxId
          return (
            <div key={box.id} className={`${styles.box} ${isSel ? styles.selected : ''}`}
              onClick={() => onSelect(box.id)}
              style={isSel ? { '--box-color': box.color } : {}}
            >
              <div className={styles.boxHeader}>
                <div className={styles.boxTitle}>
                  <div className={styles.colorDot} style={{ background: box.color }}/>
                  <span className={styles.boxNum}>Box {i + 1}</span>
                </div>
                <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(box.id) }}>×</button>
              </div>
              {isSel && (
                <div className={styles.boxForm} onClick={e => e.stopPropagation()}>
                  <div className={styles.labelRow}>
                    <label className={styles.fieldLabel}>Label</label>
                    <input className={styles.labelInput} value={box.label} onChange={e => onUpdate(box.id, { label: e.target.value })} placeholder="e.g. car, person" autoFocus/>
                  </div>
                  <div className={styles.coordsGrid}>
                    {[['x', box.x, imageWidth],['y', box.y, imageHeight],['w', box.w, imageWidth],['h', box.h, imageHeight]].map(([k, v, dim]) => (
                      <div key={k} className={styles.coordField}>
                        <span className={styles.coordLabel}>{k}</span>
                        <input className={styles.coordInput} type="number" value={px(v, dim)} readOnly/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.jsonSection}>
        <div className={styles.jsonHeader}>
          <span className={styles.jsonLabel}>JSON output</span>
          <button className={styles.copyBtn} onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <pre className={styles.jsonPre}>
          {annotations.length === 0 ? '[ ]' : JSON.stringify(
            annotations.map(b => ({ label: b.label, x: px(b.x, imageWidth), y: px(b.y, imageHeight), w: px(b.w, imageWidth), h: px(b.h, imageHeight) })),
            null, 1
          )}
        </pre>
      </div>
    </aside>
  )
}
