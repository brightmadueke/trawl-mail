import type { EmailClientConfig, ThemeMode } from "@/types/html-preview";
import IconButton from "@/components/icon-button";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  EllipsisVertical,
  FileText,
  Forward,
  HelpCircle,
  Inbox,
  Lock,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Star,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Email } from "@/types/app";
import { EmailContentIframe } from "@/components/html-preview/email-client-uis/email-content-iframe"; // ============================================================================

// ============================================================================
// GMAIL UI
// ============================================================================

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
  isMobile: boolean;
}

// ----------------------------------------------------------------------------
// Shared Email Content (used by both mobile and desktop)
// ----------------------------------------------------------------------------
function EmailContent({
  selectedEmail,
  emailHTML,
  iframeKey, // kept for potential future use
}: {
  selectedEmail: Email;
  emailHTML: string;
  iframeKey: number;
  isDark: boolean;
}) {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* Sender / subject / actions */}
      <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback className="bg-neutral-500 text-white text-xl">
                {selectedEmail.sender_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold">
                  {selectedEmail.sender_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedEmail.date).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>to me</span>
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
            <Button variant="ghost" size="sm" className="rounded-full">
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Forward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable details */}
        <CollapsibleContent className="p-3 rounded-lg bg-muted/50 dark:bg-muted/20">
          <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">From:</span>
            <span>
              {selectedEmail.sender_name}{" "}
              <span className="text-muted-foreground">
                ({selectedEmail.from})
              </span>
            </span>
            <span className="text-muted-foreground">To:</span>
            <span className="text-muted-foreground">{selectedEmail.to}</span>
            <span className="text-muted-foreground">Date:</span>
            <span className="text-muted-foreground">
              {new Date(selectedEmail.date).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
            <span className="text-muted-foreground flex items-center">
              <Lock size={14} className="mr-1" />
            </span>
            <span className="text-muted-foreground">
              Standard encryption (TLS).
            </span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Email body */}
      <div className="mt-2">
        <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Mobile version (as provided)
