// src-tauri/src/models.rs

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Represents a complete email received by the catch-all server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Email {
    /// Unique identifier for the email
    pub id: String,
    /// Recipient email address(es) - can be single or multiple
    pub to: Vec<String>,
    /// Sender email address
    pub from: Option<String>,
    /// Display name of the sender (parsed from From header)
    pub sender_name: String,
    /// Display name of the recipient (parsed from To header)
    pub recipient_name: String,
    /// Email subject line
    pub subject: String,
    /// HTML body content (if available)
    pub html: Option<String>,
    /// Plain text body content (if available)
    pub text: Option<String>,
    /// CC recipients
    pub cc: Option<Vec<String>>,
    /// BCC recipients (may not always be available)
    pub bcc: Option<Vec<String>>,
    /// List of attachments
    pub attachments: Vec<Attachment>,
    /// Date and time the email was received
    pub date: DateTime<Utc>,
    /// Whether the email has been read in the UI
    pub is_read: bool,
    /// Raw email content for debugging/reprocessing
    #[serde(skip_serializing)]
    pub raw_content: Option<String>,
}

/// Represents an email attachment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attachment {
    /// Original filename of the attachment
    pub filename: String,
    /// Base64 encoded content (if stored in memory)
    pub content: Option<String>,
    /// File path if stored on disk
    pub path: Option<String>,
    /// MIME content type (e.g., "application/pdf")
    pub content_type: Option<String>,
    /// Content transfer encoding (e.g., "base64", "quoted-printable")
    pub encoding: Option<String>,
    /// Content-ID for inline attachments
    pub cid: Option<String>,
    /// Size of the attachment in bytes
    pub size: usize,
}

/// Server log entry for tracking server activity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    /// Timestamp of the log entry
    pub timestamp: DateTime<Utc>,
    /// Log level (INFO, WARN, ERROR, DEBUG)
    pub level: String,
    /// Log message content
    pub message: String,
    /// Optional context data (e.g., email ID, connection info)
    pub context: Option<String>,
}

/// Configuration for the SMTP server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    /// IP address to bind to (e.g., "127.0.0.1" or "0.0.0.0")
    pub host: String,
    /// Port to listen on (default: 2525 to avoid privileged port issues)
    pub port: u16,
    /// Maximum message size in bytes
    pub max_message_size: usize,
    /// Whether to require authentication (false for catch-all)
    pub require_auth: bool,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 2525,
            max_message_size: 25 * 1024 * 1024, // 25MB default
            require_auth: false,
        }
    }
}

/// Server status information sent to the frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatus {
    /// Whether the server is currently running
    pub is_running: bool,
    /// Server configuration if running
    pub config: Option<ServerConfig>,
    /// Total emails received since server start
    pub total_emails: usize,
    /// Number of unread emails
    pub unread_emails: usize,
}
