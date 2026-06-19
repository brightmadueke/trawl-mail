// ============================================================================
// TYPES
// ============================================================================

import { Email } from "@/types/app.ts";

export type DeviceType =
  | "iphone-15-pro"
  | "iphone-15"
  | "iphone-14-pro"
  | "iphone-14"
  | "iphone-se-3"
  | "pixel-8-pro"
  | "pixel-8"
  | "pixel-7a"
  | "samsung-s24-ultra"
  | "samsung-s24"
  | "samsung-a54"
  | "ipad-pro-11"
  | "ipad-pro-12.9"
  | "ipad-air-5"
  | "ipad-mini-6"
  | "macbook-pro-14"
  | "macbook-pro-16"
  | "macbook-air-15"
  | "desktop-1080p"
  | "desktop-1440p"
  | "desktop-4k";

export type EmailClient =
  | "apple-mail"
  | "gmail"
  | "outlook"
  | "yahoo-mail"
  | "hey";

export type ThemeMode = "light" | "dark";

export interface DeviceConfig {
  name: string;
  brand: string;
  width: number;
  height: number;
  frameColor: string;
  borderRadius: number;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  hasHomeBar: boolean;
  category: "phone" | "tablet" | "laptop" | "desktop";
  dpi: number;
}

export interface EmailClientConfig {
  name: string;
  icon: React.ReactNode;
  headerBg: string;
  headerBgDark: string;
  headerText: string;
  headerTextDark: string;
  accentColor: string;
  fontFamily: string;
  avatarBg: string;
}

export interface HTMLPreviewProps {
  htmlContent: string;
  className?: string;
  selectedEmail: Email;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}
