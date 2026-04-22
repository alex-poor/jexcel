import type { Theme } from "../../theme";
import type { TypeSplitByYear } from "../../data/sample";
import { Tooltip, useTooltip } from "./Tooltip";

interface Props {
  data: TypeSplitByYear;
  years: number[];
  theme: Theme;
  height?: number;
}

export function TypeSplitChart({ data, years, theme, height = 140 }: Props) {
  const { tt, wrap } = useTooltip();
  const W = 620;
  const H = height;
  const pad = { t: 18, r: 16, b: 28, l: 44 };
  const bw = (W - pad.l - pad.r) / years.length;
  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = pad.t + (H - pad.t - pad.b) * t;
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={W - pad.r}
                y1={y}
                y2={y}
                stroke={theme.border}
                strokeDasharray={i === 0 || i === 4 ? "" : "2 3"}
              />
              {(i === 0 || i === 4 || i === 2) && (
                <text
                  x={pad.l - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={theme.ink3}
                  fontFamily={theme.sansFont}
                >
                  {(1 - t) * 100}%
                </text>
              )}
            </g>
          );
        })}
        {years.map((yr, i) => {
          const d = data[yr];
          if (!d) return null;
          const x = pad.l + i * bw + 14;
          const w = bw - 28;
          const topH = (H - pad.t - pad.b) * d.ohs;
          const botH = (H - pad.t - pad.b) * d.haz;
          return (
            <g key={yr}>
              <rect
                x={x}
                y={pad.t}
                width={w}
                height={topH}
                fill={theme.cat[0]}
                rx={1}
                {...wrap({
                  "data-tt": `${yr} · Occ Health/Safety\n${(d.ohs * 100).toFixed(1)}%`,
                })}
              />
              <rect
                x={x}
                y={pad.t + topH}
                width={w}
                height={botH}
                fill={theme.cat[1]}
                rx={1}
                {...wrap({
                  "data-tt": `${yr} · Hazards\n${(d.haz * 100).toFixed(1)}%`,
                })}
              />
              <text
                x={x + w / 2}
                y={pad.t + topH / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill="#fff"
                fontFamily={theme.sansFont}
                fontWeight={600}
              >
                {topH > 20 ? (d.ohs * 100).toFixed(0) + "%" : ""}
              </text>
              <text
                x={x + w / 2}
                y={pad.t + topH + botH / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill="#fff"
                fontFamily={theme.sansFont}
                fontWeight={600}
              >
                {botH > 20 ? (d.haz * 100).toFixed(0) + "%" : ""}
              </text>
              <text
                x={x + w / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize="12"
                fill={theme.ink3}
                fontFamily={theme.sansFont}
              >
                {yr}
              </text>
            </g>
          );
        })}
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}
