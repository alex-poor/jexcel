// Main dashboard screen — assembles all charts into a single scrollable page.

function Dashboard({ theme, density, sliceId = 'all', heroVariant = 'both', animated = false }) {
  const years = [2022, 2023, 2024, 2025, 2026];

  // Resolve current slice data
  const sliceData = React.useMemo(() => {
    if (sliceId === 'all' || sliceId === 'root') return SAMPLE.org;
    if (SAMPLE.slice[sliceId]) return SAMPLE.slice[sliceId];
    // Synthesize from org by scaling — for level-1 nodes we don't have explicit data
    const node = findNode(SAMPLE.hierarchy, sliceId);
    const scale = node ? node.count / SAMPLE.hierarchy.reduce((a,b)=>a+b.count,0) : 1;
    return scaleOrg(SAMPLE.org, scale, sliceId);
  }, [sliceId]);

  // Resolve breadcrumb
  const breadcrumb = React.useMemo(() => {
    if (sliceId === 'all') return ['All departments'];
    const path = findPath(SAMPLE.hierarchy, sliceId);
    return path.length ? path.map(n => n.label) : ['All departments'];
  }, [sliceId]);

  const rowCount = Object.values(sliceData.count).reduce((a,b)=>a+b,0);

  const gap = density === 'compact' ? 14 : 18;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar
        theme={theme} density={density}
        breadcrumb={breadcrumb}
        rowCount={rowCount}
        filename={SAMPLE.file}
        parsedAt={SAMPLE.parsedAt}
        yearWindow={[2022, 2026]}
      />

      <div style={{ flex: 1, overflow: 'auto', background: theme.bg }}>
        <div style={{ padding: density === 'compact' ? 18 : 24, display: 'flex', flexDirection: 'column', gap }}>

          {/* KPI strip */}
          <KpiStrip theme={theme} density={density} sliceData={sliceData} years={years} />

          {/* Volume over time */}
          <ExpandableChart theme={theme} density={density}
                title="Volume over time"
                subtitle="Incidents reported per calendar year. 2026 is year-to-date."
                right={<Legend theme={theme} items={[{c: theme.accent, l: 'Reported'}, {c: theme.accentSoft, l: 'YTD · partial', pattern: true}]} />}
                exportName="volume-over-time">
            <VolumeChart data={sliceData.count} years={years} theme={theme} />
          </ExpandableChart>

          {/* Type split + Rates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap }}>
            <ExpandableChart theme={theme} density={density}
                  title="Type split"
                  subtitle="Occ Health/Safety vs Hazards, % of incidents logged each year."
                  right={<Legend theme={theme} items={[{c: theme.cat[0], l: 'Occ Health/Safety'}, {c: theme.cat[1], l: 'Hazards'}]} />}
                  exportName="type-split">
              <TypeSplitChart data={sliceData.typeSplit} years={years} theme={theme} />
            </ExpandableChart>
            <ExpandableChart theme={theme} density={density}
                  title="Harm & near-miss rates"
                  subtitle="Read together — a rising near-miss rate alongside falling harm is a healthy reporting culture."
                  exportName="harm-nearmiss-rates">
              <RateTwinChart harm={sliceData.harmRate} nearMiss={sliceData.nearMissRate} years={years} theme={theme} height={180} />
            </ExpandableChart>
          </div>

          {/* Hero: Timeframe Analysis — timeline + slope stacked */}
          <ExpandableChart theme={theme} density={density}
                title="Timeframe analysis"
                subtitle="How quickly incidents are reported and closed. Shorter = better."
                right={<Legend theme={theme} items={[{c: theme.lag, l: 'Reporting lag'}, {c: theme.closure, l: 'Closure duration'}]} />}
                exportName="timeframe-analysis">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: theme.ink3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6, fontFamily: theme.sansFont }}>Per-year timeline · lag + closure</div>
                <TimeframeTimeline data={sliceData.timeframe} years={years} theme={theme} animated={animated} />
              </div>
              <div style={{ height: 1, background: theme.border, margin: '4px 0' }} />
              <div>
                <div style={{ fontSize: 11, color: theme.ink3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6, fontFamily: theme.sansFont }}>Trajectory over years</div>
                <TimeframeSlope data={sliceData.timeframe} years={years} theme={theme} animated={animated} />
              </div>
            </div>
            {/* Interpretation band */}
            <div style={{
              marginTop: 18, padding: '12px 14px',
              background: theme.accentSoft, border: `1px solid ${theme.accent}22`,
              borderRadius: 6,
              display: 'flex', gap: 12, alignItems: 'flex-start',
              fontFamily: theme.sansFont,
            }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: theme.accent, borderRadius: 2 }} />
              <div style={{ fontSize: 13, color: theme.accentInk, lineHeight: 1.45 }}>
                Closure duration has <strong>fallen 80% since 2022</strong> ({Math.round(sliceData.timeframe[2022].closure)} → {Math.round(sliceData.timeframe[2025].closure)} days). 2026 YTD figures reflect incomplete closure on open cases.
              </div>
            </div>
          </ExpandableChart>

          {/* Sub-category table */}
          <ExpandableChart theme={theme} density={density}
                title="Sub-category breakdown"
                subtitle="% of incidents within each year. Sharps consistently dominates."
                exportName="subcategory-breakdown">
            <SubcatTable data={sliceData.subcat} years={years} theme={theme} density={density} />
          </ExpandableChart>

          {/* Data quality panel */}
          <DataQualityPanel theme={theme} density={density} />

        </div>
      </div>

      <UpdateFooter theme={theme} state="uptodate" />
    </div>
  );
}

