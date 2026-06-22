export function DynamicIsland() {
  return (
    <div
      className="absolute z-30"
      style={{
        top: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "126px",
        height: "35px",
        borderRadius: "20px",
        background: "#000000",
        boxShadow: "0 0 0 2px #000000, 0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {/* Camera lens */}
      <div
        className="absolute"
        style={{
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #1a1a4e, #060626)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)",
        }}
      >
        {/* Lens reflection */}
        <div
          className="absolute rounded-full"
          style={{
            top: "20%",
            left: "20%",
            width: "35%",
            height: "35%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0))",
          }}
        />
      </div>

      {/* IR sensor dot */}
      <div
        className="absolute"
        style={{
          top: "50%",
          right: "36px",
          transform: "translateY(-50%)",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}
