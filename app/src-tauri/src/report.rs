//! Port of Python `reporting.py` — aggregations per slice.

use std::collections::{BTreeMap, BTreeSet};

use crate::types::{HierarchyNode, Incident, SliceData, Timeframe, TypeSplit};

pub struct Filter<'a> {
    pub level1: Option<&'a str>,
    pub level2: Option<&'a str>,
    pub years: Option<&'a [i32]>,
}

impl<'a> Filter<'a> {
    pub fn any_set(&self) -> bool {
        self.level1.is_some() || self.level2.is_some() || self.years.is_some()
    }
}

fn matches(inc: &Incident, f: &Filter) -> bool {
    if let Some(l1) = f.level1 {
        if !inc.dept_level1.eq_ignore_ascii_case(l1) {
            return false;
        }
    }
    if let Some(l2) = f.level2 {
        match inc.dept_level2.as_deref() {
            Some(v) => {
                if !v.eq_ignore_ascii_case(l2) {
                    return false;
                }
            }
            None => return false,
        }
    }
    if let Some(years) = f.years {
        if !years.contains(&inc.year) {
            return false;
        }
    }
    true
}

pub fn aggregate(incidents: &[Incident], filter: &Filter, years: &[i32]) -> SliceData {
    // Ensure every year in the window has an entry (even if zero).
    let mut count: BTreeMap<i32, usize> = years.iter().map(|y| (*y, 0)).collect();
    let mut ohs_count: BTreeMap<i32, usize> = years.iter().map(|y| (*y, 0)).collect();
    let mut haz_count: BTreeMap<i32, usize> = years.iter().map(|y| (*y, 0)).collect();
    let mut subcat: BTreeMap<i32, BTreeMap<String, usize>> =
        years.iter().map(|y| (*y, BTreeMap::new())).collect();
    let mut lag_sum: BTreeMap<i32, (f64, usize)> = years.iter().map(|y| (*y, (0.0, 0))).collect();
    let mut close_sum: BTreeMap<i32, (f64, usize)> = years.iter().map(|y| (*y, (0.0, 0))).collect();
    let mut harm_yes: BTreeMap<i32, usize> = years.iter().map(|y| (*y, 0)).collect();
    let mut nm_yes: BTreeMap<i32, usize> = years.iter().map(|y| (*y, 0)).collect();

    for inc in incidents {
        if !matches(inc, filter) {
            continue;
        }
        if !count.contains_key(&inc.year) {
            continue;
        }
        *count.get_mut(&inc.year).unwrap() += 1;

        match inc.type_of_incident_lower.as_str() {
            "occ health/safety" => *ohs_count.get_mut(&inc.year).unwrap() += 1,
            "hazards" => *haz_count.get_mut(&inc.year).unwrap() += 1,
            _ => {}
        }

        if let Some(cat) = &inc.incident_type {
            *subcat.get_mut(&inc.year).unwrap().entry(cat.clone()).or_insert(0) += 1;
        } else {
            *subcat
                .get_mut(&inc.year)
                .unwrap()
                .entry("(unspecified)".to_string())
                .or_insert(0) += 1;
        }

        if let Some(d) = inc.days_to_report {
            let (s, n) = lag_sum.get_mut(&inc.year).unwrap();
            *s += d as f64;
            *n += 1;
        }
        if let Some(d) = inc.days_to_close {
            let (s, n) = close_sum.get_mut(&inc.year).unwrap();
            *s += d as f64;
            *n += 1;
        }
        if inc.harm == Some(true) {
            *harm_yes.get_mut(&inc.year).unwrap() += 1;
        }
        if inc.near_miss == Some(true) {
            *nm_yes.get_mut(&inc.year).unwrap() += 1;
        }
    }

    let type_split: BTreeMap<i32, TypeSplit> = years
        .iter()
        .map(|y| {
            let total = count[y] as f64;
            if total > 0.0 {
                (
                    *y,
                    TypeSplit {
                        ohs: ohs_count[y] as f64 / total,
                        haz: haz_count[y] as f64 / total,
                    },
                )
            } else {
                (*y, TypeSplit { ohs: 0.0, haz: 0.0 })
            }
        })
        .collect();

    let timeframe: BTreeMap<i32, Timeframe> = years
        .iter()
        .map(|y| {
            let (ls, ln) = lag_sum[y];
            let (cs, cn) = close_sum[y];
            (
                *y,
                Timeframe {
                    lag: if ln > 0 { ls / ln as f64 } else { 0.0 },
                    closure: if cn > 0 { cs / cn as f64 } else { 0.0 },
                },
            )
        })
        .collect();

    let harm_rate: BTreeMap<i32, f64> = years
        .iter()
        .map(|y| {
            let total = count[y] as f64;
            (*y, if total > 0.0 { harm_yes[y] as f64 / total } else { 0.0 })
        })
        .collect();

    let near_miss_rate: BTreeMap<i32, f64> = years
        .iter()
        .map(|y| {
            let total = count[y] as f64;
            (*y, if total > 0.0 { nm_yes[y] as f64 / total } else { 0.0 })
        })
        .collect();

    SliceData {
        count,
        type_split,
        subcat,
        timeframe,
        harm_rate,
        near_miss_rate,
    }
}

