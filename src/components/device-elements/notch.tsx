export function Notch() {
  return (
    <div
      className="absolute bg-black z-10"
      style={{
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "160px",
        height: "30px",
        borderRadius: "0 0 16px 16px",
      }}
    >
      <div className="absolute top-2.5 right-5 w-2 h-2 bg-gray-700 rounded-full" />
    </div>
  );
}
