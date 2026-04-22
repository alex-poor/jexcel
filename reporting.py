"""Print the aggregated incident report described in the readme.

The readme's worked example is Theatre, but the same aggregations apply
to any department slice — or the whole dataset. `run_report` produces
one slice; `run_all` iterates every department plus an overall section.

Pure consumer of the normalised DataFrame from ingest.py.
"""

from __future__ import annotations

from datetime import date

import pandas as pd


def default_years() -> tuple[int, ...]:
    """Last 5 calendar years including the current year."""
    y = date.today().year
    return tuple(range(y - 4, y + 1))


def _pct(numer: int, denom: int) -> str:
    return f"{(numer / denom * 100):.2f}%" if denom else "—"


def _filter(df: pd.DataFrame, department_substring: str | None, years: tuple[int, ...]) -> pd.DataFrame:
    mask_year = df["year"].isin(years)
    if department_substring is None:
        return df[mask_year].copy()
    needle = department_substring.lower()
    mask_dept = (
        df["department"].fillna("").str.lower().str.contains(needle)
        | df["dept_level1"].fillna("").str.lower().str.contains(needle)
        | df["dept_level2"].fillna("").str.lower().str.contains(needle)
    )
    return df[mask_dept & mask_year].copy()


def _banner(title: str, char: str = "=", width: int = 72) -> None:
    print()
    print(char * width)
    print(title)
    print(char * width)


def _print_volumes(df: pd.DataFrame, years: tuple[int, ...]) -> None:
    _banner("1. Incident Volumes per Year")
    print(f"{'Year':<8}{'Incidents':>12}")
    print("-" * 20)
    for y in years:
        print(f"{y:<8}{len(df[df['year'] == y]):>12}")


def _print_high_level(df: pd.DataFrame, years: tuple[int, ...]) -> None:
    _banner("2. High-Level Type Distribution (% within year)")
    print(f"{'Year':<8}{'Occ H/S':>20}{'Hazards':>20}")
    print("-" * 48)
    for y in years:
        sub = df[df["year"] == y]
        total = len(sub)
        oh = (sub["type_of_incident"].str.lower() == "occ health/safety").sum()
        hz = (sub["type_of_incident"].str.lower() == "hazards").sum()
        print(f"{y:<8}{f'{oh} ({_pct(oh, total)})':>20}{f'{hz} ({_pct(hz, total)})':>20}")


def _print_subcategories(df: pd.DataFrame, years: tuple[int, ...]) -> None:
    _banner("3. Sub-Category Breakdown")
    for y in years:
        sub = df[df["year"] == y]
        total = len(sub)
        print(f"\n-- {y} ({total} incidents) --")
        if total == 0:
            print("  (none)")
            continue
        counts = sub["incident_type"].fillna("(unspecified)").value_counts()
        print(f"  {'Sub-Category':<45}{'Count':>8}{'% of year':>12}")
        for name, n in counts.items():
            print(f"  {str(name)[:45]:<45}{n:>8}{_pct(n, total):>12}")


def _print_timeframes(df: pd.DataFrame, years: tuple[int, ...]) -> None:
    _banner("4. Timeframe Analysis (average days)")
    print(f"{'Year':<8}{'Occurred → Reported':>24}{'Reported → Closed':>24}")
    print("-" * 56)
    for y in years:
        sub = df[df["year"] == y]
        avg_report = sub["days_to_report"].dropna().mean()
        avg_close = sub["days_to_close"].dropna().mean()
        r = f"{avg_report:.2f} days" if pd.notna(avg_report) else "—"
        c = f"{avg_close:.2f} days" if pd.notna(avg_close) else "—"
        print(f"{y:<8}{r:>24}{c:>24}")


def _print_bool_pct(df: pd.DataFrame, years: tuple[int, ...], column: str, label: str, section_num: int) -> None:
    _banner(f"{section_num}. {label} % by Year")
    print(f"{'Year':<8}{label:>30}")
    print("-" * 38)
    for y in years:
        sub = df[df["year"] == y]
        total = len(sub)
        yes = int(sub[column].fillna(False).sum())
        print(f"{y:<8}{_pct(yes, total):>30}")


