// ============================================================================
// html-preview/html-preview.tsx
// Main orchestrator component for HTML email preview
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DeviceMockup from "./device-mockup";
import EmailClientMockup from "./email-client-mockup";
import PreviewControls from "./preview-controls";
import { defaultDevices } from "./data/devices";
import { defaultEmailClients } from "./data/email-clients";
import type { HTMLPreviewProps, ThemeMode } from "./types";

/**
 * HTMLPreview is the main component for previewing HTML email content
 * across different device sizes and email client UIs.
 *
 * Features:
 * - Device frame simulation (mobile, tablet, desktop)
 * - Multiple email client UI chrome options
 * - Zoom control (25-200%)
 * - Light/dark theme toggle
 * - Fullscreen mode via portal
 * - Copy, download, and open-in-browser actions
 * - Auto-scales to fill parent container height
 * - Supports custom email client UIs and custom devices
 */
const HTMLPreview: React.FC<HTMLPreviewProps> = ({
  htmlContent,
  className = "",
  onFullscreenChange,
  defaultDevice = "desktop-1080p",
  defaultEmailClient = "simple",
  defaultShowFrame = true,
  defaultZoom = 100,
  subject = "Email Subject",
  senderName = "Sender Name",
  senderEmail = "sender@example.com",
  timestamp = new Date().toLocaleString(),
  customEmailClients = [],
  customDevices = [],
}) => {
  // ======================== State ========================
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceId, setDeviceId] = useState(defaultDevice);
  const [emailClientId, setEmailClientId] = useState(defaultEmailClient);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [zoom, setZoom] = useState(defaultZoom);
  const [localZoom, setLocalZoom] = useState(defaultZoom);
  const [showFrame, setShowFrame] = useState(defaultShowFrame);
  const [iframeKey, setIframeKey] = useState(0);

  // Ref for the fullscreen portal container
  const portalRef = useRef<HTMLDivElement | null>(null);

  // ======================== Data ========================

  /**
   * Merge default devices with any custom devices provided by the user.
   * Custom devices with the same ID will override defaults.
   */
  const allDevices = useMemo(() => {
    const merged = [...defaultDevices];
    for (const custom of customDevices) {
      const idx = merged.findIndex((d) => d.id === custom.id);
      if (idx >= 0) {
        merged[idx] = custom;
      } else {
        merged.push(custom);
      }
    }
    return merged;
  }, [customDevices]);

  /**
   * Merge default email clients with custom clients.
   */
  const allEmailClients = useMemo(() => {
    const merged = [...defaultEmailClients];
    for (const custom of customEmailClients) {
      const idx = merged.findIndex((c) => c.id === custom.config.id);
      if (idx >= 0) {
        merged[idx] = custom.config;
      } else {
        merged.push(custom.config);
      }
    }
    return merged;
  }, [customEmailClients]);

  /**
   * Build a Map of custom email client components for fast lookup.
   */
  const customClientsMap = useMemo(() => {
    const map = new Map<string, React.ComponentType<any>>();
    for (const custom of customEmailClients) {
      map.set(custom.config.id, custom.component);
    }
    return map;
  }, [customEmailClients]);

  /**
   * Current device configuration.
   */
  const deviceConfig = useMemo(
    () => allDevices.find((d) => d.id === deviceId) || allDevices[0],
    [allDevices, deviceId],
  );

  /**
   * Current email client configuration.
   */
  const clientConfig = useMemo(
    () =>
      allEmailClients.find((c) => c.id === emailClientId) || allEmailClients[0],
    [allEmailClients, emailClientId],
  );

  // ======================== Handlers ========================

  const handleDeviceChange = useCallback((id: string) => {
    setDeviceId(id);
  }, []);

  const handleEmailClientChange = useCallback((id: string) => {
    setEmailClientId(id);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const handleZoomChange = useCallback((values: number[]) => {
    setLocalZoom(values[0]);
  }, []);

  const handleZoomCommit = useCallback((values: number[]) => {
    setZoom(values[0]);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(200, prev + 10));
    setLocalZoom((prev) => Math.min(200, prev + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(25, prev - 10));
    setLocalZoom((prev) => Math.max(25, prev - 10));
  }, []);

  const handleFrameToggle = useCallback(() => {
    setShowFrame((prev) => !prev);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = htmlContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [htmlContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-preview.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [htmlContent]);

  const handleOpenInBrowser = useCallback(() => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [htmlContent]);

  /**
   * Toggle fullscreen mode.
   * Resets zoom to 100% and increments iframeKey to force remount.
   * Notifies parent via onFullscreenChange callback.
   */
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        setZoom(100);
        setLocalZoom(100);
      }
      setIframeKey((k) => k + 1);
      onFullscreenChange?.(next);
      return next;
    });
  }, [onFullscreenChange]);

  // ======================== Effects ========================

  /**
   * Create/destroy the fullscreen portal container.
   * This mounts a div directly on document.body for fullscreen rendering.
   */
  useEffect(() => {
    if (isFullscreen) {
      const div = document.createElement("div");
      div.id = "html-preview-fullscreen-portal";
      div.style.cssText =
        "position:fixed;inset:0;z-index:9999;background:#000;";
      document.body.appendChild(div);
      portalRef.current = div;

      // Prevent body scroll when fullscreen is active
      document.body.style.overflow = "hidden";

      return () => {
        document.body.removeChild(div);
        document.body.style.overflow = "";
        portalRef.current = null;
      };
    }
  }, [isFullscreen]);

  /**
   * Handle Escape key to exit fullscreen.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        handleFullscreenToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, handleFullscreenToggle]);

  // ======================== Render ========================

  /**
   * Calculate scale factor for the preview.
   * This maps the device's native resolution to the display size
   * multiplied by the user's zoom preference.
   */
  const scale = zoom / 100;

  /**
   * The core preview content: device frame wrapping email client UI.
   */
  const previewContent = (
    <div
      className={`relative inline-block ${isFullscreen ? "h-full w-full flex items-center justify-center" : ""}`}
      style={{
        transform: isFullscreen ? "none" : `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      <DeviceMockup
        deviceConfig={deviceConfig}
        showFrame={showFrame}
        theme={theme}
        scale={isFullscreen ? 1 : undefined}
      >
        <EmailClientMockup
          clientConfig={clientConfig}
          variant={emailClientId}
          htmlContent={htmlContent}
          theme={theme}
          subject={subject}
          senderName={senderName}
          senderEmail={senderEmail}
          timestamp={timestamp}
          iframeKey={iframeKey}
          customClients={customClientsMap}
        />
      </DeviceMockup>

      {/* Preview Controls Overlay */}
      <PreviewControls
        device={deviceId}
        emailClient={emailClientId}
        theme={theme}
        zoom={zoom}
        localZoom={localZoom}
        showFrame={showFrame}
        deviceType={deviceConfig.type}
        isFullscreen={isFullscreen}
        devices={allDevices}
        emailClients={allEmailClients}
        onDeviceChange={handleDeviceChange}
        onEmailClientChange={handleEmailClientChange}
        onThemeToggle={handleThemeToggle}
        onZoomChange={handleZoomChange}
        onZoomCommit={handleZoomCommit}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFrameToggle={handleFrameToggle}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onOpenInBrowser={handleOpenInBrowser}
        onFullscreenToggle={handleFullscreenToggle}
      />
    </div>
  );

  /**
   * Main wrapper that fills available parent height.
   * Centers the preview content horizontally and allows vertical scrolling.
   */
  const mainContent = (
    <div
      className={`html-preview-root h-full w-full overflow-auto flex justify-center ${className}`}
      style={{
        backgroundColor: isFullscreen ? "#000" : "transparent",
      }}
    >
      {/* Spacer for scaling - the scaled content still occupies original space */}
      {!isFullscreen && (
        <div
          style={{
            width: deviceConfig.width * scale,
            minHeight: deviceConfig.height * scale,
            flexShrink: 0,
          }}
          className="relative"
        >
          {previewContent}
        </div>
      )}

      {isFullscreen && previewContent}
    </div>
  );

  // Render fullscreen in portal, otherwise inline
  if (isFullscreen && portalRef.current) {
    return createPortal(mainContent, portalRef.current);
  }

  return mainContent;
};

export default HTMLPreview;
