// ============================================================================
// html-preview/email-client-uis/gmail.tsx
// Gmail email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * Gmail UI chrome.
 * Material Design inspired layout with Gmail-specific header and action icons.
 */
const GmailUI: React.FC<EmailClientUIProps> = ({
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
    bg: isDark ? "#202124" : "#ffffff",
    surface: isDark ? "#202124" : "#ffffff",
    text: isDark ? "#e8eaed" : "#202124",
    textSecondary: isDark ? "#9aa0a6" : "#5f6368",
    border: isDark ? "#3c4043" : "#dadce0",
    accent: isDark ? "#FF6B6B" : "#EA4335",
    headerBg: isDark ? "#202124" : "#ffffff",
    iconColor: isDark ? "#e8eaed" : "#5f6368",
    avatarBg: "#EA4335",
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
          font-family: Roboto, "Helvetica Neue", sans-serif;
          color: ${colors.text};
          background: ${colors.surface};
          padding: 16px;
          line-height: 1.6;
          word-wrap: break-word;
        }
        img { max-width: 100% !important; height: auto !important; }
        a { color: ${isDark ? "#8ab4f8" : "#1a73e8"}; }
        table { max-width: 100%; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `;

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden ${className}`}
      style={{
        fontFamily: '"Google Sans", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* Gmail Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{
          backgroundColor: colors.headerBg,
          borderColor: colors.border,
        }}
      >
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill={colors.accent}>
            <path d="M12 14l-8-6v10h16V8l-8 6z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: colors.text }}>
            Gmail
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {["Archive", "Delete", "Mark unread", "More"].map((action) => (
            <button
              key={action}
              className="p-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ color: colors.iconColor }}
              title={action}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
                <circle cx="5" cy="12" r="2" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Email Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <h1 className="text-lg font-normal mb-3" style={{ color: colors.text }}>
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
                {senderEmail}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs" style={{ color: colors.textSecondary }}>
                to me
              </span>
              <span className="text-xs" style={{ color: colors.textSecondary }}>
                {timestamp}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ color: colors.iconColor }}
              title="Star"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ color: colors.iconColor }}
              title="Reply"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
              </svg>
            </button>
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

export default GmailUI;
