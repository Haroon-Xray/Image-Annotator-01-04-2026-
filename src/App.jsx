// =====================================================================
// AnnotateAI — Image Annotation Tool
// A comprehensive single-file React component for annotating images
// with bounding boxes, labels, and metadata export
// 
// Usage: Import this component directly into your app
// Required fonts: Add to public/index.html <head>:
//   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
// =====================================================================

import React, { useState, useCallback, useRef, useEffect } from 'react';

// ── CSS injected at runtime ──────────────────────────────────────────
// Comprehensive CSS custom properties for theming and global styles
// Includes color palette, typography, spacing, and component sizes
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    /* Color Palette - Dark theme backgrounds */
    --bg-0: #080a0e; --bg-1: #0d1117; --bg-2: #111620; --bg-3: #161c28; --bg-4: #1c2333;
    
    /* Border colors with varying opacity for hierarchy */
    --border: rgba(255,255,255,0.06); --border-md: rgba(255,255,255,0.10); --border-hi: rgba(255,255,255,0.16);
    
    /* Text colors with semantic levels */
    --text-0: #f0f2f5; --text-1: #9ba8bc; --text-2: #5a6580; --text-3: #3a4458;
    
    /* Accent colors - Amber for primary, with variants for fill and glow */
    --amber: #f5a623; --amber-dim: rgba(245,166,35,0.12); --amber-glow: rgba(245,166,35,0.25); --amber-border: rgba(245,166,35,0.3);
    
    /* Semantic colors for actions and status */
    --blue: #4a90d9; --red: #e05c5c; --green: #4caf82;
    
    /* Typography - Display and monospace fonts */
    --font-display: 'Syne', sans-serif; --font-mono: 'Space Mono', monospace;
    
    /* Spacing and border radius */
    --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
    
    /* Component dimensions */
    --sidebar-w: 260px; --panel-w: 240px;
  }
  html, body, #root { height: 100%; width: 100%; overflow: hidden; }
  body { background: var(--bg-0); color: var(--text-0); font-family: var(--font-display); -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--bg-4); border-radius: 2px; }
  ::selection { background: var(--amber-glow); color: var(--amber); }
