import type { DeviceConfig } from "@/types/html-preview.ts";

interface HomeIndicatorProps {
  deviceConfig: DeviceConfig;
}

export function HomeIndicator({ deviceConfig }: HomeIndicatorProps) {
  const style = deviceConfig.homeIndicatorStyle || {};

  // Check if this is an iPhone (has dynamic island or notch)
  const isIPhone = deviceConfig.hasDynamicIsland || deviceConfig.hasNotch;

  // Check if this is an older iPhone with home button (no home bar)
  const hasHomeButton = !deviceConfig.hasHomeBar;

  // Don't render if the device has a physical home button
  if (hasHomeButton && deviceConfig.category === "phone") return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{
        bottom: isIPhone ? "8px" : style.bottom || "8px",
        width: isIPhone ? "134px" : style.width || "134px",
        height: isIPhone ? "5px" : style.height || "5px",
        borderRadius: "100px",
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: isIPhone
          ? "0 0 1px rgba(255, 255, 255, 0.1)"
          : "0 0 4px rgba(0,0,0,0.2)",
      }}
    />
  );
}
