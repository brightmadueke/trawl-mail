// ============================================================================
// html-preview/types.ts
// Type definitions for the HTML Preview component system
// ============================================================================

/**
 * Supported device categories for preview rendering
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Built-in email client UI variants
 * Custom variants can be added by extending this type
 */
export type EmailClientVariant =
  | "apple-mail"
  | "gmail"
  | "outlook"
  | "yahoo-mail"
  | "hey"
  | "simple";

/**
 * Theme mode for email client and preview rendering
 */
export type ThemeMode = "light" | "dark";

/**
 * Device frame color configuration
 */
export interface DeviceFrameColors {
  /** Outer bezel/frame color */
  frame?: string;
  /** Inner screen border color */
  screenBorder?: string;
  /** Background behind the device (for floating effect) */
  background?: string;
}

/**
 * Configuration for a device in the preview
 */
export interface DeviceConfig {
  /** Unique identifier */
  id: string;
  /** Display name shown in device selector */
  name: string;
  /** Device category */
  type: DeviceType;
  /** CSS pixel width of the viewport */
  width: number;
  /** CSS pixel height of the viewport */
  height: number;
  /** Device pixel ratio */
  dpi: number;
  /** Whether device has a notch */
  hasNotch?: boolean;
  /** Whether device has a dynamic island */
  hasDynamicIsland?: boolean;
  /** Whether device has a home indicator bar */
  hasHomeIndicator?: boolean;
  /** Corner radius of the device frame */
  borderRadius?: number;
  /** Frame color overrides */
  frameColors?: DeviceFrameColors;
}

/**
 * Configuration for an email client UI
 */
export interface EmailClientConfig {
  /** Unique identifier */
  id: EmailClientVariant | string;
  /** Display name shown in client selector */
  name: string;
  /** Icon component to render */
  icon?: React.ReactNode;
  /** Primary brand/accent color (light mode) */
  accentColor: string;
  /** Primary brand/accent color (dark mode) */
  accentColorDark: string;
  /** Header background color (light mode) */
  headerBg: string;
  /** Header background color (dark mode) */
  headerBgDark: string;
  /** Header text color (light mode) */
  headerText: string;
  /** Header text color (dark mode) */
  headerTextDark: string;
  /** Font family stack */
  fontFamily: string;
  /** Background color for avatar placeholders */
  avatarBg: string;
}

/**
 * Props for individual email client UI components
 */
export interface EmailClientUIProps {
  /** The raw HTML email content to display */
  htmlContent: string;
  /** Current theme mode */
  theme: ThemeMode;
  /** Subject line of the email */
  subject?: string;
  /** Sender name */
  senderName?: string;
  /** Sender email address */
  senderEmail?: string;
  /** Timestamp string */
  timestamp?: string;
  /** Additional CSS class */
  className?: string;
  /** Iframe key for forcing remounts */
  iframeKey?: number;
}

/**
 * Props for the main HTMLPreview component
 */
export interface HTMLPreviewProps {
  /** Raw HTML string of the email content */
  htmlContent: string;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Callback when fullscreen state changes */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /** Default device type to show */
  defaultDevice?: string;
  /** Default email client UI */
  defaultEmailClient?: EmailClientVariant | string;
  /** Whether device frame is visible by default */
  defaultShowFrame?: boolean;
  /** Default zoom level (25-200) */
  defaultZoom?: number;
  /** Email metadata */
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  timestamp?: string;
  /** Custom email client UIs to register */
  customEmailClients?: CustomEmailClient[];
  /** Custom devices to register */
  customDevices?: DeviceConfig[];
}

/**
 * Custom email client registration
 */
export interface CustomEmailClient {
  /** Configuration for the client */
  config: EmailClientConfig;
  /** React component to render */
  component: React.ComponentType<EmailClientUIProps>;
}

/**
 * Props for the DeviceMockup component
 */
export interface DeviceMockupProps {
  /** Device configuration */
  deviceConfig: DeviceConfig;
  /** Whether to show the device frame */
  showFrame: boolean;
  /** Current theme for frame styling */
  theme: ThemeMode;
  /** Frame color overrides */
  frameColors?: DeviceFrameColors;
  /** Children rendered inside the device screen */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Scale factor for the entire mockup */
  scale?: number;
}

/**
 * Props for the EmailClientMockup component
 */
export interface EmailClientMockupProps {
  /** The email client configuration */
  clientConfig: EmailClientConfig;
  /** The email client variant to render */
  variant: EmailClientVariant | string;
  /** The raw HTML content */
  htmlContent: string;
  /** Current theme */
  theme: ThemeMode;
  /** Email metadata */
  subject?: string;
  senderName?: string;
  senderEmail?: string;
  timestamp?: string;
  /** Iframe remount key */
  iframeKey: number;
  /** Custom email client components map */
  customClients?: Map<string, React.ComponentType<EmailClientUIProps>>;
}

/**
 * Props for the PreviewControls component
 */
export interface PreviewControlsProps {
  /** Currently selected device ID */
  device: string;
  /** Currently selected email client variant */
  emailClient: EmailClientVariant | string;
  /** Current theme */
  theme: ThemeMode;
  /** Current zoom level (applied) */
  zoom: number;
  /** Real-time zoom during slider drag */
  localZoom: number;
  /** Whether device frame is visible */
  showFrame: boolean;
  /** Current device type */
  deviceType: DeviceType;
  /** Whether fullscreen is active */
  isFullscreen: boolean;
  /** Available devices list */
  devices: DeviceConfig[];
  /** Available email clients list */
  emailClients: EmailClientConfig[];
  /** Change selected device */
  onDeviceChange: (deviceId: string) => void;
  /** Change selected email client */
  onEmailClientChange: (clientId: string) => void;
  /** Toggle theme */
  onThemeToggle: () => void;
  /** Zoom slider change (real-time) */
  onZoomChange: (values: number[]) => void;
  /** Zoom commit (after drag ends) */
  onZoomCommit: (values: number[]) => void;
  /** Increment zoom */
  onZoomIn: () => void;
  /** Decrement zoom */
  onZoomOut: () => void;
  /** Toggle device frame visibility */
  onFrameToggle: () => void;
  /** Copy HTML to clipboard */
  onCopy: () => void;
  /** Download HTML file */
  onDownload: () => void;
  /** Open in default browser */
  onOpenInBrowser: () => void;
  /** Toggle fullscreen mode */
  onFullscreenToggle: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Props for the EmailContentIframe component
 */
export interface EmailContentIframeProps {
  /** The full HTML document string to render */
  emailHTML: string;
  /** Key to force iframe remount */
  iframeKey: number;
  /** Additional CSS class */
  className?: string;
  /** Callback when iframe loads */
  onLoad?: () => void;
}