/// Build the hierarchy tree used by the Sidebar. Counts are over all
/// incidents (unfiltered by year) — matching the mock's behaviour.
pub fn build_hierarchy(incidents: &[Incident]) -> Vec<HierarchyNode> {
    let mut by_l1: BTreeMap<String, BTreeMap<String, usize>> = BTreeMap::new();
    let mut l1_total: BTreeMap<String, usize> = BTreeMap::new();
    let mut l1_order: Vec<String> = Vec::new();
    let mut seen_l1: BTreeSet<String> = BTreeSet::new();

    for inc in incidents {
        if !seen_l1.contains(&inc.dept_level1) {
            seen_l1.insert(inc.dept_level1.clone());
            l1_order.push(inc.dept_level1.clone());
        }
        *l1_total.entry(inc.dept_level1.clone()).or_insert(0) += 1;

        let l2 = inc.dept_level2.clone().unwrap_or_else(|| "(none)".to_string());
        *by_l1
            .entry(inc.dept_level1.clone())
            .or_default()
            .entry(l2)
            .or_insert(0) += 1;
    }

    // Sort level-1s by total desc, ties broken by first-seen order.
    let mut order = l1_order.clone();
    order.sort_by(|a, b| {
        l1_total
            .get(b)
            .cmp(&l1_total.get(a))
            .then_with(|| l1_order.iter().position(|x| x == a).cmp(&l1_order.iter().position(|x| x == b)))
    });

    order
        .into_iter()
        .map(|l1| {
            let count = l1_total.get(&l1).copied().unwrap_or(0);
            let children_map = by_l1.remove(&l1).unwrap_or_default();
            let mut children: Vec<HierarchyNode> = children_map
                .into_iter()
                .map(|(label, c)| HierarchyNode {
                    id: slugify(&format!("{l1}__{label}")),
                    label,
                    count: c,
                    children: None,
                })
                .collect();
            children.sort_by(|a, b| b.count.cmp(&a.count).then_with(|| a.label.cmp(&b.label)));
            HierarchyNode {
                id: slugify(&l1),
                label: l1,
                count,
                children: Some(children),
            }
        })
        .collect()
}

fn slugify(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut prev_dash = false;
    for ch in s.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
            prev_dash = false;
        } else if !prev_dash {
            out.push('-');
            prev_dash = true;
        }
    }
    out.trim_matches('-').to_string()
}

pub fn default_years_window(today_year: i32) -> Vec<i32> {
    (today_year - 4..=today_year).collect()
}

/// Years that actually appear in the data, sorted.
pub fn years_in_data(incidents: &[Incident]) -> Vec<i32> {
    let mut years: BTreeSet<i32> = BTreeSet::new();
    for inc in incidents {
        years.insert(inc.year);
    }
    years.into_iter().collect()
}
