// ============================================================================
// html-preview/email-client-uis/index.ts
// Barrel export for all built-in email client UI components
// ============================================================================

export { default as AppleMailUI } from "./apple-mail";
export { default as GmailUI } from "./gmail";
export { default as OutlookUI } from "./outlook";
export { default as YahooMailUI } from "./yahoo-mail";
export { default as HeyUI } from "./hey";
export { default as SimpleUI } from "./simple";

import AppleMailUI from "./apple-mail";
import GmailUI from "./gmail";
import OutlookUI from "./outlook";
import YahooMailUI from "./yahoo-mail";
import HeyUI from "./hey";
import SimpleUI from "./simple";
import type React from "react";
import type { EmailClientUIProps } from "../types";

/**
 * Map of built-in email client variant IDs to their React components.
 * Used internally by EmailClientMockup to resolve which UI to render.
 */
export const builtInEmailClients: Record<
  string,
  React.ComponentType<EmailClientUIProps>
> = {
  "apple-mail": AppleMailUI,
  gmail: GmailUI,
  outlook: OutlookUI,
  "yahoo-mail": YahooMailUI,
  hey: HeyUI,
  simple: SimpleUI,
};
