//! CLI harness — loads a workbook and prints a slice as JSON.
//! Used for parity-testing against the Python reference implementation.
//!
//! Usage:
//!   cargo run --bin ingest-cli -- path/to/file.xlsx
//!   cargo run --bin ingest-cli -- path/to/file.xlsx --level1 Theatre
//!   cargo run --bin ingest-cli -- path/to/file.xlsx --level1 Theatre --level2 "Theatre suite"
//!   cargo run --bin ingest-cli -- path/to/file.xlsx --years 2022 2023 2024 2025 2026
//!   cargo run --bin ingest-cli -- path/to/file.xlsx --hierarchy

use incident_reporting_lib::{
    ingest::load_workbook,
    mapping::DepartmentMapping,
    report::{aggregate, build_hierarchy, default_years_window, Filter},
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() {
        eprintln!("usage: ingest-cli <path.xlsx> [--level1 X] [--level2 Y] [--years Y1 Y2 ...] [--hierarchy] [--summary]");
        std::process::exit(2);
    }
    let path = &args[0];
    let mut level1: Option<String> = None;
    let mut level2: Option<String> = None;
    let mut years: Option<Vec<i32>> = None;
    let mut mode = Mode::Slice;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--level1" => {
                level1 = Some(args[i + 1].clone());
                i += 2;
            }
            "--level2" => {
                level2 = Some(args[i + 1].clone());
                i += 2;
            }
            "--years" => {
                let mut ys = Vec::new();
                i += 1;
                while i < args.len() && !args[i].starts_with("--") {
                    ys.push(args[i].parse()?);
                    i += 1;
                }
                years = Some(ys);
            }
            "--hierarchy" => {
                mode = Mode::Hierarchy;
                i += 1;
            }
            "--summary" => {
                mode = Mode::Summary;
                i += 1;
            }
            other => {
                eprintln!("unknown arg: {other}");
                std::process::exit(2);
            }
        }
    }

    let mapping = DepartmentMapping::load_embedded()?;
    let res = load_workbook(path, &mapping)?;

    match mode {
        Mode::Summary => {
            println!(
                "total_rows: {}\ndropped_rows: {}\nfiltered_out_rows: {}\nkept: {}\nunmapped: {:?}",
                res.total_rows,
                res.dropped_rows,
                res.filtered_out_rows,
                res.incidents.len(),
                res.unmapped_depts,
            );
        }
        Mode::Hierarchy => {
            let tree = build_hierarchy(&res.incidents);
            println!("{}", serde_json::to_string_pretty(&tree)?);
        }
        Mode::Slice => {
            let years_window =
                years.unwrap_or_else(|| default_years_window(current_year()));
            let filter = Filter {
                level1: level1.as_deref(),
                level2: level2.as_deref(),
                years: None,
            };
            let slice = aggregate(&res.incidents, &filter, &years_window);
            println!("{}", serde_json::to_string_pretty(&slice)?);
        }
    }
    Ok(())
}

fn current_year() -> i32 {
    chrono::Local::now()
        .format("%Y")
        .to_string()
        .parse()
        .unwrap_or(2026)
}

enum Mode {
    Slice,
    Hierarchy,
    Summary,
}
