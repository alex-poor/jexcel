import type { Theme } from "../../theme";
import type { RateByYear } from "../../data/sample";
import { Tooltip, useTooltip } from "./Tooltip";

interface Props {
  harm: RateByYear;
  nearMiss: RateByYear;
  years: number[];
  theme: Theme;
  height?: number;
}

export function RateTwinChart({ harm, nearMiss, years, theme, height = 180 }: Props) {
  const { tt, wrap } = useTooltip();
  const W = 620;
  const H = height;
  const pad = { t: 24, r: 60, b: 32, l: 44 };
  const vals = years.flatMap((y) => [harm[y] || 0, nearMiss[y] || 0]);
  const max = (Math.ceil(Math.max(...vals) * 100 / 5) * 5) / 100;
  const xs = (i: number) => pad.l + (W - pad.l - pad.r) * (i / Math.max(1, years.length - 1));
  const ys = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const pathFor = (series: RateByYear) =>
    years.map((y, i) => (i === 0 ? "M" : "L") + xs(i) + "," + ys(series[y] || 0)).join(" ");
  const areaFor = (series: RateByYear) =>
    pathFor(series) + ` L${xs(years.length - 1)},${H - pad.b} L${xs(0)},${H - pad.b} Z`;

  const yTicks = [0, max / 2, max];
  const lastY = years[years.length - 1];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height, display: "block" }}>
        {yTicks.map((t, i) => {
          const y = ys(t);
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
                {(t * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {years.map((y, i) => (
          <text
            key={y}
            x={xs(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize="12"
            fill={theme.ink3}
            fontFamily={theme.sansFont}
          >
            {y}
          </text>
        ))}
        <path d={areaFor(nearMiss)} fill={theme.nearMissSoft} opacity={0.6} />
        <path d={pathFor(nearMiss)} stroke={theme.nearMiss} strokeWidth={2.5} fill="none" strokeDasharray="5 3" />
        <path d={areaFor(harm)} fill={theme.harmSoft} opacity={0.6} />
        <path d={pathFor(harm)} stroke={theme.harm} strokeWidth={2.5} fill="none" />
        {years.map((y, i) => (
          <g key={y}>
            <circle
              cx={xs(i)}
              cy={ys(harm[y])}
              r={4}
              fill={theme.surface}
              stroke={theme.harm}
              strokeWidth={2}
              {...wrap({
                "data-tt": `${y} · Harm rate\n${(harm[y] * 100).toFixed(1)}%`,
              })}
            />
            <circle
              cx={xs(i)}
              cy={ys(nearMiss[y])}
              r={4}
              fill={theme.surface}
              stroke={theme.nearMiss}
              strokeWidth={2}
              {...wrap({
                "data-tt": `${y} · Near-miss rate\n${(nearMiss[y] * 100).toFixed(1)}%`,
              })}
            />
          </g>
        ))}
        <text
          x={xs(years.length - 1) + 8}
          y={ys(harm[lastY]) + 4}
          fontSize="11"
          fill={theme.harm}
          fontFamily={theme.sansFont}
          fontWeight={600}
        >
          Harm
        </text>
        <text
          x={xs(years.length - 1) + 8}
          y={ys(nearMiss[lastY]) + 4}
          fontSize="11"
          fill={theme.nearMiss}
          fontFamily={theme.sansFont}
          fontWeight={600}
        >
          Near-miss
        </text>
      </svg>
      <Tooltip tt={tt} theme={theme} />
    </div>
  );
}
