import { useMemo } from "react";
import type { Theme } from "../../theme";
import type { SubcatByYear } from "../../data/sample";
import { Tooltip, useTooltip } from "./Tooltip";

interface Props {
  data: SubcatByYear;
  years: number[];
  theme: Theme;
  density: "comfortable" | "compact";
}

export function SubcatTable({ data, years, theme, density }: Props) {
  const { tt, wrap } = useTooltip();

  const cats = useMemo(() => {
    const totals: Record<string, number> = {};
    years.forEach((y) => {
      Object.entries(data[y] || {}).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + v;
      });
    });
    return Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
  }, [data, years]);

  const yearTotals = useMemo(
    () =>
      Object.fromEntries(
        years.map((y) => [y, Object.values(data[y] || {}).reduce((a, b) => a + b, 0)]),
      ) as Record<number, number>,
    [data, years],
  );

  const maxPct = useMemo(() => {
    let m = 0;
    cats.forEach((c) =>
      years.forEach((y) => {
        const v = (data[y]?.[c] || 0) / (yearTotals[y] || 1);
        if (v > m) m = v;
      }),
    );
    return m;
  }, [cats, years, data, yearTotals]);

  const rowH = density === "compact" ? 28 : 34;

  return (
    <div style={{ position: "relative", fontFamily: theme.sansFont, fontSize: 13, color: theme.ink }}>
      <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${years.length}, 1fr)`, gap: 0 }}>
        <div
          style={{
            padding: "6px 10px 6px 0",
            fontSize: 11,
            fontWeight: 600,
            color: theme.ink3,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Category
        </div>
        {years.map((y) => (
          <div
            key={y}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: theme.ink3,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {y}
          </div>
        ))}
      </div>
      {cats.map((cat, ci) => (
        <div
          key={cat}
          style={{
            display: "grid",
            gridTemplateColumns: `180px repeat(${years.length}, 1fr)`,
            alignItems: "center",
            borderTop: `1px solid ${theme.border}`,
            height: rowH,
          }}
        >
          <div
            style={{
              padding: "0 10px 0 0",
              fontSize: 13,
              color: theme.ink2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cat}
          </div>
          {years.map((y) => {
            const v = data[y]?.[cat] || 0;
            const pct = v / (yearTotals[y] || 1);
            const w = maxPct > 0 ? (pct / maxPct) * 100 : 0;
            return (
              <div
                key={y}
                style={{
                  padding: "0 8px",
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
                {...wrap({
                  "data-tt": `${y} · ${cat}\n${v.toLocaleString()} incidents (${(pct * 100).toFixed(1)}%)`,
                })}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 10,
                    background: theme.surfaceAlt,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${w}%`,
                      height: "100%",
                      background: theme.cat[ci % theme.cat.length],
                      borderRadius: 2,
                      transition: "width .3s",
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    fontSize: 11,
                    color: theme.ink3,
                    fontFamily: theme.numFont,
                    fontVariantNumeric: "tabular-nums",
                    pointerEvents: "none",
                    background: `linear-gradient(90deg, transparent, ${theme.surface} 30%)`,
                    paddingLeft: 12,
                  }}
                >
                  {(pct * 100).toFixed(0)}%
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
