import { cn } from "@/lib/utils";
import type { EmailClientConfig, ThemeMode } from "@/types/html-preview";
import { EmailContentIframe } from "./email-content-iframe";
import { Email } from "@/types/app.ts";

// ============================================================================
// TYPES
// ============================================================================

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
}

// ============================================================================
// APPLE MAIL UI
// ============================================================================

export function AppleMailUI({
  clientConfig,
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
}: EmailClientUIProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const headerBg = isDark ? "#2C2C2E" : "#F5F5F7";
  const textColor = isDark ? "#F5F5F7" : "#1D1D1F";
  const mutedColor = isDark ? "#98989D" : "#86868B";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const sidebarBg = isDark ? "#1C1C1E" : "#F0F0F2";

  return (
    <div className="flex h-full" style={{ backgroundColor: bg }}>
      {/* Sidebar */}
      <div
        className="w-[200px] flex-shrink-0 border-r flex flex-col"
        style={{
          backgroundColor: sidebarBg,
          borderColor: borderColor,
        }}
      >
        {/* Mailboxes */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            <MailboxItem
              icon={<InboxIcon />}
              label="Inbox"
              count="12"
              active
              isDark={isDark}
            />
            <MailboxItem icon={<StarIcon />} label="VIP" isDark={isDark} />
            <MailboxItem icon={<ClockIcon />} label="Sent" isDark={isDark} />
            <MailboxItem
              icon={<DraftIcon />}
              label="Drafts"
              count="3"
              isDark={isDark}
            />
            <MailboxItem icon={<TrashIcon />} label="Trash" isDark={isDark} />
            <MailboxItem
              icon={<ArchiveIcon />}
              label="Archive"
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-4 py-2 border-b"
          style={{
            backgroundColor: headerBg,
            borderColor: borderColor,
          }}
        >
          <ToolbarButton icon={<BackIcon />} label="Back" isDark={isDark} />
          <ToolbarButton
            icon={<ArchiveIcon />}
            label="Archive"
            isDark={isDark}
          />
          <ToolbarButton icon={<TrashIcon />} label="Delete" isDark={isDark} />
          <ToolbarButton icon={<ReplyIcon />} label="Reply" isDark={isDark} />
          <ToolbarButton
            icon={<ForwardIcon />}
            label="Forward"
            isDark={isDark}
          />
          <div className="flex-1" />
          <ToolbarButton icon={<FlagIcon />} label="Flag" isDark={isDark} />
          <ToolbarButton icon={<MoreIcon />} label="More" isDark={isDark} />
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
            className="px-6 pb-4 mb-4 border-b"
            style={{ borderColor: borderColor }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: clientConfig.avatarBg }}
                >
                  {selectedEmail.sender_name.charAt(0)}
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: textColor }}
                  >
                    {selectedEmail.sender_name}
                  </div>
                  <div className="text-xs" style={{ color: mutedColor }}>
                    {selectedEmail.from}
                  </div>
                  <div className="text-xs mt-1" style={{ color: mutedColor }}>
                    To: {selectedEmail.to}
                  </div>
                </div>
              </div>
              <div className="text-xs" style={{ color: mutedColor }}>
                {selectedEmail.date}
              </div>
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
// MAILBOX ITEM
// ============================================================================

function MailboxItem({
  icon,
  label,
  count,
  active = false,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  count?: string;
  active?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
        active && (isDark ? "bg-white/10" : "bg-black/5"),
      )}
      style={{
        color: active
          ? isDark
            ? "#ffffff"
            : "#1D1D1F"
          : isDark
            ? "#98989D"
            : "#86868B",
      }}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      {count && <span className="text-xs opacity-60">{count}</span>}
    </div>
  );
}

// ============================================================================
// TOOLBAR BUTTON
// ============================================================================

function ToolbarButton({
  icon,
  label,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
}) {
  return (
    <button
      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
      style={{
        color: isDark ? "#F5F5F7" : "#1D1D1F",
      }}
      title={label}
      aria-label={label}
    >
      <span className="w-4 h-4">{icon}</span>
    </button>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 5 17 10" />
      <line x1="12" y1="5" x2="12" y2="19" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4" />
      <polyline points="17 10 12 5 7 10" />
      <line x1="12" y1="5" x2="12" y2="19" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
