import type { EmailClientConfig, ThemeMode } from "@/types/html-preview.ts";
import IconButton from "@/components/icon-button.tsx";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  FileText,
  Flag,
  Forward,
  Inbox,
  Lock,
  Menu,
  Plus,
  Reply,
  Search,
  Send,
  Tag,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useState } from "react";
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
                className={cn(
                  "text-white text-xl",
                  `bg-[${clientConfig.avatarBg}]`,
                )}
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
              icon={<ArchiveIcon />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
            <IconButton
              icon={<Trash2Icon />}
              variant="ghost"
              size="sm"
              className="rounded-full"
            />
            <IconButton
              icon={<Flag />}
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
        <CollapsibleContent className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
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
function AppleMailMobile(props: EmailClientUIProps) {
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
          isDark ? clientConfig.headerBgDark : clientConfig.headerBg,
          isDark ? "border-[#3a3a3c]" : "border-[#e5e5ea]",
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
            <Flag
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
          "bg-white dark:bg-[#2c2c2e]",
          "border-[#e5e5ea] dark:border-[#3a3a3c]",
        )}
      >
        <Button
          className={cn(
            "rounded-full h-12 flex-1 text-white",
            `bg-[${clientConfig.accentColor}]`,
          )}
        >
          <Reply className="mr-2 h-4 w-4" /> Reply
        </Button>
        <Button variant="outline" className="rounded-full h-12 flex-1">
          <Forward className="mr-2 h-4 w-4" /> Forward
        </Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Desktop version
// ----------------------------------------------------------------------------
function AppleMailDesktop(props: EmailClientUIProps) {
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
          "w-60 shrink-0 flex flex-col border-r transition-all duration-200",
          isDark ? clientConfig.headerBgDark : clientConfig.headerBg,
          isDark ? "border-[#3a3a3c]" : "border-[#e5e5ea]",
          !sidebarOpen && "w-0 overflow-hidden border-0",
        )}
      >
        <div
          className={cn(
            "p-4 flex items-center gap-2 border-b",
            isDark ? "border-[#3a3a3c]" : "border-[#e5e5ea]",
          )}
        >
          <IconButton
            icon={
              <Menu
                className={cn(
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
                )}
              />
            }
            variant="ghost"
            className="rounded-full"
            onClick={() => setSidebarOpen(false)}
          />
          <span
            className={cn(
              "font-semibold text-lg",
              isDark ? clientConfig.headerTextDark : clientConfig.headerText,
            )}
          >
            Mail
          </span>
        </div>
        <div className="px-4 py-3">
          <Button
            className={cn(
              "w-full rounded-full text-white",
              `bg-[${clientConfig.accentColor}]`,
            )}
          >
            <Plus className="mr-2 h-4 w-4" /> New Message
          </Button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-md",
              isDark ? `bg-[${clientConfig.accentColor}30]` : "bg-[#e6f2fc]",
              `text-[${clientConfig.accentColor}]`,
            )}
          >
            <Inbox className="mr-3 h-5 w-5" /> Inbox{" "}
            <span
              className={cn(
                "ml-auto text-xs text-white rounded-full px-2",
                `bg-[${clientConfig.accentColor}]`,
              )}
            >
              23
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300"
          >
            <Send className="mr-3 h-5 w-5" /> Sent
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300"
          >
            <FileText className="mr-3 h-5 w-5" /> Drafts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300"
          >
            <Trash2Icon className="mr-3 h-5 w-5" /> Trash
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-md text-gray-700 dark:text-gray-300"
          >
            <Tag className="mr-3 h-5 w-5" /> Flagged
          </Button>
        </nav>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-b",
            isDark ? clientConfig.headerBgDark : clientConfig.headerBg,
            isDark ? "border-[#3a3a3c]" : "border-[#e5e5ea]",
          )}
        >
          {!sidebarOpen && (
            <IconButton
              icon={
                <Menu
                  className={cn(
                    isDark
                      ? clientConfig.headerTextDark
                      : clientConfig.headerText,
                  )}
                />
              }
              variant="ghost"
              className="rounded-full"
              onClick={() => setSidebarOpen(true)}
            />
          )}
          <IconButton
            icon={
              <ArrowLeftIcon
                className={cn(
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
                )}
              />
            }
            variant="ghost"
            className="rounded-full"
          />
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                className={cn(
                  "pl-9 rounded-full bg-gray-100 dark:bg-gray-800 border-0",
                  "focus-visible:ring-1",
                  `focus-visible:ring-[${clientConfig.accentColor}]`,
                )}
              />
            </div>
          </div>
          <IconButton
            icon={
              <ArchiveIcon
                className={cn(
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
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
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
                )}
              />
            }
            variant="ghost"
            className="rounded-full"
          />
          <IconButton
            icon={
              <Reply
                className={cn(
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
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
                  isDark
                    ? clientConfig.headerTextDark
                    : clientConfig.headerText,
                )}
              />
            }
            variant="ghost"
            className="rounded-full"
          />
        </header>

        {/* Email view */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              "max-w-4xl mx-auto rounded-xl shadow-sm border",
              isDark
                ? "bg-[#2c2c2e] border-[#3a3a3c]"
                : "bg-white border-[#e5e5ea]",
            )}
          >
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-2xl font-semibold">
                {selectedEmail.subject}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className="text-gray-700 dark:text-gray-300">
                  {selectedEmail.sender_name}
                </span>
                <span>&lt;{selectedEmail.from}&gt;</span>
                <span>•</span>
                <span>{new Date(selectedEmail.date).toLocaleString()}</span>
              </div>
            </div>
            <div className="px-6 py-4">
              <EmailContent
                selectedEmail={selectedEmail}
                emailHTML={emailHTML}
                iframeKey={iframeKey}
                clientConfig={clientConfig}
                isDark={isDark}
              />
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <Button
                className={cn(
                  "rounded-full px-6 text-white",
                  `bg-[${clientConfig.accentColor}]`,
                )}
              >
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

export function AppleMailUI(props: EmailClientUIProps) {
  return props.isMobile ? (
    <AppleMailMobile {...props} />
  ) : (
    <AppleMailDesktop {...props} />
  );
}
