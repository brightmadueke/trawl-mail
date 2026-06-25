// src/components/enhanced-sidebar

import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils"; // Configuration Types

// Configuration Types
export type SidebarBadge = {
  count: number;
  hasActivity?: boolean;
  isLive?: boolean;
};

export type SidebarItemType = {
  title: string;
  url?: string;
  icon: LucideIcon;
  badge?: string | number | SidebarBadge;
  onClick?: () => void;
  items?: SidebarItemType[];
  matchPattern?: string;
  defaultExpanded?: boolean;
  id?: string;
};

export type SidebarGroupType = {
  title?: string;
  items: SidebarItemType[];
  id?: string;
};

export type SidebarConfigType = {
  header?: {
    logo?: React.ReactNode;
    title?: string;
    subtitle?: string;
    trigger?: boolean;
    user?: {
      name: string;
      email: string;
      avatar?: string;
    };
  };
  groups: SidebarGroupType[];
  footer?: {
    items?: SidebarItemType[];
    content?: React.ReactNode;
  };
  collapsed?: boolean;
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
  activeUrlMatcher?: (itemUrl: string, currentPath: string) => boolean;
};

export type EnhancedSidebarProps = {
  config: SidebarConfigType;
  defaultCollapsed?: boolean;
  className?: string;
};

// Helper function to check if URL is active
const isActiveUrl = (
  itemUrl: string | undefined,
  currentPath: string,
  matchPattern?: string,
  customMatcher?: (itemUrl: string, currentPath: string) => boolean,
): boolean => {
  if (!itemUrl) return false;

  if (customMatcher) {
    return customMatcher(itemUrl, currentPath);
  }

  if (matchPattern) {
    const pattern = matchPattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  }

  if (itemUrl === currentPath) return true;
  if (currentPath.startsWith(itemUrl + "/")) return true;
  if (itemUrl === "/" && currentPath === "/") return true;
  if (itemUrl === "/" && currentPath !== "/") return false;

  return false;
};

// Recursive function to check if any child is active
const hasActiveChild = (
  items: SidebarItemType[] | undefined,
  currentPath: string,
  activeUrlMatcher?: (itemUrl: string, currentPath: string) => boolean,
): boolean => {
  if (!items) return false;

  return items.some((item) => {
    const isItemActive = isActiveUrl(
      item.url,
      currentPath,
      item.matchPattern,
      activeUrlMatcher,
    );

    if (isItemActive) return true;
    if (item.items) {
      return hasActiveChild(item.items, currentPath, activeUrlMatcher);
    }
    return false;
  });
};

// Helper function to check if badge is a SidebarBadge object
const isSidebarBadge = (badge: unknown): badge is SidebarBadge => {
  return typeof badge === "object" && badge !== null && "count" in badge;
};

// Badge renderer component
const BadgeRenderer: React.FC<{
  badge: string | number | SidebarBadge;
  isActive: boolean;
}> = ({ badge, isActive }) => {
  // Handle object badge
  if (isSidebarBadge(badge)) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Activity indicator */}
        {badge.hasActivity && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        )}

        {/* Live indicator */}
        {badge.isLive && (
          <span className="text-[10px] px-1 py-0 h-4 font-normal rounded-full border border-green-500/50 text-green-600 dark:text-green-400 animate-pulse">
            LIVE
          </span>
        )}

        {/* Count badge */}
        {badge.count > 0 && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium font-mono tabular-nums",
              badge.hasActivity
                ? "bg-green-500 text-white"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {badge.count > 99 ? "99+" : badge.count}
          </span>
        )}
      </div>
    );
  }

  // Handle string/number badge
  if (badge) {
    return (
      <span
        className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium shrink-0",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {badge}
      </span>
    );
  }

  return null;
};

