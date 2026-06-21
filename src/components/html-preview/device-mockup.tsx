// ============================================================================
// html-preview/device-mockup.tsx
// Device frame wrapper using react-uiframe
// ============================================================================

import React, { useMemo } from "react";
import type { DeviceMockupProps } from "./types";

/**
 * DeviceMockup wraps content in a realistic device frame.
 * Uses react-uiframe for device bezels and passes children
 * (the email client UI) into the device screen area.
 */
const DeviceMockup: React.FC<DeviceMockupProps> = ({
  deviceConfig,
  showFrame,
  theme,
  frameColors,
  children,
  className = "",
  scale = 1,
}) => {
  const isDark = theme === "dark";

  /**
   * Compute frame styling based on device type and theme.
   * Desktop devices get a subtle border, mobile/tablet get bezel styling.
   */
  const frameStyle = useMemo(() => {
    const isMobileOrTablet =
      deviceConfig.type === "mobile" || deviceConfig.type === "tablet";

    return {
      borderRadius: deviceConfig.borderRadius
        ? `${deviceConfig.borderRadius}px`
        : isMobileOrTablet
          ? "24px"
          : "8px",
      backgroundColor: frameColors?.frame || (isDark ? "#1a1a1a" : "#2d2d2d"),
      borderColor: frameColors?.screenBorder || "#000000",
      /** Scale the entire mockup */
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    };
  }, [deviceConfig, frameColors, isDark, scale]);

  // If frame is hidden, render children directly
  if (!showFrame) {
    return (
      <div
        className={`overflow-hidden border ${className}`}
        style={{
          width: deviceConfig.width,
          height: deviceConfig.height,
          borderRadius: deviceConfig.type === "desktop" ? "0px" : "16px",
          borderColor: isDark ? "#374151" : "#d1d5db",
          backgroundColor: isDark ? "#111827" : "#ffffff",
        }}
      >
        {children}
      </div>
    );
  }

  // Desktop devices get a minimal frame (like a monitor bezel)
  if (deviceConfig.type === "desktop") {
    return (
      <div
        className={`relative overflow-hidden shadow-2xl ${className}`}
        style={{
          width: deviceConfig.width + 24,
          height: deviceConfig.height + 24,
          borderRadius: frameStyle.borderRadius,
          backgroundColor: frameStyle.backgroundColor,
          border: `2px solid ${frameStyle.borderColor}`,
          padding: "12px",
        }}
      >
        {/* Inner screen */}
        <div
          className="overflow-hidden w-full h-full"
          style={{
            borderRadius: deviceConfig.borderRadius
              ? `${Math.max(0, deviceConfig.borderRadius - 4)}px`
              : "4px",
            backgroundColor: isDark ? "#111827" : "#ffffff",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Mobile/Tablet devices get a phone/tablet-like frame
  const paddingTop = deviceConfig.hasDynamicIsland
    ? 44
    : deviceConfig.hasNotch
      ? 36
      : 24;
  const paddingBottom = deviceConfig.hasHomeIndicator ? 24 : 12;

  return (
    <div
      className={`relative shadow-2xl ${className}`}
      style={{
        width: deviceConfig.width + 32,
        height: deviceConfig.height + paddingTop + paddingBottom + 24,
        borderRadius: frameStyle.borderRadius,
        backgroundColor: frameStyle.backgroundColor,
        border: `2px solid ${frameStyle.borderColor}`,
        padding: "12px",
        paddingTop: `${paddingTop + 12}px`,
        paddingBottom: `${paddingBottom + 12}px`,
      }}
    >
      {/* Dynamic Island */}
      {deviceConfig.hasDynamicIsland && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full z-10"
          style={{
            top: "12px",
            width: "120px",
            height: "28px",
          }}
        />
      )}

      {/* Notch */}
      {deviceConfig.hasNotch && !deviceConfig.hasDynamicIsland && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-black rounded-b-2xl z-10"
          style={{
            top: "0px",
            width: "140px",
            height: "28px",
          }}
        />
      )}

      {/* Inner screen */}
      <div
        className="overflow-hidden w-full h-full"
        style={{
          borderRadius: deviceConfig.borderRadius
            ? `${Math.max(0, deviceConfig.borderRadius - 8)}px`
            : "16px",
          backgroundColor: isDark ? "#111827" : "#ffffff",
        }}
      >
        {children}
      </div>

      {/* Home Indicator */}
      {deviceConfig.hasHomeIndicator && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bg-gray-400 dark:bg-gray-500 rounded-full z-10"
          style={{
            bottom: "6px",
            width: "100px",
            height: "4px",
          }}
        />
      )}
    </div>
  );
};

export default DeviceMockup;
