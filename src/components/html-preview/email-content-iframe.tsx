// ============================================================================
// html-preview/email-content-iframe.tsx
// Sandboxed iframe for rendering raw HTML email content safely
// ============================================================================

import React, { useEffect, useRef, useCallback } from "react";

/**
 * Renders HTML email content in a sandboxed iframe.
 * Uses srcdoc for secure rendering without document.write.
 * Handles remounting when iframeKey changes.
 */
const EmailContentIframe: React.FC<{
  /** The complete HTML document string to render */
  emailHTML: string;
  /** Changing this key forces a complete iframe remount */
  iframeKey: number;
  /** Additional CSS class */
  className?: string;
  /** Callback fired when iframe content finishes loading */
  onLoad?: () => void;
}> = ({ emailHTML, iframeKey, className = "", onLoad }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * Handle iframe load event.
   * Ensures content is visible by adjusting iframe height to fit content.
   */
  const handleLoad = useCallback(() => {
    if (onLoad) onLoad();

    // Auto-resize iframe height to match content
    try {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument?.body) {
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height}px`;
      }
    } catch {
      // Cross-origin restriction - use default height
    }
  }, [onLoad]);

  /**
   * Reset iframe height when emailHTML changes.
   * This prevents the iframe from staying at the previous content's height
   * before the new content loads.
   */
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.style.height = "auto";
    }
  }, [emailHTML]);

  return (
    <iframe
      key={iframeKey}
  ref={iframeRef}
  srcDoc={emailHTML}
  sandbox="allow-same-origin"
  title="Email content preview"
  className={`w-full border-0 bg-white dark:bg-gray-900 transition-colors ${className}`}
  style={{ minHeight: "200px" }}
  onLoad={handleLoad}
  />
);
};

export default EmailContentIframe;