// Component for leaf items (no children)
const LeafItem: React.FC<{
  item: SidebarItemType;
  level: number;
  currentPath: string;
  activeUrlMatcher?: (itemUrl: string, currentPath: string) => boolean;
}> = React.memo(({ item, level, currentPath, activeUrlMatcher }) => {
  const navigate = useNavigate();
  const { title, icon: Icon, url, badge, onClick, matchPattern } = item;

  const isActive = isActiveUrl(
    url,
    currentPath,
    matchPattern,
    activeUrlMatcher,
  );

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (url) {
      e.preventDefault();
      navigate(url);
    }
  };

  if (level === 0) {
    return (
      <SidebarMenuItem key={item.id || item.title}>
        <SidebarMenuButton
          onClick={handleClick}
          isActive={isActive}
          tooltip={title}
          className="data-active:bg-black/20 dark:data-active:bg-white/20 not-data-active:hover:bg-black/10 dark:not-data-active:hover:bg-white/10"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{title}</span>
          {badge && <BadgeRenderer badge={badge} isActive={isActive} />}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  } else {
    return (
      <SidebarMenuSubItem key={item.id || item.title}>
        <SidebarMenuSubButton onClick={handleClick} isActive={isActive}>
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{title}</span>
          {badge && <BadgeRenderer badge={badge} isActive={isActive} />}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }
});

// Component for parent items (with children)
const ParentItem: React.FC<{
  item: SidebarItemType;
  level: number;
  currentPath: string;
  activeUrlMatcher?: (itemUrl: string, currentPath: string) => boolean;
}> = React.memo(({ item, level, currentPath, activeUrlMatcher }) => {
  const { title, icon: Icon, badge, items, defaultExpanded = false, id } = item;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasActiveChildItem = hasActiveChild(
    items,
    currentPath,
    activeUrlMatcher,
  );

  useEffect(() => {
    if (hasActiveChildItem && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasActiveChildItem]);

  if (level === 0) {
    return (
      <SidebarMenuItem key={id || title}>
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={hasActiveChildItem}
              className="w-full"
              tooltip={title}
              aria-expanded={isExpanded}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{title}</span>
              {badge && (
                <BadgeRenderer badge={badge} isActive={hasActiveChildItem} />
              )}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {items?.map((subItem, index) => (
                <NestedItemRenderer
                  key={subItem.id || `${id || title}-child-${index}`}
                  item={subItem}
                  level={level + 1}
                  currentPath={currentPath}
                  activeUrlMatcher={activeUrlMatcher}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  } else {
    return (
      <SidebarMenuSubItem key={id || title}>
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              isActive={hasActiveChildItem}
              className="w-full"
              aria-expanded={isExpanded}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{title}</span>
              {badge && (
                <BadgeRenderer badge={badge} isActive={hasActiveChildItem} />
              )}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="ml-0">
              {items?.map((subItem, index) => (
                <NestedItemRenderer
                  key={subItem.id || `${id || title}-child-${index}`}
                  item={subItem}
                  level={level + 1}
                  currentPath={currentPath}
                  activeUrlMatcher={activeUrlMatcher}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }
});

// Main renderer that decides which component to use
const NestedItemRenderer: React.FC<{
  item: SidebarItemType;
  level: number;
  currentPath: string;
  activeUrlMatcher?: (itemUrl: string, currentPath: string) => boolean;
}> = (props) => {
  const { item } = props;
  const hasChildren = item.items && item.items.length > 0;

  if (hasChildren) {
    return <ParentItem {...props} />;
  } else {
    return <LeafItem {...props} />;
  }
};

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  config,
  defaultCollapsed = false,
  className,
}) => {
  const location = useLocation();
  const { open, setOpen, toggleSidebar } = useSidebar();
  const [headerLayout, setHeaderLayout] = useState<"expanded" | "collapsed">(
    defaultCollapsed ? "collapsed" : "expanded",
  );

  useEffect(() => {
    if (defaultCollapsed) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    setHeaderLayout(open ? "expanded" : "collapsed");
  }, [open]);

  const { header, groups, footer } = config;

  return (
    <Sidebar className={cn(className, config.className)} collapsible="icon">
      {/* Header Section */}
      {header && (
        <SidebarHeader>
          <div
            className={cn(
              "flex items-center transition-all duration-200",
              headerLayout === "collapsed"
                ? "justify-center px-1 py-3"
                : "justify-between px-2 py-3",
            )}
          >
            {/* User Display */}
            {header.user && (
              <div
                className={cn(
                  "flex items-center gap-3",
                  headerLayout === "collapsed" ? "justify-center" : "flex-1",
                )}
              >
                {headerLayout === "collapsed" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleSidebar}
                        className="rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Avatar className="shrink-0">
                          <AvatarImage
                            src={header.user.avatar}
                            alt={header.user.name}
                          />
                          <AvatarFallback>
                            {header.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" sideOffset={10}>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {header.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {header.user.email}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    <Avatar className="shrink-0">
                      <AvatarImage
                        src={header.user.avatar}
                        alt={header.user.name}
                      />
                      <AvatarFallback>
                        {header.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold truncate">
                        {header.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {header.user.email}
                      </span>
                    </div>
                    {header.trigger && <SidebarTrigger />}
                  </>
                )}
              </div>
            )}

            {/* Logo/Title Display */}
            {!header.user && (header.logo || header.title) && (
              <div
                className={cn(
                  "flex items-center gap-2",
                  headerLayout === "collapsed" ? "justify-center" : "flex-1",
                )}
              >
                {headerLayout === "collapsed" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={header.trigger ? toggleSidebar : undefined}
                        className="rounded-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        {header.logo || (
                          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">
                              {header.title?.charAt(0) || "A"}
                            </span>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" sideOffset={10}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{header.title}</span>
                        {header.subtitle && (
                          <span className="text-xs text-muted-foreground">
                            {header.subtitle}
                          </span>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <>
                    {header.logo && (
                      <div className="shrink-0">{header.logo}</div>
                    )}
                    {header.title && (
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold truncate">
                          {header.title}
                        </span>
                        {header.subtitle && (
                          <span className="text-xs text-muted-foreground truncate">
                            {header.subtitle}
                          </span>
                        )}
                      </div>
                    )}
                    {header.trigger && <SidebarTrigger />}
                  </>
                )}
              </div>
            )}
          </div>

          {headerLayout === "expanded" &&
            (header.user || header.logo || header.title) && (
              <Separator className="my-2" />
            )}

          {headerLayout === "collapsed" && (header.user || header.logo) && (
            <Separator className="my-1" />
          )}
        </SidebarHeader>
      )}

      {/* Content Section */}
      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={group.id || group.title || `group-${index}`}>
            {group.title && (
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-2.5">
                {group.items.map((item, index) => (
                  <NestedItemRenderer
                    key={item.id || `${group.id || group.title}-item-${index}`}
                    item={item}
                    level={0}
                    currentPath={location.pathname}
                    activeUrlMatcher={config.activeUrlMatcher}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer Section */}
      {footer && (
        <SidebarFooter>
          {footer.content}
          {footer.items && footer.items.length > 0 && (
            <SidebarMenu>
              {footer.items.map((item, index) => (
                <NestedItemRenderer
                  key={item.id || `footer-item-${index}`}
                  item={item}
                  level={0}
                  currentPath={location.pathname}
                  activeUrlMatcher={config.activeUrlMatcher}
                />
              ))}
            </SidebarMenu>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
