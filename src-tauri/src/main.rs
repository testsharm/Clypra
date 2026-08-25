// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    use std::env;
    use std::path::PathBuf;

    // Add the resources folder to the DLL search path
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let resources_dir = exe_dir.join("resources");
            if resources_dir.exists() {
                let current_path = env::var("PATH").unwrap_or_default();
                let new_path = format!("{};{}", resources_dir.display(), current_path);
                env::set_var("PATH", &new_path);
            }
        }
    }

    tauri_app_lib::run()
}