// KPI tiles
function KpiStrip({ theme, density, sliceData, years }) {
  const total = Object.values(sliceData.count).reduce((a,b)=>a+b,0);
  const latest = years[years.length - 1];
  const prior = years[years.length - 2];
  const dVol = (sliceData.count[latest] - sliceData.count[prior]) / sliceData.count[prior];
  const harmLatest = sliceData.harmRate[latest];
  const harmPrior = sliceData.harmRate[prior];
  const dHarm = (harmLatest - harmPrior) / harmPrior;
  const closureLatest = sliceData.timeframe[latest].closure;
  const closurePrior = sliceData.timeframe[prior].closure;
  const dClosure = (closureLatest - closurePrior) / closurePrior;
  const nmLatest = sliceData.nearMissRate[latest];
  const nmPrior = sliceData.nearMissRate[prior];
  const dNm = (nmLatest - nmPrior) / nmPrior;

  const kpis = [
    { label: 'Incidents in window', value: total.toLocaleString(), delta: null, note: `${years[0]}–${latest}` },
    { label: 'YTD incidents', value: sliceData.count[latest].toLocaleString(), delta: dVol, goodDown: true, note: `vs ${prior} full year` },
    { label: 'Harm rate', value: (harmLatest*100).toFixed(1) + '%', delta: dHarm, goodDown: true, note: `${latest} YTD` },
    { label: 'Mean closure', value: closureLatest.toFixed(1) + 'd', delta: dClosure, goodDown: true, note: `${latest} YTD` },
    { label: 'Near-miss rate', value: (nmLatest*100).toFixed(1) + '%', delta: dNm, goodDown: false, note: `${latest} YTD` },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: density === 'compact' ? 10 : 14 }}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10,
          padding: density === 'compact' ? '14px 16px' : '18px 20px',
        }}>
          <div style={{ fontSize: 11, color: theme.ink3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{k.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
            <div style={{ fontFamily: theme.numFont, fontSize: density === 'compact' ? 24 : 28, fontWeight: 500, color: theme.ink, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {k.value}
            </div>
            {k.delta != null && (
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: ((k.delta < 0) === k.goodDown) ? theme.accentInk : theme.harm,
                fontFamily: theme.sansFont,
              }}>
                {k.delta > 0 ? '▲' : '▼'} {Math.abs(k.delta*100).toFixed(1)}%
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: theme.ink3, marginTop: 4 }}>{k.note}</div>
        </div>
      ))}
    </div>
  );
}

