// src-tauri/src/smtp_server.rs

use crate::email_store::EmailStore;
use crate::models::{Attachment, Email, ServerConfig, ServerStatus};
use chrono::Utc;
use mailparse::{parse_mail, MailHeaderMap};
use parking_lot::RwLock;
use smtpd::{
    async_trait, start_server, AuthData, Response, Session, SmtpConfig, SmtpHandler,
    SmtpHandlerFactory,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpSocket};
use tokio::sync::broadcast;
use uuid::Uuid;

/// Type alias for the shared email store with broadcast capability
type SharedEmailStore = Arc<RwLock<EmailStore>>;

/// Event emitted when a new email is received
#[derive(Debug, Clone)]
pub enum EmailEvent {
    NewEmail(Email),
    EmailRead(String),
    ServerStarted(ServerStatus),
    ServerStopped,
}

/// Helper function to create a TcpListener with SO_REUSEADDR
/// This allows the port to be reused quickly after server shutdown
async fn create_reusable_listener(addr: &str) -> std::io::Result<TcpListener> {
    let socket_addr: SocketAddr = addr
        .parse()
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;

    let socket = if socket_addr.is_ipv4() {
        TcpSocket::new_v4()?
    } else {
        TcpSocket::new_v6()?
    };

    // Set SO_REUSEADDR to allow rapid restart
    socket.set_reuseaddr(true)?;
    socket.bind(socket_addr)?;

    // Listen with a reasonable backlog
    socket.listen(1024)
}

/// Manages the SMTP server lifecycle and configuration
pub struct SmtpServerManager {
    /// Handle to gracefully shutdown the server
    shutdown_tx: Option<tokio::sync::oneshot::Sender<()>>,
    /// Broadcast channel for notifying frontend of new emails
    event_tx: broadcast::Sender<EmailEvent>,
    /// Current server configuration
    config: ServerConfig,
    /// Join handle for the server task to allow waiting for shutdown
    server_task: Option<tokio::task::JoinHandle<()>>,
}

impl SmtpServerManager {
    /// Creates a new server manager with event broadcasting capability
    pub fn new(config: ServerConfig) -> Self {
        let (event_tx, _) = broadcast::channel(100);
        Self {
            shutdown_tx: None,
            event_tx,
            config,
            server_task: None,
        }
    }

    /// Starts the SMTP server in a background task
    /// Returns a receiver for email events
    pub async fn start(
        &mut self,
        email_store: SharedEmailStore,
        _app_handle: tauri::AppHandle,
    ) -> std::result::Result<broadcast::Receiver<EmailEvent>, String> {
        // Check if server is already running
        if self.shutdown_tx.is_some() {
            return Err("Server is already running".to_string());
        }

        let addr = format!("{}:{}", self.config.host, self.config.port);

        // Try to bind with SO_REUSEADDR to check port availability
        match create_reusable_listener(&addr).await {
            Ok(listener) => {
                // Port is available, drop the test listener
                drop(listener);

                // Small delay to ensure the OS releases the port
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
            }
            Err(e) => {
                let error_msg = format!(
                    "Port {} is not available: {}. The port might still be in use from a previous instance. Please wait a moment and try again.",
                    self.config.port, e
                );
                return Err(error_msg);
            }
        }

        let config = self.config.clone();
        let event_tx = self.event_tx.clone();
        let store = email_store.clone();

        // Create shutdown channel for graceful termination
        let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();
        self.shutdown_tx = Some(shutdown_tx);

        // Clone event_tx for the SMTP handler
        let handler_event_tx = event_tx.clone();

        log::info!("Starting SMTP server on {}", addr);

        // Update store with server status
        let (total_emails, unread_emails) = {
            let store = store.read();
            let status = store.get_server_status();
            (status.total_emails, status.unread_emails)
        };

        {
            let mut store = store.write();
            store.add_log("INFO", &format!("SMTP server starting on {}", addr), None);
            store.update_server_status(ServerStatus {
                is_running: true,
                config: Some(config.clone()),
                total_emails,
                unread_emails,
            });

            // Notify frontend that server has started
            let _ = event_tx.send(EmailEvent::ServerStarted(store.get_server_status().clone()));
        }

        // Create SMTP configuration
        let smtp_config = SmtpConfig {
            bind_addr: addr.clone(),
            require_auth: config.require_auth,
            auth_machs: vec![],
            ..Default::default()
        };

        // Create the handler factory
        let factory = CatchAllHandlerFactory {
            email_store: store.clone(),
            event_tx: handler_event_tx,
        };

        // Start the SMTP server in a background task with shutdown handling
        let server_store = store.clone();
        let server_event_tx = event_tx.clone();
        let server_addr = addr.clone();

        let server_task = tokio::spawn(async move {
            log::info!("SMTP server listening on {}", server_addr);

            // Create the server future
            let server_future = start_server(smtp_config, factory);

            // Race between server running and shutdown signal
            tokio::select! {
                result = server_future => {
                    match result {
                        Ok(_) => log::info!("SMTP server stopped normally"),
                        Err(e) => log::error!("SMTP server error: {}", e),
                    }
                }
                _ = shutdown_rx => {
                    log::info!("SMTP server received shutdown signal, terminating gracefully");
                    // The server will stop when the task exits and drops all resources
                    // Give it a moment to clean up
                    tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                }
            }

            // Update store with stopped status
            let (total_emails, unread_emails) = {
                let store = server_store.read();
                let status = store.get_server_status();
                (status.total_emails, status.unread_emails)
            };

            let mut store = server_store.write();
            store.add_log("INFO", "SMTP server stopped", None);
            store.update_server_status(ServerStatus {
                is_running: false,
                config: None,
                total_emails,
                unread_emails,
            });
            let _ = server_event_tx.send(EmailEvent::ServerStopped);

            log::info!("SMTP server cleanup completed");
        });

        self.server_task = Some(server_task);

        // Return the event receiver for the frontend
        Ok(self.event_tx.subscribe())
    }

