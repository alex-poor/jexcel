// Expandable chart card — wraps a chart with expand + export-PNG affordances.
// Clicking expand opens a fullscreen modal; Export PNG serializes the captured
// SVG (or renders the DOM via html-to-image when SVG isn't the right target).

function ExpandableChart({ theme, density, title, subtitle, right, children, exportName = 'chart' }) {
  const [expanded, setExpanded] = React.useState(false);
  const chartRef = React.useRef(null);

  // Toolbar in the card header
  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {right}
      <IconBtn theme={theme} onClick={() => exportPng(chartRef.current, exportName, theme)} title="Export PNG">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v7m0 0l-3-3m3 3l3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconBtn>
      <IconBtn theme={theme} onClick={() => setExpanded(true)} title="Expand">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5V2h3M12 5V2H9M2 9v3h3M12 9v3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconBtn>
    </div>
  );

  return (
    <React.Fragment>
      <Card theme={theme} density={density} title={title} subtitle={subtitle} right={toolbar}>
        <div ref={chartRef}>{children}</div>
      </Card>
      {expanded && (
        <ExpandedModal theme={theme} title={title} subtitle={subtitle} onClose={() => setExpanded(false)} exportName={exportName}>
          {children}
        </ExpandedModal>
      )}
    </React.Fragment>
  );
}

function IconBtn({ theme, children, onClick, title }) {
  return (
    <button onClick={onClick} title={title}
            style={{
              width: 28, height: 28, padding: 0,
              background: 'transparent',
              border: `1px solid transparent`,
              borderRadius: 5, cursor: 'pointer',
              color: theme.ink3,
              display: 'grid', placeItems: 'center',
              transition: 'background .12s, color .12s, border-color .12s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.surfaceAlt; e.currentTarget.style.color = theme.ink; e.currentTarget.style.borderColor = theme.border; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.ink3; e.currentTarget.style.borderColor = 'transparent'; }}>
      {children}
    </button>
  );
}

function ExpandedModal({ theme, title, subtitle, onClose, children, exportName }) {
  const chartRef = React.useRef(null);
  // Lock background scroll
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(20,20,24,0.6)',
      display: 'grid', placeItems: 'center',
      padding: 32, fontFamily: theme.sansFont,
    }} onClick={onClose}>
      <div style={{
        background: theme.surface, borderRadius: 12,
        width: 'min(1200px, 96vw)', height: 'min(820px, 92vh)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,.5)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontFamily: theme.numFont, fontSize: 20, fontWeight: 600, color: theme.ink, letterSpacing: '-0.01em' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: theme.ink3, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportPng(chartRef.current, exportName, theme)}
                    style={{
                      padding: '7px 14px', fontSize: 13, fontWeight: 500,
                      background: theme.accent, color: '#fff',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontFamily: theme.sansFont,
                      display: 'flex', alignItems: 'center', gap: 7,
                    }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v7m0 0l-3-3m3 3l3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export PNG
            </button>
            <button onClick={onClose}
                    style={{
                      padding: '7px 14px', fontSize: 13, fontWeight: 500,
                      background: theme.surface, color: theme.ink2,
                      border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer',
                      fontFamily: theme.sansFont,
                    }}>Close · Esc</button>
          </div>
        </div>
        <div ref={chartRef} style={{ flex: 1, overflow: 'auto', padding: 32, background: theme.bg }}>
          <div style={{ background: theme.surface, borderRadius: 10, padding: 28, maxWidth: 1100, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export: prefer the first SVG in the container (vector), else snapshot the DOM
// via canvas at 2x scale for crisp raster output.
function exportPng(container, name, theme) {
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    svgToPng(svg, name, theme.surface);
  } else {
    // Multi-chart container (e.g. small multiples): stitch all SVGs vertically
    const svgs = container.querySelectorAll('svg');
    if (svgs.length) svgsToPng(svgs, name, theme.surface);
  }
}

function svgToPng(svg, name, bg) {
  const clone = svg.cloneNode(true);
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const w = vb && vb.width ? vb.width : rect.width;
  const h = vb && vb.height ? vb.height : rect.height;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', w);
  clone.setAttribute('height', h);
  // Inline computed styles on text elements so fonts survive rasterization
  inlineTextStyles(svg, clone);
  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg || '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob((blob) => downloadBlob(blob, name + '.png'), 'image/png');
  };
  img.src = svg64;
}

function svgsToPng(svgList, name, bg) {
  // Render each, then stack.
  const items = Array.from(svgList).map((svg) => {
    const clone = svg.cloneNode(true);
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const w = vb && vb.width ? vb.width : rect.width;
    const h = vb && vb.height ? vb.height : rect.height;
    inlineTextStyles(svg, clone);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', w);
    clone.setAttribute('height', h);
    return { xml: new XMLSerializer().serializeToString(clone), w, h };
  });
  const maxW = Math.max(...items.map(i => i.w));
  const totalH = items.reduce((a, i) => a + i.h, 0) + (items.length - 1) * 20;
  Promise.all(items.map((it) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ img, w: it.w, h: it.h });
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(it.xml);
  }))).then((loaded) => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = maxW * scale; canvas.height = totalH * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg || '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    let y = 0;
    for (const { img, w, h } of loaded) {
      ctx.drawImage(img, (maxW - w) / 2, y, w, h);
      y += h + 20;
    }
    canvas.toBlob((blob) => downloadBlob(blob, name + '.png'), 'image/png');
  });
}

function inlineTextStyles(src, dst) {
  const srcTexts = src.querySelectorAll('text');
  const dstTexts = dst.querySelectorAll('text');
  srcTexts.forEach((t, i) => {
    const cs = window.getComputedStyle(t);
    const d = dstTexts[i];
    if (!d) return;
    d.setAttribute('font-family', cs.fontFamily);
    d.setAttribute('font-size', cs.fontSize);
    d.setAttribute('font-weight', cs.fontWeight);
    d.setAttribute('fill', cs.fill);
  });
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

Object.assign(window, { ExpandableChart, ExpandedModal, exportPng });