`;

/**
 * Injects global CSS styles into the document head if not already present
 * Ensures styles are only added once by checking for existing style element
 */
function injectStyles() {
  if (document.getElementById('annotateai-styles')) return;
  const el = document.createElement('style');
  el.id = 'annotateai-styles';
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

// ── useAnnotations hook ──────────────────────────────────────────────
/**
 * Custom hook for managing image annotations state and operations
 * Handles image loading, annotation CRUD, and data export
 * 
 * @returns {Object} - Annotations state and handler methods
 */
function useAnnotations() {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  /**
   * Adds multiple image files, converts them to base64, and stores metadata
   * Automatically sets the first image as active if none were loaded
   * @param {FileList} files - Image files selected by user
   */
  const addImages = useCallback((files) => {
    const readers = [...files].filter(f => f.type.startsWith('image/')).map(file =>
      new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve({
          id: Math.random().toString(36).slice(2),
          name: file.name,
          src: e.target.result,
          annotations: [],
          size: file.size,
        });
        reader.readAsDataURL(file);
      })
    );
    Promise.all(readers).then(newImages => {
      setImages(prev => {
        const next = [...prev, ...newImages];
        if (prev.length === 0 && newImages.length > 0) setActiveIdx(0);
        return next;
      });
    });
  }, []);

  /**
   * Adds a new annotation box to the active image with auto-generated label
   * @param {Object} ann - Annotation object with x, y, w, h coordinates
   */
  const addAnnotation = useCallback((ann) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx
        ? { ...img, annotations: [...img.annotations, { id: Math.random().toString(36).slice(2), ...ann, label: `Object ${img.annotations.length + 1}` }] }
        : img
    ));
  }, [activeIdx]);

  /**
   * Removes an annotation by ID from the active image
   * @param {string} annId - Annotation ID to delete
   */
  const deleteAnnotation = useCallback((annId) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx ? { ...img, annotations: img.annotations.filter(a => a.id !== annId) } : img
    ));
  }, [activeIdx]);

  /**
   * Clears all annotations from the active image
   */
  const clearAnnotations = useCallback(() => {
    setImages(prev => prev.map((img, i) => i === activeIdx ? { ...img, annotations: [] } : img));
  }, [activeIdx]);

  /**
   * Updates the label text of an annotation
   * @param {string} annId - Annotation ID
   * @param {string} label - New label text
   */
  const updateLabel = useCallback((annId, label) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx
        ? { ...img, annotations: img.annotations.map(a => a.id === annId ? { ...a, label } : a) }
        : img
    ));
  }, [activeIdx]);

  /**
   * Removes an image by index and adjusts active index appropriately
   * @param {number} idx - Image index to remove
   */
  const removeImage = useCallback((idx) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx(ai => {
        if (next.length === 0) return -1;
        if (idx < ai) return ai - 1;
        if (idx === ai) return Math.min(ai, next.length - 1);
        return ai;
      });
      return next;
    });
  }, []);

  /**
   * Exports all annotations as JSON file with rounded coordinates
   * File format: { name, annotations: [{ id, label, x, y, width, height }] }
   */
  const exportJSON = useCallback(() => {
    const data = images.map(img => ({
      name: img.name,
      annotations: img.annotations.map(a => ({
        id: a.id, label: a.label,
        x: Math.round(a.x), y: Math.round(a.y),
        width: Math.round(a.w), height: Math.round(a.h),
      })),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'annotations.json'; a.click();
    URL.revokeObjectURL(url);
  }, [images]);

  const activeImage = images[activeIdx] || null;
  return { images, activeIdx, activeImage, setActiveIdx, addImages, addAnnotation, deleteAnnotation, clearAnnotations, updateLabel, removeImage, exportJSON };
}

// ── UploadZone ───────────────────────────────────────────────────────
/**
 * Drag-and-drop zone component for uploading images
 * Provides visual feedback for drag state and handles file input
 * @param {Function} onFiles - Callback when files are selected/dropped
 */
function UploadZone({ onFiles }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const handle = (files) => { if (files?.length) onFiles(files); };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      style={{
        border: `1.5px dashed ${dragging ? 'var(--amber)' : 'var(--border-hi)'}`,
        borderRadius: 'var(--radius-md)', padding: '18px 14px', textAlign: 'center',
        cursor: 'pointer', background: dragging ? 'var(--amber-dim)' : 'transparent',
        transition: 'all 0.18s ease', userSelect: 'none',
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handle(e.target.files)} />
      <div style={{ marginBottom: 8 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ color: dragging ? 'var(--amber)' : 'var(--text-2)', transition: 'color 0.18s', margin: '0 auto', display: 'block' }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: dragging ? 'var(--amber)' : 'var(--text-1)', marginBottom: 3 }}>Drop images here</div>
      <div style={{ fontSize: 9, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>PNG · JPG · WEBP · GIF</div>
    </div>
  );
}

// ── ImageStrip ───────────────────────────────────────────────────────
/**
 * Converts bytes to human-readable file size format
 * @param {number} b - Size in bytes
 * @returns {string} - Formatted size string (B, KB, MB)
 */
function bytesToSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

/**
 * Displays scrollable list of loaded images with thumbnails
 * Shows annotation count and file size for each image
 * @param {Array} images - Image objects
 * @param {number} activeIdx - Currently selected image index
 * @param {Function} onSelect - Callback when image is clicked
 * @param {Function} onRemove - Callback to remove image
 */
function ImageStrip({ images, activeIdx, onSelect, onRemove }) {
  if (images.length === 0) return (
    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>NO IMAGES LOADED</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 10px' }}>
      {images.map((img, i) => (
        <div
          key={img.id}
          onClick={() => onSelect(i)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px',
            borderRadius: 'var(--radius-md)',
            background: i === activeIdx ? 'var(--bg-4)' : 'transparent',
            border: `1px solid ${i === activeIdx ? 'var(--amber-border)' : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.13s',
          }}
          onMouseEnter={e => { if (i !== activeIdx) e.currentTarget.style.background = 'var(--bg-3)'; }}
          onMouseLeave={e => { if (i !== activeIdx) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 5, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-4)', border: '1px solid var(--border)' }}>
            <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: i === activeIdx ? 'var(--text-0)' : 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{img.name}</div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {img.annotations.length > 0 && (
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--amber)', background: 'var(--amber-dim)', padding: '1px 5px', borderRadius: 3 }}>
                  {img.annotations.length} {img.annotations.length === 1 ? 'box' : 'boxes'}
                </span>
              )}
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{bytesToSize(img.size)}</span>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onRemove(i); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: '3px', borderRadius: 3, lineHeight: 1, transition: 'color 0.13s', cursor: 'pointer', opacity: 0.5 }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.opacity = '0.5'; }}
            title="Remove"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ── AnnotationList ───────────────────────────────────────────────────