    /// Stops the running SMTP server with proper cleanup
    pub async fn stop(&mut self) -> std::result::Result<(), String> {
        // Check if server is running
        let shutdown_tx = self
            .shutdown_tx
            .take()
            .ok_or_else(|| "Server is not running".to_string())?;

        let server_task = self
            .server_task
            .take()
            .ok_or_else(|| "Server task not found".to_string())?;

        // Send shutdown signal
        log::info!("Sending shutdown signal to SMTP server");
        let _ = shutdown_tx.send(());

        // Wait for the server task to finish with timeout
        match tokio::time::timeout(std::time::Duration::from_secs(5), server_task).await {
            Ok(Ok(())) => {
                log::info!("SMTP server shut down gracefully");
            }
            Ok(Err(e)) => {
                log::error!("SMTP server task panicked: {}", e);
            }
            Err(_) => {
                log::warn!("SMTP server shutdown timed out after 5 seconds");
                // The task will be cleaned up when it goes out of scope
            }
        }

        // Additional delay to ensure the OS releases the port
        tokio::time::sleep(std::time::Duration::from_millis(1000)).await;

        log::info!("SMTP server shutdown complete");
        Ok(())
    }

    /// Checks if the server is currently running
    pub fn is_running(&self) -> bool {
        self.shutdown_tx.is_some()
    }
}

/// Factory for creating CatchAllHandler instances per session
struct CatchAllHandlerFactory {
    email_store: SharedEmailStore,
    event_tx: broadcast::Sender<EmailEvent>,
}

impl SmtpHandlerFactory for CatchAllHandlerFactory {
    type Handler = CatchAllHandler;

    fn new_handler(&self, _session: &Session) -> Self::Handler {
        CatchAllHandler {
            email_store: self.email_store.clone(),
            event_tx: self.event_tx.clone(),
        }
    }
}

/// Custom SMTP handler that accepts all emails
/// Implements the catch-all functionality
pub struct CatchAllHandler {
    email_store: SharedEmailStore,
    event_tx: broadcast::Sender<EmailEvent>,
}

impl CatchAllHandler {
    /// Parses raw email data into our Email model
    /// Handles MIME parsing, attachments, and header extraction
    fn parse_raw_email(raw_data: &[u8]) -> std::result::Result<Email, String> {
        let parsed = parse_mail(raw_data).map_err(|e| format!("Failed to parse email: {}", e))?;

        // Extract headers using the correct API
        let from = parsed.headers.get_first_value("From").unwrap_or_default();
        let to = parsed.headers.get_first_value("To").unwrap_or_default();
        let subject = parsed
            .headers
            .get_first_value("Subject")
            .unwrap_or_default();
        let cc = parsed.headers.get_first_value("Cc");
        let date = parsed
            .headers
            .get_first_value("Date")
            .and_then(|d| chrono::DateTime::parse_from_rfc2822(&d).ok())
            .map(|d| d.with_timezone(&Utc))
            .unwrap_or_else(Utc::now);

        // Parse sender name and email from "Name <email>" format
        let (sender_name, sender_email) = Self::parse_address(&from);
        let (recipient_name, _) = Self::parse_address(&to);

        // Extract body content and attachments
        let (text_body, html_body, attachments) = Self::extract_content(&parsed);

        Ok(Email {
            id: Uuid::new_v4().to_string(),
            to: Self::parse_address_list(&to),
            from: Some(sender_email.unwrap_or_default()),
            sender_name,
            recipient_name,
            subject,
            html: html_body,
            text: text_body,
            cc: cc.map(|c| Self::parse_address_list(&c)),
            bcc: None,
            attachments,
            date,
            is_read: false,
            raw_content: Some(String::from_utf8_lossy(raw_data).to_string()),
        })
    }

