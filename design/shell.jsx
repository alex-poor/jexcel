// Shared app chrome: Window frame, sidebar (hierarchy picker), topbar.

const WINDOW_W = 1360;
const WINDOW_H = 900;

// Windows 11-style titlebar
function WindowChrome({ theme, children, title = 'Incident Reporting', accent }) {
  return (
    <div style={{
      width: WINDOW_W, height: WINDOW_H,
      background: theme.bg,
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 24px 60px -20px rgba(20,20,30,.25), 0 0 0 1px rgba(20,20,30,.08)',
      display: 'flex', flexDirection: 'column',
      fontFamily: theme.sansFont,
    }}>
      <div style={{
        height: 36, background: theme.surface,
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px 0 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            background: accent || theme.accent,
            display: 'grid', placeItems: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '-0.02em',
          }}>I</div>
          <div style={{ fontSize: 12, color: theme.ink2, fontWeight: 500 }}>{title}</div>
        </div>
        <div style={{ display: 'flex' }}>
          {['—', '▢', '✕'].map((g, i) => (
            <div key={i} style={{
              width: 46, height: 36, display: 'grid', placeItems: 'center',
              fontSize: 11, color: theme.ink3,
              background: i === 2 ? 'transparent' : 'transparent',
            }}>{g}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{children}</div>
    </div>
  );
}

// Hierarchy picker sidebar
function Sidebar({ theme, density, hierarchy, selected, onSelect, expanded, onToggle }) {
  const pad = density === 'compact' ? 5 : 7;
  return (
    <div style={{
      width: 240, borderRight: `1px solid ${theme.border}`,
      background: theme.surfaceAlt,
      display: 'flex', flexDirection: 'column',
      fontFamily: theme.sansFont, color: theme.ink,
    }}>
      <div style={{ padding: '14px 16px 10px', fontSize: 11, textTransform: 'uppercase', color: theme.ink3, fontWeight: 600, letterSpacing: '0.06em' }}>
        Departments
      </div>
      <div style={{ padding: '0 8px', flex: 1, overflow: 'auto' }}>
        <TreeNode theme={theme} label="All departments" count={hierarchy.reduce((a,b)=>a+b.count,0)}
                  active={selected === 'all'} onClick={() => onSelect('all')} pad={pad} depth={0} />
        {hierarchy.map(l1 => (
          <div key={l1.id}>
            <TreeNode theme={theme} label={l1.label} count={l1.count}
                      active={selected === l1.id}
                      expanded={expanded[l1.id]}
                      hasChildren
                      onClick={() => onSelect(l1.id)}
                      onToggle={() => onToggle(l1.id)}
                      pad={pad} depth={0} />
            {expanded[l1.id] && l1.children.map(l2 => (
              <TreeNode key={l2.id} theme={theme} label={l2.label} count={l2.count}
                        active={selected === l2.id} onClick={() => onSelect(l2.id)}
                        pad={pad} depth={1} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}`, fontSize: 11, color: theme.ink3 }}>
        Last refreshed 09:14
      </div>
    </div>
  );
}

function TreeNode({ theme, label, count, active, expanded, hasChildren, onClick, onToggle, pad, depth }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: `${pad}px 8px ${pad}px ${8 + depth * 14}px`,
      borderRadius: 5,
      background: active ? theme.accentSoft : 'transparent',
      color: active ? theme.accentInk : theme.ink2,
      cursor: 'pointer', userSelect: 'none',
      margin: '1px 0',
      fontWeight: active ? 600 : 400,
      fontSize: 13,
    }} onClick={onClick}>
      {hasChildren ? (
        <div onClick={(e) => { e.stopPropagation(); onToggle(); }}
             style={{ width: 14, height: 14, display: 'grid', placeItems: 'center', color: theme.ink3, fontSize: 9, marginRight: 2 }}>
          {expanded ? '▾' : '▸'}
        </div>
      ) : <div style={{ width: 16 }} />}
      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{
        fontSize: 11,
        fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums',
        color: active ? theme.accentInk : theme.ink3,
        background: active ? theme.surface : 'transparent',
        padding: active ? '1px 6px' : '1px 4px',
        borderRadius: 10,
      }}>{count.toLocaleString()}</div>
    </div>
  );
}

// Topbar: filename, parse meta, year window, export
function TopBar({ theme, density, breadcrumb, rowCount, filename, parsedAt, yearWindow, onOpenSettings, onNewFile }) {
  return (
    <div style={{
      borderBottom: `1px solid ${theme.border}`,
      background: theme.surface,
      padding: density === 'compact' ? '12px 20px' : '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: theme.ink3, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>
          Viewing
        </div>
        <div style={{ fontFamily: theme.numFont, fontSize: density === 'compact' ? 19 : 22, fontWeight: 500, color: theme.ink, letterSpacing: '-0.01em' }}>
          {breadcrumb.map((b, i) => (
            <span key={i}>
              <span style={{ color: i === breadcrumb.length - 1 ? theme.ink : theme.ink3 }}>{b}</span>
              {i < breadcrumb.length - 1 && <span style={{ color: theme.ink3, margin: '0 8px' }}>›</span>}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill theme={theme} label="Year window" value={`${yearWindow[0]} – ${yearWindow[1]}`} />
        <Pill theme={theme} label="Rows" value={rowCount.toLocaleString()} />
        <Pill theme={theme} label="Source" value={filename} mono />
        <div style={{ width: 1, height: 24, background: theme.border, margin: '0 4px' }} />
        <Button theme={theme} onClick={onNewFile}>Load new file</Button>
        <Button theme={theme} onClick={onOpenSettings} ghost>⚙</Button>
      </div>
    </div>
  );
}

function Pill({ theme, label, value, mono }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 10px',
      background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
      borderRadius: 6,
      fontSize: 12, color: theme.ink2,
    }}>
      <span style={{ color: theme.ink3, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontFamily: mono ? theme.monoFont : theme.numFont, fontVariantNumeric: 'tabular-nums', color: theme.ink, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

function Button({ theme, children, onClick, primary, ghost }) {
  const base = {
    padding: ghost ? '6px 10px' : '7px 14px',
    border: `1px solid ${primary ? theme.accent : theme.border}`,
    background: primary ? theme.accent : theme.surface,
    color: primary ? '#fff' : theme.ink,
    borderRadius: 6, cursor: 'pointer',
    fontSize: 13, fontWeight: 500, fontFamily: theme.sansFont,
  };
  if (ghost) { base.background = 'transparent'; base.border = `1px solid transparent`; base.color = theme.ink2; }
  return <button style={base} onClick={onClick}>{children}</button>;
}

// Card wrapper for a dashboard section
function Card({ theme, density, title, subtitle, right, children, noPad }) {
  const pad = density === 'compact' ? 16 : 22;
  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {(title || subtitle || right) && (
        <div style={{
          padding: `${pad}px ${pad}px ${subtitle ? 12 : pad}px`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
        }}>
          <div>
            {title && <div style={{ fontFamily: theme.numFont, fontSize: 16, fontWeight: 600, color: theme.ink, letterSpacing: '-0.005em' }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 12, color: theme.ink3, marginTop: 3 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : `0 ${pad}px ${pad}px` }}>{children}</div>
    </div>
  );
}

// Update-check widget for footer
function UpdateFooter({ theme, state }) {
  const variants = {
    uptodate: { color: theme.ink3, dot: theme.accent, label: "You're on v1.2.0 · up to date" },
    available: { color: theme.accentInk, dot: theme.harm, label: 'Update available — v1.3.0' },
    offline: { color: theme.ink3, dot: theme.ink3, label: 'Offline — last checked yesterday 17:42' },
  };
  const v = variants[state] || variants.uptodate;
  return (
    <div style={{
      padding: '8px 20px', borderTop: `1px solid ${theme.border}`,
      background: theme.surface,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 11, color: theme.ink3, fontFamily: theme.sansFont,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: v.dot }} />
        <span style={{ color: v.color }}>{v.label}</span>
        {state === 'available' && (
          <a style={{ color: theme.accent, textDecoration: 'none', fontWeight: 600, marginLeft: 4 }}>download →</a>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <span>Local data only · no telemetry</span>
        <span style={{ color: theme.ink3 }}>Check for updates</span>
      </div>
    </div>
  );
}

Object.assign(window, { WindowChrome, Sidebar, TopBar, Pill, Button, Card, UpdateFooter, WINDOW_W, WINDOW_H });
