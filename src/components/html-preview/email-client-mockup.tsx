import { useMemo } from "react";
import type { EmailClientConfig, ThemeMode } from "@/types/html-preview.ts";
import {
  AppleMailUI,
  GmailUI,
  HeyUI,
  OutlookUI,
  YahooMailUI,
} from "./email-client-uis";
import { Email } from "@/types/app.ts"; // ============================================================================

// ============================================================================
// TYPES
// ============================================================================

interface EmailClientMockupProps {
  clientConfig: EmailClientConfig;
  htmlContent: string;
  theme: ThemeMode;
  emailClient: string;
  iframeKey: number;
  selectedEmail: Email;
  isMobile: boolean;
}

// ============================================================================
// EMAIL CLIENT MOCKUP COMPONENT
// ============================================================================

export function EmailClientMockup({
  clientConfig,
  htmlContent,
  theme,
  emailClient,
  iframeKey,
  selectedEmail,
  isMobile,
}: EmailClientMockupProps) {
  // Memoize the HTML content for the iframe
  const emailHTML = useMemo(() => {
    const isDark = theme === "dark";
    const bg = isDark ? "#1a1a1a" : "#ffffff";
    const textColor = isDark ? "#e5e5e5" : "#1d1d1f";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${clientConfig.fontFamily};
    background-color: ${bg};
    color: ${textColor};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    padding: 16px;
    height: 100%;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  a {
    color: ${clientConfig.accentColor};
    text-decoration: underline;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 12px;
    margin-top: 24px;
  }
  
  table {
    max-width: 100%;
    border-collapse: collapse;
  }
  
  table td, table th {
    padding: 8px;
    border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
  }
  
  blockquote {
    margin: 16px 0;
    padding: 8px 16px;
    border-left: 4px solid ${clientConfig.accentColor};
    background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"};
  }
  
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  pre {
    background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 16px;
  }
  
  code {
    font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
    font-size: 14px;
  }
  
  hr {
    border: none;
    border-top: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
    margin: 24px 0;
  }
</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  }, [htmlContent, clientConfig, theme]);

  // Render the appropriate email client UI
  const renderEmailClientUI = () => {
    const props = {
      clientConfig,
      theme,
      emailHTML,
      iframeKey,
      selectedEmail,
      isMobile,
    };

    switch (emailClient) {
      case "apple-mail":
        return <AppleMailUI {...props} />;
      case "gmail":
        return <GmailUI {...props} />;
      case "outlook":
        return <OutlookUI {...props} />;
      case "yahoo-mail":
        return <YahooMailUI {...props} />;
      case "hey":
        return <HeyUI {...props} />;
      default:
        return <AppleMailUI {...props} />;
    }
  };

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ margin: 0, padding: 0 }}
    >
      {renderEmailClientUI()}
    </div>
  );
}
