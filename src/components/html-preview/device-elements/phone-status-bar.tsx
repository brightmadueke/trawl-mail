import { Battery, Signal, Wifi } from "lucide-react";

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
  // Determine if the background is light or dark
  const isDarkBackground = backgroundColor
    ? isColorDark(backgroundColor)
    : true;

  const textColor = isDarkBackground ? "text-white/90" : "text-black/90";

  // For punch-hole cameras - status bar items wrap around the camera
  if (hasPunchHole) {
    // Camera is centered, time on left, icons on right
    return (
      <div
        className="h-full flex items-center px-6"
        style={{ backgroundColor: backgroundColor || "transparent" }}
      >
        {/* Time - on the left */}
        <span className={`text-[11px] font-semibold ${textColor}`}>9:41</span>

        {/* Flexible spacer to push icons to the right */}
        <div className="flex-1" />

        {/* Status icons - on the right */}
        <div className="flex items-center gap-1.5">
          <Signal className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
          <Wifi className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
          <Battery className={`w-5 h-2.5 ${textColor}`} strokeWidth={2} />
        </div>
      </div>
    );
  }

  // For dynamic island and notch - status bar wraps around
  if (hasDynamicIsland || hasNotch) {
    return (
      <div
        className="h-full flex items-center justify-between px-6"
        style={{ backgroundColor: backgroundColor || "transparent" }}
      >
        {/* Time */}
        <span className={`text-[11px] font-semibold ${textColor}`}>9:41</span>

        {/* Spacer for notch/island area */}
        <div className="flex-1" />

        {/* Status icons */}
        <div className="flex items-center gap-1.5 justify-end">
          <Signal className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
          <Wifi className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
          <Battery className={`w-5 h-2.5 ${textColor}`} strokeWidth={2} />
        </div>
      </div>
    );
  }

  // Default status bar for devices without notch/island/punch-hole
  return (
    <div
      className="h-full flex items-center justify-between px-6"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      {/* Time */}
      <span className={`text-[11px] font-semibold ${textColor}`}>9:41</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status icons */}
      <div className="flex items-center gap-1.5">
        <Signal className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
        <Wifi className={`w-3.5 h-3.5 ${textColor}`} strokeWidth={2} />
        <Battery className={`w-5 h-2.5 ${textColor}`} strokeWidth={2} />
      </div>
    </div>
  );
}

// Helper function to determine if a hex color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