/**
 * Displays and manages annotation list for active image
 * Supports inline editing of labels and deletion of annotations
 * @param {Array} annotations - Annotation objects to display
 * @param {Function} onDelete - Callback to delete annotation
 * @param {Function} onLabelChange - Callback to update label
 * @param {Function} onHover - Callback for hover state (for canvas highlighting)
 */
function AnnotationList({ annotations, onDelete, onLabelChange, onHover }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const startEdit = (ann) => { setEditingId(ann.id); setEditVal(ann.label); };
  const commitEdit = (id) => { if (editVal.trim()) onLabelChange(id, editVal.trim()); setEditingId(null); };

  if (annotations.length === 0) return (
    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', lineHeight: 2 }}>NO ANNOTATIONS<br/>Click and drag to draw boxes</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>
      {annotations.map((ann, i) => (
        <div
          key={ann.id}
          onMouseEnter={() => onHover && onHover(ann.id)}
          onMouseLeave={() => onHover && onHover(null)}
          style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-3)', border: '1px solid var(--border)', transition: 'border-color 0.13s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 3, background: 'var(--amber-dim)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>{i + 1}</span>
            </div>
            {editingId === ann.id ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={() => commitEdit(ann.id)}
                onKeyDown={e => { if (e.key === 'Enter') commitEdit(ann.id); if (e.key === 'Escape') setEditingId(null); }}
                style={{ flex: 1, background: 'var(--bg-4)', border: '1px solid var(--amber-border)', borderRadius: 3, padding: '2px 6px', fontSize: 11, color: 'var(--text-0)', outline: 'none', fontFamily: 'var(--font-display)' }}
              />
            ) : (
              <span onClick={() => startEdit(ann)} title="Click to rename" style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-0)', cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ann.label}
              </span>
            )}
            <button
              onClick={() => onDelete(ann.id)}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: '2px', borderRadius: 3, lineHeight: 1, cursor: 'pointer', transition: 'color 0.13s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-2)' }}>
            <span>X <span style={{ color: 'var(--text-1)' }}>{Math.round(ann.x)}</span></span>
            <span>Y <span style={{ color: 'var(--text-1)' }}>{Math.round(ann.y)}</span></span>
            <span>W <span style={{ color: 'var(--text-1)' }}>{Math.round(ann.w)}</span></span>
            <span>H <span style={{ color: 'var(--text-1)' }}>{Math.round(ann.h)}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AnnotationCanvas ─────────────────────────────────────────────────
// Canvas drawing properties
const BOX_COLOR = '#f5a623';
const BOX_FILL  = 'rgba(245,166,35,0.07)';
const BOX_FILL_HOV = 'rgba(245,166,35,0.14)';

