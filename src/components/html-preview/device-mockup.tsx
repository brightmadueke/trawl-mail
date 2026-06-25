import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { EmailClientMockup } from "./email-client-mockup";
import { PhoneStatusBar } from "@/components/html-preview/device-elements/phone-status-bar";
import { DynamicIsland } from "@/components/html-preview/device-elements/dynamic-island";
import { Notch } from "@/components/html-preview/device-elements/notch";
import { HomeIndicator } from "@/components/html-preview/device-elements/home-indicator";
import { ScreenGlare } from "@/components/html-preview/device-elements/screen-glare";
import { DeviceButtons } from "@/components/html-preview/device-elements/device-buttons";
import { CameraElement } from "@/components/html-preview/device-elements/camera-element";
import type {
  DeviceConfig,
  EmailClient,
  EmailClientConfig,
  ThemeMode,
} from "@/types/html-preview";
import { Email } from "@/types/app";

// ============================================================================
// TYPES
// ============================================================================

interface DeviceMockupProps {
  deviceConfig: DeviceConfig;
  clientConfig: EmailClientConfig;
  htmlContent: string;
  theme: ThemeMode;
  emailClient: EmailClient;
  showFrame: boolean;
  orientation: "portrait" | "landscape";
  scale: number;
  iframeKey: number;
  className?: string;
  selectedEmail: Email;
}

// ============================================================================
// DEVICE MOCKUP COMPONENT
// ============================================================================

