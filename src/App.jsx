import React, { useState, useCallback, useRef, useEffect } from 'react';

// ==============================================================
// GLOBAL CSS
// ==============================================================
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-0: #080a0e; --bg-1: #0d1117; --bg-3: #161c28; --bg-4: #1c2333;
    --border: rgba(255,255,255,0.06); --text-0: #f0f2f5; --text-1: #9ba8bc; --text-2: #5a6580; --text-3: #3a4458;
    --amber: #f5a623; --amber-dim: rgba(245,166,35,0.12); --red: #e05c5c;
    --font-display: 'Syne', sans-serif; --font-mono: 'Space Mono', monospace;
  }
  html, body, #root { height: 100%; width: 100%; overflow: hidden; }
  body { background: var(--bg-0); color: var(--text-0); font-family: var(--font-display); }
`;

function injectStyles() {
  if (document.getElementById('annotateai-styles')) return;
  const el = document.createElement('style');
  el.id = 'annotateai-styles';
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

// ==============================================================
// ANNOTATIONS HOOK
// ==============================================================
function useAnnotations() {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);

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

  const addAnnotation = useCallback((ann) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx
        ? { ...img, annotations: [...img.annotations, { id: Math.random().toString(36).slice(2), ...ann, label: `Object ${img.annotations.length + 1}` }] }
        : img
    ));
  }, [activeIdx]);

  const deleteAnnotation = useCallback((annId) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx ? { ...img, annotations: img.annotations.filter(a => a.id !== annId) } : img
    ));
  }, [activeIdx]);

  const clearAnnotations = useCallback(() => {
    setImages(prev => prev.map((img, i) => i === activeIdx ? { ...img, annotations: [] } : img));
  }, [activeIdx]);

  const updateLabel = useCallback((annId, label) => {
    setImages(prev => prev.map((img, i) =>
      i === activeIdx
        ? { ...img, annotations: img.annotations.map(a => a.id === annId ? { ...a, label } : a) }
        : img
    ));
  }, [activeIdx]);

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

  const exportJSON = useCallback(() => {
    const data = images.map(img => ({
      name: img.name,
      annotations: img.annotations.map(a => ({ id: a.id, label: a.label, x: Math.round(a.x), y: Math.round(a.y), width: Math.round(a.w), height: Math.round(a.h) })),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [images]);

  return { images, activeIdx, activeImage: images[activeIdx] || null, setActiveIdx, addImages, addAnnotation, deleteAnnotation, clearAnnotations, updateLabel, removeImage, exportJSON };
}

// ==============================================================
// UPLOAD ZONE
// ==============================================================
function UploadZone({ onFiles }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
      style={{ border: `1.5px dashed ${dragging ? '#f5a623' : 'rgba(255,255,255,0.16)'}`, borderRadius: '8px', padding: '18px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(245,166,35,0.12)' : 'transparent', transition: 'all 0.18s' }}
    >
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => onFiles(e.target.files)} />
      <div style={{ fontSize: 11, fontWeight: 600, color: dragging ? '#f5a623' : '#9ba8bc', marginBottom: 3 }}>Drop images here</div>
      <div style={{ fontSize: 9, color: '#5a6580', fontFamily: 'var(--font-mono)' }}>PNG · JPG</div>
    </div>
  );
}

// ==============================================================
// IMAGE STRIP
// ==============================================================
function bytesToSize(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function ImageStrip({ images, activeIdx, onSelect, onRemove }) {
  if (images.length === 0) return <div style={{ padding: '20px', textAlign: 'center', fontSize: 9, color: '#3a4458' }}>NO IMAGES</div>;

  return (
    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {images.map((img, i) => (
        <div key={img.id} onClick={() => onSelect(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderRadius: '8px', background: i === activeIdx ? '#1c2333' : 'transparent', border: `1px solid ${i === activeIdx ? 'rgba(245,166,35,0.3)' : 'transparent'}`, cursor: 'pointer' }} onMouseEnter={e => { if (i !== activeIdx) e.currentTarget.style.background = '#161c28'; }} onMouseLeave={e => { if (i !== activeIdx) e.currentTarget.style.background = 'transparent'; }}>
          <div style={{ width: 40, height: 40, borderRadius: 5, overflow: 'hidden', background: '#161c28', border: '1px solid rgba(255,255,255,0.06)' }}>
            <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: i === activeIdx ? '#f0f2f5' : '#9ba8bc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{img.name}</div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {img.annotations.length > 0 && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#f5a623', background: 'rgba(245,166,35,0.12)', padding: '1px 5px', borderRadius: 3 }}>{img.annotations.length} boxes</span>}
              <span style={{ fontSize: 9, color: '#3a4458', fontFamily: 'var(--font-mono)' }}>{bytesToSize(img.size)}</span>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onRemove(i); }} style={{ background: 'none', border: 'none', color: '#3a4458', padding: '2px', cursor: 'pointer', fontSize: 16 }} onMouseEnter={e => e.currentTarget.style.color = '#e05c5c'} onMouseLeave={e => e.currentTarget.style.color = '#3a4458'}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ==============================================================
// ANNOTATION LIST
// ==============================================================
function AnnotationList({ annotations, onDelete, onLabelChange, onHover }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  if (annotations.length === 0) return <div style={{ padding: '20px', textAlign: 'center', fontSize: 9, color: '#3a4458' }}>NO ANNOTATIONS<br/>Click and drag on image</div>;

  return (
    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {annotations.map((ann, i) => (
        <div key={ann.id} onMouseEnter={() => onHover?.(ann.id)} onMouseLeave={() => onHover?.(null)} style={{ padding: '8px 10px', borderRadius: '4px', background: '#161c28', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 3, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f5a623' }}>{i + 1}</span>
            </div>
            {editingId === ann.id ? (
              <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={() => { if (editVal.trim()) onLabelChange(ann.id, editVal.trim()); setEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { onLabelChange(ann.id, editVal.trim()); setEditingId(null); } if (e.key === 'Escape') setEditingId(null); }} style={{ flex: 1, background: '#1c2333', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 3, padding: '2px 6px', fontSize: 11, color: '#f0f2f5', outline: 'none', fontFamily: 'var(--font-display)' }} />
            ) : (
              <span onClick={() => { setEditingId(ann.id); setEditVal(ann.label); }} style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#f0f2f5', cursor: 'text' }}>{ann.label}</span>
            )}
            <button onClick={() => onDelete(ann.id)} style={{ background: 'none', border: 'none', color: '#3a4458', cursor: 'pointer', fontSize: 14 }} onMouseEnter={e => e.currentTarget.style.color = '#e05c5c'} onMouseLeave={e => e.currentTarget.style.color = '#3a4458'}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5a6580' }}>
            <span>X <span style={{ color: '#9ba8bc' }}>{Math.round(ann.x)}</span></span>
            <span>Y <span style={{ color: '#9ba8bc' }}>{Math.round(ann.y)}</span></span>
            <span>W <span style={{ color: '#9ba8bc' }}>{Math.round(ann.w)}</span></span>
            <span>H <span style={{ color: '#9ba8bc' }}>{Math.round(ann.h)}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==============================================================
// ANNOTATION CANVAS
// ==============================================================
function AnnotationCanvas({ image, annotations, onAdd, hoveredId }) {
  const containerRef = useRef();
  const canvasRef = useRef();
  const imgRef = useRef();
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);

  // Initialize and track canvas size
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current && canvasRef.current) {
        const w = imgRef.current.offsetWidth;
        const h = imgRef.current.offsetHeight;
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        setCanvasSize({ w, h });
      }
    };

    const img = imgRef.current;
    if (img?.complete) {
      handleResize();
    }
    img?.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      img?.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [image.id]);

  // Draw annotations
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    // Draw existing annotations
    annotations.forEach((ann, idx) => {
      const isHovered = ann.id === hoveredId;
      ctx.fillStyle = isHovered ? 'rgba(245,166,35,0.2)' : 'rgba(245,166,35,0.08)';
      ctx.fillRect(ann.x, ann.y, ann.w, ann.h);
      ctx.strokeStyle = '#f5a623';
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.strokeRect(ann.x, ann.y, ann.w, ann.h);

      // Label
      ctx.font = '700 11px "Space Mono", monospace';
      ctx.fillStyle = '#f5a623';
      ctx.fillText(String(idx + 1), ann.x + 5, ann.y + 14);
    });

    // Draw live box
    if (currentBox) {
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = '#f5a623';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.setLineDash([]);
    }
  }, [annotations, hoveredId, currentBox, canvasSize]);

  const getMousePos = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setDrawing(true);
    setStartPos(pos);
    setCurrentBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = getMousePos(e);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);
    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = (e) => {
    if (!drawing) return;
    setDrawing(false);
    if (currentBox && currentBox.w > 5 && currentBox.h > 5) {
      onAdd({ x: currentBox.x, y: currentBox.y, w: currentBox.w, h: currentBox.h });
    }
    setCurrentBox(null);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <img ref={imgRef} src={image.src} alt={image.name} style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(100vh - 110px)', borderRadius: 6, userSelect: 'none', pointerEvents: 'none' }} draggable={false} />
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { setDrawing(false); setCurrentBox(null); }} style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair', borderRadius: 6, display: canvasSize.w > 0 ? 'block' : 'none' }} />
    </div>
  );
}

// ==============================================================
// EMPTY STATE
// ==============================================================
function EmptyState({ onFiles }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  return (
    <div onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: dragging ? 'rgba(245,166,35,0.02)' : 'transparent' }}>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => onFiles(e.target.files)} />
      <div style={{ width: 70, height: 70, margin: '0 auto 20px', borderRadius: 16, background: '#161c28', border: `2px dashed ${dragging ? '#f5a623' : 'rgba(255,255,255,0.16)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24 }}>📁</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f5', marginBottom: 6 }}>Drop images to annotate</div>
      <div style={{ fontSize: 12, color: '#5a6580', marginBottom: 16 }}>or click to browse</div>
    </div>
  );
}