/**
 * Draws a bounding box on canvas with styling based on hover state
 * Includes box label number and corner handles when hovered
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} r - Rectangle object {x, y, w, h}
 * @param {number} index - Box index for label
 * @param {boolean} isHovered - Whether box is hovered
 * @param {boolean} isLive - Whether this is a currently-drawing box (dashed)
 */
function drawBox(ctx, r, index, isHovered, isLive = false) {
  const { x, y, w, h } = r;
  ctx.save();
  ctx.fillStyle = isHovered ? BOX_FILL_HOV : BOX_FILL;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = BOX_COLOR;
  ctx.lineWidth = isHovered ? 2 : 1.5;
  if (isLive) { ctx.setLineDash([6, 3]); ctx.lineWidth = 1.5; }
  ctx.strokeRect(x, y, w, h);
  ctx.restore();

  if (!isLive && index !== undefined) {
    const label = String(index + 1);
    ctx.font = `700 10px "Space Mono", monospace`;
    const tw = ctx.measureText(label).width;
    const pw = tw + 10, ph = 16;
    const px = x, py = Math.max(0, y - ph - 2);
    ctx.fillStyle = BOX_COLOR;
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 3); ctx.fill();
    ctx.fillStyle = '#080a0e';
    ctx.fillText(label, px + 5, py + ph - 4);
    
    // Draw corner handles when hovered
    if (isHovered) {
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([hx, hy]) => {
        ctx.fillStyle = '#080a0e'; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = BOX_COLOR; ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
      });
    }
  }
}

/**
 * Interactive canvas for drawing annotation boxes on images
 * Supports drag-to-draw, live preview, crosshair cursor, and hover highlighting
 * @param {Object} image - Image object with src and metadata
 * @param {Array} annotations - Existing annotations to render
 * @param {Function} onAdd - Callback when new box is drawn
 * @param {string} hoveredId - ID of currently hovered annotation
 */
function AnnotationCanvas({ image, annotations, onAdd, hoveredId }) {
  const canvasRef = useRef();
  const imgRef = useRef();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [startPt, setStartPt] = useState({ x: 0, y: 0 });
  const [liveRect, setLiveRect] = useState(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, vis: false });

  // Reset image loaded state when new image is selected
  useEffect(() => { setImgLoaded(false); }, [image?.id]);

  /**
   * Syncs canvas size with image container
   * Must be called on image load and window resize
   */
  const sync = useCallback(() => {
    const img = imgRef.current;
    const cv = canvasRef.current;
    if (!img || !cv) return;
    cv.width = img.offsetWidth;
    cv.height = img.offsetHeight;
  }, []);

  // Setup resize listener after image loads
  useEffect(() => {
    if (!imgLoaded) return;
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [imgLoaded, sync]);

  /**
   * Main canvas render loop - draws all boxes, cursor, and live preview
   */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);

    // Draw crosshair cursor when not drawing
    if (cursor.vis && !drawing) {
      ctx.save();
      ctx.strokeStyle = 'rgba(245,166,35,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cursor.x, 0); ctx.lineTo(cursor.x, cv.height);
      ctx.moveTo(0, cursor.y); ctx.lineTo(cv.width, cursor.y);
      ctx.stroke();
      ctx.restore();
    }

    // Draw all existing boxes
    annotations.forEach((ann, i) => drawBox(ctx, ann, i, ann.id === hoveredId));
    
    // Draw live preview of box being drawn
    if (liveRect) drawBox(ctx, liveRect, undefined, false, true);
  }, [annotations, liveRect, hoveredId, cursor]);

  /**
   * Gets mouse position relative to canvas
   */
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /**
   * Normalizes rectangle coordinates (handles drawing in any direction)
   */
  const norm = (x1, y1, x2, y2) => ({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) });

  const onMouseDown = (e) => {
    const p = pos(e);
    setDrawing(true); setStartPt(p);
    setLiveRect({ x: p.x, y: p.y, w: 0, h: 0 });
  };
  
  const onMouseMove = (e) => {
    const p = pos(e);
    setCursor({ x: p.x, y: p.y, vis: true });
    if (drawing) setLiveRect(norm(startPt.x, startPt.y, p.x, p.y));
  };
  
  const onMouseUp = (e) => {
    if (!drawing) return;
    setDrawing(false);
    const p = pos(e);
    const rect = norm(startPt.x, startPt.y, p.x, p.y);
    setLiveRect(null);
    // Only add box if it's larger than 6x6 pixels
    if (rect.w > 6 && rect.h > 6) onAdd(rect);
  };
  
  const onMouseLeave = () => {
    setCursor(c => ({ ...c, vis: false }));
    if (drawing) { setDrawing(false); setLiveRect(null); }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0, boxShadow: '0 0 0 1px var(--border-md), 0 20px 60px rgba(0,0,0,0.5)', borderRadius: 6 }}>
      <img
        ref={imgRef}
        src={image.src}
        alt={image.name}
        onLoad={() => setImgLoaded(true)}
        style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(100vh - 110px)', userSelect: 'none', pointerEvents: 'none', borderRadius: 6 }}
        draggable={false}
      />
      {imgLoaded && (
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', borderRadius: 6 }}
        />
      )}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────
