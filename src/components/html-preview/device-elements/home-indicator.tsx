import type { DeviceConfig, ThemeMode } from "@/types/html-preview.ts";
import { cn } from "@/lib/utils.ts";

interface HomeIndicatorProps {
  deviceConfig: DeviceConfig;
  theme: ThemeMode;
}

export function HomeIndicator({ deviceConfig, theme }: HomeIndicatorProps) {
  const style = deviceConfig.homeIndicatorStyle || {};

  // Check if this is an iPhone (has dynamic island or notch)
  const isIPhone = deviceConfig.hasDynamicIsland || deviceConfig.hasNotch;

  // Check if this is an older iPhone with home button (no home bar)
  const hasHomeButton = !deviceConfig.hasHomeBar;

  // Don't render if the device has a physical home button
  if (hasHomeButton && deviceConfig.category === "phone") return null;

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-20",
        theme == "dark" ? "bg-neutral-300" : "bg-neutral-500",
      )}
      style={{
        bottom: isIPhone ? "8px" : style.bottom || "8px",
        width: isIPhone ? "134px" : style.width || "134px",
        height: isIPhone ? "5px" : style.height || "5px",
        borderRadius: "100px",
        //background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: getBoxShadow(isIPhone, theme),
      }}
    />
  );
}

function getBoxShadow(isIPhone: boolean, theme: ThemeMode) {
  if (isIPhone) {
    if (theme === "dark") {
      return "0 0 1px rgba(255, 255, 255, 0.1)";
    } else {
      return "0 0 1px rgba(0, 0, 0, 0.1)";
    }
  } else {
    if (theme === "dark") {
      return "0 0 4px rgba(255, 255, 255, 0.2)";
    } else {
      return "0 0 4px rgba(0,0,0,0.2)";
    }
  }
}
