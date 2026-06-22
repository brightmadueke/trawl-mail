import { useEffect, useMemo } from "react";
import type { EmailClientConfig, ThemeMode } from "@/types/html-preview.ts";

// ============================================================================
// TYPES
// ============================================================================

interface PreviewIframeProps {
  htmlContent: string;
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

// ============================================================================
// EMAIL HTML GENERATOR
// ============================================================================

export function generateEmailHTML(
  htmlContent: string,
  clientConfig: EmailClientConfig,
  theme: ThemeMode,
): string {
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const textColor = isDark ? "#e5e5e5" : "#1d1d1f";
  const headerBg = isDark ? clientConfig.headerBgDark : clientConfig.headerBg;
  const headerText = isDark
    ? clientConfig.headerTextDark
    : clientConfig.headerText;
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const mutedColor = isDark ? "#aaaaaa" : "#666666";
  const quickActionBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)";
  const quickActionBorder = isDark
    ? "rgba(255,255,255,0.2)"
    : "rgba(0,0,0,0.15)";
  const scrollbarThumb = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";

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
  }
  
  .email-client {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: ${bg};
  }
  
  .email-header {
    background-color: ${headerBg};
    color: ${headerText};
    padding: 12px 16px;
    border-bottom: 1px solid ${borderColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    min-height: 56px;
  }
  
  .email-header-left,
  .email-header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .email-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
    background: none;
    color: inherit;
    position: relative;
  }
  
  .email-icon-btn:hover {
    background-color: ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"};
  }
  
  .email-icon-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .email-client-name {
    font-size: 16px;
    font-weight: 600;
    margin-left: 8px;
  }
  
  .email-content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .email-subject {
    font-size: 22px;
    font-weight: 600;
    padding: 20px 16px 8px;
    color: ${isDark ? "#ffffff" : "#1d1d1f"};
    letter-spacing: -0.3px;
  }
  
  .email-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 16px 16px;
    border-bottom: 1px solid ${borderColor};
  }
  
  .email-sender {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .sender-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${clientConfig.avatarBg};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .sender-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .sender-name {
    font-weight: 600;
    font-size: 16px;
    color: ${isDark ? "#ffffff" : "#1d1d1f"};
  }
  
  .sender-email,
  .email-to {
    font-size: 13px;
    color: ${mutedColor};
  }
  
  .email-to {
    padding: 8px 16px 0;
  }
  
  .email-date {
    font-size: 13px;
    color: ${mutedColor};
    white-space: nowrap;
  }
  
  .email-body {
    padding: 16px;
  }
  
  .email-body img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  .email-body a {
    color: ${clientConfig.accentColor};
    text-decoration: underline;
  }
  
  .email-body p {
    margin-bottom: 16px;
  }
  
  .email-body h1,
  .email-body h2,
  .email-body h3 {
    margin-bottom: 12px;
    margin-top: 24px;
  }
  
  .email-body table {
    max-width: 100%;
  }
  
  .quick-actions {
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
  }
  
  .quick-action-btn {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid ${quickActionBorder};
    background: ${quickActionBg};
    color: ${clientConfig.accentColor};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .quick-action-btn:hover {
    background: ${clientConfig.accentColor}20;
    border-color: ${clientConfig.accentColor};
  }
  
  .email-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .email-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .email-content::-webkit-scrollbar-thumb {
    background: ${scrollbarThumb};
    border-radius: 3px;
  }
</style>
</head>
<body>
<div class="email-client">
  <div class="email-header">
    <div class="email-header-left">
      <button class="email-icon-btn" title="Back" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="email-client-name">${clientConfig.name}</span>
    </div>
    <div class="email-header-right">
      <button class="email-icon-btn" title="Archive" aria-label="Archive">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/>
        </svg>
      </button>
      <button class="email-icon-btn" title="Delete" aria-label="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>
      <button class="email-icon-btn" title="Mark as unread" aria-label="Mark as unread">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 12h-6l-2 3H10l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
        </svg>
      </button>
      <button class="email-icon-btn" title="More" aria-label="More options">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>
  </div>
  
  <div class="email-content">
    <div class="email-subject">Email Preview</div>
    
    <div class="email-meta">
      <div class="email-sender">
        <div class="sender-avatar">S</div>
        <div class="sender-info">
          <span class="sender-name">Sender Name</span>
          <span class="sender-email">&lt;sender@example.com&gt;</span>
          <span class="email-to">to me</span>
        </div>
      </div>
      <div class="email-date">Today at 10:30 AM</div>
    </div>
    
    <div class="quick-actions">
      <button class="quick-action-btn">↩ Reply</button>
      <button class="quick-action-btn">↪ Forward</button>
    </div>
    
    <div class="email-body">
      ${htmlContent}
    </div>
  </div>
</div>
</body>
</html>`;
}

// ============================================================================
// PREVIEW IFRAME COMPONENT
// ============================================================================

export function PreviewIframe({
  htmlContent,
  clientConfig,
  theme,
  iframeRef,
}: PreviewIframeProps) {
  // Memoize the HTML content to prevent unnecessary re-renders
  const emailHTML = useMemo(
    () => generateEmailHTML(htmlContent, clientConfig, theme),
    [htmlContent, clientConfig, theme],
  );

  // Set srcdoc whenever emailHTML changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (iframe.srcdoc !== emailHTML) {
        iframe.srcdoc = emailHTML;
      }
    }
  }, [emailHTML, iframeRef]);

  // Force content load on mount
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const timer = setTimeout(() => {
        iframe.srcdoc = emailHTML;
      }, 0);
      return () => clearTimeout(timer);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      title="Email Preview"
      sandbox="allow-same-origin allow-scripts"
      srcDoc={emailHTML}
    />
  );
}
