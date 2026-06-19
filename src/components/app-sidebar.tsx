// src/components/app-sidebar.tsx

import { EnhancedSidebar, SidebarConfigType } from "@/components/enhanced-sidebar";
import { useAutoCollapseSidebar, useTauriWindowSize } from "@/hooks/use-window-width";
import { Inbox, Settings, TerminalSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { useAppContext } from "@/components/app-context";
import { useLocation } from "react-router";

1;

export function AppSidebar() {
  const { width } = useTauriWindowSize();
  const location = useLocation();
  const [userCollapsedPreference, setUserCollapsedPreference] =
    useState<boolean>(() => {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? saved === "true" : true;
    });

  useAutoCollapseSidebar(width, userCollapsedPreference);

  // Get data from App Context
  const { unreadCount, logs, serverStatus, isLogsPaused } = useAppContext();

  // Track previous values for activity detection
  const prevUnreadCount = useRef(unreadCount);
  const prevLogCount = useRef(logs.length);
  const [hasNewEmail, setHasNewEmail] = useState(false);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  // Detect new emails
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && serverStatus.is_running) {
      setHasNewEmail(true);
      const timer = setTimeout(() => setHasNewEmail(false), 3000);
      prevUnreadCount.current = unreadCount;
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, serverStatus.is_running]);

  // Detect new logs
  useEffect(() => {
    if (
      logs.length > prevLogCount.current &&
      serverStatus.is_running &&
      !isLogsPaused
    ) {
      setHasNewLogs(true);
      const timer = setTimeout(() => setHasNewLogs(false), 2000);
      prevLogCount.current = logs.length;
      return () => clearTimeout(timer);
    }
    prevLogCount.current = logs.length;
  }, [logs.length, serverStatus.is_running, isLogsPaused]);

  // Clear activity indicators when navigating to that page
  useEffect(() => {
    if (location.pathname === "/") {
      setHasNewEmail(false);
    } else if (location.pathname === "/logs") {
      setHasNewLogs(false);
    }
  }, [location.pathname]);

  const sidebarConfig: SidebarConfigType = {
    groups: [
      {
        title: "Main",
        items: [
          {
            title: "Inbox",
            url: "/",
            icon: Inbox,
            badge:
              unreadCount > 0
                ? { count: unreadCount, hasActivity: hasNewEmail }
                : undefined,
            id: "inbox",
          },
          {
            title: "Logs",
            url: "/logs",
            icon: TerminalSquare,
            badge: {
              count: logs.length,
              hasActivity: hasNewLogs,
              isLive: serverStatus.is_running && !isLogsPaused,
            },
            id: "logs",
          },
          {
            title: "Settings",
            url: "/settings",
            icon: Settings,
            id: "settings",
          },
        ],
      },
    ],
    footer: {
      content: (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            Change App Theme
          </TooltipContent>
        </Tooltip>
      ),
    },
    onCollapseChange: (collapsed) => {
      setUserCollapsedPreference(collapsed);
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    },
  };

  return (
    <EnhancedSidebar
      config={sidebarConfig}
      defaultCollapsed={true}
      className="border-none py-3 top-(--header-height) h-[calc(100svh-var(--header-height))]!"
    />
  );
}
