import type { EmailClientConfig, ThemeMode } from "@/types/html-preview";
import { EmailContentIframe } from "./email-content-iframe";
import { Email } from "@/types/app.ts";

// ============================================================================
// OUTLOOK UI
// ============================================================================

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
}

export function OutlookUI({
  clientConfig,
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
}: EmailClientUIProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const headerBg = "#0078D4";
  const textColor = isDark ? "#ffffff" : "#333333";
  const mutedColor = isDark ? "#cccccc" : "#666666";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const sidebarBg = isDark ? "#1C1C1E" : "#F4F4F4";

  return (
    <div className="flex h-full" style={{ backgroundColor: bg }}>
      {/* Left Sidebar */}
      <div
        className="w-[48px] flex-shrink-0 flex flex-col items-center py-2 gap-1"
        style={{
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${borderColor}`,
        }}
      >
        <OutlookSidebarIcon icon={<MailIcon />} label="Mail" active />
        <OutlookSidebarIcon icon={<CalendarIcon />} label="Calendar" />
        <OutlookSidebarIcon icon={<PeopleIcon />} label="People" />
        <OutlookSidebarIcon icon={<TasksIcon />} label="Tasks" />
      </div>

      {/* Folder List */}
      <div
        className="w-[180px] flex-shrink-0 border-r flex flex-col"
        style={{ backgroundColor: bg, borderColor: borderColor }}
      >
        <div className="p-3 border-b" style={{ borderColor: borderColor }}>
          <button
            className="w-full py-2 px-3 rounded text-white text-sm font-medium"
            style={{ backgroundColor: headerBg }}
          >
            + New Message
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <OutlookFolderItem label="Inbox" count="12" active />
          <OutlookFolderItem label="Drafts" count="3" />
          <OutlookFolderItem label="Sent Items" />
          <OutlookFolderItem label="Deleted Items" />
          <OutlookFolderItem label="Archive" />
          <OutlookFolderItem label="Junk Email" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Ribbon */}
        <div
          className="flex items-center gap-1 px-3 py-2 border-b"
          style={{
            backgroundColor: headerBg,
            borderColor: "rgba(255,255,255,0.1)",
            color: "#ffffff",
          }}
        >
          <OutlookRibbonButton icon={<ReplyOIcon />} label="Reply" />
          <OutlookRibbonButton icon={<ReplyAllIcon />} label="Reply All" />
          <OutlookRibbonButton icon={<ForwardOIcon />} label="Forward" />
          <div className="w-px h-6 bg-white/20 mx-2" />
          <OutlookRibbonButton icon={<DeleteOIcon />} label="Delete" />
          <OutlookRibbonButton icon={<ArchiveOIcon />} label="Archive" />
          <OutlookRibbonButton icon={<FlagOIcon />} label="Flag" />
          <div className="flex-1" />
          <OutlookRibbonButton icon={<MoreOIcon />} label="More" />
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Subject */}
          <div className="px-6 pt-5 pb-3">
            <h1 className="text-xl font-semibold" style={{ color: textColor }}>
              {selectedEmail.subject}
            </h1>
          </div>

          {/* Sender Info */}
          <div
            className="px-6 pb-4 mb-4 border-b flex items-start gap-3"
            style={{ borderColor: borderColor }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: clientConfig.avatarBg }}
            >
              {selectedEmail.sender_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-sm"
                style={{ color: textColor }}
              >
                {selectedEmail.sender_name}
              </div>
              <div className="text-xs" style={{ color: mutedColor }}>
                {selectedEmail.from}
              </div>
              <div className="text-xs" style={{ color: mutedColor }}>
                To: {selectedEmail.to}
              </div>
            </div>
            <div className="text-xs" style={{ color: mutedColor }}>
              {selectedEmail.date}
            </div>
          </div>

          {/* Email Body */}
          <div className="px-6">
            <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OUTLOOK SUB-COMPONENTS
// ============================================================================

function OutlookSidebarIcon({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className="w-9 h-9 rounded flex items-center justify-center transition-colors"
      style={{
        backgroundColor: active ? "rgba(0,120,212,0.1)" : "transparent",
        color: active ? "#0078D4" : "#666666",
      }}
      title={label}
      aria-label={label}
    >
      <span className="w-5 h-5">{icon}</span>
    </button>
  );
}

function OutlookFolderItem({
  label,
  count,
  active = false,
}: {
  label: string;
  count?: string;
  active?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors"
      style={{
        backgroundColor: active ? "rgba(0,120,212,0.1)" : "transparent",
        color: active ? "#0078D4" : "#333333",
        fontWeight: active ? 600 : 400,
      }}
    >
      <span className="flex-1">{label}</span>
      {count && <span className="text-xs opacity-60">{count}</span>}
    </div>
  );
}

function OutlookRibbonButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors"
      title={label}
      aria-label={label}
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// OUTLOOK ICONS
// ============================================================================

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z" />
    </svg>
  );
}

function ReplyOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
    </svg>
  );
}

function ReplyAllIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M7 8V5l-7 7 7 7v-3l-4-4 4-4zm6 1V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
    </svg>
  );
}

function ForwardOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z" />
    </svg>
  );
}

function DeleteOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

function ArchiveOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
    </svg>
  );
}

function FlagOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
    </svg>
  );
}

function MoreOIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}