// ==============================================================
// SECTION LABEL
// ==============================================================
function SectionLabel({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#0d1117' }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#3a4458', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{children}</span>
      {count > 0 && <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', background: 'rgba(245,166,35,0.12)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 3, padding: '1px 5px' }}>{count}</span>}
    </div>
  );
}

// ==============================================================
// ICON BUTTON
// ==============================================================
function IconBtn({ onClick, title, variant, children }) {
  const [hov, setHov] = useState(false);
  const isDanger = variant === 'danger';
  const isPrimary = variant === 'primary';

  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: '4px', border: `1px solid ${hov && isDanger ? 'rgba(224,92,92,0.4)' : hov && isPrimary ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.06)'}`, background: hov && isDanger ? 'rgba(224,92,92,0.1)' : hov && isPrimary ? 'rgba(245,166,35,0.12)' : '#161c28', color: hov && isDanger ? '#e05c5c' : hov && isPrimary ? '#f5a623' : '#9ba8bc', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>{children}</button>
  );
}

// ==============================================================
// MAIN APP
// ==============================================================
export default function App() {
  injectStyles();
  const ann = useAnnotations();
  const [hoveredId, setHoveredId] = useState(null);
  const totalBoxes = ann.images.reduce((s, img) => s + img.annotations.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080a0e', fontFamily: 'var(--font-display)' }}>
      {/* HEADER */}
      <header style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d1117', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>■</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f2f5' }}>AnnotateAI</span>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#5a6580' }}>{ann.images.length} images · {totalBoxes} boxes</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ann.activeImage?.name && <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#3a4458' }}>{ann.activeImage.name}</span>}
          {ann.activeImage?.annotations?.length > 0 && <IconBtn onClick={ann.clearAnnotations} variant="danger">Clear</IconBtn>}
          <IconBtn onClick={ann.exportJSON} variant="primary">Export JSON</IconBtn>
        </div>
      </header>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <UploadZone onFiles={ann.addImages} />
          </div>
          <SectionLabel count={ann.images.length}>Images</SectionLabel>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <ImageStrip images={ann.images} activeIdx={ann.activeIdx} onSelect={ann.setActiveIdx} onRemove={ann.removeImage} />
          </div>
        </div>

        {/* CENTER */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080a0e' }}>
          {!ann.activeImage ? (
            <EmptyState onFiles={ann.addImages} />
          ) : (
            <div style={{ padding: 20 }}>
              <AnnotationCanvas image={ann.activeImage} annotations={ann.activeImage.annotations} onAdd={ann.addAnnotation} hoveredId={hoveredId} />
            </div>
          )}
        </main>

        {/* RIGHT */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', background: '#0d1117', borderLeft: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <SectionLabel count={ann.activeImage?.annotations?.length || 0}>Annotations</SectionLabel>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <AnnotationList annotations={ann.activeImage?.annotations || []} onDelete={ann.deleteAnnotation} onLabelChange={ann.updateLabel} onHover={setHoveredId} />
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#080a0e' }}>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#3a4458', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shortcuts</div>
            {[['Drag', 'Draw box'], ['Click label', 'Rename'], ['✕ button', 'Delete']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 9 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#5a6580', background: '#161c28', padding: '2px 5px', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>{k}</span>
                <span style={{ color: '#3a4458', fontFamily: 'var(--font-mono)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div style={{ height: 26, display: 'flex', alignItems: 'center', padding: '0 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0d1117', fontSize: 9, fontFamily: 'var(--font-mono)', color: '#3a4458' }}>
        {ann.activeImage ? `${ann.activeImage.annotations.length} annotations · drag to draw` : 'Drop images to start'}
        <div style={{ flex: 1 }} />
        <span style={{ color: '#f5a623', opacity: 0.5 }}>v1.0</span>
      </div>
    </div>
  );
}
