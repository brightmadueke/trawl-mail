export function DynamicIsland() {
  return (
    <div
      className="absolute bg-black z-10"
      style={{
        top: "6px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120px",
        height: "28px",
        borderRadius: "20px",
      }}
    >
      <div className="absolute top-1/2 right-5 -translate-y-1/2 w-2 h-2 bg-gray-700 rounded-full border border-gray-600" />
    </div>
  );
}
