// src-tauri/src/commands.rs

use crate::models::{Email, LogEntry, ServerConfig, ServerStatus};
use crate::smtp_server::{EmailEvent, SmtpServerManager};
use crate::AppState;
use chrono::{DateTime, Utc};
use tauri::{Emitter, State};

/// Starts the SMTP server with the provided configuration
#[tauri::command]
pub async fn start_smtp_server(
    app_handle: tauri::AppHandle,
    state: State<'_, AppState>,
    config: Option<ServerConfig>,
) -> std::result::Result<ServerStatus, String> {
    let config = config.unwrap_or_default();
    let port = config.port;
    let host = config.host.clone();

    // Log the start attempt
    {
        let mut store = state.email_store.write();
        store.add_log(
            "INFO",
            &format!("Starting SMTP server on {}:{}", host, port),
            None,
        );
    }

    // Create server manager
    let mut manager = SmtpServerManager::new(config.clone());

    // Start the server and get event receiver - await the async call
    let mut event_rx = match manager
        .start(state.email_store.clone(), app_handle.clone())
        .await
    {
        Ok(rx) => {
            // Log successful start
            let mut store = state.email_store.write();
            store.add_log(
                "INFO",
                &format!("SMTP server started successfully on {}:{}", host, port),
                None,
            );
            rx
        }
        Err(e) => {
            // Log the error
            let mut store = state.email_store.write();
            store.add_log(
                "ERROR",
                &format!("Failed to start SMTP server: {}", e),
                None,
            );
            return Err(e);
        }
    };

    // Store the manager in app state
    {
        let mut server = state.smtp_server.write();
        *server = Some(manager);
    }

    // Spawn a task to forward SMTP events to the frontend
    tokio::spawn(async move {
        while let Ok(event) = event_rx.recv().await {
            match event {
                EmailEvent::NewEmail(email) => {
                    // Log the new email
                    let sender = email.from.clone().unwrap_or_else(|| "Unknown".to_string());
                    let subject = email.subject.clone();
                    let id = &email.id;

                    // Log to console with email details
                    println!(
                        "📧 New email [{}] - From: {}, Subject: {}",
                        id, sender, subject
                    );

                    // The email is already stored by the SMTP server handler
                    let _ = app_handle.emit("new-email", &email);
                }
                EmailEvent::EmailRead(id) => {
                    let _ = app_handle.emit("email-read", &id);
                }
                EmailEvent::ServerStarted(status) => {
                    let _ = app_handle.emit("server-status", &status);
                }
                EmailEvent::ServerStopped => {
                    let status = ServerStatus {
                        is_running: false,
                        config: None,
                        total_emails: 0,
                        unread_emails: 0,
                    };
                    let _ = app_handle.emit("server-status", &status);
                }
            }
        }
    });

    Ok(ServerStatus {
        is_running: true,
        config: Some(ServerConfig {
            host,
            port,
            ..config
        }),
        total_emails: 0,
        unread_emails: 0,
    })
}

/// Stops the running SMTP server
#[tauri::command]
pub async fn stop_smtp_server(state: State<'_, AppState>) -> std::result::Result<bool, String> {
    let manager_opt = {
        let mut server = state.smtp_server.write();
        server.take()
    };

    match manager_opt {
        Some(mut manager) => {
            // Log the stop attempt
            {
                let mut store = state.email_store.write();
                store.add_log("INFO", "Stopping SMTP server...", None);
            }

            // Await the async stop call
            match manager.stop().await {
                Ok(()) => {
                    // Log successful stop
                    let mut store = state.email_store.write();
                    store.add_log("INFO", "SMTP server stopped successfully", None);
                    Ok(true)
                }
                Err(e) => {
                    // Log stop error
                    let mut store = state.email_store.write();
                    store.add_log("ERROR", &format!("Error stopping SMTP server: {}", e), None);
                    Err(e)
                }
            }
        }
        None => {
            // Log that server wasn't running
            let mut store = state.email_store.write();
            store.add_log("WARN", "Stop requested but server is not running", None);
            Err("Server is not running".to_string())
        }
    }
}

/// Retrieves all emails from the store
#[tauri::command]
pub fn get_all_emails(state: State<'_, AppState>) -> Vec<Email> {
    let store = state.email_store.read();
    store.get_all_emails().into_iter().cloned().collect()
}

/// Retrieves a specific email by ID
#[tauri::command]
pub fn get_email_by_id(
    state: State<'_, AppState>,
    email_id: String,
) -> std::result::Result<Email, String> {
    let store = state.email_store.read();
    store
        .get_email(&email_id)
        .cloned()
        .ok_or_else(|| format!("Email not found: {}", email_id))
}

/// Marks an email as read
#[tauri::command]
pub fn mark_email_as_read(
    app_handle: tauri::AppHandle,
    state: State<'_, AppState>,
    email_id: String,
) -> std::result::Result<bool, String> {
    let mut store = state.email_store.write();
    if store.mark_as_read(&email_id) {
        // Log the read action
        store.add_log(
            "DEBUG",
            &format!("Email marked as read: {}", email_id),
            Some(email_id.clone()),
        );
        let _ = app_handle.emit("email-read", &email_id);
        Ok(true)
    } else {
        Err(format!("Email not found: {}", email_id))
    }
}

/// Gets the count of unread emails
#[tauri::command]
pub fn get_unread_count(state: State<'_, AppState>) -> usize {
    let store = state.email_store.read();
    store.get_unread_count()
}

