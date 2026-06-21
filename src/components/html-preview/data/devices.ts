// ============================================================================
// html-preview/data/devices.ts
// Device configurations for all supported preview devices
// ============================================================================

import type { DeviceConfig, DeviceType } from "../types";

/**
 * Default device configurations.
 * Users can extend these via the customDevices prop on HTMLPreview.
 */
export const defaultDevices: DeviceConfig[] = [
  // ======================== PHONES ========================
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    type: "mobile",
    width: 393,
    height: 852,
    dpi: 3,
    hasDynamicIsland: true,
    hasHomeIndicator: true,
    borderRadius: 44,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    type: "mobile",
    width: 393,
    height: 852,
    dpi: 3,
    hasNotch: true,
    hasHomeIndicator: true,
    borderRadius: 44,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "iphone-se-3",
    name: "iPhone SE (3rd gen)",
    type: "mobile",
    width: 375,
    height: 667,
    dpi: 2,
    hasHomeIndicator: false,
    borderRadius: 20,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "pixel-8-pro",
    name: "Pixel 8 Pro",
    type: "mobile",
    width: 412,
    height: 915,
    dpi: 3.5,
    hasNotch: false,
    hasHomeIndicator: true,
    borderRadius: 32,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    type: "mobile",
    width: 412,
    height: 915,
    dpi: 3,
    hasHomeIndicator: true,
    borderRadius: 28,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "samsung-s24-ultra",
    name: "Samsung S24 Ultra",
    type: "mobile",
    width: 412,
    height: 915,
    dpi: 3.5,
    hasNotch: false,
    hasHomeIndicator: true,
    borderRadius: 28,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "samsung-s24",
    name: "Samsung S24",
    type: "mobile",
    width: 393,
    height: 852,
    dpi: 3,
    hasHomeIndicator: true,
    borderRadius: 24,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },

  // ======================== TABLETS ========================
  {
    id: "ipad-pro-11",
    name: "iPad Pro 11",
    type: "tablet",
    width: 834,
    height: 1194,
    dpi: 2,
    hasHomeIndicator: true,
    borderRadius: 24,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "ipad-pro-12-9",
    name: "iPad Pro 12.9",
    type: "tablet",
    width: 1024,
    height: 1366,
    dpi: 2,
    hasHomeIndicator: true,
    borderRadius: 28,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "ipad-air-5",
    name: "iPad Air (5th gen)",
    type: "tablet",
    width: 820,
    height: 1180,
    dpi: 2,
    hasHomeIndicator: true,
    borderRadius: 20,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "ipad-mini-6",
    name: "iPad Mini (6th gen)",
    type: "tablet",
    width: 744,
    height: 1133,
    dpi: 2,
    hasHomeIndicator: true,
    borderRadius: 16,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },

  // ======================== DESKTOP / LAPTOP ========================
  {
    id: "macbook-pro-14",
    name: "MacBook Pro 14",
    type: "desktop",
    width: 1512,
    height: 982,
    dpi: 2,
    hasNotch: true,
    borderRadius: 12,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "macbook-pro-16",
    name: "MacBook Pro 16",
    type: "desktop",
    width: 1728,
    height: 1117,
    dpi: 2,
    hasNotch: true,
    borderRadius: 14,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "macbook-air-15",
    name: "MacBook Air 15",
    type: "desktop",
    width: 1710,
    height: 1107,
    dpi: 2,
    hasNotch: true,
    borderRadius: 12,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#000000",
      background: "transparent",
    },
  },
  {
    id: "desktop-1080p",
    name: "Desktop 1080p",
    type: "desktop",
    width: 1920,
    height: 1080,
    dpi: 1,
    borderRadius: 0,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#1a1a1a",
      background: "transparent",
    },
  },
  {
    id: "desktop-1440p",
    name: "Desktop 1440p",
    type: "desktop",
    width: 2560,
    height: 1440,
    dpi: 1,
    borderRadius: 0,
    frameColors: {
      frame: "#1a1a1a",
      screenBorder: "#1a1a1a",
      background: "transparent",
    },
  },
];

/**
 * Get a device config by its ID
 */
export function getDeviceById(id: string): DeviceConfig | undefined {
  return defaultDevices.find((d) => d.id === id);
}

/**
 * Group devices by their category type
 */
export function getDevicesByCategory(): Record<DeviceType, DeviceConfig[]> {
  return {
    mobile: defaultDevices.filter((d) => d.type === "mobile"),
    tablet: defaultDevices.filter((d) => d.type === "tablet"),
    desktop: defaultDevices.filter((d) => d.type === "desktop"),
  };
}
