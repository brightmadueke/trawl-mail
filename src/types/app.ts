// src/types/app.ts

export interface Attachment {
  filename: string;
  content?: string;
  path?: string;
  content_type?: string;
  encoding?: string;
  cid?: string;
  size: number;
}

export interface Email {
  id: string;
  to: string[];
  from?: string;
  sender_name: string;
  recipient_name: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Attachment[];
  date: string;
  is_read: boolean;
  raw_content?: string;
}

export interface ServerStatus {
  is_running: boolean;
  config?: ServerConfig;
  total_emails: number;
  unread_emails: number;
}

export interface ServerConfig {
  host: string;
  port: number;
  max_message_size?: number;
  require_auth?: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
}

export type EmailEventType = "new-email" | "email-read" | "server-status";
