// src/components/app-context.tsx

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Command } from "@tauri-apps/plugin-shell";
import { type } from "@tauri-apps/plugin-os";
import { toast } from "sonner";
import { load, Store } from "@tauri-apps/plugin-store";
import { Email, LogEntry, ServerConfig, ServerStatus } from "@/types/app";

// ==================== Event Name Constants ====================
const EVENTS = {
  NEW_EMAIL: "new-email",
  EMAIL_READ: "email-read",
  EMAIL_UNREAD: "email-unread",
  SERVER_STATUS: "server-status",
} as const;

// ==================== Constants ====================
const AUTO_REFRESH = {
  EMAILS_INTERVAL: 10000,
  LOGS_INTERVAL: 3000,
  STATUS_INTERVAL: 5000,
  LOGS_LIMIT: 200,
  SHUTDOWN_DELAY: 3000,
  PORT_RELEASE_DELAY: 2000,
} as const;

const STORE_FILE = "settings.json";
const STORE_KEYS = {
  SERVER_CONFIG: "server_config",
  NOTIFICATIONS: "notifications_enabled",
} as const;

// ==================== Dev Mode Default Emails ====================
const DEV_DEFAULT_EMAILS: Email[] = [
  {
    id: "dev-1",
    to: ["user@example.com"],
    from: "john.doe@company.com",
    sender_name: "John Doe",
    recipient_name: "User",
    subject: "Welcome to the Development Environment",
    html: "<p>This is a test email for development purposes.</p>",
    text: "This is a test email for development purposes.",
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    is_read: false,
  },
  {
    id: "dev-2",
    to: ["user@example.com"],
    from: "jane.smith@startup.io",
    sender_name: "Jane Smith",
    recipient_name: "User",
    subject: "Project Update - Q3 Milestones",
    html: "<p>Here's the latest update on our Q3 milestones.</p><p>We're making great progress!</p>",
    text: "Here's the latest update on our Q3 milestones.\nWe're making great progress!",
    date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    is_read: false,
    cc: ["manager@startup.io"],
  },
  {
    id: "dev-3",
    to: ["user@example.com"],
    from: "noreply@github.com",
    sender_name: "GitHub",
    recipient_name: "User",
    subject: "[repo-name] Pull request #42: Feature branch merged",
    html: "<p>Pull request #42 has been merged into main.</p><p><strong>Feature: Add new authentication system</strong></p>",
    text: "Pull request #42 has been merged into main.\nFeature: Add new authentication system",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    is_read: true,
    attachments: [
      {
        filename: "changelog.md",
        content_type: "text/markdown",
        size: 1024,
      },
    ],
  },
  {
    id: "dev-4",
    to: ["user@example.com"],
    from: "team@slack.com",
    sender_name: "Slack",
    recipient_name: "User",
    subject: "You have 5 new mentions in #general",
    html: "<p>You were mentioned by @alex, @sarah, and 3 others in #general.</p>",
    text: "You were mentioned by @alex, @sarah, and 3 others in #general.",
    date: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    is_read: false,
  },
  {
    id: "dev-5",
    to: ["user@example.com"],
    from: "newsletter@techweekly.com",
    sender_name: "Tech Weekly",
    recipient_name: "User",
    subject: "This Week in Tech: AI Breakthroughs and Web Development Trends",
    html: "<h1>This Week in Tech</h1><p>Top stories this week:</p><ul><li>New AI model achieves breakthrough</li><li>React 19 announced</li><li>WebAssembly gains traction</li></ul>",
    text: "This Week in Tech\nTop stories this week:\n- New AI model achieves breakthrough\n- React 19 announced\n- WebAssembly gains traction",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    is_read: true,
  },
];

// ==================== Settings type definition ====================
interface AppSettings {
  serverConfig?: ServerConfig;
  notificationsEnabled: boolean;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  notificationPriority: "all" | "important" | "none";
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  showTimestamps: boolean;
  autoRefresh: boolean;
}

// ==================== Utility Functions ====================
function formatError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isDevMode(): boolean {
  // Check if we're in development mode
  // This works with both Vite and CRA
  return import.meta.env.DEV || process.env.NODE_ENV === "development";
}

