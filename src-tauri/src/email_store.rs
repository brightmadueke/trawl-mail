// src-tauri/src/email_store.rs

use crate::models::{Email, LogEntry, ServerStatus};
use std::collections::HashMap;

/// In-memory storage for emails and server logs
/// Can be extended to use SQLite or another persistent storage
pub struct EmailStore {
    /// HashMap of all emails indexed by their ID for O(1) lookup
    emails: HashMap<String, Email>,
    /// Ordered list of email IDs to maintain chronological order
    email_order: Vec<String>,
    /// Circular buffer for server logs
    logs: Vec<LogEntry>,
    /// Maximum number of log entries to keep in memory
    max_logs: usize,
    /// Current server status
    server_status: ServerStatus,
}

impl EmailStore {
    /// Creates a new empty email store
    pub fn new() -> Self {
        Self {
            emails: HashMap::new(),
            email_order: Vec::new(),
            logs: Vec::with_capacity(1000),
            max_logs: 1000, // Keep last 1000 log entries
            server_status: ServerStatus {
                is_running: false,
                config: None,
                total_emails: 0,
                unread_emails: 0,
            },
        }
    }

    /// Adds a new email to the store
    /// Returns the email ID for reference
    pub fn add_email(&mut self, email: Email) -> String {
        let id = email.id.clone();
        let is_unread = !email.is_read;

        self.emails.insert(id.clone(), email);
        self.email_order.push(id.clone());

        // Update counters
        self.server_status.total_emails = self.email_order.len();
        if is_unread {
            self.server_status.unread_emails += 1;
        }

        id
    }

    /// Retrieves an email by its ID
    pub fn get_email(&self, id: &str) -> Option<&Email> {
        self.emails.get(id)
    }

    /// Returns all emails in chronological order (newest first)
    pub fn get_all_emails(&self) -> Vec<&Email> {
        self.email_order
            .iter()
            .rev() // Reverse for newest first
            .filter_map(|id| self.emails.get(id))
            .collect()
    }

    /// Marks an email as read
    /// Returns true if the email was found and updated
    pub fn mark_as_read(&mut self, id: &str) -> bool {
        if let Some(email) = self.emails.get_mut(id) {
            if !email.is_read {
                email.is_read = true;
                self.server_status.unread_emails =
                    self.server_status.unread_emails.saturating_sub(1);
            }
            true
        } else {
            false
        }
    }

    /// Gets the count of unread emails
    pub fn get_unread_count(&self) -> usize {
        self.server_status.unread_emails
    }

    /// Adds a log entry to the in-memory log store
    /// Automatically trims old entries if max capacity is reached
    pub fn add_log(&mut self, level: &str, message: &str, context: Option<String>) {
        let entry = LogEntry {
            timestamp: chrono::Utc::now(),
            level: level.to_string(),
            message: message.to_string(),
            context,
        };

        self.logs.push(entry);

        // Maintain circular buffer by removing oldest entries
        if self.logs.len() > self.max_logs {
            let excess = self.logs.len() - self.max_logs;
            self.logs.drain(0..excess);
        }
    }

    /// Returns all log entries (newest first)
    pub fn get_logs(&self) -> Vec<&LogEntry> {
        self.logs.iter().rev().collect()
    }

    /// Clears all logs from memory
    pub fn clear_logs(&mut self) {
        self.logs.clear();
    }

    /// Updates the server status
    pub fn update_server_status(&mut self, status: ServerStatus) {
        self.server_status = status;
    }

    /// Gets the current server status
    pub fn get_server_status(&self) -> &ServerStatus {
        &self.server_status
    }

    /// Clears all emails and resets counters
    /// Useful for testing or resetting the state
    #[allow(dead_code)]
    pub fn clear_all(&mut self) {
        self.emails.clear();
        self.email_order.clear();
        self.logs.clear();
        self.server_status.total_emails = 0;
        self.server_status.unread_emails = 0;
    }

    /// Deletes a specific email by ID
    /// Returns true if the email was found and deleted
    #[allow(dead_code)]
    pub fn delete_email(&mut self, id: &str) -> bool {
        if let Some(email) = self.emails.remove(id) {
            self.email_order.retain(|x| x != id);
            self.server_status.total_emails = self.email_order.len();
            if !email.is_read {
                self.server_status.unread_emails =
                    self.server_status.unread_emails.saturating_sub(1);
            }
            true
        } else {
            false
        }
    }

    // Add to src-tauri/src/email_store.rs

    pub fn mark_as_unread(&mut self, email_id: &str) -> bool {
        if let Some(email) = self.emails.get_mut(email_id) {
            email.is_read = false;
            true
        } else {
            false
        }
    }
}
