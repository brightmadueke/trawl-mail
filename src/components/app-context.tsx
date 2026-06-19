// src/components/app-context.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { toast } from "sonner";
import { load, Store } from "@tauri-apps/plugin-store";
import { Email, LogEntry, ServerConfig, ServerStatus } from "@/types/app";

// ==================== Event Name Constants ====================
const EVENTS = {
  NEW_EMAIL: "new-email",
  EMAIL_READ: "email-read",
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

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  const selectEmail = useCallback(async (email: Email | null) => {
    setSelectedEmail(email);
    if (email && !email.is_read) {
      try {
        await invoke<boolean>("mark_email_as_read", { emailId: email.id });
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark email as read:", formatError(err));
      }
    }
  }, []);

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

      // Check desktop notifications
      if (!settings.desktopNotifications) {
        // Only show toast, skip system notification
        const body = email.text
          ? email.text.substring(0, 150) +
            (email.text.length > 150 ? "..." : "")
          : "New email received";

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
      const body = email.text
        ? email.text.substring(0, 150) + (email.text.length > 150 ? "..." : "")
        : "New email received";

      toast(`${email.subject || "New Email"}`, {
        description: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
        action: {
          label: "View",
          onClick: () => {
            selectEmailRef.current(email);
          },
        },
      });

      // 2. Send Tauri system notification
      let hasPermission = await isPermissionGranted();
      if (!hasPermission) {
        const permission = await requestPermission();
        hasPermission = permission === "granted";
      }

      if (hasPermission) {
        sendNotification({
          title: `${email.subject || "New Email"}`,
          body: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
        });
      }
    },
    [
      settings.notificationsEnabled,
      settings.soundAlerts,
      settings.desktopNotifications,
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
      const [loadedEmails, count] = await Promise.all([
        invoke<Email[]>("get_all_emails"),
        invoke<number>("get_unread_count"),
      ]);
      setEmails(loadedEmails);
      setUnreadCount(count);
    } catch (err) {
      setEmailsError(formatError(err));
    } finally {
      setIsEmailsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (emailId: string) => {
    try {
      await invoke<boolean>("mark_email_as_read", { emailId });
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark email as read:", formatError(err));
    }
  }, []);

  useEffect(() => {
    refreshEmailsRef.current = refreshEmails;
  }, [refreshEmails]);

  const refreshLogs = useCallback(async () => {
    if (isInitialLogsLoadRef.current) setIsLogsLoading(true);
    setLogsError(null);
    try {
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
      setLogsError(formatError(err));
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    refreshLogsRef.current = refreshLogs;
  }, [refreshLogs]);

  const startAllAutoRefresh = useCallback(async () => {
    clearAllTimers();
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
  }, [clearAllTimers]);

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

        const unlisten3 = await listen<ServerStatus>(
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
        unlistenFunctions.push(unlisten3);
      } catch (err) {
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
    settings,
    saveSettings,
    loadSettings,
    isSettingsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
