// src/components/Settings.tsx

import { useCallback, useEffect, useState } from "react";
import { Monitor, Moon, Save, Settings2, Sun, Undo2 } from "lucide-react";
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

const DEFAULT_SERVER_CONFIG: ServerConfig = {
  host: "127.0.0.1",
  port: 2525,
  max_message_size: 10485760,
  require_auth: false,
};

export function Settings() {
  const { serverStatus, settings, saveSettings, isSettingsLoading } =
    useAppContext();

  const { theme, setTheme } = useTheme();

  // Initialize all state from context settings
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
  }, [settings.theme]);

  const saveAllSettings = useCallback(async () => {
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
      });

      toast.success("Settings saved");
      setHasChanges(false);
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
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
    saveSettings,
  ]);

  const resetToDefaults = useCallback(() => {
    setServerConfig(DEFAULT_SERVER_CONFIG);
    setNotificationsEnabled(true);
    setSoundAlerts(true);
    setDesktopNotifications(true);
    setNotificationPriority("all");
    setTheme("system");
    setFontSize("medium");
    setShowTimestamps(true);
    setAutoRefresh(true);
    setHasChanges(true);
  }, [setTheme]);

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "Not set";
    if (bytes === 0) return "Unlimited";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const markChanged = useCallback(() => setHasChanges(true), []);

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <Settings2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-scroll p-4">
      {/* header*/}
      <div className="flex items-center gap-2 px-4">
        <div className="flex flex-col gap-1">
          <span className="text-xl">Settings</span>
          <span className="text-sm text-muted-foreground">
            Manage your preferences
          </span>
        </div>
        <div className="grow" />
        {hasChanges && (
          <Button size="lg" variant="outline" onClick={resetToDefaults}>
            <Undo2 />
            Reset
          </Button>
        )}
        <Button
          size="lg"
          onClick={saveAllSettings}
          disabled={!hasChanges || isSaving}
        >
          <Save />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <br />
      {/* server and notification config*/}
      <div className="grid grid-cols-3 gap-4 w-full p-4">
        <div className="bg-background/75 rounded-4xl p-6 h-fit flex flex-col gap-1">
          <div className="flex items-center">
            <span className="text-muted-foreground text-xl">
              Configure SMTP Server
            </span>
            <div className="grow" />
            <Badge>{serverStatus.is_running ? "Running" : "Stopped"}</Badge>
          </div>

          <br />

          <div className="flex flex-col gap-3">
            <Label>Host</Label>
            <InputGroup className="h-11">
              <InputGroupInput
                id="host"
                value={serverConfig.host}
                onChange={(e) => {
                  setServerConfig((prev) => ({
                    ...prev,
                    host: e.target.value,
                  }));
                  markChanged();
                }}
                placeholder="127.0.0.1"
                className="tracking-widest"
              />
            </InputGroup>
          </div>

          <br />

          <div className="flex flex-col gap-3">
            <Label>Port</Label>
            <InputGroup className="h-11">
              <InputGroupInput
                id="port"
                type="number"
                value={serverConfig.port}
                onChange={(e) => {
                  setServerConfig((prev) => ({
                    ...prev,
                    port: parseInt(e.target.value) || 2525,
                  }));
                  markChanged();
                }}
                className="font-mono tracking-widest"
              />
            </InputGroup>
          </div>

          <br />

          <div className="flex flex-col gap-3">
            <Label className="flex items-center">
              <span>Max message size</span>
              <Badge variant="secondary" className="font-normal text-xs">
                {formatBytes(serverConfig.max_message_size)}
              </Badge>
            </Label>
            <InputGroup className="h-11">
              <InputGroupInput
                id="maxMessageSize"
                type="number"
                value={serverConfig.max_message_size ?? ""}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? undefined
                      : parseInt(e.target.value);
                  setServerConfig((prev) => ({
                    ...prev,
                    max_message_size: value,
                  }));
                  markChanged();
                }}
                placeholder="10485760"
                className="font-mono tracking-widest"
              />
            </InputGroup>
          </div>

          <br />

          <div className="flex items-center">
            <div className="flex flex-col gap-2">
              <Label>Require Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Ensure SMTP authentication for connections
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={serverConfig.require_auth ?? false}
              onCheckedChange={(checked: any) => {
                setServerConfig((prev) => ({ ...prev, require_auth: checked }));
                markChanged();
              }}
            />
          </div>
        </div>
        <div className="bg-background/75 h-fit rounded-4xl p-6 flex flex-col gap-6">
          <div className="flex flex-col mb-6">
            <Label className="text-xl">Notifications</Label>
            <span className="text-sm text-muted-foreground">
              Control how you receive alerts
            </span>
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for new emails
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                setNotificationsEnabled(checked);
                markChanged();
              }}
            />
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Play a sound for new emails
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={soundAlerts}
              onCheckedChange={(checked) => {
                setSoundAlerts(checked);
                markChanged();
              }}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show system notifications
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={desktopNotifications}
              onCheckedChange={(checked) => {
                setDesktopNotifications(checked);
                markChanged();
              }}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <p className="text-sm text-muted-foreground">
                Choose which emails trigger notifications
              </p>
            </div>
            <div className="grow" />
            <Select
              value={notificationPriority}
              onValueChange={(value: "all" | "important" | "none") => {
                setNotificationPriority(value);
                markChanged();
              }}
              disabled={!notificationsEnabled}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="important">Important Only</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="bg-background/75 rounded-4xl p-6 h-fit flex flex-col gap-6">
          {/* title*/}
          <div className="flex flex-col mb-6">
            <Label className="text-xl">Appearance</Label>
            <span className="text-sm text-muted-foreground">
              Customize the look and feel
            </span>
          </div>

          <div>
            <Label className="mb-2">Theme</Label>
            <ToggleGroup
              type="single"
              value={theme}
              onValueChange={(value: Theme) => {
                if (value) setTheme(value);
              }}
              className="grid grid-cols-3 gap-0 rounded-lg border border-input p-0 bg-background w-full h-10"
              aria-label="Select theme"
            >
              <ToggleGroupItem
                value="light"
                aria-label="Light theme"
                className="data-[state=on]:bg-muted px-2.5 py-1.5 h-full rounded-none rounded-l-lg hover:bg-muted/50"
              >
                <Sun className="h-4 w-4" />
              </ToggleGroupItem>

              <ToggleGroupItem
                value="dark"
                aria-label="Dark theme"
                className="data-[state=on]:bg-muted px-2.5 py-1.5 h-full rounded-none hover:bg-muted/50"
              >
                <Moon className="h-4 w-4" />
              </ToggleGroupItem>

              <ToggleGroupItem
                value="system"
                aria-label="System theme"
                className="data-[state=on]:bg-muted px-2.5 py-1.5 h-full rounded-none rounded-r-lg hover:bg-muted/50"
              >
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Show Timestamps</Label>
              <p className="text-sm text-muted-foreground">
                Display relative timestamps
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={showTimestamps}
              onCheckedChange={(checked) => {
                setShowTimestamps(checked);
                markChanged();
              }}
            />
          </div>

          <div className="flex items-center">
            <div className="flex flex-col gap-1.5">
              <Label>Auto Refresh</Label>
              <p className="text-sm text-muted-foreground">
                Automatically refresh data
              </p>
            </div>
            <div className="grow" />
            <Switch
              checked={autoRefresh}
              onCheckedChange={(checked) => {
                setAutoRefresh(checked);
                markChanged();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
