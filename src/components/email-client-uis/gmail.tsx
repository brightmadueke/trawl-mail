import type {EmailClientConfig, ThemeMode} from "@/types/html-preview";
import IconButton from "@/components/icon-button.tsx";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Lock,
  Mail,
  Trash2Icon,
} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar.tsx";
import {useState} from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible.tsx";
import {Email} from "@/types/app.ts";
import {EmailContentIframe} from "@/components/email-client-uis/email-content-iframe.tsx"; // ============================================================================

// ============================================================================
// GMAIL UI
// ============================================================================

interface EmailClientUIProps {
  clientConfig: EmailClientConfig;
  theme: ThemeMode;
  emailHTML: string;
  iframeKey: number;
  selectedEmail: Email;
}

export function GmailUI({
  theme,
  emailHTML,
  iframeKey,
  selectedEmail,
}: EmailClientUIProps) {
  const isDark = theme === "dark";
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col gap-2 overflow-hidden",
        isDark ? "bg-neutral-800 text-white" : "bg-neutral-300 text-black",
      )}
    >
      <header
        className={cn(
          "sticky top-0 flex gap-2 p-4 bg-sidebar",
          isDark ? "bg-neutral-800" : "bg-neutral-300",
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
          tooltip="Archine"
        />
        <IconButton
          icon={<Trash2Icon />}
          variant="ghost"
          className="rounded-full"
          tooltip="Delete"
        />{" "}
        <IconButton icon={<Mail />} variant="ghost" className="rounded-full" />
        <IconButton
          icon={<EllipsisVertical />}
          variant="ghost"
          className="rounded-full"
        />
      </header>

      <div className="h-full w-full p-2.5 overflow-y-scroll">
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
          {/**/}
          <Collapsible
            open={collapsibleOpen}
            onOpenChange={setCollapsibleOpen}
            className="flex w-full flex-col gap-2"
          >
            <div className="flex items-center gap-3.5">
              <Avatar size="lg">
                <AvatarImage />
                <AvatarFallback className="bg-neutral-500 text-white text-xl">
                  {selectedEmail.sender_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-md font-semibold">
                    {selectedEmail.sender_name}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedEmail.date).toLocaleString("en-US", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span>to me</span>
                  <CollapsibleTrigger className="hover:bg-inherit">
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
            <CollapsibleContent
              className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-neutral-800" : "bg-neutral-300",
              )}
            >
              <div className="grid grid-cols-1 gap-2">
                <div className="flex">
                  <div
                    className={cn(
                      "text-muted w-1/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    From:
                  </div>
                  <div className="flex items-center gap-2 w-6/7">
                    <span>{selectedEmail.sender_name}</span>
                    <span
                      className={cn(
                        "text-muted text-sm",
                        isDark && "text-muted-foreground",
                      )}
                    >
                      {selectedEmail.from}
                    </span>
                  </div>
                </div>

                <div className="flex">
                  <div
                    className={cn(
                      "text-muted w-1/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    To:
                  </div>
                  <div
                    className={cn(
                      "text-muted text-start w-6/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    {selectedEmail.to}
                  </div>
                </div>

                <div className="flex">
                  <div
                    className={cn(
                      "text-muted w-1/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    Date:
                  </div>
                  <div
                    className={cn(
                      "text-muted text-start w-6/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    {new Date(selectedEmail.date).toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex">
                  <div
                    className={cn(
                      "text-muted w-1/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    <Lock size={15} />
                  </div>
                  <div
                    className={cn(
                      "text-muted text-start w-6/7",
                      isDark && "text-muted-foreground",
                    )}
                  >
                    Standard encryption (TLS).
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <br />

          <EmailContentIframe emailHTML={emailHTML} iframeKey={iframeKey} />
        </div>
      </div>
    </div>
  );
}
