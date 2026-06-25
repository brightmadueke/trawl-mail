import type { ButtonPosition } from "@/types/html-preview.ts";

interface DeviceButtonsProps {
  buttons: ButtonPosition[];
  frameHeight: number;
  frameWidth: number;
  borderRadius: number;
  frameColor: string;
}

export function DeviceButtons({
  buttons,
  frameHeight,
  frameWidth,
  frameColor,
}: DeviceButtonsProps) {
  return (
    <>
      {buttons.map((button, index) => {
        const isLeft = button.side === "left";
        const isRight = button.side === "right";
        const isTop = button.side === "top";

        const yPosition = (button.y / 100) * frameHeight;
        const buttonHeight = (button.height / 100) * frameHeight;

        // Create gradient colors that are visible
        const lighterColor = adjustColor(frameColor, 30);
        const darkerColor = adjustColor(frameColor, -15);

        return (
          <div
            key={`${button.type}-${index}`}
            className="absolute z-10"
            style={{
              [isLeft ? "left" : isRight ? "right" : "top"]: isTop
                ? `${(button.y / 100) * frameWidth}px`
                : `-${button.width + 1}px`,
              top: isTop ? `-${button.width + 1}px` : `${yPosition}px`,
              width: isTop
                ? `${(button.height / 100) * frameWidth}px`
                : `${button.width}px`,
              height: isTop ? `${button.width}px` : `${buttonHeight}px`,
              background: `linear-gradient(180deg, 
                ${lighterColor} 0%, 
                ${frameColor} 30%,
                ${darkerColor} 50%, 
                ${frameColor} 70%,
                ${lighterColor} 100%)`,
              borderRadius: isTop
                ? `${button.width / 2}px ${button.width / 2}px 0 0`
                : isLeft
                  ? `${button.width}px 0 0 ${button.width}px`
                  : `0 ${button.width}px ${button.width}px 0`,
              boxShadow: isTop
                ? `0 -1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)`
                : isLeft
                  ? `2px 0 3px rgba(0,0,0,0.5), inset -1px 0 1px rgba(255,255,255,0.15)`
                  : `-2px 0 3px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.15)`,
              border: `1px solid ${adjustColor(frameColor, -20)}`,
            }}
          />
        );
      })}
    </>
  );
}

// Helper function to lighten/darken a hex color
function adjustColor(hex: string, amount: number): string {
  // Remove the hash if present
  const cleanHex = hex.replace("#", "");

  // Parse the RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Adjust each channel
  const newR = Math.min(255, Math.max(0, r + amount));
  const newG = Math.min(255, Math.max(0, g + amount));
  const newB = Math.min(255, Math.max(0, b + amount));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
