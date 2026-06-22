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

export function YahooMailUI(props: EmailClientUIProps) {
  const isDark = props.theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#232A31";
  const headerBg = isDark ? "#3D0088" : "#6001D2";

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: bg }}>
      {/* Yahoo Header */}
      <div
        className="flex items-center gap-3 px-4 py-2"
        style={{ backgroundColor: headerBg, color: "#ffffff" }}
      >
        <span className="text-lg font-bold">Yahoo!</span>
        <span className="text-sm opacity-80">Mail</span>
        <div className="flex-1" />
        <button className="px-3 py-1 rounded-full text-sm border border-white/30 hover:bg-white/10">
          Reply
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-4 pb-2">
          <h1 className="text-xl" style={{ color: textColor }}>
            {props.selectedEmail.subject}
          </h1>
        </div>
        <div
          className="px-6 pb-4 border-b"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: props.clientConfig.avatarBg }}
            >
              {props.selectedEmail.sender_name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold" style={{ color: textColor }}>
                {props.selectedEmail.sender_name}
              </div>
              <div className="text-xs opacity-60" style={{ color: textColor }}>
                {props.selectedEmail.from}
              </div>
            </div>
            <div
              className="ml-auto text-xs opacity-60"
              style={{ color: textColor }}
            >
              {props.selectedEmail.date}
            </div>
          </div>
        </div>
        <div className="px-6">
          <EmailContentIframe
            emailHTML={props.emailHTML}
            iframeKey={props.iframeKey}
          />
        </div>
      </div>
    </div>
  );
}
