import type { EmailClientConfig, ThemeMode } from "@/types/html-preview.ts";
import { EmailContentIframe } from "./email-content-iframe.tsx";
import { Email } from "@/types/app.ts";

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
}

export function HeyUI(props: EmailClientUIProps) {
  const isDark = props.theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#F6F5F3";
  const textColor = isDark ? "#ffffff" : "#333333";
  const accentColor = "#0037FF";

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: bg }}>
      {/* HEY Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: isDark ? "#0022CC" : accentColor }}
      >
        <div className="flex items-center gap-2" style={{ color: "#ffffff" }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9c-.828 0-1.5-.672-1.5-1.5S6.672 13 7.5 13h9c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5z" />
          </svg>
          <span className="text-lg font-bold">HEY</span>
        </div>
        <div className="flex-1" />
        <button className="text-white/80 text-sm hover:text-white">
          Reply
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: props.clientConfig.avatarBg }}
            >
              {props.selectedEmail.sender_name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: textColor }}>
                {props.selectedEmail.sender_name}
              </div>
              <div className="text-sm opacity-60" style={{ color: textColor }}>
                {props.selectedEmail.date}
              </div>
            </div>
          </div>
          <EmailContentIframe
            emailHTML={props.emailHTML}
            iframeKey={props.iframeKey}
          />
        </div>
      </div>
    </div>
  );
}
