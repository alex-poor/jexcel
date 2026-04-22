import { useEffect, useState } from "react";
import type { Theme } from "../../theme";
import type { TimeframeByYear } from "../../data/sample";
import { Tooltip, useTooltip } from "./Tooltip";

interface Props {
  data: TimeframeByYear;
  years: number[];
  theme: Theme;
  height?: number;
  animated?: boolean;
}

/** Hero timeline — two stacked segments per year (lag | closure) on a shared day axis. */
export function TimeframeTimeline({ data, years, theme, height = 260, animated = false }: Props) {
  const { tt, wrap } = useTooltip();
  const W = 620;
  // Floor rowH at 14 so labels never overlap when we're showing lots of years.
  // H is computed from rowH below, so the SVG grows vertically if needed.
  const rowH = Math.max(14, Math.min(38, (height - 60) / years.length));
  const pad = { t: 18, r: 80, b: 34, l: 56 };
  const totals = years.map((y) => (data[y]?.lag || 0) + (data[y]?.closure || 0));
  const max = Math.max(...totals, 10);
  const niceMax = Math.ceil(max / 20) * 20;
  const xScale = (d: number) => pad.l + (W - pad.l - pad.r) * (d / niceMax);
  const ticks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];
  const H = pad.t + rowH * years.length + pad.b;
  const latestYear = years[years.length - 1];

  const [reveal, setReveal] = useState(animated ? 0 : 1);
  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      setReveal(e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={xScale(t)}
              x2={xScale(t)}
              y1={pad.t - 4}
              y2={H - pad.b + 4}
              stroke={i === 0 ? theme.borderStrong : theme.border}
              strokeDasharray={i === 0 ? "" : "2 3"}
            />
            <text
              x={xScale(t)}
              y={H - pad.b + 18}
              textAnchor="middle"
              fontSize="11"
              fill={theme.ink3}
              fontFamily={theme.sansFont}
            >
              {t === 0 ? "0" : `${t}d`}
            </text>
          </g>
        ))}
        {years.map((yr, i) => {
          const row = data[yr];
          const y = pad.t + i * rowH + rowH / 2;
          const lagEnd = row ? xScale(row.lag * reveal) : pad.l;
          const closureEnd = row ? xScale((row.lag + row.closure) * reveal) : pad.l;
          const barH = Math.min(18, rowH - 8);
          const partial = yr === latestYear;
          return (
            <g key={yr}>
              <text
                x={pad.l - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill={theme.ink2}
                fontFamily={theme.sansFont}
                fontWeight={600}
              >
                {yr}
                {partial ? " · YTD" : ""}
              </text>
              {!row && (
                <text
                  x={pad.l + 8}
                  y={y + 4}
                  fontSize="11"
                  fill={theme.ink3}
                  fontStyle="italic"
                  fontFamily={theme.sansFont}
                >
                  no data
                </text>
              )}
              {row && (
                <g>
                  <rect
                    x={pad.l}
                    y={y - barH / 2}
                    width={lagEnd - pad.l}
                    height={barH}
                    fill={theme.lag}
                    rx={2}
                    {...wrap({
                      "data-tt": `${yr} · Reporting lag\n${row.lag.toFixed(2)} days (Occurred → Reported)`,
                    })}
                  />
                  <rect
                    x={lagEnd}
                    y={y - barH / 2}
                    width={Math.max(0, closureEnd - lagEnd)}
                    height={barH}
                    fill={theme.closure}
                    rx={2}
                    {...wrap({
                      "data-tt": `${yr} · Closure duration\n${row.closure.toFixed(2)} days (Reported → Closed)`,
                    })}
                  />
                  {lagEnd - pad.l > 34 && (
                    <text
                      x={pad.l + 6}
                      y={y + 4}
                      fontSize="11"
                      fill="#fff"
                      fontFamily={theme.numFont}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                      fontWeight={600}
                    >
                      {row.lag.toFixed(2)}d
                    </text>
                  )}
                  {closureEnd - lagEnd > 40 && (
                    <text
                      x={lagEnd + 6}
                      y={y + 4}
                      fontSize="11"
                      fill="#fff"
                      fontFamily={theme.numFont}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                      fontWeight={600}
                    >
                      {row.closure.toFixed(2)}d
                    </text>
                  )}
                  <text
                    x={closureEnd + 8}
                    y={y + 4}
                    fontSize="11"
                    fill={theme.ink2}
                    fontFamily={theme.numFont}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
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