    /// Parses "Name <email@domain.com>" format into separate components
    fn parse_address(address: &str) -> (String, Option<String>) {
        if address.is_empty() {
            return ("Unknown".to_string(), None);
        }

        if let Some(start) = address.find('<') {
            if let Some(end) = address.find('>') {
                let name = address[..start].trim().trim_matches('"').to_string();
                let email = address[start + 1..end].trim().to_string();
                return (name, Some(email));
            }
        }

        (String::new(), Some(address.to_string()))
    }

    /// Parses comma-separated list of email addresses
    fn parse_address_list(list: &str) -> Vec<String> {
        list.split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect()
    }

    /// Recursively extracts text, HTML, and attachments from MIME structure
    fn extract_content(
        parsed: &mailparse::ParsedMail,
    ) -> (Option<String>, Option<String>, Vec<Attachment>) {
        let mut text_body = None;
        let mut html_body = None;
        let mut attachments = Vec::new();

        if parsed.subparts.is_empty() {
            let content_type = parsed.ctype.mimetype.clone();
            let body = parsed.get_body().unwrap_or_default();

            match content_type.as_str() {
                "text/plain" => text_body = Some(body),
                "text/html" => html_body = Some(body),
                _ => {
                    // Get filename, avoiding temporary value issues
                    let filename = parsed
                        .ctype
                        .params
                        .get("name")
                        .cloned()
                        .or_else(|| {
                            parsed
                                .get_content_disposition()
                                .params
                                .get("filename")
                                .cloned()
                        })
                        .unwrap_or_else(|| "unnamed".to_string());

                    let attachment = Attachment {
                        filename,
                        content: Some(body),
                        path: None,
                        content_type: Some(content_type),
                        encoding: None,
                        cid: parsed.headers.get_first_value("Content-ID"),
                        size: parsed.get_body_raw().map(|b| b.len()).unwrap_or(0),
                    };
                    attachments.push(attachment);
                }
            }
        } else {
            for subpart in &parsed.subparts {
                let (text, html, mut atts) = Self::extract_content(subpart);

                if text.is_some() && text_body.is_none() {
                    text_body = text;
                }
                if html.is_some() && html_body.is_none() {
                    html_body = html;
                }
                attachments.append(&mut atts);
            }
        }

        (text_body, html_body, attachments)
    }
}

/// Implement the SmtpHandler trait for our catch-all handler
#[async_trait]
impl SmtpHandler for CatchAllHandler {
    /// Handle authentication - accept all for catch-all server
    async fn handle_auth(&mut self, _session: &Session, _data: AuthData) -> smtpd::Result {
        Ok(Response::Default)
    }

    /// Handle recipient validation - accept all recipients
    async fn handle_rcpt(&mut self, _session: &Session, _to: &str) -> smtpd::Result {
        Ok(Response::Default)
    }

    /// Handle incoming email data
    async fn handle_email(&mut self, _session: &Session, data: Vec<u8>) -> smtpd::Result {
        // Log the receipt
        {
            let mut store = self.email_store.write();
            store.add_log(
                "INFO",
                "Received new email",
                Some(format!("Size: {} bytes", data.len())),
            );
        }

        // Parse and store the email
        match Self::parse_raw_email(&data) {
            Ok(email) => {
                let email_id = email.id.clone();
                let subject = email.subject.clone();
                let from = email.from.clone().unwrap_or_default();

                {
                    let mut store = self.email_store.write();
                    store.add_email(email.clone());
                    store.add_log(
                        "INFO",
                        &format!("Email stored successfully: {}", email_id),
                        Some(format!("From: {}, Subject: {}", from, subject)),
                    );
                }

                let _ = self.event_tx.send(EmailEvent::NewEmail(email));
                Ok(Response::Default)
            }
            Err(e) => {
                let mut store = self.email_store.write();
                store.add_log(
                    "ERROR",
                    &format!("Failed to parse email: {}", e),
                    Some(String::from_utf8_lossy(&data).to_string()),
                );
                // Still accept the message to prevent sender errors
                Ok(Response::Default)
            }
        }
    }
}
