// hooks/useWindowWidth.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// Window size breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

// Sidebar width thresholds for auto-collapse
const SIDEBAR_COLLAPSE_THRESHOLD = 1024; // Collapse below this width
const SIDEBAR_COLLAPSE_THRESHOLD_SM = 768; // Even smaller threshold for mobile

export type WindowSizeState = {
  width: number;
  height: number;
  isFullscreen: boolean;
  isMaximized: boolean;
  previousWidth: number;
  previousHeight: number;
};

export const useTauriWindowSize = () => {
  const [size, setSize] = useState<WindowSizeState>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isFullscreen: false,
    isMaximized: false,
    previousWidth: typeof window !== "undefined" ? window.innerWidth : 1024,
    previousHeight: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  const sizeRef = useRef(size);
  sizeRef.current = size;

  useEffect(() => {
    const unlistenFns: UnlistenFn[] = [];
    let fallbackCleanup: (() => void) | undefined;

    const setupTauriListener = async () => {
      try {
        const currentWindow = getCurrentWindow();

        // Get initial window state
        const initialSize = await currentWindow.innerSize();
        const isFullscreen = await currentWindow.isFullscreen();
        const isMaximized = await currentWindow.isMaximized();

        setSize((prev) => ({
          ...prev,
          width: initialSize.width,
          height: initialSize.height,
          isFullscreen,
          isMaximized,
          previousWidth: prev.width,
          previousHeight: prev.height,
        }));

        // Listen for resize events
        const unlistenResize = await currentWindow.onResized(
          ({ payload: newSize }) => {
            setSize((prev) => ({
              ...prev,
              width: newSize.width,
              height: newSize.height,
              previousWidth: prev.width,
              previousHeight: prev.height,
            }));
          },
        );
        unlistenFns.push(unlistenResize);

        // Listen for fullscreen changes - using events in Tauri v2
        const unlistenFullscreen = await listen<boolean>(
          "tauri://fullscreen",
          (event) => {
            setSize((prev) => ({
              ...prev,
              isFullscreen: event.payload,
            }));
          },
        );
        unlistenFns.push(unlistenFullscreen);

        // Listen for maximize changes - using events in Tauri v2
        const unlistenMaximize = await listen<boolean>(
          "tauri://maximize",
          (event) => {
            setSize((prev) => ({
              ...prev,
              isMaximized: event.payload,
            }));
          },
        );
        unlistenFns.push(unlistenMaximize);

        // Alternative: Listen for window state changes via scale factor or theme
        // This is a fallback for fullscreen/maximize detection
        const unlistenTheme = await listen<string>(
          "tauri://theme-changed",
          () => {
            // Re-check window state when theme changes (often accompanies state changes)
            Promise.all([
              currentWindow.isFullscreen(),
              currentWindow.isMaximized(),
            ])
              .then(([fullscreen, maximized]) => {
                setSize((prev) => ({
                  ...prev,
                  isFullscreen: fullscreen,
                  isMaximized: maximized,
                }));
              })
              .catch(console.error);
          },
        );
        unlistenFns.push(unlistenTheme);
      } catch (error) {
        console.error("Failed to setup Tauri window listener:", error);
        fallbackCleanup = setupFallbackResizeListener();
      }
    };

    const setupFallbackResizeListener = (): (() => void) => {
      const handleResize = () => {
        setSize((prev) => ({
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight,
          previousWidth: prev.width,
          previousHeight: prev.height,
          isFullscreen: !!document.fullscreenElement,
          isMaximized: false,
        }));
      };

      const handleFullscreenChange = () => {
        setSize((prev) => ({
          ...prev,
          isFullscreen: !!document.fullscreenElement,
        }));
      };

      window.addEventListener("resize", handleResize);
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      // Initial call
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange,
        );
      };
    };

    // Check if running in Tauri
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      setupTauriListener().catch(console.error);
    } else {
      fallbackCleanup = setupFallbackResizeListener();
    }

    return () => {
      unlistenFns.forEach((fn) => fn());
      if (fallbackCleanup) {
        fallbackCleanup();
      }
    };
  }, []);

  return size;
};

// Hook to determine if sidebar should be collapsed based on window width
export const useAutoCollapseSidebar = (
  windowWidth: number,
  userPreference?: boolean, // User's manual preference
): {
  shouldCollapse: boolean;
  reason: "narrow-window" | "very-narrow-window" | "user-preference" | "manual";
} => {
  // If user has explicitly set a preference, respect it
  if (userPreference !== undefined) {
    return {
      shouldCollapse: userPreference,
      reason: "user-preference",
    };
  }

  // Auto-collapse based on window width
  if (windowWidth < SIDEBAR_COLLAPSE_THRESHOLD_SM) {
    return {
      shouldCollapse: true,
      reason: "very-narrow-window",
    };
  }

  if (windowWidth < SIDEBAR_COLLAPSE_THRESHOLD) {
    return {
      shouldCollapse: true,
      reason: "narrow-window",
    };
  }

  return {
    shouldCollapse: false,
    reason: "manual",
  };
};

// Hook to get dynamic sidebar width
export const useSidebarWidth = (
  collapsed: boolean = false,
  windowWidth: number,
) => {
  // Define width thresholds
  const widths = {
    expanded: {
      xl: 280, // >= 1280px
      lg: 250, // >= 1024px
      md: 220, // >= 768px
      sm: 200, // >= 640px
      base: 180, // default
    },
    collapsed: {
      xl: 70,
      lg: 70,
      md: 60,
      sm: 55,
      base: 50,
    },
  };

  const getWidth = useCallback(() => {
    const widthSet = collapsed ? widths.collapsed : widths.expanded;

    if (windowWidth >= BREAKPOINTS.XL) return widthSet.xl;
    if (windowWidth >= BREAKPOINTS.LG) return widthSet.lg;
    if (windowWidth >= BREAKPOINTS.MD) return widthSet.md;
    if (windowWidth >= BREAKPOINTS.SM) return widthSet.sm;
    return widthSet.base;
  }, [collapsed, windowWidth]);

  return getWidth();
};

// Helper hook to get breakpoint-based values
export const useBreakpoint = (windowWidth: number) => {
  const getBreakpoint = useCallback(() => {
    if (windowWidth >= BREAKPOINTS.XXL) return "2xl" as const;
    if (windowWidth >= BREAKPOINTS.XL) return "xl" as const;
    if (windowWidth >= BREAKPOINTS.LG) return "lg" as const;
    if (windowWidth >= BREAKPOINTS.MD) return "md" as const;
    if (windowWidth >= BREAKPOINTS.SM) return "sm" as const;
    return "base" as const;
  }, [windowWidth]);

  const isMobile = windowWidth < BREAKPOINTS.MD;
  const isTablet =
    windowWidth >= BREAKPOINTS.MD && windowWidth < BREAKPOINTS.LG;
  const isDesktop = windowWidth >= BREAKPOINTS.LG;

  return {
    breakpoint: getBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
  };
};
