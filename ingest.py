"""Load the incident workbook into a clean, typed DataFrame.

No reporting logic lives here — this is only normalisation so downstream
consumers (theatre_report.py, future Tauri frontend, etc.) all see the
same well-formed shape.
"""

from __future__ import annotations

from datetime import date, datetime
from pathlib import Path

import pandas as pd

from mapping import load_mapping, map_department


# Columns we care about, mapped from the verbose sheet headers to tidy names.
COLUMN_MAP = {
    "Serial No.": "serial",
    "Date of Incident": "date_occurred",
    "Incident Involved": "incident_involved",
    "Department/Area": "department",
    "Summary": "summary",
    "Details": "details",
    "Result in Harm?": "harm",
    "Near Miss?": "near_miss",
    "Type of Incident": "type_of_incident",
    "Incident Type": "incident_type",
    "Date Modified": "date_modified",
    "Created On": "date_reported",
}

# readme: "exclude values not in ('hazard','occ health/safety')"
KEEP_TYPES = {"hazards", "occ health/safety"}


def _parse_dmy(value) -> date | None:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    # Excel sometimes yields floats for date cells, but in this sheet dates
    # arrive as DD-MM-YYYY strings. Be strict so bad rows surface loudly.
    try:
        return datetime.strptime(str(value).strip(), "%d-%m-%Y").date()
    except ValueError:
        return None


def _parse_bool(value) -> bool | None:
    if value is None:
        return None
    s = str(value).strip().lower()
    if s == "yes":
        return True
    if s == "no":
        return False
    return None


def load_incidents(
    path: str | Path,
    mapping_path: str | Path = "department_mapping.csv",
) -> pd.DataFrame:
    """Read the workbook and return a normalised DataFrame.

    Applies the readme's filter rule (type_of_incident in Hazards /
    Occ Health/Safety) and drops rows with unparseable occurrence dates,
    since every downstream aggregation slices by year.

    Adds dept_level1 / dept_level2 columns per the mapping CSV. Rows
    whose raw department isn't in the mapping get level1="(unmapped)"
    and level2=raw-name, so they surface in reports rather than
    silently disappear.
    """
    raw = pd.read_excel(path, engine="openpyxl", dtype=object)

    missing = [c for c in COLUMN_MAP if c not in raw.columns]
    if missing:
        raise ValueError(f"Workbook missing expected columns: {missing}")

    df = raw[list(COLUMN_MAP)].rename(columns=COLUMN_MAP).copy()

    for col in ("date_occurred", "date_modified", "date_reported"):
        df[col] = df[col].map(_parse_dmy)

    for col in ("harm", "near_miss"):
        df[col] = df[col].map(_parse_bool)

    for col in ("incident_involved", "department", "type_of_incident", "incident_type"):
        df[col] = df[col].map(lambda v: v.strip() if isinstance(v, str) else v)

    df = df[df["type_of_incident"].str.lower().isin(KEEP_TYPES)]
    df = df[df["date_occurred"].notna()].copy()

    df["year"] = df["date_occurred"].map(lambda d: d.year)
    df["days_to_report"] = [
        (r - o).days if (r and o) else None
        for r, o in zip(df["date_reported"], df["date_occurred"])
    ]
    df["days_to_close"] = [
        (m - r).days if (m and r) else None
        for m, r in zip(df["date_modified"], df["date_reported"])
    ]

    mapping = load_mapping(mapping_path)

    def _map(raw_dept):
        l1, l2 = map_department(raw_dept, mapping)
        if l1 is None:
            return ("(unmapped)", str(raw_dept) if raw_dept else "(blank)")
        return (l1, l2)

    mapped = df["department"].map(_map)
    df["dept_level1"] = mapped.map(lambda t: t[0])
    df["dept_level2"] = mapped.map(lambda t: t[1])

    return df.reset_index(drop=True)
