import type { CameraConfig } from "@/types/html-preview.ts";

interface CameraElementProps {
  config: CameraConfig;
}

export function CameraElement({ config }: CameraElementProps) {
  if (config.type !== "punch-hole" && config.type !== "teardrop") {
    return null;
  }

  return (
    <div
      className="absolute z-30"
      style={{
        top: `${config.topOffset || 1.7}%`,
        left: `${config.leftOffset || 50}%`,
        transform: "translateX(-50%)",
        width: `${config.width}%`,
        aspectRatio: "1",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #1a1a1a, #000000)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.5), inset 0 0 2px rgba(0,0,0,0.8)",
      }}
    >
      {/* Camera lens reflection */}
      <div
        className="absolute rounded-full"
        style={{
          top: "20%",
          left: "20%",
          width: "30%",
          height: "30%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.4), rgba(255,255,255,0))",
        }}
      />
    </div>
  );
}
