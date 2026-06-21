// ============================================================================
// html-preview/data/email-clients.ts
// Email client UI configurations
// ============================================================================

import type { EmailClientConfig } from "../types";
import React from "react";

/**
 * Icons for built-in email clients (simple SVG placeholders)
 */
const Icons = {
  appleMail: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      className: "w-4 h-4",
    },
    React.createElement("rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }),
    React.createElement("path", { d: "M2 7l10 7 10-7" }),
  ),
  gmail: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: "w-4 h-4",
    },
    React.createElement("path", {
      d: "M12 14l-8-6v10h16V8l-8 6z",
    }),
  ),
  outlook: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: "w-4 h-4",
    },
    React.createElement("rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }),
    React.createElement("path", {
      d: "M6 8h4v2H6zM6 12h4v2H6zM14 8h4v6h-4z",
      fill: "white",
    }),
  ),
  yahoo: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className: "w-4 h-4",
    },
    React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
    React.createElement("text", {
      x: 12,
      y: 17,
      textAnchor: "middle",
      fill: "white",
      fontSize: 14,
      fontWeight: "bold",
      children: "Y",
    }),
  ),
  hey: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      className: "w-4 h-4",
    },
    React.createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 4 }),
  ),
  simple: React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      className: "w-4 h-4",
    },
    React.createElement("rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }),
    React.createElement("path", { d: "M2 8h20" }),
  ),
};

/**
 * Default email client configurations
 */
export const defaultEmailClients: EmailClientConfig[] = [
  {
    id: "apple-mail",
    name: "Apple Mail",
    icon: Icons.appleMail,
    accentColor: "#007AFF",
    accentColorDark: "#0A84FF",
    headerBg: "#f5f5f7",
    headerBgDark: "#1c1c1e",
    headerText: "#1d1d1f",
    headerTextDark: "#f5f5f7",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
    avatarBg: "#007AFF",
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: Icons.gmail,
    accentColor: "#EA4335",
    accentColorDark: "#FF6B6B",
    headerBg: "#ffffff",
    headerBgDark: "#202124",
    headerText: "#5f6368",
    headerTextDark: "#e8eaed",
    fontFamily: '"Google Sans", Roboto, "Helvetica Neue", sans-serif',
    avatarBg: "#EA4335",
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: Icons.outlook,
    accentColor: "#0078D4",
    accentColorDark: "#4DA3E0",
    headerBg: "#0078D4",
    headerBgDark: "#1a3a5c",
    headerText: "#ffffff",
    headerTextDark: "#ffffff",
    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
    avatarBg: "#0078D4",
  },
  {
    id: "yahoo-mail",
    name: "Yahoo Mail",
    icon: Icons.yahoo,
    accentColor: "#6001D2",
    accentColorDark: "#8B5CF6",
    headerBg: "#6001D2",
    headerBgDark: "#2d1066",
    headerText: "#ffffff",
    headerTextDark: "#ffffff",
    fontFamily: '"Yahoo Sans", "Helvetica Neue", sans-serif',
    avatarBg: "#6001D2",
  },
  {
    id: "hey",
    name: "HEY",
    icon: Icons.hey,
    accentColor: "#2563EB",
    accentColorDark: "#60A5FA",
    headerBg: "#ffffff",
    headerBgDark: "#111827",
    headerText: "#2563EB",
    headerTextDark: "#60A5FA",
    fontFamily: '"Avenir Next", "Helvetica Neue", sans-serif',
    avatarBg: "#2563EB",
  },
  {
    id: "simple",
    name: "Simple",
    icon: Icons.simple,
    accentColor: "#6B7280",
    accentColorDark: "#9CA3AF",
    headerBg: "#ffffff",
    headerBgDark: "#1f2937",
    headerText: "#111827",
    headerTextDark: "#f9fafb",
    fontFamily: '"Inter", system-ui, sans-serif',
    avatarBg: "#6B7280",
  },
];

/**
 * Get an email client config by its ID
 */
export function getEmailClientById(id: string): EmailClientConfig | undefined {
  return defaultEmailClients.find((c) => c.id === id);
}
