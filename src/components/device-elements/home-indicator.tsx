export function HomeIndicator() {
  return (
    <div
      className="absolute bg-gray-500/60 rounded-full z-10"
      style={{
        bottom: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "134px",
        height: "5px",
      }}
    />
  );
}
