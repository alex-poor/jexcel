"""CLI entry point.

Default: overall report + per-level1 + per-(level1, level2) sections.

Filter flags (all AND together, all case-insensitive):
    --level1 "Theatre"          exact match on mapped level1
    --level2 "Theatre Suite"    exact match on mapped level2
    --department theatre        legacy substring across raw + level1 + level2

Examples:
    myenv/bin/python main.py Notify-11-76-226.xlsx
    myenv/bin/python main.py Notify-11-76-226.xlsx --level1 Theatre
    myenv/bin/python main.py Notify-11-76-226.xlsx --level1 "Patient Services" --level2 PACU
    myenv/bin/python main.py Notify-11-76-226.xlsx --department theatre --years 2024 2025
"""

from __future__ import annotations

import argparse
import sys

from ingest import load_incidents
from reporting import run_all, run_slice


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Incident reporting rules engine")
    p.add_argument("path", help="Path to the source .xlsx file")
    p.add_argument(
        "--mapping",
        default="department_mapping.csv",
        help="Path to the department grouping CSV (default: department_mapping.csv)",
    )
    p.add_argument("--level1", default=None, help="Exact match on mapped level1 (case-insensitive)")
    p.add_argument("--level2", default=None, help="Exact match on mapped level2 (case-insensitive)")
    p.add_argument(
        "--department",
        default=None,
        help="Substring match across raw department name, level1, and level2",
    )
    p.add_argument(
        "--years",
        nargs="+",
        type=int,
        default=None,
        help="Override the reporting window (default: last 5 calendar years)",
    )
    args = p.parse_args(argv)

    df = load_incidents(args.path, mapping_path=args.mapping)
    years = tuple(args.years) if args.years else None

    any_filter = any(v is not None for v in (args.level1, args.level2, args.department))
    if any_filter:
        run_slice(
            df,
            level1=args.level1,
            level2=args.level2,
            department_substring=args.department,
            years=years,
        )
    else:
        run_all(df, years=years)
    return 0


if __name__ == "__main__":
    sys.exit(main())
