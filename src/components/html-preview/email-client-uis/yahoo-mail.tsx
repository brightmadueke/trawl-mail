// ============================================================================
// html-preview/email-client-uis/yahoo-mail.tsx
// Yahoo Mail email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * Yahoo Mail UI chrome.
 * Purple branded header with clean, simple layout.
 */
const YahooMailUI: React.FC<EmailClientUIProps> = ({
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
    surface: isDark ? "#1a1a2e" : "#ffffff",
    text: isDark ? "#e0e0e0" : "#232a31",
    textSecondary: isDark ? "#8888aa" : "#6e7780",
    border: isDark ? "#2a2a40" : "#e1e4e8",
    accent: isDark ? "#8B5CF6" : "#6001D2",
    headerBg: isDark ? "#2d1066" : "#6001D2",
    avatarBg: "#6001D2",
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
          font-family: "Yahoo Sans", "Helvetica Neue", sans-serif;
          color: ${colors.text};
          background: ${colors.surface};
          padding: 16px;
          line-height: 1.5;
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
      style={{ fontFamily: '"Yahoo Sans", "Helvetica Neue", sans-serif' }}
    >
      {/* Yahoo Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: colors.headerBg }}
      >
        <span className="text-white font-bold text-sm tracking-wide">
          Yahoo Mail
        </span>
      </div>

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
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: colors.avatarBg }}
          >
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="font-semibold text-sm"
              style={{ color: colors.text }}
            >
              {senderName}
            </span>
            <span
              className="text-xs ml-2"
              style={{ color: colors.textSecondary }}
            >
              {senderEmail}
            </span>
            <div
              className="text-xs mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              {timestamp}
            </div>
          </div>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors hover:opacity-80"
            style={{
              color: colors.accent,
              borderColor: colors.accent,
              backgroundColor: "transparent",
            }}
          >
            Reply
          </button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-auto">
        <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
      </div>
    </div>
  );
};

export default YahooMailUI;
