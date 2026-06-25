// src/components/app-header

import {
  Maximize2,
  Minus,
  Play,
  RefreshCw,
  SquareStop,
  Tractor,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useState } from "react";
import { ServerConfig } from "@/types/app.ts";
import { useAppContext } from "@/components/app-context";
import IconButton from "@/components/icon-button";
import { toast } from "sonner";

export const HEADER_HEIGHT = "48px";

export function AppHeader() {
  const [serverRestarting, setServerRestarting] = useState(false);
  const appWindow = getCurrentWindow();

  // Get state and actions from App Context
  const {
    serverStatus,
    isServerLoading,
    isServerRestarting,
    serverError,
    startServer,
    stopServer,
    restartServer,
    settings,
  } = useAppContext();

  // Use server config from settings, with fallback defaults
  const config: ServerConfig = settings.serverConfig || {
    host: "0.0.0.0",
    port: 2525,
    max_message_size: 25000000,
    require_auth: false,
  };

  // Start server handler
  const handleStartServer = useCallback(async () => {
    try {
      await startServer(config);
      toast.success("Server started!", {
        description: `Listening on ${config.host}:${config.port}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(message);
      toast.error("Failed to start server!", {
        description: message,
      });
    }
  }, [config, startServer]);

  // Stop server handler
  const handleStopServer = useCallback(async () => {
    try {
      await stopServer();
      toast.success("Server stopped!");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Failed to stop server!", {
        description: message,
      });
    }
  }, [stopServer]);

  // Restart server handler
  const handleRestartServer = useCallback(async () => {
    setServerRestarting(true);
    try {
      await restartServer(config);
      toast.success("Server restarted!", {
        description: `Listening on ${config.host}:${config.port}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Failed to restart server!", {
        description: message,
      });
    } finally {
      setServerRestarting(false);
    }
  }, [config, restartServer]);

  // Refresh handler

  // Determine if any server operation is in progress
  const isBusy = isServerLoading || isServerRestarting || serverRestarting;

  return (
    <header
      data-tauri-drag-region
      className="sticky h-12 flex p-2.5 items-center top-0 z-50 w-full border-b bg-transparent select-none cursor-default border-none"
    >
      {/* App Icon */}
      <div className="h-8 w-8 rounded-lg flex items-center justify-center">
        <span className="text-secondary-foreground font-bold text-sm">
          <Tractor />
        </span>
      </div>

      {/* Middle section with server status and controls */}
      <div
        data-tauri-drag-region
        className="grow flex justify-center items-center gap-4"
      >
        {/* Server Status */}
        {serverStatus.is_running && !serverRestarting ? (
          <span
            data-tauri-drag-region
            className="text-sm flex items-center gap-1.5"
          >
            <Badge className="bg-green-500 align-middle p-0 size-1.5 animate-pulse" />
            <span>Listening on</span>
            <span className="font-bold text-sm tracking-wider text-blue-400 dark:text-blue-400">
              {serverStatus.config?.host || config.host}:
              {serverStatus.config?.port || config.port}
            </span>
          </span>
        ) : serverRestarting || isServerRestarting ? (
          <span className="text-sm flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Server is restarting...
          </span>
        ) : (
          <span className="text-sm flex items-center gap-1.5">
            <Badge className="bg-red-500 align-middle p-0 size-1.5" />
            Server is offline
          </span>
        )}

        {/* Error message if any */}
        {serverError && (
          <span className="text-xs text-red-500 max-w-50 truncate">
            {serverError}
          </span>
        )}

        <Separator data-tauri-drag-region orientation="vertical" />

        {/* Server Control Buttons */}
        <div className="flex gap-1.5">
          {serverStatus.is_running || serverRestarting || isServerRestarting ? (
            <>
              {/* Restart button */}
              <IconButton
                icon={
                  isBusy ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )
                }
                variant="ghost"
                className="bg-green-500 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-700"
                tooltip="Restart SMTP server"
                onClick={handleRestartServer}
                disabled={isBusy}
              />
              {/* Stop button */}
              {!serverRestarting && !isServerRestarting && (
                <IconButton
                  icon={<SquareStop />}
                  variant="ghost"
                  className="bg-red-400 dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500"
                  tooltip="Stop SMTP server"
                  onClick={handleStopServer}
                  disabled={isServerLoading}
                />
              )}
            </>
          ) : (
            <IconButton
              icon={<Play color="green" />}
              variant="ghost"
              tooltip="Start SMTP server"
              onClick={handleStartServer}
              disabled={isServerLoading}
            />
          )}
        </div>
      </div>

      {/* Window controls */}
      <div className="flex gap-2.5 items-center">
        {/* Minimize window */}
        <IconButton
          icon={<Minus />}
          variant="ghost"
          size="icon-xs"
          className="bg-muted dark:bg-muted/50 rounded-full"
          tooltip="Minimize"
          onClick={() => appWindow.minimize()}
        />
        {/* Toggle maximize */}
        <IconButton
          icon={<Maximize2 />}
          variant="ghost"
          size="icon-xs"
          className="bg-muted dark:bg-muted/50 rounded-full"
          tooltip="Toggle maximize"
          onClick={() => appWindow.toggleMaximize()}
        />
        {/* Close window */}
        <IconButton
          icon={<X />}
          variant="ghost"
          size="icon-xs"
          className="bg-muted dark:bg-muted/50 rounded-full"
          tooltip="Close"
          onClick={() => appWindow.close()}
        />
      </div>
    </header>
  );
}
