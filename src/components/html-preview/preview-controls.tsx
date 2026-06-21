// ============================================================================
// html-preview/preview-controls.tsx
// Header toolbar for controlling preview settings
// Uses shadcn/ui components and lucide-react icons
// ============================================================================

import React, { useCallback } from "react";
import type { PreviewControlsProps } from "./types";
import IconButton from "@/components/icon-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Download,
  ExternalLink,
  EyeOff,
  Frame,
  Mail,
  Maximize,
  Minimize,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  Tablet,
  ZoomIn,
  ZoomOut
} from "lucide-react";

/**
 * PreviewControls renders a fixed header toolbar above the preview area.
 * Provides device selection, email client selection, zoom controls,
 * theme toggle, and action buttons (copy, download, open, fullscreen).
 *
 * The header is styled to integrate with the parent inbox layout.
 */
const PreviewControls: React.FC<PreviewControlsProps> = ({
  device,
  emailClient,
  theme,
  zoom,
  localZoom,
  showFrame,
  isFullscreen,
  devices,
  emailClients,
  onDeviceChange,
  onEmailClientChange,
  onThemeToggle,
  onZoomChange,
  onZoomCommit,
  onZoomIn,
  onZoomOut,
  onFrameToggle,
  onCopy,
  onDownload,
  onOpenInBrowser,
  onFullscreenToggle,
  className = "",
}) => {
  const isDark = theme === "dark";

  // Group devices by type for organized dropdown display
  const groupedDevices = React.useMemo(() => {
    const groups = {
      mobile: [] as typeof devices,
      tablet: [] as typeof devices,
      desktop: [] as typeof devices,
    };

    for (const d of devices) {
      if (d.type === "mobile") groups.mobile.push(d);
      else if (d.type === "tablet") groups.tablet.push(d);
      else groups.desktop.push(d);
    }

    return groups;
  }, [devices]);

  // Find the currently selected device and client for display
  const currentDevice = devices.find((d) => d.id === device);
  const currentClient = emailClients.find((c) => c.id === emailClient);

  /**
   * Get the appropriate icon for a device type.
   */
  const getDeviceTypeIcon = useCallback((type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5" />;
      default:
        return <Monitor className="w-3.5 h-3.5" />;
    }
  }, []);

  /**
   * Handle zoom in, clamped to 200% max.
   */
  const handleZoomIn = useCallback(() => {
    if (zoom < 200) {
      onZoomIn();
    }
  }, [zoom, onZoomIn]);

  /**
   * Handle zoom out, clamped to 25% min.
   */
  const handleZoomOut = useCallback(() => {
    if (zoom > 25) {
      onZoomOut();
    }
  }, [zoom, onZoomOut]);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-b bg-card text-card-foreground ${className}`}
      role="toolbar"
      aria-label="Preview controls"
    >
      {/* ======================== Device Selector ======================== */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 min-w-[140px] justify-start"
          >
            {getDeviceTypeIcon(currentDevice?.type || "desktop")}
            <span className="text-xs truncate max-w-[100px]">
              {currentDevice?.name || "Select device"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-60 max-h-[400px] overflow-y-auto"
        >
          {/* Mobile devices */}
          {groupedDevices.mobile.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Smartphone className="w-3 h-3" />
                Phones
              </DropdownMenuLabel>
              {groupedDevices.mobile.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => onDeviceChange(d.id)}
                  className={
                    device === d.id ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <span className="text-xs flex-1">{d.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
                    {d.width}&times;{d.height}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Tablet devices */}
          {groupedDevices.tablet.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Tablet className="w-3 h-3" />
                Tablets
              </DropdownMenuLabel>
              {groupedDevices.tablet.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => onDeviceChange(d.id)}
                  className={
                    device === d.id ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <span className="text-xs flex-1">{d.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
                    {d.width}&times;{d.height}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Desktop devices */}
          {groupedDevices.desktop.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Monitor className="w-3 h-3" />
                Desktop
              </DropdownMenuLabel>
              {groupedDevices.desktop.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => onDeviceChange(d.id)}
                  className={
                    device === d.id ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <span className="text-xs flex-1">{d.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
                    {d.width}&times;{d.height}
                  </span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ======================== Email Client Selector ======================== */}
      <Select value={emailClient} onValueChange={onEmailClientChange}>
        <SelectTrigger className="h-8 w-auto min-w-[130px] gap-1.5 text-xs">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
          <SelectValue>{currentClient?.name || "Select client"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {emailClients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              <span className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{client.icon}</span>
                {client.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* ======================== Zoom Controls ======================== */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={<ZoomOut className="w-4 h-4" />}
          tooltip="Zoom out"
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        />

        <div className="w-24 sm:w-28">
          <Slider
            value={[localZoom]}
            min={25}
            max={200}
            step={5}
            onValueChange={onZoomChange}
            onValueCommit={onZoomCommit}
            aria-label="Zoom level"
            className="cursor-pointer [&>span]:h-4 [&>span:first-child]:bg-primary"
          />
        </div>

        <IconButton
          icon={<ZoomIn className="w-4 h-4" />}
          tooltip="Zoom in"
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
        />

        <span className="text-xs tabular-nums min-w-[42px] text-center text-muted-foreground select-none">
          {zoom}%
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* ======================== Toggle Controls ======================== */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <IconButton
          icon={
            isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
          }
          tooltip={isDark ? "Switch to light theme" : "Switch to dark theme"}
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onThemeToggle}
        />

        {/* Frame Toggle */}
        <div className="flex items-center gap-2 pl-1">
          <IconButton
            icon={
              showFrame ? (
                <Frame className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )
            }
            tooltip={showFrame ? "Hide device frame" : "Show device frame"}
            tooltipSide="bottom"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onFrameToggle}
          />
          <Switch
            checked={showFrame}
            onCheckedChange={onFrameToggle}
            aria-label="Toggle device frame"
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* ======================== Spacer ======================== */}
      <div className="flex-1" />

      {/* ======================== Action Buttons ======================== */}
      <div className="flex items-center gap-0.5">
        {/* Copy HTML */}
        <IconButton
          icon={<Copy className="w-4 h-4" />}
          tooltip="Copy HTML to clipboard"
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCopy}
        />

        {/* Download HTML */}
        <IconButton
          icon={<Download className="w-4 h-4" />}
          tooltip="Download HTML file"
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDownload}
        />

        {/* Open in Browser */}
        <IconButton
          icon={<ExternalLink className="w-4 h-4" />}
          tooltip="Open in browser"
          tooltipSide="bottom"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onOpenInBrowser}
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Fullscreen Toggle */}
        <IconButton
          icon={
            isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )
          }
          tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen preview"}
          tooltipSide="bottom"
          variant={isFullscreen ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onFullscreenToggle}
        />
      </div>
    </div>
  );
};

export default PreviewControls;
