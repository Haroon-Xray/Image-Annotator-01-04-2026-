import React, { useRef, useState, useEffect, useCallback } from 'react'
import styles from './AnnotationCanvas.module.css'

const MIN_BOX_SIZE = 10

export default function AnnotationCanvas({ image, annotations, selectedBoxId, onSelectBox, onAddBox, onUpdateBox, tool }) {
   const containerRef = useRef(null)
   const imgRef = useRef(null)
   const [imgRect, setImgRect] = useState(null)
   const [drawing, setDrawing] = useState(null)
   const [zoom, setZoom] = useState(1)
   const [dragging, setDragging] = useState(null)
   const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false })

   useEffect(() => {
      if (!imgRef.current || !containerRef.current) return
      const update = () => {
         const r = imgRef.current?.getBoundingClientRect()
         const cr = containerRef.current?.getBoundingClientRect()
         if (r && cr) setImgRect({ x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height })
         setZoom(1)
      }
      const img = imgRef.current
      img.addEventListener('load', update)
      const ro = new ResizeObserver(update)
      ro.observe(containerRef.current)
      update()
      return () => { img.removeEventListener('load', update); ro.disconnect() }
   }, [image?.id])

   const toNorm = useCallback((cx, cy) => {
      if (!imgRect) return { x: 0, y: 0 }
      const adjustedX = (cx - imgRect.x) / zoom
      const adjustedY = (cy - imgRect.y) / zoom
      return { x: Math.max(0, Math.min(1, adjustedX / imgRect.w)), y: Math.max(0, Math.min(1, adjustedY / imgRect.h)) }
   }, [imgRect, zoom])

   const toPx = useCallback((nx, ny) => {
      if (!imgRect) return { x: 0, y: 0 }
      return { x: imgRect.x + nx * imgRect.w, y: imgRect.y + ny * imgRect.h }
   }, [imgRect])

   const getPos = useCallback((e) => {
      const cr = containerRef.current.getBoundingClientRect()
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - cr.left
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - cr.top
      return { cx, cy }
   }, [])

   const handleMouseDown = useCallback((e) => {
      if (e.button !== 0) return
      const { cx, cy } = getPos(e)

      if (tool === 'select') {
         for (const box of [...annotations].reverse()) {
            const p1 = toPx(box.x, box.y)
            const p2 = toPx(box.x + box.w, box.y + box.h)
            const handles = [
               { type: 'nw', x: p1.x, y: p1.y }, { type: 'ne', x: p2.x, y: p1.y },
               { type: 'sw', x: p1.x, y: p2.y }, { type: 'se', x: p2.x, y: p2.y },
            ]
            for (const h of handles) {
               if (Math.abs(cx - h.x) < 7 && Math.abs(cy - h.y) < 7) {
                  onSelectBox(box.id)
                  const norm = toNorm(cx, cy)
                  setDragging({ boxId: box.id, type: h.type, startX: norm.x, startY: norm.y, origBox: { ...box } })
                  return
               }
            }
            if (cx >= p1.x && cx <= p2.x && cy >= p1.y && cy <= p2.y) {
               onSelectBox(box.id)
               const norm = toNorm(cx, cy)
               setDragging({ boxId: box.id, type: 'move', startX: norm.x, startY: norm.y, origBox: { ...box } })
               return
            }
         }
         onSelectBox(null)
         return
      }

      if (!imgRect) return
      const norm = toNorm(cx, cy)
      setDrawing({ startX: norm.x, startY: norm.y, x: norm.x, y: norm.y, w: 0, h: 0 })
      onSelectBox(null)
   }, [tool, annotations, imgRect, toPx, toNorm, onSelectBox, getPos, zoom])

   const handleMouseMove = useCallback((e) => {
      const { cx, cy } = getPos(e)
      setCursor({ x: cx, y: cy, visible: true })

      if (drawing) {
         const norm = toNorm(cx, cy)
         setDrawing(prev => ({
            ...prev,
            x: Math.min(norm.x, prev.startX), y: Math.min(norm.y, prev.startY),
            w: Math.abs(norm.x - prev.startX), h: Math.abs(norm.y - prev.startY),
         }))
         return
      }

      if (dragging && imgRect) {
         const norm = toNorm(cx, cy)
         const dx = norm.x - dragging.startX
         const dy = norm.y - dragging.startY
         const ob = dragging.origBox
         let nb = { ...ob }

         if (dragging.type === 'move') {
            nb.x = Math.max(0, Math.min(1 - ob.w, ob.x + dx))
            nb.y = Math.max(0, Math.min(1 - ob.h, ob.y + dy))
         } else {
            const minW = MIN_BOX_SIZE / imgRect.w, minH = MIN_BOX_SIZE / imgRect.h
            if (dragging.type === 'se') { nb.w = Math.max(minW, ob.w + dx); nb.h = Math.max(minH, ob.h + dy) }
            else if (dragging.type === 'nw') {
               const nx = Math.min(ob.x + ob.w - minW, ob.x + dx), ny = Math.min(ob.y + ob.h - minH, ob.y + dy)
               nb = { ...ob, x: nx, y: ny, w: ob.w - (nx - ob.x), h: ob.h - (ny - ob.y) }
            } else if (dragging.type === 'ne') {
               const ny = Math.min(ob.y + ob.h - minH, ob.y + dy)
               nb = { ...ob, y: ny, w: Math.max(minW, ob.w + dx), h: ob.h - (ny - ob.y) }
            } else if (dragging.type === 'sw') {
               const nx = Math.min(ob.x + ob.w - minW, ob.x + dx)
               nb = { ...ob, x: nx, w: ob.w - (nx - ob.x), h: Math.max(minH, ob.h + dy) }
            }
            nb.x = Math.max(0, nb.x); nb.y = Math.max(0, nb.y)
            nb.w = Math.min(1 - nb.x, nb.w); nb.h = Math.min(1 - nb.y, nb.h)
         }
         onUpdateBox(dragging.boxId, nb)
      }
   }, [drawing, dragging, imgRect, toNorm, onUpdateBox, getPos, zoom])

   const handleMouseUp = useCallback(() => {
      if (drawing) {
         if (drawing.w * (imgRect?.w || 0) > MIN_BOX_SIZE && drawing.h * (imgRect?.h || 0) > MIN_BOX_SIZE)
            onAddBox({ x: drawing.x, y: drawing.y, w: drawing.w, h: drawing.h })
         setDrawing(null)
      }
      if (dragging) setDragging(null)
   }, [drawing, dragging, imgRect, onAddBox])

   const handleWheel = useCallback((e) => {
      // Only allow zoom if no annotations have been drawn yet
      if (annotations.length > 0) return

      e.preventDefault()
      setZoom(z => Math.max(0.25, Math.min(4, z - e.deltaY * 0.001)))
   }, [annotations.length])

   if (!image) {
      return (
         <div className={styles.empty}>
            <div className={styles.emptyInner}>
               <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="17" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 32l10-8 8 6 6-5 12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
               <p>Upload images to start annotating</p>
            </div>
         </div>
      )
   }

   return (
      <div
         className={styles.canvas} ref={containerRef}
         onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={() => { handleMouseUp(); setCursor(c => ({ ...c, visible: false })) }}
         onWheel={handleWheel}
         style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
      >
         <div className={styles.imageWrapper} style={{ transform: `scale(${zoom})` }}>
            <img ref={imgRef} src={image.url} alt={image.name} className={styles.image} draggable={false} />
         </div>

         {imgRect && (
            <svg className={styles.svg} style={{
               left: imgRect.x,
               top: imgRect.y,
               width: imgRect.w,
               height: imgRect.h,
               transform: `scale(${zoom})`,
               transformOrigin: '0 0'
            }}>
               {annotations.map(box => {
                  const bx = box.x * imgRect.w, by = box.y * imgRect.h
                  const bw = box.w * imgRect.w, bh = box.h * imgRect.h
                  const isSel = box.id === selectedBoxId
                  return (
                     <g key={box.id}>
                        <rect x={bx} y={by} width={bw} height={bh} fill={`${box.color}18`} stroke={box.color} strokeWidth={isSel ? 2 : 1.5} rx="2" />
                        <rect x={bx} y={by - 18} width={box.label.length * 6.5 + 12} height={17} rx="3" fill={box.color} />
                        <text x={bx + 6} y={by - 5} fontSize="9" fill="white" fontFamily="DM Mono, monospace" fontWeight="500">{box.label}</text>
                        {isSel && [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]].map(([hx, hy], i) => (
                           <rect key={i} x={hx - 4} y={hy - 4} width={8} height={8} rx="1" fill="white" stroke={box.color} strokeWidth="1.5"
                              style={{ cursor: ['nw-resize', 'ne-resize', 'sw-resize', 'se-resize'][i] }} />
                        ))}
                     </g>
                  )
               })}
               {drawing && (
                  <rect x={drawing.x * imgRect.w} y={drawing.y * imgRect.h} width={drawing.w * imgRect.w} height={drawing.h * imgRect.h}
                     fill="rgba(124,106,247,0.1)" stroke="#7c6af7" strokeWidth="1.5" strokeDasharray="5 3" rx="2" />
               )}
            </svg>
         )}

         {cursor.visible && imgRect && (
            <div className={styles.coords}>
               {Math.round(Math.max(0, (cursor.x - imgRect.x) / imgRect.w * (image.width || imgRect.w)))},&nbsp;
               {Math.round(Math.max(0, (cursor.y - imgRect.y) / imgRect.h * (image.height || imgRect.h)))}
            </div>
         )}
         <div className={styles.zoomBadge}>
            {Math.round(zoom * 100)}%
            {annotations.length > 0 && <span title="Zoom locked after drawing boxes"> 🔒</span>}
         </div>
      </div>
   )
}
