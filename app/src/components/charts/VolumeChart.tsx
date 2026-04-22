import type { Theme } from "../../theme";
import type { CountByYear } from "../../data/sample";
import { Tooltip, useTooltip } from "./Tooltip";

interface Props {
  data: CountByYear;
  years: number[];
  theme: Theme;
  height?: number;
}

export function VolumeChart({ data, years, theme, height = 180 }: Props) {
  const { tt, wrap } = useTooltip();
  const W = 620;
  const H = height;
  const pad = { t: 24, r: 16, b: 32, l: 44 };
  const max = Math.max(...years.map((y) => data[y] || 0));
  const bw = (W - pad.l - pad.r) / years.length;
  const yTicks = [0, max * 0.5, max].map((v) => Math.round(v / 50) * 50);

  const latestYear = years[years.length - 1];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }}>
        {yTicks.map((v, i) => {
          const y = pad.t + (H - pad.t - pad.b) * (1 - v / max);
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={W - pad.r}
                y1={y}
                y2={y}
                stroke={theme.border}
                strokeDasharray={i === 0 ? "" : "2 3"}
              />
              <text
                x={pad.l - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill={theme.ink3}
                fontFamily={theme.sansFont}
              >
                {v}
              </text>
            </g>
          );
        })}
        {years.map((yr, i) => {
          const v = data[yr] || 0;
          const bh = (H - pad.t - pad.b) * (v / max);
          const x = pad.l + i * bw + 10;
          const y = H - pad.b - bh;
          const w = bw - 20;
          const prev = i > 0 ? data[years[i - 1]] || 0 : null;
          const d = prev ? (v - prev) / prev : null;
          const partial = yr === latestYear;
          const tooltip = `${yr}${partial ? " (YTD)" : ""}\n${v.toLocaleString()} incidents${
            d != null ? "\n" + (d > 0 ? "+" : "") + (d * 100).toFixed(1) + "% vs prior" : ""
          }`;
          return (
            <g key={yr} {...wrap({ "data-tt": tooltip })}>
              <rect
                x={x}
                y={y}
                width={w}
                height={bh}
                fill={partial ? theme.accentSoft : theme.accent}
                stroke={partial ? theme.accent : "none"}
                strokeDasharray={partial ? "3 3" : ""}
                rx={2}
              />
              <text
                x={x + w / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="12"
                fill={theme.ink}
                fontFamily={theme.numFont}
                fontWeight={600}
              >
                {v.toLocaleString()}
              </text>
              <text
                x={x + w / 2}
                y={H - 12}
                textAnchor="middle"
                fontSize="12"
                fill={theme.ink3}
                fontFamily={theme.sansFont}
              >
                {yr}
                {partial ? " · YTD" : ""}
              </text>
              {d != null && !partial && (
                <text
                  x={x + w / 2}
                  y={y - 22}
                  textAnchor="middle"
                  fontSize="10"
                  fill={d > 0 ? theme.harm : theme.accentInk}
                  fontFamily={theme.sansFont}
                  fontWeight={600}
                >
                  {d > 0 ? "▲" : "▼"} {Math.abs(d * 100).toFixed(1)}%
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