export function DeviceMockup({
  deviceConfig,
  clientConfig,
  htmlContent,
  theme,
  emailClient,
  showFrame,
  orientation,
  scale,
  iframeKey,
  className,
  selectedEmail,
}: DeviceMockupProps) {
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

  // ---- KEY CHANGE: no bezel for laptops/desktops ----
  const isLaptopOrDesktop =
    deviceConfig.category === "desktop" || deviceConfig.category === "laptop";
  const bezelSize = isLaptopOrDesktop ? 0 : deviceConfig.bezelWidth;

  // Different padding for different device categories
  const framePadding =
    deviceConfig.category === "desktop"
      ? 24
      : deviceConfig.category === "laptop"
        ? 16
        : deviceConfig.category === "tablet"
          ? 14
          : 10; // phone

  // Frame dimensions (outer metal band)
  const frameWidth = showFrame
    ? displayWidth + bezelSize * 2 + framePadding
    : displayWidth;

  const frameHeight = showFrame
    ? displayHeight + bezelSize * 2 + framePadding
    : displayHeight;

  // Screen glass area positioning
  const screenAreaTop = framePadding / 2;
  const screenAreaLeft = framePadding / 2;
  const screenAreaWidth = displayWidth + bezelSize * 2;
  const screenAreaHeight = displayHeight + bezelSize * 2;

  // Calculate content top offset based on device features
  const contentTopOffset =
    deviceConfig.category === "desktop" || deviceConfig.category === "laptop"
      ? 0
      : deviceConfig.hasDynamicIsland
        ? 54
        : deviceConfig.hasNotch
          ? 48
          : deviceConfig.camera.type === "punch-hole"
            ? 36
            : 24;

  // Content top position (now 0 for laptops because bezelSize = 0)
  const contentTop = bezelSize + contentTopOffset;

  // Get the status bar background color from email client config
  const statusBarBg =
    theme === "dark" ? clientConfig.headerBgDark : clientConfig.headerBg;

  // Apply scale directly to dimensions instead of CSS transform
  const scaledFrameWidth = frameWidth * scale;
  const scaledFrameHeight = frameHeight * scale;

  // Determine if this is a mobile device
  const isMobile = deviceConfig.category === "phone";

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out select-none",
        showFrame && "shadow-2xl",
        className,
      )}
      style={{
        width: `${scaledFrameWidth}px`,
        height: `${scaledFrameHeight}px`,
        borderRadius: `${deviceConfig.borderRadius}px`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: showFrame ? deviceConfig.frameGradient : "transparent",
          borderRadius: showFrame ? `${deviceConfig.borderRadius}px` : "0px",
          boxShadow: showFrame
            ? `0 0 0 1px ${deviceConfig.frameBorderColor}, 
               0 ${25 * scale}px ${50 * scale}px -12px rgba(0, 0, 0, 0.5),
               inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
        }}
      >
        {/* Inner frame highlight for depth */}
        {showFrame && deviceConfig.category !== "desktop" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: `${deviceConfig.borderRadius}px`,
              zIndex: 1,
            }}
          />
        )}

        {/* Physical Buttons */}
        {showFrame && deviceConfig.buttons.length > 0 && (
          <DeviceButtons
            buttons={deviceConfig.buttons}
            frameHeight={frameHeight}
            frameWidth={frameWidth}
            borderRadius={deviceConfig.borderRadius}
            frameColor={deviceConfig.frameColor}
          />
        )}

        {/* Screen Glass Area (black glass with bezel) */}
        {showFrame && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: `${screenAreaTop}px`,
              left: `${screenAreaLeft}px`,
              width: `${screenAreaWidth}px`,
              height: `${screenAreaHeight}px`,
              borderRadius: `${deviceConfig.screenBorderRadius}px`,
              background: deviceConfig.bezelColor,
              boxShadow: "inset 0 0 1px rgba(255,255,255,0.1)",
            }}
          >
            {/* Dynamic Island - sits in the glass, status bar wraps around it */}
            {deviceConfig.hasDynamicIsland && (
              <>
                <DynamicIsland />
                <div
                  className={cn(
                    "absolute left-0 right-0 z-20",
                    theme === "dark"
                      ? clientConfig.headerBgDark
                      : clientConfig.headerBg,
                  )}
                  style={{
                    top: 0,
                    height: "57px",
                  }}
                >
                  <PhoneStatusBar
                    backgroundColor={
                      theme === "dark"
                        ? clientConfig.headerTextDark
                        : clientConfig.headerText
                    }
                    hasDynamicIsland={true}
                  />
                </div>
              </>
            )}

            {/* Notch - sits at top, status bar wraps around it */}
            {deviceConfig.hasNotch && deviceConfig.category !== "laptop" && (
              <>
                <Notch />
                <div
                  className={cn(
                    "absolute left-0 right-0 z-20",
                    theme === "dark"
                      ? clientConfig.headerBgDark
                      : clientConfig.headerBg,
                  )}
                  style={{
                    top: 0,
                    height: "53px",
                  }}
                >
                  <PhoneStatusBar
                    backgroundColor={
                      theme === "dark"
                        ? clientConfig.headerTextDark
                        : clientConfig.headerText
                    }
                    hasNotch={true}
                  />
                </div>
              </>
            )}

            {/* Laptop notch */}
            {deviceConfig.hasNotch && deviceConfig.category === "laptop" && (
              <Notch />
            )}

            {/* Camera punch-hole - camera on top (z-30), status bar below (z-20) */}
            {deviceConfig.camera.type === "punch-hole" && (
              <>
                <div
                  className={cn(
                    "absolute z-20",
                    theme === "dark"
                      ? clientConfig.headerBgDark
                      : clientConfig.headerBg,
                  )}
                  style={{
                    top: 0,
                    height: "48px",
                    left: 0,
                    right: 0,
                  }}
                >
                  <PhoneStatusBar
                    backgroundColor={
                      theme === "dark"
                        ? clientConfig.headerTextDark
                        : clientConfig.headerText
                    }
                    hasPunchHole={true}
                  />
                </div>
                <CameraElement config={deviceConfig.camera} />
              </>
            )}

            {/* Status bar for devices without notch/island/punch-hole */}
            {!deviceConfig.hasDynamicIsland &&
              !deviceConfig.hasNotch &&
              deviceConfig.camera.type !== "punch-hole" &&
              deviceConfig.category === "phone" && (
                <div
                  className="absolute left-0 right-0 z-20"
                  style={{
                    top: "8px",
                    height: "24px",
                  }}
                >
                  <PhoneStatusBar backgroundColor={statusBarBg} />
                </div>
              )}

            {/* Content Area */}
            <div
              className={`absolute overflow-hidden ${isMobile ? "h-svh" : ""}`}
              style={{
                top: `${contentTop}px`,
                left: 0,
                right: 0,
                // For laptops/desktops, the content height is exactly the screen glass height (no bezel)
                // For other devices, use h-svh (dynamic) which works for mobile
                ...(isLaptopOrDesktop
                  ? { height: `${screenAreaHeight}px`, bottom: "auto" }
                  : {}),
                // Make sure the content doesn't overflow the rounded corners
                borderBottomLeftRadius: isLaptopOrDesktop
                  ? `${deviceConfig.screenBorderRadius}px`
                  : undefined,
                borderBottomRightRadius: isLaptopOrDesktop
                  ? `${deviceConfig.screenBorderRadius}px`
                  : undefined,
              }}
            >
              <EmailClientMockup
                clientConfig={clientConfig}
                htmlContent={htmlContent}
                theme={theme}
                emailClient={emailClient}
                iframeKey={iframeKey}
                selectedEmail={selectedEmail}
                isMobile={isMobile}
              />

              {/* Screen Glare Effect */}
              {deviceConfig.screenGlare.enabled && (
                <ScreenGlare
                  intensity={deviceConfig.screenGlare.intensity}
                  angle={deviceConfig.screenGlare.angle}
                />
              )}
            </div>

            {/* Home Indicator - floats on top of content with no extra space */}
            {deviceConfig.hasHomeBar && (
              <HomeIndicator deviceConfig={deviceConfig} theme={theme} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
