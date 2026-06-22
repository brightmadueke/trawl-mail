// src/components/Settings.tsx - Fixed version

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  HardDrive,
  Monitor,
  Moon,
  Palette,
  Server,
  Shield,
  Sun,
  Undo2
} from "lucide-react";
import { toast } from "sonner";
import { ServerConfig } from "@/types/app";
import { useAppContext } from "@/components/app-context";
import { Theme, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  host: "127.0.0.1",
  port: 2525,
  max_message_size: 10485760,
  require_auth: false,
};

const DEFAULT_SETTINGS = {
  serverConfig: DEFAULT_SERVER_CONFIG,
  notificationsEnabled: true,
  soundAlerts: true,
  desktopNotifications: true,
  notificationPriority: "all" as const,
  theme: "system" as Theme,
  fontSize: "medium" as const,
  showTimestamps: true,
  autoRefresh: true,
};

function SettingRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${className || ""}`}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function StatusBadge({ isRunning }: { isRunning: boolean }) {
  return (
    <Badge
      variant={isRunning ? "default" : "secondary"}
      className={`gap-1.5 px-2.5 py-1 text-xs font-medium ${
        isRunning
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isRunning ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <AlertTriangle className="size-3" />
      )}
      {isRunning ? "Running" : "Stopped"}
    </Badge>
  );
}

function SaveIndicator({
  isSaving,
  saved,
}: {
  isSaving: boolean;
  saved: boolean;
}) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-3" />
        Saving...
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
        <CheckCircle2 className="size-3" />
        Saved
      </div>
    );
  }

  return null;
}

