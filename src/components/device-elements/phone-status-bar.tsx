export function PhoneStatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-6 z-20">
      <span className="text-[11px] font-semibold text-gray-300">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg
          width="14"
          height="10"
          viewBox="0 0 14 10"
          className="text-gray-300"
          aria-hidden="true"
        >
          <rect
            x="0"
            y="0"
            width="12"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          <rect
            x="13"
            y="2.5"
            width="1.2"
            height="3"
            rx="0.5"
            fill="currentColor"
          />
        </svg>
        <svg
          width="20"
          height="10"
          viewBox="0 0 20 10"
          className="text-gray-300"
          aria-hidden="true"
        >
          <rect
            x="0"
            y="1.5"
            width="16"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          <rect
            x="17"
            y="3.5"
            width="2"
            height="3"
            rx="0.8"
            fill="currentColor"
          />
          <rect
            x="2.5"
            y="4"
            width="11"
            height="2"
            rx="0.5"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
