import { useEffect, useRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface EmailContentIframeProps {
  emailHTML: string;
  iframeKey: number;
}

// ============================================================================
// EMAIL CONTENT IFRAME
// ============================================================================

export function EmailContentIframe({
  emailHTML,
  iframeKey,
}: EmailContentIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Set srcdoc whenever emailHTML changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (iframe.srcdoc !== emailHTML) {
        iframe.srcdoc = emailHTML;
      }
    }
  }, [emailHTML]);

  // Force content load on mount
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const timer = setTimeout(() => {
        iframe.srcdoc = emailHTML;
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeKey]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0"
      style={{
        height: "calc(100vh - 200px)",
        minHeight: "300px",
      }}
      title="Email Content"
      sandbox="allow-same-origin allow-scripts"
      srcDoc={emailHTML}
    />
  );
}
