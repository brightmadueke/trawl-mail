import type { EmailClient, EmailClientConfig } from "@/types/html-preview.ts";

// ============================================================================
// EMAIL CLIENT CONFIGURATIONS
// ============================================================================

export const EMAIL_CLIENTS: Record<EmailClient, EmailClientConfig> = {
  "apple-mail": {
    name: "Apple Mail",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      >
        <path d="M22 5.5C22 4.11929 20.8807 3 19.5 3H4.5C3.11929 3 2 4.11929 2 5.5V18.5C2 19.8807 3.11929 21 4.5 21H19.5C20.8807 21 22 19.8807 22 18.5V5.5ZM4.5 5H19.5C19.7761 5 20 5.22386 20 5.5V6.282L12 12.338L4 6.282V5.5C4 5.22386 4.22386 5 4.5 5ZM4 7.718L12 13.774L20 7.718V18.5C20 18.7761 19.7761 19 19.5 19H4.5C4.22386 19 4 18.7761 4 18.5V7.718Z" />
      </svg>
    ),
    headerBg: "bg-[#F5F5F7]",
    headerBgDark: "bg-[#1C1C1E]",
    headerText: "text-[#1D1D1F]",
    headerTextDark: "text-[#F5F5F7]",
    bgColor: "bg-[#F2F2F7] text-[#1D1D1F]",
    bgColorDark: "bg-[#1C1C1E] text-[#F5F5F7]",
    accentColor: "#007AFF",
    fontFamily:
      "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
    avatarBg: "#007AFF",
  },
  gmail: {
    name: "Gmail",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
    headerBg: "bg-[#F8F9FA]",
    headerBgDark: "bg-[#202124]",
    headerText: "text-[#202124]",
    headerTextDark: "text-[#E8EAED]",
    bgColor: "bg-[#FFFFFF] text-[#202124]",
    bgColorDark: "bg-[#1E1E1E] text-[#E8EAED]",
    accentColor: "#1A73E8",
    fontFamily: "'Google Sans', 'Roboto', 'Arial', sans-serif",
    avatarBg: "#EA4335",
  },
  outlook: {
    name: "Outlook",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 7.387v10.478c0 1.464-1.185 2.65-2.65 2.65H2.65C1.186 20.515 0 19.33 0 17.865V7.387c0-1.464 1.186-2.65 2.65-2.65h18.7C22.814 4.737 24 5.923 24 7.387zm-4.72-1.324l-5.848 4.234 5.848 4.234V6.063zm-1.497 10.73H5.47c-.688 0-1.244-.557-1.244-1.245V9.406c0-.688.557-1.245 1.245-1.245h12.314c.688 0 1.245.557 1.245 1.245v6.142c0 .688-.557 1.245-1.245 1.245z" />
      </svg>
    ),
    headerBg: "bg-[#0078D4]",
    headerBgDark: "bg-[#2B2B2B]",
    headerText: "text-white",
    headerTextDark: "text-[#E8EAED]",
    bgColor: "bg-[#F3F5F8] text-[#252525]",
    bgColorDark: "bg-[#1E1E1E] text-[#E8EAED]",
    accentColor: "#0078D4",
    fontFamily:
      "'Segoe UI Variable', 'Segoe UI', system-ui, 'Helvetica Neue', sans-serif",
    avatarBg: "#0078D4",
  },
  "yahoo-mail": {
    name: "Yahoo Mail",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 21.5C6.753 21.5 2.5 17.247 2.5 12S6.753 2.5 12 2.5 21.5 6.753 21.5 12 17.247 21.5 12 21.5zm0-17C7.865 4.5 4.5 7.865 4.5 12s3.365 7.5 7.5 7.5 7.5-3.365 7.5-7.5S16.135 4.5 12 4.5zm.12 3.12l2.38 3.5-2.5 1.88-2.5-1.88 2.38-3.5h.24zm0 6.38l2.5-1.88 1.12 1.62c-.69.78-1.74 1.26-2.88 1.26h-1.72c-1.14 0-2.19-.48-2.88-1.26l1.12-1.62 2.5 1.88h.24z" />
      </svg>
    ),
    headerBg: "bg-[#7B0099]",
    headerBgDark: "bg-[#2B2B2B]",
    headerText: "text-white",
    headerTextDark: "text-[#E8EAED]",
    bgColor: "bg-[#F5F5F5] text-[#1A1A1A]",
    bgColorDark: "bg-[#1E1E1E] text-[#E8EAED]",
    accentColor: "#6001D2",
    fontFamily: "'Yahoo Sans', 'Helvetica Neue', 'Arial', sans-serif",
    avatarBg: "#6001D2",
  },
  hey: {
    name: "HEY",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9c-.828 0-1.5-.672-1.5-1.5S6.672 13 7.5 13h9c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5z" />
      </svg>
    ),
    headerBg: "bg-[#FEFEFE]",
    headerBgDark: "bg-[#1A1A1A]",
    headerText: "text-[#1A1A1A]",
    headerTextDark: "text-[#F5F5F5]",
    bgColor: "bg-[#FEFEFE] text-[#1A1A1A]",
    bgColorDark: "bg-[#121212] text-[#F5F5F5]",
    accentColor: "#FF3B30",
    fontFamily: "'Inter', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
    avatarBg: "#FF3B30",
  },
};
