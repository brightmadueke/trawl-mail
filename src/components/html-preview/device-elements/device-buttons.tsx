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
                ${frameColor} 0%, 
                ${adjustColor(frameColor, 20)} 50%, 
                ${frameColor} 100%)`,
              borderRadius: isTop
                ? `${button.width / 2}px ${button.width / 2}px 0 0`
                : isLeft
                  ? `${button.width}px 0 0 ${button.width}px`
                  : `0 ${button.width}px ${button.width}px 0`,
              boxShadow: isTop
                ? "0 -1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : isLeft
                  ? "1px 0 2px rgba(0,0,0,0.3), inset -1px 0 0 rgba(255,255,255,0.1)"
                  : "-1px 0 2px rgba(0,0,0,0.3), inset 1px 0 0 rgba(255,255,255,0.1)",
              border: `1px solid ${adjustColor(frameColor, -10)}`,
            }}
          />
        );
      })}
    </>
  );
}

// Helper function to lighten/darken a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
