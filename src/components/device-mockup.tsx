import {useMemo} from "react";
import {cn} from "@/lib/utils";
import {EmailClientMockup} from "./email-client-mockup";
import {PhoneStatusBar} from "./device-elements/phone-status-bar";
import {DynamicIsland} from "./device-elements/dynamic-island";
import {Notch} from "./device-elements/notch";
import {HomeIndicator} from "./device-elements/home-indicator";
import type {DeviceConfig, EmailClient, EmailClientConfig, ThemeMode,} from "@/types/html-preview";
import {Email} from "@/types/app.ts";

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

  // Calculate frame dimensions
  const frameWidth = useMemo(
    () =>
      showFrame
        ? displayWidth + (deviceConfig.category === "phone" ? 12 : 20)
        : displayWidth,
    [showFrame, displayWidth, deviceConfig.category],
  );

  const frameHeight = useMemo(
    () =>
      showFrame
        ? displayHeight + (deviceConfig.category === "phone" ? 40 : 50)
        : displayHeight,
    [showFrame, displayHeight, deviceConfig.category],
  );

  // Calculate screen offsets
  const screenTop = useMemo(
    () =>
      showFrame ? (deviceConfig.category === "phone" ? "28px" : "20px") : 0,
    [showFrame, deviceConfig.category],
  );

  const screenHorizontal = useMemo(
    () =>
      showFrame ? (deviceConfig.category === "phone" ? "6px" : "10px") : 0,
    [showFrame, deviceConfig.category],
  );

  const screenBottom = useMemo(
    () =>
      showFrame ? (deviceConfig.category === "phone" ? "10px" : "12px") : 0,
    [showFrame, deviceConfig.category],
  );

  const screenBorderRadius = useMemo(
    () =>
      showFrame
        ? deviceConfig.category === "phone"
          ? 36
          : deviceConfig.borderRadius - 4
        : 0,
    [showFrame, deviceConfig.category, deviceConfig.borderRadius],
  );

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        showFrame && "shadow-2xl",
        className,
      )}
      style={{
        width: frameWidth,
        height: frameHeight,
        backgroundColor: showFrame ? deviceConfig.frameColor : "transparent",
        borderRadius: showFrame ? deviceConfig.borderRadius : 0,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Device Frame Elements */}
      {showFrame && deviceConfig.category !== "desktop" && (
        <>
          {deviceConfig.category === "phone" && <PhoneStatusBar />}
          {deviceConfig.hasDynamicIsland && <DynamicIsland />}
          {deviceConfig.hasNotch && <Notch />}
          {deviceConfig.hasHomeBar && <HomeIndicator />}
        </>
      )}

      {/* Screen */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: screenTop,
          left: screenHorizontal,
          right: screenHorizontal,
          bottom: screenBottom,
          borderRadius: screenBorderRadius,
        }}
      >
        <EmailClientMockup
          clientConfig={clientConfig}
          htmlContent={htmlContent}
          theme={theme}
          emailClient={emailClient}
          iframeKey={iframeKey}
          selectedEmail={selectedEmail}
        />
      </div>
    </div>
  );
}
