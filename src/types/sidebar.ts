// types/sidebar.ts
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: SidebarSubItem[];
  isActive?: boolean;
  badge?: string | number;
}

export interface SidebarSubItem {
  title: string;
  url: string;
  isActive?: boolean;
}

export interface SidebarGroup {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarGroup[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}
