// ============================================================================
// html-preview/email-client-uis/simple.tsx
// Simple/minimal email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * Simple email UI chrome.
 * Minimal design with just sender info and content - no sidebar or complex chrome.
 * Ideal as the default view for a desktop email client.
 */
const SimpleUI: React.FC<EmailClientUIProps> = ({
  htmlContent,
  theme,
  subject = "Email Subject",
  senderName = "Sender Name",
  senderEmail = "sender@example.com",
  timestamp = "Today at 10:30 AM",
  className = "",
  iframeKey = 0,
}) => {
  const isDark = theme === "dark";

  const colors = {
    surface: isDark ? "#1f2937" : "#ffffff",
    text: isDark ? "#f9fafb" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    accent: isDark ? "#818cf8" : "#4f46e5",
    avatarBg: isDark ? "#6366f1" : "#4f46e5",
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
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          color: ${colors.text};
          background: ${colors.surface};
          padding: 16px;
          line-height: 1.6;
          word-wrap: break-word;
        }
        img { max-width: 100% !important; height: auto !important; }
        a { color: ${colors.accent}; }
        table { max-width: 100%; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `;

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden ${className}`}
      style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* Email Header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <h1
          className="text-lg font-semibold mb-3"
          style={{ color: colors.text }}
        >
          {subject}
        </h1>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
            style={{ backgroundColor: colors.avatarBg }}
          >
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-medium text-sm"
                style={{ color: colors.text }}
              >
                {senderName}
              </span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>
                &lt;{senderEmail}&gt;
              </span>
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              {timestamp}
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-auto">
        <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
      </div>
    </div>
  );
};

export default SimpleUI;
