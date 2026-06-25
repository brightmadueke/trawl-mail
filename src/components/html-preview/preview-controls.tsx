import React, { useMemo } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { cn } from "@/lib/utils.ts";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Laptop,
  Maximize,
  Minimize,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  Tablet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { DEVICES } from "@/components/html-preview/data/devices.ts";
import { EMAIL_CLIENTS } from "@/components/html-preview/data/email-clients.tsx";
import type {
  DeviceConfig,
  DeviceType,
  EmailClient,
  ThemeMode,
} from "@/types/html-preview.ts";
import IconButton from "@/components/icon-button.tsx"; // ============================================================================

// ============================================================================
// TYPES
// ============================================================================

interface PreviewControlsProps {
  device: DeviceType;
  emailClient: EmailClient;
  theme: ThemeMode;
  zoom: number;
  localZoom: number;
  showFrame: boolean;
  orientation: "portrait" | "landscape";
  displayWidth: number;
  displayHeight: number;
  isFullscreen: boolean;
  onDeviceChange: (device: DeviceType) => void;
  onEmailClientChange: (client: EmailClient) => void;
  onThemeToggle: () => void;
  onZoomChange: (values: number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFrameToggle: () => void;
  onOrientationToggle: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onOpenInBrowser: () => void;
  onFullscreenToggle: () => void;
}

// ============================================================================
// PREVIEW CONTROLS COMPONENT
// ============================================================================

export function PreviewControls({
  device,
  emailClient,
  theme,
  zoom,
  localZoom,
  showFrame,
  orientation,
  displayWidth,
  displayHeight,
  isFullscreen,
  onDeviceChange,
  onEmailClientChange,
  onThemeToggle,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onFrameToggle,
  onOrientationToggle,
  onOpenInBrowser,
  onFullscreenToggle,
}: PreviewControlsProps) {
  const deviceConfig = DEVICES[device];

  // Group devices by category
  const phones = useMemo(
    () =>
      Object.entries(DEVICES).filter(
        ([, config]) => config.category === "phone",
      ),
    [],
  );
  const tablets = useMemo(
    () =>
      Object.entries(DEVICES).filter(
        ([, config]) => config.category === "tablet",
      ),
    [],
  );
  const laptops = useMemo(
    () =>
      Object.entries(DEVICES).filter(
        ([, config]) => config.category === "laptop",
      ),
    [],
  );
  const desktops = useMemo(
    () =>
      Object.entries(DEVICES).filter(
        ([, config]) => config.category === "desktop",
      ),
    [],
  );

  const showOrientationToggle = useMemo(
    () =>
      deviceConfig.category === "phone" || deviceConfig.category === "tablet",
    [deviceConfig.category],
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-wrap border-b px-3 py-2",
        isFullscreen
          ? "bg-black/60 backdrop-blur-md border-white/10"
          : "bg-muted/30 border-border",
      )}
    >
      {/* Device Selector */}
      <DeviceSelector
        device={device}
        deviceConfig={deviceConfig}
        phones={phones}
        tablets={tablets}
        laptops={laptops}
        desktops={desktops}
        onDeviceChange={onDeviceChange}
      />