export function Settings() {
  const { serverStatus, settings, saveSettings, isSettingsLoading } =
    useAppContext();

  const { theme, setTheme } = useTheme();

  const [serverConfig, setServerConfig] = useState<ServerConfig>(
    settings.serverConfig || DEFAULT_SERVER_CONFIG,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings.notificationsEnabled,
  );
  const [soundAlerts, setSoundAlerts] = useState(settings.soundAlerts);
  const [desktopNotifications, setDesktopNotifications] = useState(
    settings.desktopNotifications,
  );
  const [notificationPriority, setNotificationPriority] = useState<
    "all" | "important" | "none"
  >(settings.notificationPriority);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [showTimestamps, setShowTimestamps] = useState(settings.showTimestamps);
  const [autoRefresh, setAutoRefresh] = useState(settings.autoRefresh);

  // Auto-save states
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedIndicatorTimeoutRef =
    useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check if any settings differ from defaults
  const hasChangesFromDefault = useMemo(() => {
    if (!settings) return false;

    return (
      JSON.stringify(serverConfig) !==
        JSON.stringify(DEFAULT_SETTINGS.serverConfig) ||
      notificationsEnabled !== DEFAULT_SETTINGS.notificationsEnabled ||
      soundAlerts !== DEFAULT_SETTINGS.soundAlerts ||
      desktopNotifications !== DEFAULT_SETTINGS.desktopNotifications ||
      notificationPriority !== DEFAULT_SETTINGS.notificationPriority ||
      theme !== DEFAULT_SETTINGS.theme ||
      fontSize !== DEFAULT_SETTINGS.fontSize ||
      showTimestamps !== DEFAULT_SETTINGS.showTimestamps ||
      autoRefresh !== DEFAULT_SETTINGS.autoRefresh
    );
  }, [
    serverConfig,
    notificationsEnabled,
    soundAlerts,
    desktopNotifications,
    notificationPriority,
    theme,
    fontSize,
    showTimestamps,
    autoRefresh,
    settings,
  ]);

  // Sync with context settings when they load
  useEffect(() => {
    if (settings.serverConfig) {
      setServerConfig(settings.serverConfig);
    }
    setNotificationsEnabled(settings.notificationsEnabled);
    setSoundAlerts(settings.soundAlerts);
    setDesktopNotifications(settings.desktopNotifications);
    setNotificationPriority(settings.notificationPriority);
    setFontSize(settings.fontSize);
    setShowTimestamps(settings.showTimestamps);
    setAutoRefresh(settings.autoRefresh);
  }, [settings]);

  // Sync theme with theme provider
  useEffect(() => {
    if (settings.theme && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, theme, setTheme]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (savedIndicatorTimeoutRef.current)
        clearTimeout(savedIndicatorTimeoutRef.current);
    };
  }, []);

  // Auto-save function with debounce
  const autoSave = useCallback(
    (updatedSettings: Partial<typeof settings>) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save for 1 second
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await saveSettings({
            serverConfig,
            notificationsEnabled,
            soundAlerts,
            desktopNotifications,
            notificationPriority,
            theme,
            fontSize,
            showTimestamps,
            autoRefresh,
            ...updatedSettings,
          });

          // Show saved indicator
          setShowSaved(true);
          if (savedIndicatorTimeoutRef.current) {
            clearTimeout(savedIndicatorTimeoutRef.current);
          }
          savedIndicatorTimeoutRef.current = setTimeout(() => {
            setShowSaved(false);
          }, 2000);
        } catch (err) {
          toast.error("Failed to save settings", {
            description: "Your changes could not be saved.",
          });
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [
      serverConfig,
      notificationsEnabled,
      soundAlerts,
      desktopNotifications,
      notificationPriority,
      theme,
      fontSize,
      showTimestamps,
      autoRefresh,
      saveSettings,
    ],
  );

  // Reset all settings to defaults
  const resetToDefaults = useCallback(() => {
    const defaultServerConfig = { ...DEFAULT_SETTINGS.serverConfig };
    setServerConfig(defaultServerConfig);
    setNotificationsEnabled(DEFAULT_SETTINGS.notificationsEnabled);
    setSoundAlerts(DEFAULT_SETTINGS.soundAlerts);
    setDesktopNotifications(DEFAULT_SETTINGS.desktopNotifications);
    setNotificationPriority(DEFAULT_SETTINGS.notificationPriority);
    setTheme(DEFAULT_SETTINGS.theme);
    setFontSize(DEFAULT_SETTINGS.fontSize);
    setShowTimestamps(DEFAULT_SETTINGS.showTimestamps);
    setAutoRefresh(DEFAULT_SETTINGS.autoRefresh);

    // Save immediately (no debounce)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveSettings({
      serverConfig: defaultServerConfig,
      notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
      soundAlerts: DEFAULT_SETTINGS.soundAlerts,
      desktopNotifications: DEFAULT_SETTINGS.desktopNotifications,
      notificationPriority: DEFAULT_SETTINGS.notificationPriority,
      theme: DEFAULT_SETTINGS.theme,
      fontSize: DEFAULT_SETTINGS.fontSize,
      showTimestamps: DEFAULT_SETTINGS.showTimestamps,
      autoRefresh: DEFAULT_SETTINGS.autoRefresh,
    })
      .then(() => {
        toast.success("Settings reset to defaults", {
          description:
            "All settings have been restored to their default values.",
          icon: <Undo2 className="size-4" />,
        });
        setShowSaved(true);
        if (savedIndicatorTimeoutRef.current) {
          clearTimeout(savedIndicatorTimeoutRef.current);
        }
        savedIndicatorTimeoutRef.current = setTimeout(() => {
          setShowSaved(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to reset settings");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [saveSettings, setTheme]);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "Not set";
    if (bytes === 0) return "Unlimited";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Spinner className="size-8 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Loading Settings</p>
            <p className="text-xs text-muted-foreground">
              Please wait a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your application preferences and server configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset to defaults button - only shown when settings differ from defaults */}
            {hasChangesFromDefault && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToDefaults}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      <Undo2 className="size-4" />
                      Reset to Defaults
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restore all settings to their default values</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Save Indicator */}
            <SaveIndicator isSaving={isSaving} saved={showSaved} />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Configuration */}
          <Card className="rounded-3xl border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Server className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">SMTP Server</CardTitle>
                    <CardDescription>
                      Configure your local SMTP server
                    </CardDescription>
                  </div>
                </div>
                <StatusBadge isRunning={serverStatus.is_running} />
              </div>
            </CardHeader>

            <CardContent className="space-y-1">
              <SettingRow
                label="Host Address"
                description="Server hostname or IP address"
              >
                <InputGroup className="w-48">
                  <InputGroupInput
                    value={serverConfig.host}
                    onChange={(e) => {
                      const newConfig = {
                        ...serverConfig,
                        host: e.target.value,
                      };
                      setServerConfig(newConfig);
                      autoSave({ serverConfig: newConfig });
                    }}
                    placeholder="127.0.0.1"
                    className="font-mono text-sm"
                  />
                </InputGroup>
              </SettingRow>

              <Separator />

              <SettingRow
                label="Port Number"
                description="Server listening port"
              >
                <InputGroup className="w-32">
                  <InputGroupInput
                    type="number"
                    value={serverConfig.port}
                    onChange={(e) => {
                      const newConfig = {
                        ...serverConfig,
                        port: parseInt(e.target.value) || 2525,
                      };
                      setServerConfig(newConfig);
                      autoSave({ serverConfig: newConfig });
                    }}
                    className="font-mono text-sm"
                  />
                </InputGroup>
              </SettingRow>

              <Separator />

              <SettingRow
                label="Max Message Size"
                description="Maximum allowed message size"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {formatBytes(serverConfig.max_message_size)}
                  </Badge>
                  <InputGroup className="w-32">
                    <InputGroupInput
                      type="number"
                      value={serverConfig.max_message_size ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : parseInt(e.target.value);
                        const newConfig = {
                          ...serverConfig,
                          max_message_size: value,
                        };
                        setServerConfig(newConfig);
                        autoSave({ serverConfig: newConfig });
                      }}
                      placeholder="10485760"
                      className="font-mono text-sm"
                    />
                  </InputGroup>
                </div>
              </SettingRow>

              <Separator />

              <SettingRow
                label="Require Authentication"
                description="Enforce SMTP authentication"
              >
                <Switch
                  checked={serverConfig.require_auth ?? false}
                  onCheckedChange={(checked) => {
                    const newConfig = {
                      ...serverConfig,
                      require_auth: checked,
                    };
                    setServerConfig(newConfig);
                    autoSave({ serverConfig: newConfig });
                  }}
                />
              </SettingRow>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-3xl border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <Bell className="size-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>
                    Control how you receive alerts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-1">
              <SettingRow
                label="Enable Notifications"
                description="Receive alerts for new emails"
              >
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    autoSave({ notificationsEnabled: checked });
                  }}
                />
              </SettingRow>

              <Separator />

              <SettingRow
                label="Sound Alerts"
                description="Play a sound for new emails"
              >
                <Switch
                  checked={soundAlerts}
                  onCheckedChange={(checked) => {
                    setSoundAlerts(checked);
                    autoSave({ soundAlerts: checked });
                  }}
                  disabled={!notificationsEnabled}
                />
              </SettingRow>

              <Separator />

              <SettingRow
                label="Desktop Notifications"
                description="Show system notifications"
              >
                <Switch
                  checked={desktopNotifications}
                  onCheckedChange={(checked) => {
                    setDesktopNotifications(checked);
                    autoSave({ desktopNotifications: checked });
                  }}
                  disabled={!notificationsEnabled}
                />
              </SettingRow>

              <Separator />

              <SettingRow
                label="Priority"
                description="Choose which emails trigger notifications"
              >
                <Select
                  value={notificationPriority}
                  onValueChange={(value: "all" | "important" | "none") => {
                    setNotificationPriority(value);
                    autoSave({ notificationPriority: value });
                  }}
                  disabled={!notificationsEnabled}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Emails</SelectItem>
                    <SelectItem value="important">Important Only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="rounded-3xl border-none shadow-sm bg-background/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Palette className="size-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Theme</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <ToggleGroup
                    type="single"
                    value={theme}
                    onValueChange={(value: Theme) => {
                      if (value) {
                        setTheme(value);
                        autoSave({ theme: value });
                      }
                    }}
                    className="grid grid-cols-3 gap-0 rounded-xl border border-input p-1 bg-muted/50 w-full"
                  >
                    <ToggleGroupItem
                      value="light"
                      className="data-[state=on]:bg-muted data-[state=on]:shadow-sm rounded-lg gap-2 py-3"
                    >
                      <Sun className="size-4" />
                      <span className="text-xs">Light</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="dark"
                      className="data-[state=on]:bg-muted data-[state=on]:shadow-sm rounded-lg gap-2 py-3"
                    >
                      <Moon className="size-4" />
                      <span className="text-xs">Dark</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="system"
                      className="data-[state=on]:bg-muted data-[state=on]:shadow-sm rounded-lg gap-2 py-3"
                    >
                      <Monitor className="size-4" />
                      <span className="text-xs">System</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Display Options */}
                <div className="space-y-1">
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Display</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control how information is shown
                    </p>
                  </div>

                  <SettingRow
                    label="Show Timestamps"
                    description="Display relative timestamps"
                    className="py-3"
                  >
                    <Switch
                      checked={showTimestamps}
                      onCheckedChange={(checked) => {
                        setShowTimestamps(checked);
                        autoSave({ showTimestamps: checked });
                      }}
                    />
                  </SettingRow>

                  <Separator />

                  <SettingRow
                    label="Auto Refresh"
                    description="Automatically refresh data"
                    className="py-3"
                  >
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={(checked) => {
                        setAutoRefresh(checked);
                        autoSave({ autoRefresh: checked });
                      }}
                    />
                  </SettingRow>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Configuration Summary
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current settings overview
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Server className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Server:</span>
                      <span className="font-mono text-xs">
                        {serverConfig.host}:{serverConfig.port}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Auth:</span>
                      <span className="text-xs">
                        {serverConfig.require_auth
                          ? "Required"
                          : "Not required"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Max Size:</span>
                      <span className="text-xs">
                        {formatBytes(serverConfig.max_message_size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Alerts:</span>
                      <span className="text-xs">
                        {notificationsEnabled
                          ? notificationPriority === "all"
                            ? "All emails"
                            : notificationPriority === "important"
                              ? "Important only"
                              : "Disabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Palette className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Theme:</span>
                      <span className="text-xs capitalize">{theme}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Settings are automatically saved to your local storage. Changes take
            effect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
