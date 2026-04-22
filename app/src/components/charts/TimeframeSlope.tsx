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

export function TimeframeSlope({ data, years, theme, height = 260, animated = false }: Props) {
  const { tt, wrap } = useTooltip();
  const W = 620;
  const H = height;
  const pad = { t: 28, r: 80, b: 42, l: 44 };
  const lagMax = Math.max(...years.map((y) => data[y]?.lag || 0), 10);
  const closureMax = Math.max(...years.map((y) => data[y]?.closure || 0), 20);
  const xs = (i: number) => pad.l + (W - pad.l - pad.r) * (i / Math.max(1, years.length - 1));
  const yLag = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / (Math.ceil(lagMax / 5) * 5));
  const yCl = (v: number) =>
    pad.t + (H - pad.t - pad.b) * (1 - v / (Math.ceil(closureMax / 20) * 20));

  const present = years.filter((y) => data[y]);
  const lagPts: [number, number][] = present.map((y) => [xs(years.indexOf(y)), yLag(data[y]!.lag)]);
  const clPts: [number, number][] = present.map((y) => [
    xs(years.indexOf(y)),
    yCl(data[y]!.closure),
  ]);

  const [reveal, setReveal] = useState(animated ? 0 : 1);
  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setReveal(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  const path = (pts: [number, number][]) =>
    pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");

  const latestYear = years[years.length - 1];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {years.map((yr, i) => (
          <g key={yr}>
            <line
              x1={xs(i)}
              x2={xs(i)}
              y1={pad.t}
              y2={H - pad.b}
              stroke={theme.border}
              strokeDasharray="2 3"
            />
            <text
              x={xs(i)}
              y={H - pad.b + 18}
              textAnchor="middle"
              fontSize="12"
              fill={theme.ink3}
              fontFamily={theme.sansFont}
            >
              {yr}
              {yr === latestYear ? " · YTD" : ""}
            </text>
          </g>
        ))}
        <g style={{ opacity: reveal }}>
          <path d={path(clPts)} stroke={theme.closure} strokeWidth={2.5} fill="none" />
          {clPts.map((p, i) => {
            const yr = present[i];
            const row = data[yr]!;
            return (
              <g
                key={i}
                {...wrap({
                  "data-tt": `${yr} · Closure duration\n${row.closure.toFixed(2)} days`,
                })}
              >
                <circle cx={p[0]} cy={p[1]} r={5} fill={theme.surface} stroke={theme.closure} strokeWidth={2.5} />
                <text
                  x={p[0]}
                  y={p[1] - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill={theme.closure}
                  fontFamily={theme.numFont}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  fontWeight={700}
                >
                  {row.closure.toFixed(1)}
                </text>
              </g>
            );
          })}
          {clPts.length > 0 && (
            <text
              x={xs(years.length - 1) + 10}
              y={clPts[clPts.length - 1][1] + 4}
              fontSize="11"
              fill={theme.closure}
              fontFamily={theme.sansFont}
              fontWeight={600}
            >
              Closure (d)
            </text>
          )}
        </g>
        <g style={{ opacity: reveal }}>
          <path d={path(lagPts)} stroke={theme.lag} strokeWidth={2.5} fill="none" />
          {lagPts.map((p, i) => {
            const yr = present[i];
            const row = data[yr]!;
            return (
              <g
                key={i}
                {...wrap({
                  "data-tt": `${yr} · Reporting lag\n${row.lag.toFixed(2)} days`,
                })}
              >
                <circle cx={p[0]} cy={p[1]} r={5} fill={theme.surface} stroke={theme.lag} strokeWidth={2.5} />
                <text
                  x={p[0]}
                  y={p[1] + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill={theme.lag}
                  fontFamily={theme.numFont}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                  fontWeight={700}
                >
                  {row.lag.toFixed(1)}
                </text>
              </g>
            );
          })}
          {lagPts.length > 0 && (
            <text
              x={xs(years.length - 1) + 10}
              y={lagPts[lagPts.length - 1][1] + 4}
              fontSize="11"
              fill={theme.lag}
              fontFamily={theme.sansFont}
              fontWeight={600}
            >
              Lag (d)
            </text>
          )}
        </g>
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}