def _print_full_sections(df: pd.DataFrame, years: tuple[int, ...]) -> None:
    _print_volumes(df, years)
    _print_high_level(df, years)
    _print_subcategories(df, years)
    _print_timeframes(df, years)
    _print_bool_pct(df, years, "harm", "Resulting in harm", section_num=5)
    _print_bool_pct(df, years, "near_miss", "Near miss", section_num=6)
    print()


def run_report(
    df: pd.DataFrame,
    department_substring: str | None = None,
    years: tuple[int, ...] | None = None,
) -> None:
    """Print the full report for a single slice (one department, or everything)."""
    years = years or default_years()
    filtered = _filter(df, department_substring, years)
    label = f"department LIKE '%{department_substring}%'" if department_substring else "ALL DEPARTMENTS"

    print()
    print("#" * 72)
    print(f"# INCIDENT REPORT — {label}")
    print(f"# years: {', '.join(map(str, years))}    rows: {len(filtered)}")
    print("#" * 72)

    if len(filtered) == 0:
        print("\n(no rows matched this slice)\n")
        return

    _print_full_sections(filtered, years)


def run_all(df: pd.DataFrame, years: tuple[int, ...] | None = None) -> None:
    """Overall report → per level1 → per (level1, level2)."""
    years = years or default_years()
    run_report(df, department_substring=None, years=years)

    in_window = df[df["year"].isin(years)]
    level1s = sorted(
        {v for v in in_window["dept_level1"].dropna() if str(v).strip()},
        key=lambda s: str(s).lower(),
    )

    _banner(f"HIERARCHICAL REPORTS — {len(level1s)} level-1 groups", char="#")

    for l1 in level1s:
        l1_slice = in_window[in_window["dept_level1"] == l1]
        _banner(f"LEVEL 1: {l1}  ({len(l1_slice)} rows)", char="#")
        _print_full_sections(l1_slice, years)

        level2s = sorted(
            {v for v in l1_slice["dept_level2"].dropna() if str(v).strip()},
            key=lambda s: str(s).lower(),
        )
        for l2 in level2s:
            l2_slice = l1_slice[l1_slice["dept_level2"] == l2]
            if len(l2_slice) == 0:
                continue
            _banner(f"  LEVEL 2: {l1} › {l2}  ({len(l2_slice)} rows)", char="*")
            _print_full_sections(l2_slice, years)


def run_slice(
    df: pd.DataFrame,
    level1: str | None = None,
    level2: str | None = None,
    department_substring: str | None = None,
    years: tuple[int, ...] | None = None,
) -> None:
    """Print one report for an arbitrary filter combination.

    level1/level2 are exact matches (case-insensitive). department_substring
    is the legacy loose match across raw + level1 + level2. Filters AND
    together when multiple are set.
    """
    years = years or default_years()
    filtered = df[df["year"].isin(years)].copy()
    label_parts = []

    if level1 is not None:
        filtered = filtered[filtered["dept_level1"].fillna("").str.lower() == level1.lower()]
        label_parts.append(f"level1={level1}")
    if level2 is not None:
        filtered = filtered[filtered["dept_level2"].fillna("").str.lower() == level2.lower()]
        label_parts.append(f"level2={level2}")
    if department_substring is not None:
        needle = department_substring.lower()
        mask = (
            filtered["department"].fillna("").str.lower().str.contains(needle)
            | filtered["dept_level1"].fillna("").str.lower().str.contains(needle)
            | filtered["dept_level2"].fillna("").str.lower().str.contains(needle)
        )
        filtered = filtered[mask]
        label_parts.append(f"department~='{department_substring}'")

    label = ", ".join(label_parts) if label_parts else "ALL DEPARTMENTS"

    print()
    print("#" * 72)
    print(f"# INCIDENT REPORT — {label}")
    print(f"# years: {', '.join(map(str, years))}    rows: {len(filtered)}")
    print("#" * 72)

    if len(filtered) == 0:
        print("\n(no rows matched this slice)\n")
        return

    _print_full_sections(filtered, years)
