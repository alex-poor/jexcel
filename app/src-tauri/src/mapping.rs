//! Department grouping — direct port of Python `mapping.py`.
//!
//! The CSV is baked in at compile time so there's nothing to install at
//! runtime. A future iteration can expose an override path via Settings.

use std::collections::HashMap;

const EMBEDDED_CSV: &str = include_str!("../resources/department_mapping.csv");

#[derive(Debug, Clone)]
pub struct DepartmentMapping {
    /// Key is `normalise_key(raw)` — case-insensitive, collapsed whitespace.
    lookup: HashMap<String, (String, Option<String>)>,
}

impl DepartmentMapping {
    pub fn load_embedded() -> Result<Self, String> {
        Self::from_csv_str(EMBEDDED_CSV)
    }

    pub fn from_csv_str(csv_text: &str) -> Result<Self, String> {
        let mut reader = csv::Reader::from_reader(csv_text.as_bytes());
        let mut rows: Vec<(String, String, Option<String>)> = Vec::new();

        for record in reader.deserialize::<Row>() {
            let Row { original, new } = record.map_err(|e| format!("bad mapping row: {e}"))?;
            let orig = original.trim().to_string();
            if orig.is_empty() || new.trim().is_empty() {
                continue;
            }
            let (l1, l2) = split_once_colon(&new);
            let l1 = collapse_ws(&l1);
            let l2 = l2.map(|s| collapse_ws(&s)).filter(|s| !s.is_empty());
            if l1.is_empty() {
                continue;
            }
            rows.push((orig, l1, l2));
        }

        // First-seen canonical display per lowercase key.
        let mut canon_l1: HashMap<String, String> = HashMap::new();
        let mut canon_l2: HashMap<(String, String), String> = HashMap::new();
        for (_, l1, l2) in &rows {
            canon_l1.entry(l1.to_lowercase()).or_insert_with(|| l1.clone());
            if let Some(l2v) = l2 {
                canon_l2
                    .entry((l1.to_lowercase(), l2v.to_lowercase()))
                    .or_insert_with(|| l2v.clone());
            }
        }

        let mut lookup: HashMap<String, (String, Option<String>)> = HashMap::new();
        for (orig, l1, l2) in rows {
            let l1c = canon_l1
                .get(&l1.to_lowercase())
                .cloned()
                .unwrap_or_else(|| l1.clone());
            let l2c = l2
                .as_ref()
                .and_then(|l2v| canon_l2.get(&(l1.to_lowercase(), l2v.to_lowercase())).cloned());
            lookup.insert(normalise_key(&orig), (l1c, l2c));
        }

        Ok(Self { lookup })
    }

    /// Returns `(level1, level2_or_None)` if mapped, else None.
    pub fn map(&self, raw: &str) -> Option<(String, Option<String>)> {
        self.lookup.get(&normalise_key(raw)).cloned()
    }
}

#[derive(serde::Deserialize)]
struct Row {
    original: String,
    new: String,
}

fn split_once_colon(s: &str) -> (String, Option<String>) {
    match s.split_once(':') {
        Some((l, r)) => (l.to_string(), Some(r.to_string())),
        None => (s.to_string(), None),
    }
}

fn collapse_ws(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn normalise_key(s: &str) -> String {
    collapse_ws(s).to_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn loads_embedded_mapping() {
        let m = DepartmentMapping::load_embedded().unwrap();
        assert_eq!(
            m.map("CSSD"),
            Some(("Theatre".to_string(), Some("CSSD".to_string())))
        );
        // Case-insensitive + collapse whitespace
        assert_eq!(
            m.map("  cssd  "),
            Some(("Theatre".to_string(), Some("CSSD".to_string())))
        );
        // Trailing space in original ("Pre-Admission ") still matches
        assert_eq!(
            m.map("Pre-Admission"),
            Some((
                "Patient services".to_string(),
                Some("Pre-Admission".to_string())
            ))
        );
        // Level-1-only (Administration)
        assert_eq!(m.map("Administration"), Some(("Administration".to_string(), None)));
        assert!(m.map("Not A Dept").is_none());
    }
}
