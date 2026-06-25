import { Battery, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface PhoneStatusBarProps {
  backgroundColor?: string;
  hasDynamicIsland?: boolean;
  hasNotch?: boolean;
  hasPunchHole?: boolean;
}

export function PhoneStatusBar({
  backgroundColor,
  hasDynamicIsland,
  hasNotch,
  hasPunchHole,
}: PhoneStatusBarProps) {
  // For punch-hole cameras - status bar items wrap around the camera
  if (hasPunchHole) {
    // Camera is centered, time on left, icons on right
    return (
      <div
        className={cn("h-full flex items-center px-6", backgroundColor)}
        //style={{ backgroundColor: backgroundColor || "transparent" }}
      >
        {/* Time - on the left */}
        <span className={`text-[11px] font-semibold`}>9:41</span>

        {/* Flexible spacer to push icons to the right */}
        <div className="flex-1" />

        {/* Status icons - on the right */}
        <div className="flex items-center gap-1.5">
          <Signal className={`w-3.5 h-3.5`} strokeWidth={2} />
          <Wifi className={`w-3.5 h-3.5`} strokeWidth={2} />
          <Battery className={`w-5 h-2.5`} strokeWidth={2} />
        </div>
      </div>
    );
  }

  // For dynamic island and notch - status bar wraps around
  if (hasDynamicIsland || hasNotch) {
    return (
      <div
        className={cn(
          "h-full flex items-center justify-between px-6",
          backgroundColor,
        )}
        //style={{ backgroundColor: backgroundColor || "transparent" }}
      >
        {/* Time */}
        <span className={`text-[11px] font-semibold`}>9:41</span>

        {/* Spacer for notch/island area */}
        <div className="flex-1" />

        {/* Status icons */}
        <div className="flex items-center gap-1.5 justify-end">
          <Signal className={`w-3.5 h-3.5`} strokeWidth={2} />
          <Wifi className={`w-3.5 h-3.5`} strokeWidth={2} />
          <Battery className={`w-5 h-2.5`} strokeWidth={2} />
        </div>
      </div>
    );
  }

  // Default status bar for devices without notch/island/punch-hole
  return (
    <div
      className={cn(
        "h-full flex items-center justify-between px-6",
        backgroundColor,
      )}
      //style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      {/* Time */}
      <span className={`text-[11px] font-semibold`}>9:41</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status icons */}
      <div className="flex items-center gap-1.5">
        <Signal className={`w-3.5 h-3.5`} strokeWidth={2} />
        <Wifi className={`w-3.5 h-3.5`} strokeWidth={2} />
        <Battery className={`w-5 h-2.5`} strokeWidth={2} />
      </div>
    </div>
  );
}
