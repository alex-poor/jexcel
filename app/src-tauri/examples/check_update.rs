use incident_reporting_lib::updates::check;
#[tokio::main]
async fn main() { let s = check().await; println!("{}", serde_json::to_string_pretty(&s).unwrap()); }
