export function Notch() {
  return (
    <div
      className="absolute z-30"
      style={{
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "160px",
        height: "33px",
        borderRadius: "0 0 20px 20px",
        background: "#000000",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      {/* Speaker grille */}
      <div
        className="absolute"
        style={{
          top: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "45px",
          height: "4px",
          borderRadius: "2px",
          background: "#1a1a1a",
          border: "0.5px solid rgba(255,255,255,0.1)",
        }}
      />

      {/* Camera dot */}
      <div
        className="absolute"
        style={{
          top: "9px",
          right: "22px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #1a1a4e, #060626)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 0 2px rgba(0,0,0,0.5)",
        }}
      >
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

      {/* IR illuminator */}
      <div
        className="absolute"
        style={{
          top: "10px",
          right: "42px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#1a1a1a",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}
