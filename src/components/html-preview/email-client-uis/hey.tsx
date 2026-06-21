// ============================================================================
// html-preview/email-client-uis/hey.tsx
// HEY Email email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * HEY Email UI chrome.
 * Minimalist design with large sender avatar and centered layout.
 */
const HeyUI: React.FC<EmailClientUIProps> = ({
  htmlContent,
  theme,
  subject = "Email Subject",
  senderName = "Sender Name",
  senderEmail = "sender@example.com",
  timestamp = "10:30 AM",
  className = "",
  iframeKey = 0,
}) => {
  const isDark = theme === "dark";

  const colors = {
    surface: isDark ? "#111827" : "#ffffff",
    text: isDark ? "#f9fafb" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#1f2937" : "#e5e7eb",
    accent: isDark ? "#60A5FA" : "#2563EB",
    avatarBg: "#2563EB",
  };

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: "Avenir Next", "Helvetica Neue", sans-serif;
          color: ${colors.text};
          background: ${colors.surface};
          padding: 16px;
          line-height: 1.6;
          word-wrap: break-word;
        }
        img { max-width: 100% !important; height: auto !important; }
        a { color: ${colors.accent}; text-decoration: underline; }
        table { max-width: 100%; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `;

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden ${className}`}
      style={{ fontFamily: '"Avenir Next", "Helvetica Neue", sans-serif' }}
    >
      {/* HEY Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: colors.border }}
      >
        <span
          className="text-sm font-bold tracking-tight"
          style={{ color: colors.accent }}
        >
          HEY
        </span>
        <div className="flex gap-1">
          <button
            className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors hover:opacity-80"
            style={{
              color: colors.accent,
              backgroundColor: colors.accent + "15",
            }}
          >
            Reply
          </button>
        </div>
      </div>

      {/* Email Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Centered sender info */}
        <div
          className="flex flex-col items-center px-6 py-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold mb-3"
            style={{ backgroundColor: colors.avatarBg }}
          >
            {senderName.charAt(0).toUpperCase()}
          </div>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: colors.text }}
          >
            {senderName}
          </h2>
          <span className="text-xs" style={{ color: colors.textSecondary }}>
            {senderEmail}
          </span>
          <span
            className="text-xs mt-1"
            style={{ color: colors.textSecondary }}
          >
            {timestamp}
          </span>
          <h1
            className="text-xl font-bold mt-4 text-center"
            style={{ color: colors.text }}
          >
            {subject}
          </h1>
        </div>

        {/* Email Content */}
        <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
      </div>
    </div>
  );
};

export default HeyUI;
