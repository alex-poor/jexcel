pub mod commands;
pub mod ingest;
pub mod mapping;
pub mod report;
pub mod types;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = AppState::new().expect("failed to load embedded mapping");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::parse_workbook,
            commands::parse_summary,
            commands::get_hierarchy,
            commands::get_slice,
            commands::clear_workbook,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
