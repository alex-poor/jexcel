// Chart primitives — hand-built SVG so we can style them crisply per theme.
// All charts accept a `theme` object (see tokens.js) and a `density` key.

// ─── shared tooltip hook ───────────────────────────────────────────
function useTooltip() {
  const [tt, setTT] = React.useState(null);
  const wrap = (props) => ({
    ...props,
    onMouseEnter: (e) => setTT({ x: e.clientX, y: e.clientY, content: props['data-tt'] }),
    onMouseMove: (e) => setTT((t) => t ? { ...t, x: e.clientX, y: e.clientY } : t),
    onMouseLeave: () => setTT(null),
  });
  return { tt, wrap };
}

function Tooltip({ tt, theme }) {
  if (!tt) return null;
  return (
    <div style={{
      position: 'fixed', left: tt.x + 14, top: tt.y + 14, zIndex: 1000,
      background: theme.ink, color: theme.bg,
      padding: '8px 10px', borderRadius: 6, fontSize: 12, lineHeight: 1.35,
      fontFamily: theme.sansFont, pointerEvents: 'none',
      boxShadow: '0 6px 20px rgba(0,0,0,.18)', maxWidth: 220,
      whiteSpace: 'pre-line',
    }}>{tt.content}</div>
  );
}

// ─── Volume over time (hero bar) ──────────────────────────────────
function VolumeChart({ data, years, theme, height = 180 }) {
  const { tt, wrap } = useTooltip();
  const W = 620, H = height, pad = { t: 24, r: 16, b: 32, l: 44 };
  const max = Math.max(...years.map(y => data[y] || 0));
  const bw = (W - pad.l - pad.r) / years.length;
  const yTicks = [0, max * 0.5, max].map(v => Math.round(v / 50) * 50);
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
        {/* y grid */}
        {yTicks.map((v, i) => {
          const y = pad.t + (H - pad.t - pad.b) * (1 - v / max);
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={theme.border} strokeDasharray={i === 0 ? '' : '2 3'} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill={theme.ink3} fontFamily={theme.sansFont}>{v}</text>
            </g>
          );
        })}
        {years.map((yr, i) => {
          const v = data[yr] || 0;
          const bh = (H - pad.t - pad.b) * (v / max);
          const x = pad.l + i * bw + 10;
          const y = H - pad.b - bh;
          const w = bw - 20;
          const prev = i > 0 ? (data[years[i-1]] || 0) : null;
          const d = prev ? ((v - prev) / prev) : null;
          const partial = yr === 2026;
          return (
            <g key={yr} {...wrap({ 'data-tt': `${yr}${partial ? ' (YTD)':''}\n${v.toLocaleString()} incidents${d!=null ? '\n'+(d>0?'+':'')+(d*100).toFixed(1)+'% vs prior':''}` })}>
              <rect x={x} y={y} width={w} height={bh}
                    fill={partial ? theme.accentSoft : theme.accent}
                    stroke={partial ? theme.accent : 'none'}
                    strokeDasharray={partial ? '3 3' : ''}
                    rx="2" />
              {/* value label above */}
              <text x={x + w/2} y={y - 6} textAnchor="middle" fontSize="12" fill={theme.ink} fontFamily={theme.numFont} fontWeight="600">{v.toLocaleString()}</text>
              {/* year label */}
              <text x={x + w/2} y={H - 12} textAnchor="middle" fontSize="12" fill={theme.ink3} fontFamily={theme.sansFont}>{yr}{partial ? ' · YTD' : ''}</text>
              {d != null && !partial && (
                <text x={x + w/2} y={y - 22} textAnchor="middle" fontSize="10" fill={d > 0 ? theme.harm : theme.accentInk} fontFamily={theme.sansFont} fontWeight="600">
                  {d > 0 ? '▲' : '▼'} {Math.abs(d*100).toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

// ─── Type split — stacked 100% bars ───────────────────────────────
function TypeSplitChart({ data, years, theme, height = 140 }) {
  const { tt, wrap } = useTooltip();
  const W = 620, H = height, pad = { t: 18, r: 16, b: 28, l: 44 };
  const bw = (W - pad.l - pad.r) / years.length;
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = pad.t + (H - pad.t - pad.b) * t;
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={theme.border} strokeDasharray={i === 0 || i === 4 ? '' : '2 3'} />
              {(i === 0 || i === 4 || i === 2) && (
                <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill={theme.ink3} fontFamily={theme.sansFont}>{(1-t)*100}%</text>
              )}
            </g>
          );
        })}
        {years.map((yr, i) => {
          const d = data[yr]; if (!d) return null;
          const x = pad.l + i * bw + 14;
          const w = bw - 28;
          const topH = (H - pad.t - pad.b) * d.ohs;
          const botH = (H - pad.t - pad.b) * d.haz;
          return (
            <g key={yr}>
              <rect x={x} y={pad.t} width={w} height={topH} fill={theme.cat[0]} rx="1"
                    {...wrap({ 'data-tt': `${yr} · Occ Health/Safety\n${(d.ohs*100).toFixed(1)}%` })} />
              <rect x={x} y={pad.t + topH} width={w} height={botH} fill={theme.cat[1]} rx="1"
                    {...wrap({ 'data-tt': `${yr} · Hazards\n${(d.haz*100).toFixed(1)}%` })} />
              <text x={x + w/2} y={pad.t + topH/2 + 4} textAnchor="middle" fontSize="11" fill="#fff" fontFamily={theme.sansFont} fontWeight="600">
                {topH > 20 ? (d.ohs*100).toFixed(0) + '%' : ''}
              </text>
              <text x={x + w/2} y={pad.t + topH + botH/2 + 4} textAnchor="middle" fontSize="11" fill="#fff" fontFamily={theme.sansFont} fontWeight="600">
                {botH > 20 ? (d.haz*100).toFixed(0) + '%' : ''}
              </text>
              <text x={x + w/2} y={H - 10} textAnchor="middle" fontSize="12" fill={theme.ink3} fontFamily={theme.sansFont}>{yr}</text>
            </g>
          );
        })}
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

// ─── Sub-category — category-row table with inline bars ─────────
function SubcatTable({ data, years, theme, density }) {
  const { tt, wrap } = useTooltip();
  // Aggregate unique categories across years, sorted by total desc
  const cats = React.useMemo(() => {
    const totals = {};
    years.forEach(y => Object.entries(data[y] || {}).forEach(([k, v]) => totals[k] = (totals[k]||0)+v));
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  }, [data, years]);
  // Per-year totals for pct normalization
  const yearTotals = React.useMemo(() => Object.fromEntries(years.map(y =>
    [y, Object.values(data[y] || {}).reduce((a, b) => a + b, 0)])), [data, years]);
  const maxPct = React.useMemo(() => {
    let m = 0;
    cats.forEach(c => years.forEach(y => {
      const v = (data[y]?.[c] || 0) / (yearTotals[y] || 1);
      if (v > m) m = v;
    }));
    return m;
  }, [cats, years, data, yearTotals]);
  const rowH = density === 'compact' ? 28 : 34;

  return (
    <div style={{ position: 'relative', fontFamily: theme.sansFont, fontSize: 13, color: theme.ink }}>
      <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(${years.length}, 1fr)`, gap: 0 }}>
        <div style={{ padding: '6px 10px 6px 0', fontSize: 11, fontWeight: 600, color: theme.ink3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
        {years.map(y => (
          <div key={y} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, color: theme.ink3, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{y}</div>
        ))}
      </div>
      {cats.map((cat, ci) => (
        <div key={cat} style={{
          display: 'grid', gridTemplateColumns: `180px repeat(${years.length}, 1fr)`,
          alignItems: 'center',
          borderTop: ci === 0 ? `1px solid ${theme.border}` : `1px solid ${theme.border}`,
          height: rowH,
        }}>
          <div style={{ padding: '0 10px 0 0', fontSize: 13, color: theme.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat}</div>
          {years.map((y, yi) => {
            const v = data[y]?.[cat] || 0;
            const pct = v / (yearTotals[y] || 1);
            const w = maxPct > 0 ? (pct / maxPct) * 100 : 0;
            return (
              <div key={y} style={{ padding: '0 8px', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                   {...wrap({ 'data-tt': `${y} · ${cat}\n${v.toLocaleString()} incidents (${(pct*100).toFixed(1)}%)` })}>
                <div style={{ position: 'relative', width: '100%', height: 10, background: theme.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${w}%`, height: '100%', background: theme.cat[ci % theme.cat.length], borderRadius: 2, transition: 'width .3s' }}/>
                </div>
                <div style={{ position: 'absolute', right: 10, fontSize: 11, color: theme.ink3, fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none', background: `linear-gradient(90deg, transparent, ${theme.surface} 30%)`, paddingLeft: 12 }}>
                  {(pct*100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

// ─── Timeframe Analysis — Variant A: horizontal timeline ──────────
// Two segments per year (lag + closure) on a shared day-axis.
// Shorter bar = better year.
function TimeframeTimeline({ data, years, theme, height = 260, animated = false }) {
  const { tt, wrap } = useTooltip();
  const W = 620, rowH = Math.min(38, (height - 60) / years.length);
  const pad = { t: 18, r: 80, b: 34, l: 56 };
  const totals = years.map(y => (data[y]?.lag || 0) + (data[y]?.closure || 0));
  const max = Math.max(...totals, 10);
  // Round up to a nice tick
  const niceMax = Math.ceil(max / 20) * 20;
  const xScale = (d) => pad.l + (W - pad.l - pad.r) * (d / niceMax);
  const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];
  const H = pad.t + rowH * years.length + pad.b;

  const [reveal, setReveal] = React.useState(animated ? 0 : 1);
  React.useEffect(() => {
    if (!animated) return;
    let raf; const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 900);
      // easeOutCubic
      const e = 1 - Math.pow(1 - p, 3);
      setReveal(e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* tick grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={xScale(t)} x2={xScale(t)} y1={pad.t - 4} y2={H - pad.b + 4}
                  stroke={i === 0 ? theme.borderStrong : theme.border}
                  strokeDasharray={i === 0 ? '' : '2 3'} />
            <text x={xScale(t)} y={H - pad.b + 18} textAnchor="middle" fontSize="11" fill={theme.ink3} fontFamily={theme.sansFont}>
              {t === 0 ? '0' : `${t}d`}
            </text>
          </g>
        ))}
        <text x={pad.l} y={H - pad.b + 18} textAnchor="start" fontSize="11" fill={theme.ink3} fontFamily={theme.sansFont} opacity="0" />

        {years.map((yr, i) => {
          const row = data[yr];
          const y = pad.t + i * rowH + rowH / 2;
          const lagEnd = row ? xScale(row.lag * reveal) : pad.l;
          const closureEnd = row ? xScale((row.lag + row.closure) * reveal) : pad.l;
          const barH = Math.min(18, rowH - 8);
          const partial = yr === 2026;
          return (
            <g key={yr}>
              <text x={pad.l - 10} y={y + 4} textAnchor="end" fontSize="12" fill={theme.ink2} fontFamily={theme.sansFont} fontWeight="600">
                {yr}{partial ? ' · YTD' : ''}
              </text>
              {!row && (
                <text x={pad.l + 8} y={y + 4} fontSize="11" fill={theme.ink3} fontStyle="italic" fontFamily={theme.sansFont}>no data</text>
              )}
              {row && (
                <g>
                  <rect x={pad.l} y={y - barH/2} width={lagEnd - pad.l} height={barH} fill={theme.lag} rx="2"
                        {...wrap({ 'data-tt': `${yr} · Reporting lag\n${row.lag.toFixed(2)} days (Occurred → Reported)` })} />
                  <rect x={lagEnd} y={y - barH/2} width={Math.max(0, closureEnd - lagEnd)} height={barH} fill={theme.closure} rx="2"
                        {...wrap({ 'data-tt': `${yr} · Closure duration\n${row.closure.toFixed(2)} days (Reported → Closed)` })} />
                  {/* inline numerals */}
                  {lagEnd - pad.l > 34 && (
                    <text x={pad.l + 6} y={y + 4} fontSize="11" fill="#fff" fontFamily={theme.numFont} style={{fontVariantNumeric:"tabular-nums"}} fontWeight="600">
                      {row.lag.toFixed(2)}d
                    </text>
                  )}
                  {closureEnd - lagEnd > 40 && (
                    <text x={lagEnd + 6} y={y + 4} fontSize="11" fill="#fff" fontFamily={theme.numFont} style={{fontVariantNumeric:"tabular-nums"}} fontWeight="600">
                      {row.closure.toFixed(2)}d
                    </text>
                  )}
                  {/* trailing total */}
                  <text x={closureEnd + 8} y={y + 4} fontSize="11" fill={theme.ink2} fontFamily={theme.numFont} style={{fontVariantNumeric:"tabular-nums"}}>
                    {(row.lag + row.closure).toFixed(1)}d total
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

// ─── Timeframe Analysis — Variant B: slope / trajectory ───────────
function TimeframeSlope({ data, years, theme, height = 260, animated = false }) {
  const { tt, wrap } = useTooltip();
  const W = 620, H = height, pad = { t: 28, r: 80, b: 42, l: 44 };
  const lagMax = Math.max(...years.map(y => data[y]?.lag || 0), 10);
  const closureMax = Math.max(...years.map(y => data[y]?.closure || 0), 20);
  // Use a log-ish shared axis? Brief wants both readable. Use two y-axes.
  const xs = (i) => pad.l + (W - pad.l - pad.r) * (i / Math.max(1, years.length - 1));
  const yLag = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / (Math.ceil(lagMax/5)*5));
  const yCl  = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / (Math.ceil(closureMax/20)*20));

  const lagPts = years.map((y, i) => data[y] ? [xs(i), yLag(data[y].lag)] : null).filter(Boolean);
  const clPts  = years.map((y, i) => data[y] ? [xs(i), yCl(data[y].closure)] : null).filter(Boolean);

  const [reveal, setReveal] = React.useState(animated ? 0 : 1);
  React.useEffect(() => {
    if (!animated) return;
    let raf; const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 900);
      setReveal(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  const path = (pts) => pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* year grid */}
        {years.map((yr, i) => (
          <g key={yr}>
            <line x1={xs(i)} x2={xs(i)} y1={pad.t} y2={H - pad.b} stroke={theme.border} strokeDasharray="2 3" />
            <text x={xs(i)} y={H - pad.b + 18} textAnchor="middle" fontSize="12" fill={theme.ink3} fontFamily={theme.sansFont}>
              {yr}{yr === 2026 ? ' · YTD' : ''}
            </text>
          </g>
        ))}
        {/* closure line */}
        <g style={{ opacity: reveal }}>
          <path d={path(clPts)} stroke={theme.closure} strokeWidth="2.5" fill="none" />
          {clPts.map((p, i) => {
            const yr = years.filter(y => data[y])[i];
            const row = data[yr];
            return (
              <g key={i} {...wrap({ 'data-tt': `${yr} · Closure duration\n${row.closure.toFixed(2)} days` })}>
                <circle cx={p[0]} cy={p[1]} r="5" fill={theme.surface} stroke={theme.closure} strokeWidth="2.5" />
                <text x={p[0]} y={p[1] - 10} textAnchor="middle" fontSize="11" fill={theme.closure} fontFamily={theme.numFont} style={{fontVariantNumeric:"tabular-nums"}} fontWeight="700">
                  {row.closure.toFixed(1)}
                </text>
              </g>
            );
          })}
          <text x={xs(years.length - 1) + 10} y={clPts[clPts.length-1][1] + 4} fontSize="11" fill={theme.closure} fontFamily={theme.sansFont} fontWeight="600">Closure (d)</text>
        </g>
        {/* lag line */}
        <g style={{ opacity: reveal }}>
          <path d={path(lagPts)} stroke={theme.lag} strokeWidth="2.5" fill="none" />
          {lagPts.map((p, i) => {
            const yr = years.filter(y => data[y])[i];
            const row = data[yr];
            return (
              <g key={i} {...wrap({ 'data-tt': `${yr} · Reporting lag\n${row.lag.toFixed(2)} days` })}>
                <circle cx={p[0]} cy={p[1]} r="5" fill={theme.surface} stroke={theme.lag} strokeWidth="2.5" />
                <text x={p[0]} y={p[1] + 18} textAnchor="middle" fontSize="11" fill={theme.lag} fontFamily={theme.numFont} style={{fontVariantNumeric:"tabular-nums"}} fontWeight="700">
                  {row.lag.toFixed(1)}
                </text>
              </g>
            );
          })}
          <text x={xs(years.length - 1) + 10} y={lagPts[lagPts.length-1][1] + 4} fontSize="11" fill={theme.lag} fontFamily={theme.sansFont} fontWeight="600">Lag (d)</text>
        </g>
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

// ─── Timeframe Analysis — Variant C: small multiples ─────────────
function TimeframeMultiples({ data, years, theme }) {
  const metrics = [
    { key: 'lag', label: 'Reporting lag', sub: 'Occurred → Reported', color: theme.lag },
    { key: 'closure', label: 'Closure duration', sub: 'Reported → Closed', color: theme.closure },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {metrics.map(m => {
        const values = years.map(y => data[y]?.[m.key] ?? null);
        const max = Math.max(...values.filter(v => v != null), 1);
        const W = 300, H = 120, pad = { t: 10, r: 10, b: 26, l: 28 };
        const xs = (i) => pad.l + (W - pad.l - pad.r) * (i / Math.max(1, years.length - 1));
        const ys = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
        const pts = values.map((v, i) => v != null ? [xs(i), ys(v)] : null);
        const pathD = pts.reduce((acc, p, i) => {
          if (!p) return acc;
          if (!acc) return 'M' + p[0] + ',' + p[1];
          const prev = pts[i-1];
          return acc + (prev ? ' L' : ' M') + p[0] + ',' + p[1];
        }, '');
        const last = values[values.length - 1];
        const prev = values[values.length - 2];
        const d = prev ? (last - prev) / prev : null;
        return (
          <div key={m.key} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 16, fontFamily: theme.sansFont }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 12, color: theme.ink3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: theme.ink3, marginTop: 2 }}>{m.sub}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: theme.numFont, fontSize: 28, fontWeight: 500, color: theme.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {last != null ? last.toFixed(2) : '—'}<span style={{ fontSize: 13, color: theme.ink3, fontWeight: 400 }}>d</span>
                </div>
                {d != null && (
                  <div style={{ fontSize: 11, color: d < 0 ? theme.accentInk : theme.harm, marginTop: 2, fontWeight: 600 }}>
                    {d < 0 ? '▼' : '▲'} {Math.abs(d*100).toFixed(0)}% vs {years[years.length-2]}
                  </div>
                )}
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120, display: 'block', marginTop: 10 }}>
              <path d={pathD} stroke={m.color} strokeWidth="2" fill="none" />
              {pts.map((p, i) => p && (
                <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5}
                        fill={i === pts.length - 1 ? m.color : theme.surface}
                        stroke={m.color} strokeWidth="1.5" />
              ))}
              {years.map((y, i) => (
                <text key={y} x={xs(i)} y={H - 8} textAnchor="middle" fontSize="10" fill={theme.ink3} fontFamily={theme.sansFont}>{y}</text>
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ─── Harm & Near-miss twin rate chart ────────────────────────────
function RateTwinChart({ harm, nearMiss, years, theme, height = 180 }) {
  const { tt, wrap } = useTooltip();
  const W = 620, H = height, pad = { t: 24, r: 60, b: 32, l: 44 };
  const vals = years.flatMap(y => [harm[y] || 0, nearMiss[y] || 0]);
  const max = Math.ceil(Math.max(...vals) * 100 / 5) * 5 / 100;
  const xs = (i) => pad.l + (W - pad.l - pad.r) * (i / Math.max(1, years.length - 1));
  const ys = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const pathFor = (series) => years.map((y, i) => (i === 0 ? 'M' : 'L') + xs(i) + ',' + ys(series[y] || 0)).join(' ');
  const areaFor = (series) => pathFor(series) + ` L${xs(years.length-1)},${H - pad.b} L${xs(0)},${H - pad.b} Z`;

  const yTicks = [0, max / 2, max];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
        {yTicks.map((t, i) => {
          const y = ys(t);
          return (
            <g key={i}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={theme.border} strokeDasharray={i === 0 ? '' : '2 3'} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill={theme.ink3} fontFamily={theme.sansFont}>
                {(t * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {years.map((y, i) => (
          <text key={y} x={xs(i)} y={H - 10} textAnchor="middle" fontSize="12" fill={theme.ink3} fontFamily={theme.sansFont}>{y}</text>
        ))}
        {/* near-miss area */}
        <path d={areaFor(nearMiss)} fill={theme.nearMissSoft} opacity="0.6" />
        <path d={pathFor(nearMiss)} stroke={theme.nearMiss} strokeWidth="2.5" fill="none" strokeDasharray="5 3" />
        {/* harm area */}
        <path d={areaFor(harm)} fill={theme.harmSoft} opacity="0.6" />
        <path d={pathFor(harm)} stroke={theme.harm} strokeWidth="2.5" fill="none" />
        {/* points */}
        {years.map((y, i) => (
          <g key={y}>
            <circle cx={xs(i)} cy={ys(harm[y])} r="4" fill={theme.surface} stroke={theme.harm} strokeWidth="2"
                    {...wrap({ 'data-tt': `${y} · Harm rate\n${(harm[y]*100).toFixed(1)}%` })} />
            <circle cx={xs(i)} cy={ys(nearMiss[y])} r="4" fill={theme.surface} stroke={theme.nearMiss} strokeWidth="2"
                    {...wrap({ 'data-tt': `${y} · Near-miss rate\n${(nearMiss[y]*100).toFixed(1)}%` })} />
          </g>
        ))}
        {/* end-of-line labels */}
        <text x={xs(years.length - 1) + 8} y={ys(harm[years[years.length-1]])+4} fontSize="11" fill={theme.harm} fontFamily={theme.sansFont} fontWeight="600">Harm</text>
        <text x={xs(years.length - 1) + 8} y={ys(nearMiss[years[years.length-1]])+4} fontSize="11" fill={theme.nearMiss} fontFamily={theme.sansFont} fontWeight="600">Near-miss</text>
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}

Object.assign(window, {
  VolumeChart, TypeSplitChart, SubcatTable,
  TimeframeTimeline, TimeframeSlope, TimeframeMultiples,
  RateTwinChart, Tooltip, useTooltip,
});
