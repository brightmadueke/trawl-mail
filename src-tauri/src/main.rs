// src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod email_store;
mod models;
mod smtp_server;

use email_store::EmailStore;
use parking_lot::RwLock;
use smtp_server::SmtpServerManager;
use std::sync::Arc;

/// Main application state shared across Tauri commands
pub struct AppState {
    /// The email store containing all received emails and their metadata
    pub email_store: Arc<RwLock<EmailStore>>,
    /// Manager for the SMTP server lifecycle
    pub smtp_server: Arc<RwLock<Option<SmtpServerManager>>>,
}

fn main() {
    // Initialize logging for the application
    env_logger::init();

    // Create the shared application state
    let app_state = AppState {
        email_store: Arc::new(RwLock::new(EmailStore::new())),
        smtp_server: Arc::new(RwLock::new(None)),
    };

    // Build and run the Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::start_smtp_server,
            commands::stop_smtp_server,
            commands::get_all_emails,
            commands::get_email_by_id,
            commands::mark_email_as_read,
            commands::get_unread_count,
            commands::get_server_logs,
            commands::get_server_status,
            commands::clear_server_logs,
            commands::get_server_config,
            commands::get_server_logs_filtered,
            commands::get_server_logs_since_id,
            commands::get_log_count,
            commands::delete_email,
            commands::clear_all_emails,
            commands::mark_email_as_unread,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
