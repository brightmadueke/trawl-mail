interface ScreenGlareProps {
  intensity: number;
  angle: number;
}

export function ScreenGlare({ intensity, angle }: ScreenGlareProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        background: `linear-gradient(${angle}deg, 
          rgba(255, 255, 255, ${intensity}) 0%, 
          rgba(255, 255, 255, ${intensity * 0.5}) 25%, 
          rgba(255, 255, 255, 0) 50%,
          rgba(255, 255, 255, 0) 100%)`,
        mixBlendMode: "overlay",
      }}
    >
      {/* Subtle diagonal reflection line */}
      <div
        className="absolute"
        style={{
          top: "10%",
          left: "-20%",
          width: "150%",
          height: "1px",
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(255,255,255,${intensity * 2}) 50%, 
            transparent 100%)`,
          transform: `rotate(${angle}deg)`,
          opacity: 0.3,
        }}
      />
    </div>
  );
}
