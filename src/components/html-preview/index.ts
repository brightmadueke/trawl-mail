// ============================================================================
// html-preview/index.ts
// Barrel export file for the HTML Preview component system
// ============================================================================

// Main component
export { default as HTMLPreview } from "./html-preview";

// Device mockup (useful if users want to build custom preview layouts)
export { default as DeviceMockup } from "./device-mockup";

// Email client mockup router
export { default as EmailClientMockup } from "./email-client-mockup";

// Preview controls (exported for custom toolbar implementations)
export { default as PreviewControls } from "./preview-controls";

// Email content iframe (for custom email client UIs)
export { default as EmailContentIframe } from "./email-content-iframe.tsx";

// All built-in email client UI components
export {
  AppleMailUI,
  GmailUI,
  OutlookUI,
  YahooMailUI,
  HeyUI,
  SimpleUI,
  builtInEmailClients,
} from "./email-client-uis";

// Data exports for building custom selectors or configurations
export {
  defaultDevices,
  getDeviceById,
  getDevicesByCategory,
} from "./data/devices";
export { defaultEmailClients, getEmailClientById } from "./data/email-clients";

// All TypeScript types
export type {
  DeviceType,
  EmailClientVariant,
  ThemeMode,
  DeviceConfig,
  EmailClientConfig,
  EmailClientUIProps,
  HTMLPreviewProps,
  CustomEmailClient,
  DeviceMockupProps,
  EmailClientMockupProps,
  PreviewControlsProps,
  EmailContentIframeProps,
  DeviceFrameColors,
} from "./types";
