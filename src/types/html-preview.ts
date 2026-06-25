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

export interface ButtonPosition {
  type: "volume-up" | "volume-down" | "power" | "action" | "mute";
  y: number; // Percentage from top (0-100)
  height: number; // Percentage of device height
  width: number; // In pixels
  side: "left" | "right" | "top";
}

export interface CameraConfig {
  type: "dynamic-island" | "notch" | "punch-hole" | "teardrop" | "none";
  width: number; // Percentage of device width
  height?: number; // For dynamic island/notch
  topOffset?: number; // Percentage from top
  leftOffset?: number; // Percentage from left (for punch-hole)
  backgroundColor?: string;
}

export interface DeviceConfig {
  name: string;
  brand: string;
  width: number;
  height: number;
  frameColor: string;
  frameGradient: string;
  frameBorderColor: string;
  borderRadius: number;
  screenBorderRadius: number;
  bezelWidth: number;
  bezelColor: string;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  hasHomeBar: boolean;
  category: "phone" | "tablet" | "laptop" | "desktop";
  dpi: number;
  camera: CameraConfig;
  buttons: ButtonPosition[];
  screenGlare: {
    enabled: boolean;
    intensity: number;
    angle: number;
  };
  homeIndicatorStyle?: {
    color?: string;
    width?: string;
    height?: string;
    bottom?: string;
  };
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
  bgColor?: string;
  bgColorDark?: string;
}

export interface HTMLPreviewProps {
  htmlContent: string;
  className?: string;
  selectedEmail: Email;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}