      {/* Email Client Selector */}
      <Select
        value={emailClient}
        onValueChange={(value) => onEmailClientChange(value as EmailClient)}
      >
        <SelectTrigger
          className={cn(
            "w-35 h-9",
            isFullscreen &&
              "bg-white/10 border-white/20 text-white hover:bg-white/20",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(EMAIL_CLIENTS).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <span className="flex items-center gap-2">
                {config.icon}
                {config.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator
        orientation="vertical"
        className={cn(isFullscreen && "bg-white/20")}
      />

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        localZoom={localZoom}
        isFullscreen={isFullscreen}
        onZoomChange={onZoomChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />

      {/* Frame Toggle */}
      <ControlButton
        icon={
          showFrame ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )
        }
        tooltip={showFrame ? "Hide Frame" : "Show Frame"}
        isFullscreen={isFullscreen}
        onClick={onFrameToggle}
      />

      {/* Orientation Toggle */}
      {showOrientationToggle && (
        <ControlButton
          icon={
            orientation == "portrait" ? (
              <Smartphone size={64} />
            ) : (
              <Smartphone size={64} style={{ transform: "rotate(90deg)" }} />
            )
          }
          tooltip={orientation === "portrait" ? "Landscape" : "Portrait"}
          isFullscreen={isFullscreen}
          onClick={onOrientationToggle}
        />
      )}

      {/* Theme Toggle */}
      <ControlButton
        icon={
          theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        }
        tooltip={theme === "dark" ? "Light Mode" : "Dark Mode"}
        isFullscreen={isFullscreen}
        onClick={onThemeToggle}
      />

      {/* Action Buttons */}

      <ControlButton
        icon={<ExternalLink className="h-4 w-4" />}
        tooltip="Open in Browser"
        isFullscreen={isFullscreen}
        onClick={onOpenInBrowser}
      />

      {/* Device Info Badge */}
      <Badge
        variant="secondary"
        className={cn(
          "text-xs ml-auto",
          isFullscreen && "bg-white/10 text-white/70 border-white/20",
        )}
      >
        {displayWidth}×{displayHeight} @{deviceConfig.dpi}dpi
      </Badge>

      {/* Fullscreen Toggle */}
      <ControlButton
        icon={
          isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )
        }
        tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
        isFullscreen={isFullscreen}
        onClick={onFullscreenToggle}
      />
    </div>
  );
}

// ============================================================================
// DEVICE SELECTOR SUB-COMPONENT
// ============================================================================

interface DeviceSelectorProps {
  device: DeviceType;
  deviceConfig: DeviceConfig;
  phones: [string, DeviceConfig][];
  tablets: [string, DeviceConfig][];
  laptops: [string, DeviceConfig][];
  desktops: [string, DeviceConfig][];
  onDeviceChange: (device: DeviceType) => void;
}

function DeviceSelector({
  device,
  deviceConfig,
  phones,
  tablets,
  laptops,
  desktops,
  onDeviceChange,
}: DeviceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9 min-w-45 justify-between"
        >
          {deviceConfig.category === "phone" && (
            <Smartphone className="h-4 w-4" />
          )}
          {deviceConfig.category === "tablet" && <Tablet className="h-4 w-4" />}
          {(deviceConfig.category === "laptop" ||
            deviceConfig.category === "desktop") && (
            <Monitor className="h-4 w-4" />
          )}
          <span className="flex-1 text-left">{deviceConfig.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-70" align="start">
        <DeviceGroup
          label="Phones"
          devices={phones}
          selectedDevice={device}
          icon={<Smartphone className="h-4 w-4" />}
          onSelect={onDeviceChange}
        />
        <DropdownMenuSeparator />
        <DeviceGroup
          label="Tablets"
          devices={tablets}
          selectedDevice={device}
          icon={<Tablet className="h-4 w-4" />}
          onSelect={onDeviceChange}
        />
        <DropdownMenuSeparator />
        <DeviceGroup
          label="Laptops"
          devices={laptops}
          selectedDevice={device}
          icon={<Laptop className="h-4 w-4" />}
          onSelect={onDeviceChange}
        />
        <DropdownMenuSeparator />
        <DeviceGroup
          label="Desktops"
          devices={desktops}
          selectedDevice={device}
          icon={<Monitor className="h-4 w-4" />}
          onSelect={onDeviceChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// DEVICE GROUP SUB-COMPONENT
// ============================================================================

interface DeviceGroupProps {
  label: string;
  devices: [string, DeviceConfig][];
  selectedDevice: string;
  icon: React.ReactNode;
  onSelect: (device: DeviceType) => void;
}

function DeviceGroup({
  label,
  devices,
  selectedDevice,
  icon,
  onSelect,
}: DeviceGroupProps) {
  return (
    <>
      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
        {label}
      </DropdownMenuLabel>
      {devices.map(([key, config]) => (
        <DropdownMenuItem
          key={key}
          onClick={() => onSelect(key as DeviceType)}
          className="gap-2"
        >
          {icon}
          <span className="flex-1">{config.name}</span>
          <span className="text-xs text-muted-foreground">
            {config.width}×{config.height}
          </span>
          {selectedDevice === key && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

// ============================================================================
// ZOOM CONTROLS SUB-COMPONENT
// ============================================================================

interface ZoomControlsProps {
  zoom: number;
  localZoom: number;
  isFullscreen: boolean;
  onZoomChange: (values: number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function ZoomControls({
  zoom,
  localZoom,
  isFullscreen,
  onZoomChange,
  onZoomIn,
  onZoomOut,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 mr-2">
      <ControlButton
        icon={<ZoomOut className="h-4 w-4" />}
        tooltip="Zoom Out"
        isFullscreen={isFullscreen}
        onClick={onZoomOut}
        disabled={zoom <= 25}
      />

      <Slider
        value={[localZoom]}
        onValueChange={onZoomChange}
        min={25}
        max={200}
        step={5}
        className={cn(
          "w-48",
          "**:[[role=slider]]:h-4 **:[[role=slider]]:w-4",
          "**:[[role=slider]]:border-2 **:[[role=slider]]:border-primary",
          "**:[[role=slider]]:bg-background",
          "**:data-[orientation=horizontal]:h-2",
          "**:data-[orientation=horizontal]:bg-primary/20",
          "**:data-[orientation=horizontal]>span:bg-primary",
          isFullscreen && [
            "**:[[role=slider]]:border-white/80 **:[[role=slider]]:bg-white/20",
            "**:data-[orientation=horizontal]:bg-white/20",
            "**:data-[orientation=horizontal]>span:bg-white",
            "**:[[role=slider]]:focus-visible:ring-white/50",
          ],
        )}
      />

      <ControlButton
        icon={<ZoomIn className="h-4 w-4" />}
        tooltip="Zoom In"
        isFullscreen={isFullscreen}
        onClick={onZoomIn}
        disabled={zoom >= 200}
      />
    </div>
  );
}

// ============================================================================
// CONTROL BUTTON SUB-COMPONENT
// ============================================================================

interface ControlButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  isFullscreen: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({
  icon,
  tooltip,
  isFullscreen,
  onClick,
  disabled = false,
}: ControlButtonProps) {
  return (
    <IconButton
      icon={icon}
      variant={isFullscreen ? "ghost" : "outline"}
      className={cn("h-8 w-8", isFullscreen && "text-white hover:bg-white/10")}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
}
