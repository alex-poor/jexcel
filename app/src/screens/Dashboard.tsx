import { useMemo, useState } from "react";
import type { Theme } from "../theme";
import type { HierarchyNode, SliceData } from "../data/sample";
import { findPath } from "../data/sample";
import type { ParseSummary } from "../api/tauri";
import type { UseUpdatesResult } from "../hooks/useUpdates";

import { TopBar } from "../components/shell/TopBar";
import { UpdateFooter } from "../components/shell/UpdateFooter";
import { Card } from "../components/shell/Card";
import { ExpandableChart } from "../components/ExpandableChart";

import { VolumeChart } from "../components/charts/VolumeChart";
import { TypeSplitChart } from "../components/charts/TypeSplitChart";
import { SubcatTable } from "../components/charts/SubcatTable";
import { TimeframeTimeline } from "../components/charts/TimeframeTimeline";
import { TimeframeSlope } from "../components/charts/TimeframeSlope";
import { RateTwinChart } from "../components/charts/RateTwinChart";

type Density = "comfortable" | "compact";

interface Props {
  theme: Theme;
  density?: Density;
  sliceId: string;
  sliceData: SliceData;
  hierarchy: HierarchyNode[];
  summary: ParseSummary;
  updates: UseUpdatesResult;
  animated?: boolean;
  onOpenSettings?: () => void;
  onNewFile?: () => void;
}

export function Dashboard({
  theme,
  density = "comfortable",
  sliceId,
  sliceData,
  hierarchy,
  summary,
  updates,
  animated = false,
  onOpenSettings,
  onNewFile,
}: Props) {
  const years = summary.years.length ? summary.years : Object.keys(sliceData.count).map(Number);
  const breadcrumb = useMemo<string[]>(() => {
    if (sliceId === "all") return ["All departments"];
    const path = findPath(hierarchy, sliceId);
    return path.length ? path.map((n) => n.label) : ["All departments"];
  }, [sliceId, hierarchy]);

  const rowCount = Object.values(sliceData.count).reduce((a, b) => a + b, 0);
  const gap = density === "compact" ? 14 : 18;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <TopBar
        theme={theme}
        density={density}
        breadcrumb={breadcrumb}
        rowCount={rowCount}
        filename={summary.file}
        parsedAt={summary.parsedAt}
        yearWindow={[years[0], years[years.length - 1]]}
        onOpenSettings={onOpenSettings}
        onNewFile={onNewFile}
      />

      <div style={{ flex: 1, overflow: "auto", background: theme.bg }}>
        <div
          style={{
            padding: density === "compact" ? 18 : 24,
            display: "flex",
            flexDirection: "column",
            gap,
          }}
        >
          <KpiStrip theme={theme} density={density} sliceData={sliceData} years={years} />

          <ExpandableChart
            theme={theme}
            density={density}
            title="Volume over time"
            subtitle="Incidents reported per calendar year. The final year is year-to-date."
            right={
              <Legend
                theme={theme}
                items={[
                  { c: theme.accent, l: "Reported" },
                  { c: theme.accentSoft, l: "YTD · partial", pattern: true },
                ]}
              />
            }
            exportName="volume-over-time"
          >
            <VolumeChart data={sliceData.count} years={years} theme={theme} />
          </ExpandableChart>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap }}>
            <ExpandableChart
              theme={theme}
              density={density}
              title="Type split"
              subtitle="Occ Health/Safety vs Hazards, % of incidents logged each year."
              right={
                <Legend
                  theme={theme}
                  items={[
                    { c: theme.cat[0], l: "Occ Health/Safety" },
                    { c: theme.cat[1], l: "Hazards" },
                  ]}
                />
              }
              exportName="type-split"
            >
              <TypeSplitChart data={sliceData.typeSplit} years={years} theme={theme} />
            </ExpandableChart>
            <ExpandableChart
              theme={theme}
              density={density}
              title="Harm & near-miss rates"
              subtitle="Read together — a rising near-miss rate alongside falling harm is a healthy reporting culture."
              exportName="harm-nearmiss-rates"
            >
              <RateTwinChart
                harm={sliceData.harmRate}
                nearMiss={sliceData.nearMissRate}
                years={years}
                theme={theme}
                height={180}
              />
            </ExpandableChart>
          </div>

          <ExpandableChart
            theme={theme}
            density={density}
            title="Timeframe analysis"
            subtitle="How quickly incidents are reported and closed. Shorter = better."
            right={
              <Legend
                theme={theme}
                items={[
                  { c: theme.lag, l: "Reporting lag" },
                  { c: theme.closure, l: "Closure duration" },
                ]}
              />
            }
            exportName="timeframe-analysis"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.ink3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                    fontFamily: theme.sansFont,
                  }}
                >
                  Per-year timeline · lag + closure
                </div>
                <TimeframeTimeline
                  data={sliceData.timeframe}
                  years={years}
                  theme={theme}
                  animated={animated}
                />
              </div>
              <div style={{ height: 1, background: theme.border, margin: "4px 0" }} />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: theme.ink3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                    fontFamily: theme.sansFont,
                  }}
                >
                  Trajectory over years
                </div>
                <TimeframeSlope
                  data={sliceData.timeframe}
                  years={years}
                  theme={theme}
                  animated={animated}
                />
              </div>
            </div>
            <InterpretBand theme={theme} sliceData={sliceData} years={years} />
          </ExpandableChart>

          <ExpandableChart
            theme={theme}
            density={density}
            title="Sub-category breakdown"
            subtitle="% of incidents within each year. Sharps consistently dominates."
            exportName="subcategory-breakdown"
          >
            <SubcatTable data={sliceData.subcat} years={years} theme={theme} density={density} />
          </ExpandableChart>

          <DataQualityPanel theme={theme} density={density} summary={summary} />
        </div>
      </div>

      <UpdateFooter theme={theme} updates={updates} />
    </div>
  );
}

