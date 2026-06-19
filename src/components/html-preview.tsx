import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { DeviceMockup } from "./device-mockup";
import { PreviewControls } from "./preview-controls";
import { DEVICES } from "@/data/devices";
import { EMAIL_CLIENTS } from "@/data/email-clients";
import type {
  DeviceType,
  EmailClient,
  HTMLPreviewProps,
  ThemeMode,
} from "@/types/html-preview";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HTMLPreview({
  htmlContent,
  className,
  selectedEmail,
  onFullscreenChange,
}: HTMLPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [device, setDevice] = useState<DeviceType>("iphone-15-pro");
  const [emailClient, setEmailClient] = useState<EmailClient>("apple-mail");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [zoom, setZoom] = useState(75);
  const [localZoom, setLocalZoom] = useState(75);
  const [showFrame, setShowFrame] = useState(true);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const deviceConfig = DEVICES[device];
  const clientConfig = EMAIL_CLIENTS[emailClient];

  // Calculate display dimensions based on orientation
  const displayWidth = useMemo(
    () =>
      orientation === "landscape" ? deviceConfig.height : deviceConfig.width,
    [deviceConfig, orientation],
  );

  const displayHeight = useMemo(
    () =>
      orientation === "landscape" ? deviceConfig.width : deviceConfig.height,
    [deviceConfig, orientation],
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Fullscreen toggle - forces iframe remount to ensure content loads
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => {
      const newState = !prev;
      onFullscreenChange?.(newState);
      if (newState) {
        setZoom(100);
        setLocalZoom(100);
        setIframeKey((prev) => prev + 1);
      }
      return newState;
    });
  }, [onFullscreenChange]);

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Device change
  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDevice(newDevice);
  }, []);

  // Email client change
  const handleEmailClientChange = useCallback((newClient: EmailClient) => {
    setEmailClient(newClient);
  }, []);

  // Zoom handlers with smooth updates
  const handleZoomChange = useCallback((values: number[]) => {
    const newZoom = values[0];
    setLocalZoom(newZoom);
    setZoom(newZoom);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + 10, 200);
      setLocalZoom(newZoom);
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 10, 25);
      setLocalZoom(newZoom);
      return newZoom;
    });
  }, []);

  // Frame toggle
  const handleFrameToggle = useCallback(() => {
    setShowFrame((prev) => !prev);
  }, []);

  // Orientation toggle (only for phones/tablets)
  const handleOrientationToggle = useCallback(() => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  }, []);

  // Copy HTML to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [htmlContent]);

  // Download HTML as file
  const handleDownload = useCallback(() => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlContent]);

  // Open in new browser tab
  const handleOpenInBrowser = useCallback(() => {
    const emailHTML = htmlContent;
    const blob = new Blob([emailHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, [htmlContent, clientConfig, theme]);

  // ============================================================================
  // SCALE CALCULATION
  // ============================================================================

  // Calculate the scale factor to fit the device in the container
  const scale = useMemo(() => {
    if (!containerRef.current) return 1;

    const container = containerRef.current;
    const padding = 48;
    const controlsHeight = isFullscreen ? 64 : 48;
    const containerWidth = container.clientWidth - padding * 2;
    const containerHeight =
      container.clientHeight - padding * 2 - controlsHeight;

    if (!containerWidth || !containerHeight) return 1;

    const frameWidth = showFrame
      ? displayWidth + (deviceConfig.category === "phone" ? 12 : 20)
      : displayWidth;
    const frameHeight = showFrame
      ? displayHeight + (deviceConfig.category === "phone" ? 40 : 50)
      : displayHeight;

    const scaleX = containerWidth / frameWidth;
    const scaleY = containerHeight / frameHeight;

    return Math.min(scaleX, scaleY, localZoom / 100);
  }, [
    deviceConfig,
    localZoom,
    displayWidth,
    displayHeight,
    showFrame,
    isFullscreen,
  ]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Render the controls bar
  const renderControls = (isFullscreenView: boolean) => (
    <PreviewControls
      device={device}
      emailClient={emailClient}
      theme={theme}
      zoom={zoom}
      localZoom={localZoom}
      showFrame={showFrame}
      orientation={orientation}
      displayWidth={displayWidth}
      displayHeight={displayHeight}
      isFullscreen={isFullscreenView}
      onDeviceChange={handleDeviceChange}
      onEmailClientChange={handleEmailClientChange}
      onThemeToggle={handleThemeToggle}
      onZoomChange={handleZoomChange}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onFrameToggle={handleFrameToggle}
      onOrientationToggle={handleOrientationToggle}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onOpenInBrowser={handleOpenInBrowser}
      onFullscreenToggle={handleFullscreenToggle}
    />
  );

  // Render the device preview with email client
  const renderDevicePreview = (isFullscreenView: boolean) => (
    <DeviceMockup
      deviceConfig={deviceConfig}
      clientConfig={clientConfig}
      htmlContent={htmlContent}
      theme={theme}
      emailClient={emailClient}
      showFrame={showFrame}
      orientation={orientation}
      scale={scale}
      selectedEmail={selectedEmail}
      iframeKey={iframeKey}
      className={isFullscreenView ? "shadow-black/50" : undefined}
    />
  );

  // Render the full layout
  const renderContent = (isFullscreenView: boolean) => (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full",
          isFullscreenView
            ? "fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
            : "w-full",
          className,
        )}
      >
        {/* Controls Bar */}
        {renderControls(isFullscreenView)}

        {/* Preview Area */}
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto flex items-center justify-center",
            isFullscreenView ? "p-8" : "bg-muted/20 p-6",
          )}
          ref={containerRef}
        >
          {renderDevicePreview(isFullscreenView)}
        </div>

        {/* Device Label Footer (non-fullscreen only) */}
        {!isFullscreenView && showFrame && (
          <div className="text-center py-1.5 bg-muted/10 border-t">
            <p className="text-[10px] text-muted-foreground font-medium">
              {deviceConfig.name} • {displayWidth}×{displayHeight} •{" "}
              {deviceConfig.dpi}dpi • {orientation}
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  // Empty state (when no HTML content and not in fullscreen)
  if (!htmlContent && !isFullscreen) {
    return (
      <div className={cn("flex flex-col h-full w-full", className)}>
        {renderControls(false)}
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/30 flex items-center justify-center">
              <Info className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                No Content to Preview
              </p>
              <p className="text-xs text-muted-foreground/60">
                Paste or write HTML to see a preview
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal or fullscreen view
  return renderContent(isFullscreen);
}