// ==================== Context Type Definition ====================
interface AppContextType {
  serverStatus: ServerStatus;
  isServerLoading: boolean;
  isServerRestarting: boolean;
  serverError: string | null;
  startServer: (config: ServerConfig) => Promise<void>;
  stopServer: () => Promise<void>;
  restartServer: (config: ServerConfig) => Promise<void>;
  emails: Email[];
  selectedEmail: Email | null;
  isEmailsLoading: boolean;
  emailsError: string | null;
  selectEmail: (email: Email | null) => Promise<void>;
  markAsRead: (emailId: string) => Promise<void>;
  markAsUnread: (emailId: string) => Promise<void>;
  refreshEmails: () => Promise<void>;
  unreadCount: number;
  logs: LogEntry[];
  isLogsLoading: boolean;
  isLogsPaused: boolean;
  logsError: string | null;
  refreshLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
  toggleLogsPause: () => void;
  refreshAll: () => Promise<void>;
  // Email management methods
  deleteEmail: (emailId: string) => Promise<void>;
  clearAllEmails: () => Promise<void>;
  deleteSelectedEmail: () => Promise<void>;
  // Settings methods
  settings: AppSettings;
  saveSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<AppSettings>;
  isSettingsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

interface AppProviderProps {
  children: React.ReactNode;
}

// Store instance reference
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await load(STORE_FILE, {
      autoSave: true,
      defaults: {
        [STORE_KEYS.NOTIFICATIONS]: true,
        all_settings: {
          notificationsEnabled: true,
          soundAlerts: true,
          desktopNotifications: true,
          notificationPriority: "all",
          theme: "system",
          fontSize: "medium",
          showTimestamps: true,
          autoRefresh: true,
        },
      },
    });
  }
  return storeInstance;
}