// ----------------------------------------------------------------------------
function GmailUIMobile({
  clientConfig,
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
}: EmailClientUIProps) {
  const isDark = theme === "dark";
  return (
    <div
      className={cn(
        "h-full w-full flex flex-col overflow-hidden",
        isDark ? clientConfig.bgColorDark : clientConfig.bgColor,
      )}
    >
      <header
        className={cn(
          "flex sticky top-0 gap-2 p-4 z-10",
          isDark ? clientConfig.headerBgDark : clientConfig.headerBg,
        )}
      >
        <IconButton
          icon={<ArrowLeftIcon />}
          variant="ghost"
          className="rounded-full mr-auto"
          tooltip="Navigation up"
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
        <IconButton icon={<Mail />} variant="ghost" className="rounded-full" />
        <IconButton
          icon={<EllipsisVertical />}
          variant="ghost"
          className="rounded-full"
        />
      </header>

      <div className="flex-1 overflow-y-scroll p-2.5">
        <div className="flex gap-3 items-center">
          <span className="text-2xl">{selectedEmail.subject}</span>
          <Button
            className="bg-blue-800 hover:bg-blue-800 text-white"
            size="xs"
          >
            Inbox
          </Button>
        </div>

        <div
          className={cn(
            "h-fit w-full flex-1 rounded-2xl my-2 p-3",
            isDark ? "bg-black" : "bg-white",
          )}
        >
          <EmailContent
            selectedEmail={selectedEmail}
            emailHTML={emailHTML}
            iframeKey={iframeKey}
            isDark={isDark}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-row w-full gap-2 py-6 px-4",
          isDark
            ? "bg-neutral-800 border-neutral-700"
            : "bg-neutral-300 border-neutral-400",
        )}
      >
        <Button
          className={cn(
            "rounded-full h-14 flex-1",
            isDark
              ? "bg-blue-400 hover:bg-blue-400 text-black"
              : "bg-blue-700 hover:bg-blue-700 text-white",
          )}
        >
          <Reply /> Reply
        </Button>
        <Button
          className={cn(
            "rounded-full h-14 flex-1",
            isDark
              ? "bg-blue-400 hover:bg-blue-400 text-black"
              : "bg-blue-700 hover:bg-blue-700 text-white",
          )}
        >
          <Forward /> Forward
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Desktop version
// ----------------------------------------------------------------------------
function GmailUIDesktop({
  clientConfig,
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
}: EmailClientUIProps) {
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
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-200",
          !sidebarOpen && "w-0 overflow-hidden border-0",
        )}
      >
        {/* Logo / hamburger */}
        <div className="flex items-center gap-2 p-4">
          <IconButton
            icon={<Menu />}
            variant="ghost"
            className="rounded-full"
            onClick={() => setSidebarOpen(false)}
          />
          <span className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Gmail
          </span>
        </div>

        {/* Compose */}
        <div className="px-4 py-2">
          <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Compose
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          >
            <Inbox className="mr-3 h-5 w-5" /> Inbox
            <span className="ml-auto text-xs bg-blue-200 dark:bg-blue-800 rounded-full px-2 py-0.5">
              12
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Star className="mr-3 h-5 w-5" /> Starred
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Clock className="mr-3 h-5 w-5" /> Snoozed
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Send className="mr-3 h-5 w-5" /> Sent
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FileText className="mr-3 h-5 w-5" /> Drafts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreHorizontal className="mr-3 h-5 w-5" /> More
          </Button>
        </nav>

        {/* Labels */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Labels
          </span>
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Personal
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Work
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className={cn(
            "flex items-center gap-2 p-2 border-b",
            isDark
              ? "border-neutral-800 bg-neutral-900"
              : "border-neutral-200 bg-white",
          )}
        >
          {!sidebarOpen && (
            <IconButton
              icon={<Menu />}
              variant="ghost"
              className="rounded-full"
              onClick={() => setSidebarOpen(true)}
            />
          )}
          <div className="flex-1 flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search mail"
              className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1"
            />
          </div>
          <IconButton
            icon={<HelpCircle />}
            variant="ghost"
            className="rounded-full"
          />
          <IconButton
            icon={<Settings />}
            variant="ghost"
            className="rounded-full"
          />
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              U
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Email view */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Subject & actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconButton
                  icon={<ArrowLeftIcon />}
                  variant="ghost"
                  className="rounded-full"
                  tooltip="Back to inbox"
                />
                <h2 className="text-2xl font-medium">
                  {selectedEmail.subject}
                </h2>
                <Button variant="outline" size="sm" className="rounded-full">
                  Inbox
                </Button>
              </div>
              <div className="flex items-center gap-1">
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
                  icon={<Mail />}
                  variant="ghost"
                  className="rounded-full"
                  tooltip="Mark as unread"
                />
                <IconButton
                  icon={<EllipsisVertical />}
                  variant="ghost"
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Email content */}
            <div
              className={cn(
                "rounded-2xl p-5",
                isDark ? "bg-black/20" : "bg-white/80",
              )}
            >
              <EmailContent
                selectedEmail={selectedEmail}
                emailHTML={emailHTML}
                iframeKey={iframeKey}
                isDark={isDark}
              />
            </div>

            {/* Reply / Forward actions (inline) */}
            <div className="flex gap-2 mt-6">
              <Button className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white">
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Button>
              <Button variant="outline" className="rounded-full px-6">
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
export function GmailUI({
  clientConfig,
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
  isMobile,
}: EmailClientUIProps) {
  const props = {
    clientConfig,
    theme,
    emailHTML,
    iframeKey,
    selectedEmail,
    isMobile,
  };

  if (isMobile) {
    return <GmailUIMobile {...props} />;
  }
  return <GmailUIDesktop {...props} />;
}
