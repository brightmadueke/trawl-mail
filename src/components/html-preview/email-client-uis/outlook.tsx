// ============================================================================
// html-preview/email-client-uis/outlook.tsx
// Outlook email client UI component
// ============================================================================

import React from "react";
import EmailContentIframe from "../email-content-iframe.tsx";
import type { EmailClientUIProps } from "../types";

/**
 * Outlook UI chrome.
 * Features left app sidebar, folder list, and ribbon-style toolbar.
 * Styled to match Microsoft 365 Outlook design.
 */
const OutlookUI: React.FC<EmailClientUIProps> = ({
  htmlContent,
  theme,
  subject = "Email Subject",
  senderName = "Sender Name",
  senderEmail = "sender@example.com",
  timestamp = "Today, 10:30 AM",
  className = "",
  iframeKey = 0,
}) => {
  const isDark = theme === "dark";

  const colors = {
    appSidebarBg: isDark ? "#1a1a2e" : "#1b3a5c",
    folderBg: isDark ? "#1e1e2e" : "#f0f2f5",
    surface: isDark ? "#1e1e2e" : "#ffffff",
    text: isDark ? "#ffffff" : "#333333",
    textSecondary: isDark ? "#a0a0b0" : "#666666",
    border: isDark ? "#333344" : "#e0e0e0",
    accent: isDark ? "#4DA3E0" : "#0078D4",
    headerBg: isDark ? "#0078D4" : "#0078D4",
    avatarBg: "#0078D4",
    ribbonBg: isDark ? "#252535" : "#f8f8f8",
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
          font-family: "Segoe UI", "Helvetica Neue", sans-serif;
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

  // App sidebar icons (Mail, Calendar, People, Tasks)
  const appIcons = ["Mail", "Calendar", "People", "Tasks"];

  // Folder list
  const folders = [
    { name: "Inbox", active: true },
    { name: "Drafts" },
    { name: "Sent Items" },
    { name: "Deleted Items" },
    { name: "Archive" },
  ];

  return (
    <div
      className={`flex h-full w-full overflow-hidden ${className}`}
      style={{ fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif' }}
    >
      {/* App Sidebar (leftmost) */}
      <div
        className="flex flex-col items-center w-12 flex-shrink-0 py-3 gap-3"
        style={{ backgroundColor: colors.appSidebarBg }}
      >
        {appIcons.map((name) => (
          <button
            key={name}
            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-medium transition-colors hover:bg-white/10"
            title={name}
            style={{
              backgroundColor:
                name === "Mail" ? "rgba(255,255,255,0.15)" : "transparent",
            }}
          >
            {name.charAt(0)}
          </button>
        ))}
      </div>

      {/* Folder Panel */}
      <div
        className="hidden sm:flex flex-col w-36 lg:w-44 flex-shrink-0 border-r overflow-y-auto"
        style={{
          backgroundColor: colors.folderBg,
          borderColor: colors.border,
        }}
      >
        <div className="p-3">
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-2"
            style={{ color: colors.textSecondary }}
          >
            Folders
          </h3>
          {folders.map((folder) => (
            <div
              key={folder.name}
              className="px-2 py-1.5 rounded text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: folder.active
                  ? colors.accent + "20"
                  : "transparent",
                color: folder.active ? colors.accent : colors.text,
                fontWeight: folder.active ? 600 : 400,
              }}
            >
              {folder.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Ribbon Toolbar */}
        <div
          className="flex items-center gap-1 px-3 py-1.5 border-b overflow-x-auto"
          style={{
            backgroundColor: colors.ribbonBg,
            borderColor: colors.border,
          }}
        >
          {["Reply", "Reply All", "Forward", "Delete", "Archive", "Flag"].map(
            (action) => (
              <button
                key={action}
                className="px-2.5 py-1 text-xs font-medium rounded transition-colors hover:opacity-80 whitespace-nowrap"
                style={{
                  color: colors.text,
                  backgroundColor: "transparent",
                }}
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
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: colors.avatarBg }}
            >
              {senderName.charAt(0).toUpperCase()}
            </div>
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
              <div className="flex items-center gap-2 mt-0.5">
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
          <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
        </div>
      </div>
    </div>
  );
};

export default OutlookUI;
