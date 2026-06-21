// ============================================================================
// html-preview/email-client-uis/apple-mail.tsx
// Apple Mail email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * Apple Mail UI chrome.
 * Features a sidebar with mailbox folders and a toolbar with action buttons.
 * Styled to match macOS Mail app appearance.
 */
const AppleMailUI: React.FC<EmailClientUIProps> = ({
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

  // Theme-aware color tokens
  const colors = {
    bg: isDark ? "#1c1c1e" : "#f5f5f7",
    sidebarBg: isDark ? "#1a1a1c" : "#e8e8ed",
    surface: isDark ? "#2c2c2e" : "#ffffff",
    text: isDark ? "#f5f5f7" : "#1d1d1f",
    textSecondary: isDark ? "#98989d" : "#6e6e73",
    border: isDark ? "#38383a" : "#d1d1d6",
    accent: isDark ? "#0A84FF" : "#007AFF",
    avatarBg: "#007AFF",
  };

  // Mailbox items for the sidebar
  const mailboxes = [
    { name: "Inbox", count: 24, active: true },
    { name: "VIP", count: 3, active: false },
    { name: "Sent", count: null, active: false },
    { name: "Drafts", count: 2, active: false },
    { name: "Trash", count: null, active: false },
    { name: "Archive", count: null, active: false },
  ];

  /**
   * Generate the full email HTML document.
   * Wraps the raw HTML content with responsive styles for the iframe.
   */
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: ${isDark ? '-apple-system, "Helvetica Neue"' : '-apple-system, "Helvetica Neue"'};
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
      className={`flex h-full w-full overflow-hidden ${className}`}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Sidebar - Hidden on very small screens */}
      <div
        className="hidden sm:flex flex-col w-40 lg:w-48 flex-shrink-0 border-r overflow-y-auto"
        style={{
          backgroundColor: colors.sidebarBg,
          borderColor: colors.border,
        }}
      >
        <div className="p-3">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-2"
            style={{ color: colors.textSecondary }}
          >
            Mailboxes
          </h2>
          {mailboxes.map((mbox) => (
            <div
              key={mbox.name}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm cursor-pointer ${
                mbox.active ? "font-semibold" : ""
              }`}
              style={{
                backgroundColor: mbox.active
                  ? colors.accent + "20"
                  : "transparent",
                color: mbox.active ? colors.accent : colors.text,
              }}
            >
              <span>{mbox.name}</span>
              {mbox.count !== null && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: mbox.active
                      ? colors.accent
                      : colors.textSecondary + "30",
                    color: mbox.active ? "#ffffff" : colors.textSecondary,
                  }}
                >
                  {mbox.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div
          className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
          }}
        >
          {["Back", "Archive", "Delete", "Reply", "Forward", "Flag"].map(
            (action) => (
              <button
                key={action}
                className="px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors hover:opacity-80"
                style={{
                  color: colors.text,
                  backgroundColor: "transparent",
                }}
                title={action}
              >
                {action}
              </button>
            ),
          )}
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
            className="text-base font-semibold mb-2"
            style={{ color: colors.text }}
          >
            {subject}
          </h1>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: colors.avatarBg }}
            >
              {senderName.charAt(0).toUpperCase()}
            </div>
            {/* Sender Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-semibold text-sm"
                  style={{ color: colors.text }}
                >
                  {senderName}
                </span>
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {senderEmail}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  To: me
                </span>
                <span
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {timestamp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-auto">
          <EmailContentIframe
            emailHTML={emailHTML}
            iframeKey={iframeKey}
            className="min-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
};

export default AppleMailUI;
