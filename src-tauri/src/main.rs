#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![quit_application])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn quit_application(window: tauri::Window) {
  window.app_handle().exit(0);
}