/**
 * Full-screen empty state shown when no images are loaded
 * Provides drag-drop and click-to-upload functionality
 * @param {Function} onFiles - Callback when files are selected/dropped
 */
function EmptyState({ onFiles }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const handle = (files) => { if (files?.length) onFiles(files); };

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: dragging ? 'rgba(245,166,35,0.02)' : 'transparent', transition: 'background 0.2s', position: 'relative' }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handle(e.target.files)} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, margin: '0 auto 18px', borderRadius: 16, background: 'var(--bg-3)', border: `1.5px dashed ${dragging ? 'var(--amber)' : 'var(--border-hi)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: dragging ? 'var(--amber)' : 'var(--text-2)', transition: 'color 0.2s' }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6, letterSpacing: '-0.02em' }}>Drop images to annotate</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 18 }}>or click anywhere to browse</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {['PNG', 'JPG', 'WEBP', 'GIF'].map(f => (
            <span key={f} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 3, padding: '3px 7px' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────
/**
 * Section header with label and count badge
 * Used for Images and Annotations panels
 * @param {string} children - Section title
 * @param {number} count - Count to display in badge
 */
function SectionLabel({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{children}</span>
      {count > 0 && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--amber-dim)', color: 'var(--amber)', border: '1px solid var(--amber-border)', borderRadius: 3, padding: '1px 6px' }}>{count}</span>}
    </div>
  );
}

/**
 * Reusable icon button with hover states and visual variants
 * @param {Function} onClick - Click handler
 * @param {string} title - Button tooltip
 * @param {string} variant - 'primary', 'danger', or default
 * @param {ReactNode} children - Button content
 */
function IconBtn({ onClick, title, variant, children }) {
  const [hov, setHov] = useState(false);
  const danger = variant === 'danger', primary = variant === 'primary';
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 'var(--radius-sm)',
        border: `1px solid ${hov && danger ? 'rgba(224,92,92,0.4)' : hov && primary ? 'var(--amber-border)' : 'var(--border)'}`,
        background: hov && danger ? 'rgba(224,92,92,0.1)' : hov && primary ? 'var(--amber-dim)' : 'var(--bg-3)',
        color: hov && danger ? 'var(--red)' : hov && primary ? 'var(--amber)' : 'var(--text-1)',
        fontSize: 11, fontWeight: 600, transition: 'all 0.13s', cursor: 'pointer', fontFamily: 'var(--font-display)',
      }}
    >{children}</button>
  );
}

// ── App ──────────────────────────────────────────────────────────────
/**
 * Main App component - orchestrates entire annotation interface
 * Three-column layout: Images sidebar, Canvas center, Annotations panel right
 * Manages state through useAnnotations hook
 */
export default function App() {
  injectStyles();
  const ann = useAnnotations();
  const [hoveredAnnId, setHoveredAnnId] = useState(null);
  const totalBoxes = ann.images.reduce((s, img) => s + img.annotations.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-0)', fontFamily: 'var(--font-display)' }}>

      {/* ════════ HEADER ════════ */}
      {/* Top bar showing app title, image count, and action buttons */}
      <header style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#080a0e"/>
              <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#080a0e" opacity="0.5"/>
              <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#080a0e" opacity="0.5"/>
              <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#080a0e"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>AnnotateAI</span>
          <div style={{ width: 1, height: 14, background: 'var(--border-hi)', margin: '0 2px' }} />
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
            {ann.images.length} image{ann.images.length !== 1 ? 's' : ''} · {totalBoxes} box{totalBoxes !== 1 ? 'es' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {ann.activeImage?.name && (
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginRight: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.activeImage.name}</span>
          )}
          {ann.activeImage?.annotations?.length > 0 && (
            <IconBtn onClick={ann.clearAnnotations} variant="danger">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Clear
            </IconBtn>
          )}
          <IconBtn onClick={ann.exportJSON} variant="primary">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export JSON
          </IconBtn>
        </div>
      </header>

      {/* ════════ BODY ════════ */}
      {/* Three-column layout: Sidebar | Canvas | Panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ─ LEFT SIDEBAR ─ Images management */}
        <aside style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <UploadZone onFiles={ann.addImages} />
          </div>
          <SectionLabel count={ann.images.length}>Images</SectionLabel>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <ImageStrip images={ann.images} activeIdx={ann.activeIdx} onSelect={ann.setActiveIdx} onRemove={ann.removeImage} />
          </div>
        </aside>

        {/* ─ CENTER CANVAS ─ Image and drawing area */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
          {!ann.activeImage ? (
            <EmptyState onFiles={ann.addImages} />
          ) : (
            <div style={{ padding: 28, position: 'relative', zIndex: 1 }}>
              <AnnotationCanvas
                image={ann.activeImage}
                annotations={ann.activeImage.annotations}
                onAdd={ann.addAnnotation}
                hoveredId={hoveredAnnId}
              />
            </div>
          )}
        </main>

        {/* ─ RIGHT PANEL ─ Annotations list and shortcuts */}
        <aside style={{ width: 'var(--panel-w)', minWidth: 'var(--panel-w)', display: 'flex', flexDirection: 'column', background: 'var(--bg-1)', borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>
          <SectionLabel count={ann.activeImage?.annotations?.length || 0}>Annotations</SectionLabel>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <AnnotationList
              annotations={ann.activeImage?.annotations || []}
              onDelete={ann.deleteAnnotation}
              onLabelChange={ann.updateLabel}
              onHover={setHoveredAnnId}
            />
          </div>
          {/* Shortcuts reference */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-0)', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', marginBottom: 8, letterSpacing: '0.06em' }}>SHORTCUTS</div>
            {[['Drag', 'Draw box'], ['Click label', 'Rename'], ['✕ button', 'Delete box']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--bg-3)', color: 'var(--text-2)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--border)' }}>{k}</span>
                <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ════════ STATUS BAR ════════ */}
      {/* Bottom status showing current state and tips */}
      <div style={{ height: 26, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-1)', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
          {ann.activeImage
            ? `${ann.activeImage.annotations.length} annotation${ann.activeImage.annotations.length !== 1 ? 's' : ''} · click and drag on image to draw`
            : 'Upload or drop images to begin annotating'}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--amber)', opacity: 0.5 }}>AnnotateAI v1.0</span>
      </div>
    </div>
  );
}
