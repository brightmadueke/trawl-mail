import type { EmailClientConfig, ThemeMode } from "@/types/html-preview.ts";
import IconButton from "@/components/icon-button.tsx";
import {
  AlertCircle,
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  FileText,
  Folder,
  Forward,
  Inbox,
  Lock,
  Menu,
  Pencil,
  Reply,
  Search,
  Send,
  Star,
  Trash2Icon,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Input } from "@/components/ui/input.tsx";
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { Email } from "@/types/app.ts";
import { EmailContentIframe } from "@/components/html-preview/email-client-uis/email-content-iframe.tsx";

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
  isMobile: boolean;
}

// ----------------------------------------------------------------------------
// Shared Email Content
// ----------------------------------------------------------------------------
function EmailContent({
  selectedEmail,
  emailHTML,
  iframeKey,
  clientConfig,
}: {
  selectedEmail: Email;
  emailHTML: string;
  iframeKey: number;
  clientConfig: EmailClientConfig;
  isDark: boolean;
}) {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback
                className="text-white text-xl"
                style={{ backgroundColor: clientConfig.avatarBg }}
              >
                {selectedEmail.sender_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold">
                  {selectedEmail.sender_name}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedEmail.date).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>To: {selectedEmail.to}</span>
                <CollapsibleTrigger asChild>
                  <IconButton
                    icon={collapsibleOpen ? <ChevronUp /> : <ChevronDown />}
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full"
                  />
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Reply />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
            <IconButton
              icon={<Forward />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
            <IconButton
              icon={<EllipsisVertical />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
          </div>
        </div>

        <CollapsibleContent className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
            <span className="text-gray-500">From:</span>
            <span>
              {selectedEmail.sender_name}{" "}
              <span className="text-gray-400">({selectedEmail.from})</span>
            </span>
            <span className="text-gray-500">To:</span>
            <span className="text-gray-500">{selectedEmail.to}</span>
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-500">
              {new Date(selectedEmail.date).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
            <span className="text-gray-500 flex items-center">
              <Lock size={14} className="mr-1" />
            </span>
            <span className="text-gray-500">Encrypted</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-2">
        <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Mobile version
// ----------------------------------------------------------------------------
function OutlookUIMobile(props: EmailClientUIProps) {
  const { clientConfig, theme, emailHTML, iframeKey, selectedEmail } = props;
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col overflow-hidden",
        isDark ? clientConfig.bgColorDark : clientConfig.bgColor,
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "flex items-center gap-2 px-4 py-3 border-b",
          isDark
            ? `${clientConfig.headerBgDark} border-gray-700`
            : `${clientConfig.headerBg} border-[${clientConfig.accentColor}]`,
        )}
      >
        <IconButton
          icon={
            <ArrowLeftIcon
              className={cn(
                isDark ? clientConfig.headerTextDark : clientConfig.headerText,
              )}
            />
          }
          variant="ghost"
          className="rounded-full"
          tooltip="Back"
        />
        <span
          className={cn(
            "font-semibold text-lg flex-1 truncate",
            isDark ? clientConfig.headerTextDark : clientConfig.headerText,
          )}
        >
          {selectedEmail.subject}
        </span>
        <IconButton
          icon={
            <ArchiveIcon
              className={cn(
                isDark ? clientConfig.headerTextDark : clientConfig.headerText,
              )}
            />
          }
          variant="ghost"
          className="rounded-full"
        />
        <IconButton
          icon={
            <Trash2Icon
              className={cn(
                isDark ? clientConfig.headerTextDark : clientConfig.headerText,
              )}
            />
          }
          variant="ghost"
          className="rounded-full"
        />
        <IconButton
          icon={
            <EllipsisVertical
              className={cn(
                isDark ? clientConfig.headerTextDark : clientConfig.headerText,
              )}
            />
          }
          variant="ghost"
          className="rounded-full"
        />
      </header>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-4">
        <EmailContent
          selectedEmail={selectedEmail}
          emailHTML={emailHTML}
          iframeKey={iframeKey}
          clientConfig={clientConfig}
          isDark={isDark}
        />
      </div>

      {/* Reply/Forward bar */}
      <div
        className={cn(
          "flex gap-2 p-4 border-t",
          isDark
            ? `${clientConfig.headerBgDark} border-gray-700`
            : "bg-gray-50 border-gray-200",
        )}
      >
        <Button
          className="rounded-full h-12 flex-1 text-white"
          style={{ backgroundColor: clientConfig.accentColor }}
        >
          <Reply className="mr-2 h-4 w-4" /> Reply
        </Button>
        <Button
          variant="outline"
          className={cn(
            "rounded-full h-12 flex-1",
            isDark
              ? "border-gray-600 text-gray-200"
              : "border-gray-300 text-gray-700",
          )}
        >
          <Forward className="mr-2 h-4 w-4" /> Forward
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Desktop version
// ----------------------------------------------------------------------------
function OutlookUIDesktop(props: EmailClientUIProps) {
  const { clientConfig, theme, emailHTML, iframeKey, selectedEmail } = props;
  const isDark = theme === "dark";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={cn(
        "h-full w-full flex overflow-hidden",
        isDark ? clientConfig.bgColorDark : clientConfig.bgColor,
      )}
    >
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 flex flex-col border-r transition-all duration-200",
          isDark
            ? `${clientConfig.headerBgDark} border-gray-700`
            : "bg-white border-gray-200",
          !sidebarOpen && "w-0 overflow-hidden border-0",
        )}
      >
        {/* Logo / hamburger */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <IconButton
            icon={<Menu className="text-gray-600 dark:text-gray-300" />}
            variant="ghost"
            className="rounded-full"
            onClick={() => setSidebarOpen(false)}
          />
          <span
            className="text-xl font-semibold"
            style={{ color: clientConfig.accentColor }}
          >
            Outlook
          </span>
        </div>

        {/* New message */}
        <div className="px-4 py-3">
          <Button
            className="w-full rounded-full text-white shadow-sm"
            style={{ backgroundColor: clientConfig.accentColor }}
          >
            <Pencil className="mr-2 h-4 w-4" /> New message
          </Button>
        </div>

        {/* Folder list */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md"
            style={{
              backgroundColor: isDark
                ? `${clientConfig.accentColor}30`
                : "#e6f2fc",
              color: clientConfig.accentColor,
            }}
          >
            <Inbox className="mr-3 h-5 w-5" /> Inbox
            <span
              className="ml-auto text-xs text-white rounded-full px-2 py-0.5"
              style={{ backgroundColor: clientConfig.accentColor }}
            >
              42
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Send className="mr-3 h-5 w-5" /> Sent Items
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FileText className="mr-3 h-5 w-5" /> Drafts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Trash2Icon className="mr-3 h-5 w-5" /> Deleted Items
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Folder className="mr-3 h-5 w-5" /> Archive
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <AlertCircle className="mr-3 h-5 w-5" /> Junk Email
          </Button>
        </nav>

        {/* Groups */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Groups
          </span>
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users size={16} /> Team Alpha
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users size={16} /> Project Beta
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Ribbon / Top bar */}
        <header
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b",
            isDark
              ? `${clientConfig.headerBgDark} border-gray-700`
              : `${clientConfig.headerBg} border-gray-200`,
          )}
        >
          {!sidebarOpen && (
            <IconButton
              icon={<Menu className="text-gray-600 dark:text-gray-300" />}
              variant="ghost"
              className="rounded-full"
              onClick={() => setSidebarOpen(true)}
            />
          )}
          <div className="flex-1 flex items-center gap-2">
            <IconButton
              icon={<ArrowLeftIcon />}
              variant="ghost"
              className="rounded-full"
              tooltip="Back"
            />
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1"
                style={
                  {
                    "--tw-ring-color": clientConfig.accentColor,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<Reply />}
              variant="ghost"
              className="rounded-full"
              tooltip="Reply"
            />
            <IconButton
              icon={<Forward />}
              variant="ghost"
              className="rounded-full"
              tooltip="Forward"
            />
            <IconButton
              icon={<ArchiveIcon />}
              variant="ghost"
              className="rounded-full"
              tooltip="Archive"
            />
            <IconButton
              icon={<Trash2Icon />}
              variant="ghost"
              className="rounded-full"
              tooltip="Delete"
            />
            <IconButton
              icon={<EllipsisVertical />}
              variant="ghost"
              className="rounded-full"
            />
            <div className="border-l mx-2 h-6 border-gray-300 dark:border-gray-600" />
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className="text-white text-sm"
                style={{ backgroundColor: clientConfig.avatarBg }}
              >
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Email view */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              "max-w-4xl mx-auto rounded-lg shadow-sm border",
              isDark
                ? "bg-[#2b2b2b] border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            {/* Subject line */}
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconButton
                    icon={<ArrowLeftIcon />}
                    variant="ghost"
                    className="rounded-full"
                    tooltip="Back"
                  />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedEmail.subject}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    icon={<Star />}
                    variant="ghost"
                    className="rounded-full"
                  />
                  <IconButton
                    icon={<EllipsisVertical />}
                    variant="ghost"
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {selectedEmail.sender_name}
                </span>
                <span>&lt;{selectedEmail.from}&gt;</span>
              </div>
            </div>

            {/* Email content */}
            <div className="p-6">
              <EmailContent
                selectedEmail={selectedEmail}
                emailHTML={emailHTML}
                iframeKey={iframeKey}
                clientConfig={clientConfig}
                isDark={isDark}
              />
            </div>

            {/* Reply/Forward actions */}
            <div className="flex gap-2 px-6 pb-6">
              <Button
                className="rounded-full px-6 text-white"
                style={{ backgroundColor: clientConfig.accentColor }}
              >
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6 border-gray-300 dark:border-gray-600"
              >
                <Forward className="mr-2 h-4 w-4" /> Forward
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main export
// ----------------------------------------------------------------------------
export function OutlookUI(props: EmailClientUIProps) {
  return props.isMobile ? (
    <OutlookUIMobile {...props} />
  ) : (
    <OutlookUIDesktop {...props} />
  );
}