interface KpiStripProps {
  theme: Theme;
  density: Density;
  sliceData: SliceData;
  years: number[];
}

function KpiStrip({ theme, density, sliceData, years }: KpiStripProps) {
  const total = Object.values(sliceData.count).reduce((a, b) => a + b, 0);
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

  const kpis: Array<{
    label: string;
    value: string;
    delta: number | null;
    goodDown?: boolean;
    note: string;
  }> = [
    { label: "Incidents in window", value: total.toLocaleString(), delta: null, note: `${years[0]}–${latest}` },
    { label: "YTD incidents", value: sliceData.count[latest].toLocaleString(), delta: dVol, goodDown: true, note: `vs ${prior} full year` },
    { label: "Harm rate", value: (harmLatest * 100).toFixed(1) + "%", delta: dHarm, goodDown: true, note: `${latest} YTD` },
    { label: "Mean closure", value: closureLatest.toFixed(1) + "d", delta: dClosure, goodDown: true, note: `${latest} YTD` },
    { label: "Near-miss rate", value: (nmLatest * 100).toFixed(1) + "%", delta: dNm, goodDown: false, note: `${latest} YTD` },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${kpis.length}, 1fr)`,
        gap: density === "compact" ? 10 : 14,
      }}
    >
      {kpis.map((k, i) => (
        <div
          key={i}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: density === "compact" ? "14px 16px" : "18px 20px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: theme.ink3,
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {k.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <div
              style={{
                fontFamily: theme.numFont,
                fontSize: density === "compact" ? 24 : 28,
                fontWeight: 500,
                color: theme.ink,
                letterSpacing: "-0.01em",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {k.value}
            </div>
            {k.delta != null && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: (k.delta < 0) === k.goodDown ? theme.accentInk : theme.harm,
                  fontFamily: theme.sansFont,
                }}
              >
                {k.delta > 0 ? "▲" : "▼"} {Math.abs(k.delta * 100).toFixed(1)}%
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: theme.ink3, marginTop: 4 }}>{k.note}</div>
        </div>
      ))}
    </div>
  );
}

interface LegendProps {
  theme: Theme;
  items: Array<{ c: string; l: string; pattern?: boolean }>;
}
function Legend({ theme, items }: LegendProps) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: theme.ink2,
            fontFamily: theme.sansFont,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: it.c,
              border: it.pattern ? `1px dashed ${theme.accent}` : "none",
            }}
          />
          <span>{it.l}</span>
        </div>
      ))}
    </div>
  );
}

function InterpretBand({
  theme,
  sliceData,
  years,
}: {
  theme: Theme;
  sliceData: SliceData;
  years: number[];
}) {
  const first = years[0];
  const penultimate = years[years.length - 2];
  const firstClosure = sliceData.timeframe[first]?.closure;
  const recentClosure = sliceData.timeframe[penultimate]?.closure;
  if (!firstClosure || !recentClosure) return null;
  const drop = Math.round((1 - recentClosure / firstClosure) * 100);
  return (
    <div
      style={{
        marginTop: 18,
        padding: "12px 14px",
        background: theme.accentSoft,
        border: `1px solid ${theme.accent}22`,
        borderRadius: 6,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        fontFamily: theme.sansFont,
      }}
    >
      <div style={{ width: 3, alignSelf: "stretch", background: theme.accent, borderRadius: 2 }} />
      <div style={{ fontSize: 13, color: theme.accentInk, lineHeight: 1.45 }}>
        Closure duration has <strong>fallen {drop}% since {first}</strong> ({Math.round(firstClosure)} →{" "}
        {Math.round(recentClosure)} days). The final year reflects incomplete closure on open cases.
      </div>
    </div>
  );
}

function DataQualityPanel({
  theme,
  density,
  summary,
}: {
  theme: Theme;
  density: Density;
  summary: ParseSummary;
}) {
  const [open, setOpen] = useState(false);
  const firstYear = summary.years[0];
  const lastYear = summary.years[summary.years.length - 1];
  const unmappedCount = summary.unmappedDepts.length;
  const healthy = summary.droppedRows === 0 && unmappedCount === 0;
  const dateRange =
    summary.years.length > 0 ? `${firstYear} – ${lastYear}` : "no data";
  return (
    <Card theme={theme} density={density}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      >
        <div>
          <div
            style={{
              fontFamily: theme.numFont,
              fontSize: 15,
              fontWeight: 600,
              color: theme.ink,
            }}
          >
            Data quality
          </div>
          <div style={{ fontSize: 12, color: theme.ink3, marginTop: 2 }}>
            {summary.totalRows.toLocaleString()} rows · {summary.droppedRows} dropped ·{" "}
            {unmappedCount} unmapped · date range {dateRange}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: theme.ink3 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: healthy ? theme.accent : theme.harm,
            }}
          />
          {healthy ? "Healthy" : "Needs review"}
          <span style={{ color: theme.ink3, marginLeft: 8 }}>{open ? "▾" : "▸"}</span>
        </div>
      </div>
      {open && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            fontFamily: theme.sansFont,
          }}
        >
          {(
            [
              ["Total rows", summary.totalRows.toLocaleString()],
              ["Dropped · bad dates", String(summary.droppedRows)],
              ["Unmapped departments", String(unmappedCount)],
              ["Date range", dateRange],
            ] as const
          ).map(([l, v], i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                background: theme.surfaceAlt,
                borderRadius: 6,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: theme.ink3,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: theme.numFont,
                  fontSize: 15,
                  color: theme.ink,
                  marginTop: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
