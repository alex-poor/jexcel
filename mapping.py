"""Department grouping: raw Department/Area → (level1, level2_or_None).

The mapping source lives in department_mapping.csv so it can be edited
without touching code. Readme §department grouping is the spec.

Normalisation:
- Lookup is case-insensitive and whitespace-tolerant (strip + collapse
  internal whitespace), so "Pre-Admission " and "pre-admission" both hit
  the same row.
- Level display strings collapse by lowercase key but preserve the
  first-seen canonical form, so "Commercial: Facilities" and
  "Commercial: facilities" group together under whichever spelling
  appeared first in the CSV.
- Split is on the FIRST ":" only. A value like
  "Commercial: Facilities: Car park" becomes level1="Commercial",
  level2="Facilities: Car park".
"""

from __future__ import annotations

import csv
import re
from pathlib import Path


Mapping = dict[str, tuple[str, str | None]]


def _collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip())


def _norm_key(s: str | None) -> str:
    return _collapse_ws(str(s)).lower() if s is not None else ""


def load_mapping(path: str | Path) -> Mapping:
    rows: list[tuple[str, str, str | None]] = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            orig = row.get("original")
            new = row.get("new")
            if not orig or not new:
                continue
            parts = new.split(":", 1)
            l1 = _collapse_ws(parts[0])
            l2 = _collapse_ws(parts[1]) if len(parts) > 1 else None
            if not l1:
                continue
            if l2 == "":
                l2 = None
            rows.append((orig.strip(), l1, l2))

    # first-seen canonical display per lowercase key
    canon_l1: dict[str, str] = {}
    canon_l2: dict[tuple[str, str], str] = {}
    for _, l1, l2 in rows:
        canon_l1.setdefault(l1.lower(), l1)
        if l2 is not None:
            canon_l2.setdefault((l1.lower(), l2.lower()), l2)

    mapping: Mapping = {}
    for orig, l1, l2 in rows:
        l1c = canon_l1[l1.lower()]
        l2c = canon_l2[(l1.lower(), l2.lower())] if l2 is not None else None
        mapping[_norm_key(orig)] = (l1c, l2c)
    return mapping


def map_department(raw: object, mapping: Mapping) -> tuple[str | None, str | None]:
    if raw is None:
        return (None, None)
    return mapping.get(_norm_key(str(raw)), (None, None))
