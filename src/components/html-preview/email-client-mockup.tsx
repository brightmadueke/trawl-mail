// ============================================================================
// html-preview/email-client-mockup.tsx
// Routes to the correct email client UI component based on variant
// ============================================================================

import React, { useMemo } from "react";
import { builtInEmailClients } from "./email-client-uis";
import type { EmailClientMockupProps } from "./types";

/**
 * EmailClientMockup resolves which email client UI component to render
 * based on the variant prop and any registered custom clients.
 *
 * This is the bridge between the main HTMLPreview state and the individual
 * email client UI components.
 */
const EmailClientMockup: React.FC<EmailClientMockupProps> = ({
  variant,
  htmlContent,
  theme,
  subject,
  senderName,
  senderEmail,
  timestamp,
  iframeKey,
  customClients,
}) => {
  /**
   * Resolve the correct React component for the given variant.
   * Checks custom clients first, then falls back to built-in clients.
   */
  const ClientComponent = useMemo(() => {
    if (customClients?.has(variant)) {
      return customClients.get(variant)!;
    }
    return builtInEmailClients[variant] || builtInEmailClients["simple"];
  }, [variant, customClients]);

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <ClientComponent
        htmlContent={htmlContent}
        theme={theme}
        subject={subject}
        senderName={senderName}
        senderEmail={senderEmail}
        timestamp={timestamp}
        iframeKey={iframeKey}
      />
    </div>
  );
};

export default EmailClientMockup;