export function AppProvider({ children }: AppProviderProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    is_running: false,
    total_emails: 0,
    unread_emails: 0,
  });
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isServerRestarting, setIsServerRestarting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Initialize emails with dev defaults if in dev mode
  const [emails, setEmails] = useState<Email[]>(() => {
    if (isDevMode()) {
      return DEV_DEFAULT_EMAILS;
    }
    return [];
  });

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  // Initialize unread count based on dev emails
  const [unreadCount, setUnreadCount] = useState(() => {
    if (isDevMode()) {
      return DEV_DEFAULT_EMAILS.filter((email) => !email.is_read).length;
    }
    return 0;
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Settings state with all defaults
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    soundAlerts: true,
    desktopNotifications: true,
    notificationPriority: "all",
    theme: "system",
    fontSize: "medium",
    showTimestamps: true,
    autoRefresh: true,
  });
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  const isLogsPausedRef = useRef(false);
  const isServerRunningRef = useRef(false);
  const isInitialLogsLoadRef = useRef(true);
  const logsClearedAtRef = useRef<string | null>(null);

  // Refs for functions that might be called before they're defined
  const selectEmailRef = useRef<(email: Email | null) => Promise<void>>(
    async () => {},
  );
  const showNewEmailNotificationRef = useRef<(email: Email) => Promise<void>>(
    async () => {},
  );

  useEffect(() => {
    isLogsPausedRef.current = isLogsPaused;
  }, [isLogsPaused]);

  useEffect(() => {
    isServerRunningRef.current = serverStatus.is_running;
  }, [serverStatus.is_running]);

  const logsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emailsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shutdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshEmailsRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const refreshLogsRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const startAllAutoRefreshRef = useRef<(() => Promise<void>) | undefined>(
    undefined,
  );
  const stopAllAutoRefreshRef = useRef<(() => void) | undefined>(undefined);

  const clearAllTimers = useCallback(() => {
    if (logsIntervalRef.current) {
      clearInterval(logsIntervalRef.current);
      logsIntervalRef.current = null;
    }
    if (emailsIntervalRef.current) {
      clearInterval(emailsIntervalRef.current);
      emailsIntervalRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    if (shutdownTimeoutRef.current) {
      clearTimeout(shutdownTimeoutRef.current);
      shutdownTimeoutRef.current = null;
    }
  }, []);

  // ==================== Settings Functions ====================
  const saveSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        setIsSettingsLoading(true);
        const store = await getStore();

        // Merge with existing settings
        const updatedSettings = { ...settings, ...newSettings };

        // Save the entire settings object
        await store.set("all_settings", updatedSettings);

        // Update local state
        setSettings(updatedSettings);

        console.log("Settings saved successfully");
      } catch (err) {
        console.error("Failed to save settings:", formatError(err));
        throw err;
      } finally {
        setIsSettingsLoading(false);
      }
    },
    [settings],
  );

  const loadSettings = useCallback(async (): Promise<AppSettings> => {
    try {
      setIsSettingsLoading(true);
      const store = await getStore();

      // Try to load the complete settings object
      const savedSettings = await store.get<AppSettings>("all_settings");

      if (savedSettings) {
        setSettings(savedSettings);
        return savedSettings;
      }

      // Fallback: return default settings
      const defaultSettings: AppSettings = {
        notificationsEnabled: true,
        soundAlerts: true,
        desktopNotifications: true,
        notificationPriority: "all",
        theme: "system",
        fontSize: "medium",
        showTimestamps: true,
        autoRefresh: true,
      };
      setSettings(defaultSettings);
      return defaultSettings;
    } catch (err) {
      console.error("Failed to load settings:", formatError(err));
      // Return default settings on error
      const defaultSettings: AppSettings = {
        notificationsEnabled: true,
        soundAlerts: true,
        desktopNotifications: true,
        notificationPriority: "all",
        theme: "system",
        fontSize: "medium",
        showTimestamps: true,
        autoRefresh: true,
      };
      setSettings(defaultSettings);
      return defaultSettings;
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  // ==================== Core Functions ====================

  // Define selectEmail first
  const selectEmail = useCallback(
    async (email: Email | null) => {
      setSelectedEmail(email);
      if (email && !email.is_read) {
        try {
          // In dev mode without a backend, just update the state locally
          if (isDevMode() && !serverStatus.is_running) {
            setEmails((prev) =>
              prev.map((e) =>
                e.id === email.id ? { ...e, is_read: true } : e,
              ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
            return;
          }

          await invoke<boolean>("mark_email_as_read", { emailId: email.id });
          setEmails((prev) =>
            prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
          console.error("Failed to mark email as read:", formatError(err));
          // In dev mode, still update the state even if the backend call fails
          if (isDevMode()) {
            setEmails((prev) =>
              prev.map((e) =>
                e.id === email.id ? { ...e, is_read: true } : e,
              ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      }
    },
    [serverStatus.is_running],
  );

  // Update selectEmailRef when selectEmail changes
  useEffect(() => {
    selectEmailRef.current = selectEmail;
  }, [selectEmail]);

  // Define showNewEmailNotification after selectEmail
  const showNewEmailNotification = useCallback(
    async (email: Email) => {
      // Check if notifications are enabled in settings
      if (!settings.notificationsEnabled) {
        return;
      }

      // Check sound alerts
      if (settings.soundAlerts) {
        // You can add sound playback logic here
      }

      const body = email.text
        ? email.text.substring(0, 150) + (email.text.length > 150 ? "..." : "")
        : "New email received";

      // Check desktop notifications
      if (!settings.desktopNotifications) {
        // Only show toast, skip system notification

        toast(`${email.subject || "New Email"}`, {
          description: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
          action: {
            label: "View",
            onClick: () => {
              selectEmailRef.current(email);
            },
          },
        });
        return;
      }

      // 1. Show sonner toast with action button

      toast(`${email.subject || "New Email"}`, {
        description: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
        action: {
          label: "View",
          onClick: () => {
            selectEmailRef.current(email);
          },
        },
      });

      // In dev mode without a backend, skip the system notification
      if (isDevMode() && !serverStatus.is_running) {
        return;
      }

      // 2. Send Tauri system notification
      let hasPermission = await isPermissionGranted();
      if (!hasPermission) {
        const permission = await requestPermission();
        hasPermission = permission === "granted";
      }

      if (hasPermission) {
        const currentOs = type();

        console.log(currentOs);

        if (currentOs === "linux") {
          // Fallback directly to native notify-send on Linux
          await Command.create("notify-send", [
            `${email.subject || "New Email"}`,
            `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
          ]).execute();
        } else {
          // Standard Tauri logic for Windows/macOS
          sendNotification({
            title: `${email.subject || "New Email"}`,
            body: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
          });
        }
      }
    },
    [
      settings.notificationsEnabled,
      settings.soundAlerts,
      settings.desktopNotifications,
      serverStatus.is_running,
    ],
  );

  // Update showNewEmailNotificationRef when showNewEmailNotification changes
  useEffect(() => {
    showNewEmailNotificationRef.current = showNewEmailNotification;
  }, [showNewEmailNotification]);

  const startServer = useCallback(
    async (config: ServerConfig) => {
      setIsServerLoading(true);
      setServerError(null);
      try {
        const status = await invoke<ServerStatus>("start_smtp_server", {
          config,
        });
        setServerStatus(status);
        logsClearedAtRef.current = null;

        // Save the server config to settings
        await saveSettings({ serverConfig: config });

        void startAllAutoRefreshRef.current?.();
      } catch (err) {
        const message = formatError(err);
        setServerError(message);
        refreshLogsRef.current?.()?.catch(console.error);
        throw err;
      } finally {
        setIsServerLoading(false);
      }
    },
    [saveSettings],
  );

  const stopServer = useCallback(async () => {
    setIsServerLoading(true);
    setServerError(null);
    try {
      await invoke<boolean>("stop_smtp_server");
      setServerStatus((prev) => ({
        ...prev,
        is_running: false,
        config: undefined,
      }));
      if (shutdownTimeoutRef.current) {
        clearTimeout(shutdownTimeoutRef.current);
      }
      await refreshLogsRef.current?.();
      shutdownTimeoutRef.current = setTimeout(() => {
        refreshLogsRef.current?.()?.catch(console.error);
        stopAllAutoRefreshRef.current?.();
        shutdownTimeoutRef.current = null;
      }, AUTO_REFRESH.SHUTDOWN_DELAY);
    } catch (err) {
      const message = formatError(err);
      setServerError(message);
      throw err;
    } finally {
      setIsServerLoading(false);
    }
  }, []);

  const restartServer = useCallback(
    async (config: ServerConfig) => {
      setIsServerRestarting(true);
      setServerError(null);
      try {
        try {
          await invoke<boolean>("stop_smtp_server");
          await refreshLogsRef.current?.();
        } catch (err: unknown) {
          const message = formatError(err).toLowerCase();
          if (
            !message.includes("not running") &&
            !message.includes("already stopped")
          ) {
            throw err;
          }
        }
        setServerStatus((prev) => ({
          ...prev,
          is_running: false,
          config: undefined,
        }));
        if (shutdownTimeoutRef.current)
          clearTimeout(shutdownTimeoutRef.current);
        await new Promise((resolve) =>
          setTimeout(resolve, AUTO_REFRESH.PORT_RELEASE_DELAY),
        );
        const status = await invoke<ServerStatus>("start_smtp_server", {
          config,
        });
        setServerStatus(status);
        logsClearedAtRef.current = null;

        // Save the server config to settings
        await saveSettings({ serverConfig: config });

        void startAllAutoRefreshRef.current?.();
      } catch (err) {
        const message = formatError(err);
        setServerError(message);
        refreshLogsRef.current?.()?.catch(console.error);
        throw err;
      } finally {
        setIsServerRestarting(false);
      }
    },
    [saveSettings],
  );

  const refreshEmails = useCallback(async () => {
    setIsEmailsLoading(true);
    setEmailsError(null);
    try {
      // In dev mode without a running server, return the dev emails
      if (isDevMode() && !serverStatus.is_running) {
        // Don't overwrite emails if we already have them
        if (emails.length === 0) {
          setEmails(DEV_DEFAULT_EMAILS);
          setUnreadCount(DEV_DEFAULT_EMAILS.filter((e) => !e.is_read).length);
        }
        return;
      }

      const [loadedEmails, count] = await Promise.all([
        invoke<Email[]>("get_all_emails"),
        invoke<number>("get_unread_count"),
      ]);
      setEmails(loadedEmails);
      setUnreadCount(count);
    } catch (err) {
      // In dev mode, if the backend call fails, use default emails
      if (isDevMode()) {
        console.log("Using dev mode default emails (backend not available)");
        if (emails.length === 0) {
          setEmails(DEV_DEFAULT_EMAILS);
          setUnreadCount(DEV_DEFAULT_EMAILS.filter((e) => !e.is_read).length);
        }
      } else {
        setEmailsError(formatError(err));
      }
    } finally {
      setIsEmailsLoading(false);
    }
  }, [serverStatus.is_running, emails.length]);

  const markAsRead = useCallback(
    async (emailId: string) => {
      try {
        // In dev mode without a running server, just update state locally
        if (isDevMode() && !serverStatus.is_running) {
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          return;
        }

        await invoke<boolean>("mark_email_as_read", { emailId });
        setEmails((prev) =>
          prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark email as read:", formatError(err));
        // In dev mode, still update state locally
        if (isDevMode()) {
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    },
    [serverStatus.is_running],
  );

  const markAsUnread = useCallback(
    async (emailId: string) => {
      try {
        // In dev mode without a running server, just update state locally
        if (isDevMode() && !serverStatus.is_running) {
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: false } : e)),
          );
          setUnreadCount((prev) => prev + 1);
          return;
        }

        await invoke<boolean>("mark_email_as_unread", { emailId });
        setEmails((prev) =>
          prev.map((e) => (e.id === emailId ? { ...e, is_read: false } : e)),
        );
        setUnreadCount((prev) => prev + 1);

        // Update server status
        setServerStatus((prev) => ({
          ...prev,
          unread_emails: prev.unread_emails + 1,
        }));
      } catch (err) {
        console.error("Failed to mark email as unread:", formatError(err));
        // In dev mode, still update state locally
        if (isDevMode()) {
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: false } : e)),
          );
          setUnreadCount((prev) => prev + 1);
        }
      }
    },
    [serverStatus.is_running],
  );

  useEffect(() => {
    refreshEmailsRef.current = refreshEmails;
  }, [refreshEmails]);

  const refreshLogs = useCallback(async () => {
    if (isInitialLogsLoadRef.current) setIsLogsLoading(true);
    setLogsError(null);
    try {
      // In dev mode without a running server, set empty logs
      if (isDevMode() && !serverStatus.is_running) {
        setLogs([]);
        isInitialLogsLoadRef.current = false;
        return;
      }

      const clearedAt = logsClearedAtRef.current;
      const serverLogs = clearedAt
        ? await invoke<LogEntry[]>("get_server_logs_filtered", {
            limit: AUTO_REFRESH.LOGS_LIMIT,
            sinceTimestamp: clearedAt,
          })
        : await invoke<LogEntry[]>("get_server_logs", {
            limit: AUTO_REFRESH.LOGS_LIMIT,
          });
      setLogs(serverLogs);
      isInitialLogsLoadRef.current = false;
    } catch (err) {
      // In dev mode, just set empty logs
      if (isDevMode()) {
        setLogs([]);
        isInitialLogsLoadRef.current = false;
      } else {
        setLogsError(formatError(err));
      }
    } finally {
      setIsLogsLoading(false);
    }
  }, [serverStatus.is_running]);

  const clearLogs = useCallback(async () => {
    try {
      await invoke("clear_server_logs");
      logsClearedAtRef.current = new Date().toISOString();
      setLogs([]);
      setLogsError(null);
      isInitialLogsLoadRef.current = true;
    } catch (err) {
      console.error("Failed to clear logs:", formatError(err));
      logsClearedAtRef.current = new Date().toISOString();
      setLogs([]);
      setLogsError(null);
      isInitialLogsLoadRef.current = true;
    }
  }, []);

  const toggleLogsPause = useCallback(() => {
    setIsLogsPaused((prev) => !prev);
  }, []);

  // ==================== Email Management Functions ====================

  const deleteEmail = useCallback(
    async (emailId: string) => {
      try {
        // In dev mode without a running server, just update state locally
        if (isDevMode() && !serverStatus.is_running) {
          const deletedEmail = emails.find((e) => e.id === emailId);
          setEmails((prev) => prev.filter((e) => e.id !== emailId));
          if (deletedEmail && !deletedEmail.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          // If the deleted email was selected, clear selection
          setSelectedEmail((prev) => (prev?.id === emailId ? null : prev));
          toast.success("Email deleted");
          return;
        }

        await invoke<boolean>("delete_email", { emailId });

        const deletedEmail = emails.find((e) => e.id === emailId);
        setEmails((prev) => prev.filter((e) => e.id !== emailId));

        // Update unread count if needed
        if (deletedEmail && !deletedEmail.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Update server status counts
        setServerStatus((prev) => ({
          ...prev,
          total_emails: Math.max(0, prev.total_emails - 1),
          unread_emails:
            deletedEmail && !deletedEmail.is_read
              ? Math.max(0, prev.unread_emails - 1)
              : prev.unread_emails,
        }));

        // If the deleted email was selected, clear selection
        setSelectedEmail((prev) => (prev?.id === emailId ? null : prev));

        toast.success("Email deleted successfully");
      } catch (err) {
        const message = formatError(err);
        console.error("Failed to delete email:", message);

        // In dev mode, still update state locally
        if (isDevMode()) {
          const deletedEmail = emails.find((e) => e.id === emailId);
          setEmails((prev) => prev.filter((e) => e.id !== emailId));
          if (deletedEmail && !deletedEmail.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          setSelectedEmail((prev) => (prev?.id === emailId ? null : prev));
          toast.success("Email deleted (dev mode)");
        } else {
          toast.error(`Failed to delete email: ${message}`);
          throw err;
        }
      }
    },
    [serverStatus.is_running, emails],
  );

  const clearAllEmails = useCallback(async () => {
    try {
      // In dev mode without a running server, just update state locally
      if (isDevMode() && !serverStatus.is_running) {
        setEmails([]);
        setUnreadCount(0);
        setSelectedEmail(null);
        setServerStatus((prev) => ({
          ...prev,
          total_emails: 0,
          unread_emails: 0,
        }));
        toast.success("All emails cleared");
        return;
      }

      await invoke("clear_all_emails");

      setEmails([]);
      setUnreadCount(0);
      setSelectedEmail(null);
      setServerStatus((prev) => ({
        ...prev,
        total_emails: 0,
        unread_emails: 0,
      }));

      toast.success("All emails cleared successfully");
    } catch (err) {
      const message = formatError(err);
      console.error("Failed to clear all emails:", message);

      // In dev mode, still update state locally
      if (isDevMode()) {
        setEmails([]);
        setUnreadCount(0);
        setSelectedEmail(null);
        setServerStatus((prev) => ({
          ...prev,
          total_emails: 0,
          unread_emails: 0,
        }));
        toast.success("All emails cleared (dev mode)");
      } else {
        toast.error(`Failed to clear emails: ${message}`);
        throw err;
      }
    }
  }, [serverStatus.is_running]);

  // Helper function to delete the currently selected email
  const deleteSelectedEmail = useCallback(async () => {
    if (selectedEmail) {
      await deleteEmail(selectedEmail.id);
    }
  }, [selectedEmail, deleteEmail]);

  useEffect(() => {
    refreshLogsRef.current = refreshLogs;
  }, [refreshLogs]);

  const startAllAutoRefresh = useCallback(async () => {
    clearAllTimers();

    // In dev mode without a running server, don't start auto-refresh
    if (isDevMode() && !serverStatus.is_running) {
      return;
    }

    await Promise.allSettled([
      refreshEmailsRef.current?.(),
      refreshLogsRef.current?.(),
    ]);
    emailsIntervalRef.current = setInterval(() => {
      if (isServerRunningRef.current)
        refreshEmailsRef.current?.()?.catch(console.error);
    }, AUTO_REFRESH.EMAILS_INTERVAL);
    logsIntervalRef.current = setInterval(() => {
      if (!isLogsPausedRef.current)
        refreshLogsRef.current?.()?.catch(console.error);
    }, AUTO_REFRESH.LOGS_INTERVAL);
    statusIntervalRef.current = setInterval(() => {
      invoke<ServerStatus>("get_server_status")
        .then(setServerStatus)
        .catch(console.error);
    }, AUTO_REFRESH.STATUS_INTERVAL);
  }, [clearAllTimers, serverStatus.is_running]);

  const stopAllAutoRefresh = useCallback(() => {
    clearAllTimers();
  }, [clearAllTimers]);

  useEffect(() => {
    startAllAutoRefreshRef.current = startAllAutoRefresh;
    stopAllAutoRefreshRef.current = stopAllAutoRefresh;
  }, [startAllAutoRefresh, stopAllAutoRefresh]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      refreshEmailsRef.current?.(),
      refreshLogsRef.current?.(),
    ]);
  }, []);

  // ==================== Event Listeners ====================
  useEffect(() => {
    const unlistenFunctions: UnlistenFn[] = [];
    let isMounted = true;

    const setupListeners = async () => {
      try {
        // Listen for new emails
        const unlisten1 = await listen<Email>(EVENTS.NEW_EMAIL, (event) => {
          if (!isMounted) return;
          const newEmail = event.payload;

          setEmails((prev) => [newEmail, ...prev]);
          setUnreadCount((prev) => prev + 1);
          setServerStatus((prev) => ({
            ...prev,
            total_emails: prev.total_emails + 1,
            unread_emails: prev.unread_emails + 1,
          }));

          // Use the ref to call the notification function
          showNewEmailNotificationRef.current(newEmail);
        });
        unlistenFunctions.push(unlisten1);

        // Listen for email read events
        const unlisten2 = await listen<string>(EVENTS.EMAIL_READ, (event) => {
          if (!isMounted) return;
          const emailId = event.payload;
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e)),
          );
          setSelectedEmail((prev) =>
            prev?.id === emailId ? { ...prev, is_read: true } : prev,
          );
          setServerStatus((prev) => ({
            ...prev,
            unread_emails: Math.max(0, prev.unread_emails - 1),
          }));
        });
        unlistenFunctions.push(unlisten2);

        // Listen for email unread events
        const unlisten3 = await listen<string>(EVENTS.EMAIL_UNREAD, (event) => {
          if (!isMounted) return;
          const emailId = event.payload;
          setEmails((prev) =>
            prev.map((e) => (e.id === emailId ? { ...e, is_read: false } : e)),
          );
          setSelectedEmail((prev) =>
            prev?.id === emailId ? { ...prev, is_read: false } : prev,
          );
          setServerStatus((prev) => ({
            ...prev,
            unread_emails: prev.unread_emails + 1,
          }));
        });
        unlistenFunctions.push(unlisten3);

        // Listen for server status changes
        const unlisten4 = await listen<ServerStatus>(
          EVENTS.SERVER_STATUS,
          (event) => {
            if (!isMounted) return;
            setServerStatus(event.payload);
            if (event.payload.is_running) {
              logsClearedAtRef.current = null;
              startAllAutoRefreshRef.current?.()?.catch(console.error);
            } else {
              refreshLogsRef.current?.()?.catch(console.error);
              if (shutdownTimeoutRef.current)
                clearTimeout(shutdownTimeoutRef.current);
              shutdownTimeoutRef.current = setTimeout(() => {
                refreshLogsRef.current?.()?.catch(console.error);
                stopAllAutoRefreshRef.current?.();
                shutdownTimeoutRef.current = null;
              }, AUTO_REFRESH.SHUTDOWN_DELAY);
            }
          },
        );
        unlistenFunctions.push(unlisten4);
      } catch (err) {
        // Always log the error - don't suppress it
        console.error("Failed to set up event listeners:", formatError(err));
      }
    };

    setupListeners();

    return () => {
      isMounted = false;
      unlistenFunctions.forEach((fn) => fn());
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Initial load - load settings first, then data
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadSettings();
        await refreshAll();
      } catch (err) {
        console.error("Failed to initialize:", formatError(err));
      }
    };

    initialize();
  }, []);

  const value: AppContextType = {
    serverStatus,
    isServerLoading,
    isServerRestarting,
    serverError,
    startServer,
    stopServer,
    restartServer,
    emails,
    selectedEmail,
    isEmailsLoading,
    emailsError,
    selectEmail,
    markAsRead,
    markAsUnread,
    refreshEmails,
    unreadCount,
    logs,
    isLogsLoading,
    isLogsPaused,
    logsError,
    refreshLogs,
    clearLogs,
    toggleLogsPause,
    refreshAll,
    // Email management methods
    deleteEmail,
    clearAllEmails,
    deleteSelectedEmail,
    // Settings methods
    settings,
    saveSettings,
    loadSettings,
    isSettingsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