/// Retrieves server logs (original - without filtering)
#[tauri::command]
pub fn get_server_logs(state: State<'_, AppState>, limit: Option<usize>) -> Vec<LogEntry> {
    let store = state.email_store.read();
    let logs = store.get_logs();
    let logs: Vec<LogEntry> = logs.into_iter().cloned().collect();

    if let Some(limit) = limit {
        logs.into_iter().take(limit).collect()
    } else {
        logs
    }
}

/// Retrieves server logs with optional timestamp filtering
#[tauri::command]
pub fn get_server_logs_filtered(
    state: State<'_, AppState>,
    limit: Option<usize>,
    since_timestamp: Option<String>,
) -> Vec<LogEntry> {
    let store = state.email_store.read();
    let logs = store.get_logs();
    let logs: Vec<LogEntry> = logs.into_iter().cloned().collect();

    // Filter by timestamp if provided
    let filtered: Vec<LogEntry> = if let Some(since_str) = since_timestamp {
        // Try multiple parsing methods for flexibility
        let since_time = if let Ok(time) = since_str.parse::<DateTime<Utc>>() {
            Some(time)
        } else if let Ok(time) = chrono::DateTime::parse_from_rfc3339(&since_str) {
            Some(time.with_timezone(&Utc))
        } else if let Ok(time) =
            chrono::NaiveDateTime::parse_from_str(&since_str, "%Y-%m-%dT%H:%M:%S%.fZ")
        {
            Some(DateTime::from_naive_utc_and_offset(time, Utc))
        } else {
            eprintln!("Warning: Failed to parse timestamp filter: {}", since_str);
            None
        };

        match since_time {
            Some(since_time) => logs
                .into_iter()
                .filter(|log| log.timestamp > since_time)
                .collect(),
            None => {
                // If timestamp parsing fails completely, return all logs
                logs
            }
        }
    } else {
        logs
    };

    // Apply limit if provided
    if let Some(limit) = limit {
        filtered.into_iter().take(limit).collect()
    } else {
        filtered
    }
}

/// Clears all server logs from memory
#[tauri::command]
pub fn clear_server_logs(state: State<'_, AppState>) -> std::result::Result<(), String> {
    let mut store = state.email_store.write();
    store.clear_logs();

    // Add a log entry noting the clear action
    store.add_log("INFO", "Logs cleared by user", None);

    Ok(())
}

/// Gets the current server status
#[tauri::command]
pub fn get_server_status(state: State<'_, AppState>) -> ServerStatus {
    let store = state.email_store.read();
    store.get_server_status().clone()
}

/// Gets server logs since a specific log entry ID (for incremental updates)
#[tauri::command]
pub fn get_server_logs_since_id(
    state: State<'_, AppState>,
    since_id: Option<usize>,
    limit: Option<usize>,
) -> Vec<LogEntry> {
    let store = state.email_store.read();
    let logs = store.get_logs();
    let logs: Vec<LogEntry> = logs.into_iter().cloned().collect();

    let filtered: Vec<LogEntry> = if let Some(since_id) = since_id {
        // This assumes logs have sequential IDs or we use index
        // Since LogEntry doesn't have an ID field, we'll use index-based filtering
        if since_id < logs.len() {
            logs.into_iter().skip(since_id).collect()
        } else {
            vec![]
        }
    } else {
        logs
    };

    if let Some(limit) = limit {
        filtered.into_iter().take(limit).collect()
    } else {
        filtered
    }
}

/// Gets the total number of log entries
#[tauri::command]
pub fn get_log_count(state: State<'_, AppState>) -> usize {
    let store = state.email_store.read();
    store.get_logs().len()
}

/// Deletes a specific email by ID
#[tauri::command]
pub fn delete_email(
    state: State<'_, AppState>,
    email_id: String,
) -> std::result::Result<bool, String> {
    let mut store = state.email_store.write();
    if store.delete_email(&email_id) {
        store.add_log(
            "INFO",
            &format!("Email deleted: {}", email_id),
            Some(email_id),
        );
        Ok(true)
    } else {
        Err(format!("Email not found: {}", email_id))
    }
}

/// Clears all emails from the store
#[tauri::command]
pub fn clear_all_emails(state: State<'_, AppState>) -> std::result::Result<(), String> {
    let mut store = state.email_store.write();
    store.clear_all();
    store.add_log("INFO", "All emails cleared by user", None);
    Ok(())
}

/// Gets server configuration
#[tauri::command]
pub fn get_server_config(
    state: State<'_, AppState>,
) -> std::result::Result<Option<ServerConfig>, String> {
    let status = {
        let store = state.email_store.read();
        store.get_server_status().clone()
    };

    Ok(status.config)
}

/// Marks an email as unread
#[tauri::command]
pub fn mark_email_as_unread(
    app_handle: tauri::AppHandle,
    state: State<'_, AppState>,
    email_id: String,
) -> std::result::Result<bool, String> {
    let mut store = state.email_store.write();
    if store.mark_as_unread(&email_id) {
        // Log the unread action
        store.add_log(
            "DEBUG",
            &format!("Email marked as unread: {}", email_id),
            Some(email_id.clone()),
        );
        let _ = app_handle.emit("email-unread", &email_id);
        Ok(true)
    } else {
        Err(format!("Email not found: {}", email_id))
    }
}