// Simple legend
function Legend({ theme, items }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.ink2, fontFamily: theme.sansFont }}>
          <div style={{
            width: 10, height: 10, borderRadius: 2,
            background: it.c,
            border: it.pattern ? `1px dashed ${theme.accent}` : 'none',
          }} />
          <span>{it.l}</span>
        </div>
      ))}
    </div>
  );
}

// Data quality panel — collapsed by default
function DataQualityPanel({ theme, density }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Card theme={theme} density={density}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <div>
          <div style={{ fontFamily: theme.numFont, fontSize: 15, fontWeight: 600, color: theme.ink }}>Data quality</div>
          <div style={{ fontSize: 12, color: theme.ink3, marginTop: 2 }}>
            4 127 rows · 3 dropped · 0 unmapped · date range 1 Jan 2022 – 22 Apr 2026
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: theme.ink3,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent }} />
          Healthy
          <span style={{ color: theme.ink3, marginLeft: 8 }}>{open ? '▾' : '▸'}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontFamily: theme.sansFont }}>
          {[
            ['Total rows', '4 127'],
            ['Dropped · bad dates', '3'],
            ['Unmapped departments', '0'],
            ['Date range', '1 Jan 2022 – 22 Apr 2026'],
          ].map(([l, v], i) => (
            <div key={i} style={{ padding: '10px 12px', background: theme.surfaceAlt, borderRadius: 6, border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: 10, color: theme.ink3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{l}</div>
              <div style={{ fontFamily: theme.numFont, fontSize: 15, color: theme.ink, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Helpers for slice resolution
function findNode(tree, id) {
  for (const n of tree) {
    if (n.id === id) return n;
    if (n.children) {
      const c = findNode(n.children, id);
      if (c) return c;
    }
  }
  return null;
}
function findPath(tree, id) {
  for (const n of tree) {
    if (n.id === id) return [n];
    if (n.children) {
      const sub = findPath(n.children, id);
      if (sub.length) return [n, ...sub];
    }
  }
  return [];
}
function scaleOrg(org, scale, key) {
  // Slight variation so scaled views don't look identical — seeded by id
  const seed = key ? key.charCodeAt(0) : 0;
  const jitter = (y, k) => 1 + ((y * 31 + seed + k.length) % 7 - 3) * 0.02;
  const scaleMap = (m, j = 0) => Object.fromEntries(Object.entries(m).map(([y, v]) => [y, Math.round(v * scale * jitter(+y, String(j)))]));
  const scaleRates = (m, key) => Object.fromEntries(Object.entries(m).map(([y, v]) => [y, v * jitter(+y, key)]));
  const scaleSub = (m) => Object.fromEntries(Object.entries(m).map(([y, cats]) =>
    [y, Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, Math.round(v * scale * jitter(+y, k))]))]));
  const scaleSplit = (m) => Object.fromEntries(Object.entries(m).map(([y, d]) => {
    const ohs = Math.min(0.95, Math.max(0.3, d.ohs * jitter(+y, 'o')));
    return [y, { ohs, haz: 1 - ohs }];
  }));
  const scaleTf = (m) => Object.fromEntries(Object.entries(m).map(([y, d]) =>
    [y, { lag: d.lag * jitter(+y, 'l'), closure: d.closure * jitter(+y, 'c') }]));
  return {
    count: scaleMap(org.count),
    typeSplit: scaleSplit(org.typeSplit),
    subcat: scaleSub(org.subcat),
    timeframe: scaleTf(org.timeframe),
    harmRate: scaleRates(org.harmRate, 'h'),
    nearMissRate: scaleRates(org.nearMissRate, 'n'),
  };
}

Object.assign(window, { Dashboard, KpiStrip, Legend, DataQualityPanel });
