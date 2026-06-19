// src/components/inbox.tsx

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group.tsx";
import {
  ArrowLeft,
  Copy,
  Download,
  ListFilter,
  RefreshCcwIcon,
  RefreshCw,
  Search,
  Trash2,
  User2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils.ts";
import { Email } from "@/types/app.ts";
import { useAppContext } from "@/components/app-context";
import IconButton from "@/components/icon-button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { EmailTextViewer } from "@/components/text-view.tsx";
import { HTMLPreview } from "@/components/html-preview.tsx"; // ==================== List Pane Item ====================

// ==================== List Pane Item ====================
function ListPaneItem({
  email,
  selectEmail,
  selectedEmail,
}: {
  email: Email;
  selectEmail: (email: Email) => Promise<void>;
  selectedEmail: Email | null;
}) {
  return (
    <div
      className={cn(
        "flex gap-3.5 h-20 px-4 items-center hover:bg-muted/20 dark:hover:bg-muted/20 not-hover:not-last:border-b cursor-pointer",
        selectedEmail?.id === email.id &&
          "bg-muted dark:bg-muted/50 border-none",
      )}
      onClick={async () => {
        await selectEmail(email);
      }}
    >
      <Avatar size="lg">
        <AvatarImage />
        <AvatarFallback>
          {email.sender_name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5 min-w-0 grow">
        <span className="text-sm font-semibold inline-block line-clamp-1">
          {email.sender_name || email.from || "Unknown Sender"}
        </span>
        <p className="text-xs text-muted-foreground mt-2 truncate">
          {email.subject || "(No Subject)"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 items-end">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date(email.date!).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        {!email.is_read && (
          <Badge className="text-xs rounded-md p-1 text-center text-[10px]">
            NEW
          </Badge>
        )}
      </div>
    </div>
  );
}

// ==================== List Pane ====================
export function ListPane() {
  // Get state from context
  const { emails, selectedEmail, isEmailsLoading, selectEmail, refreshEmails } =
    useAppContext();

  const [filter, setFilter] = useState<"all" | "new" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let result = emails;

    // Apply filter
    switch (filter) {
      case "new":
        result = result.filter((email) => !email.is_read);
        break;
      case "unread":
        result = result.filter((email) => !email.is_read);
        break;
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (email) =>
          email.sender_name?.toLowerCase().includes(query) ||
          email.from?.toLowerCase().includes(query) ||
          email.subject?.toLowerCase().includes(query) ||
          email.text?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [emails, filter, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshEmails();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEmails]);

  return (
    <div className="w-1/4 flex flex-col rounded-xl bg-background/85 h-full overflow-y-hidden border-l">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <IconButton icon={<ListFilter />} tooltip="Filter emails" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                {filter === "all" && (
                  <Badge className="bg-green-500 p-0 size-2 mr-2" />
                )}
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("new")}>
                {filter === "new" && (
                  <Badge className="bg-green-500 p-0 size-2 mr-2" />
                )}
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                {filter === "unread" && (
                  <Badge className="bg-green-500 p-0 size-2 mr-2" />
                )}
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh email list */}
          <IconButton
            icon={isRefreshing ? <Spinner /> : <RefreshCw />}
            tooltip="Refresh emails list"
            onClick={handleRefresh}
            disabled={isRefreshing}
          />
        </div>
        <span className="text-sm">
          <i className="text-blue-500">Filter:</i>{" "}
          <span className="font-medium capitalize">{filter}</span>
          {filteredEmails.length !== emails.length && (
            <span className="text-muted-foreground ml-1">
              ({filteredEmails.length} of {emails.length})
            </span>
          )}
        </span>
      </div>

      <div className="flex-1 gap-2 scrollbar-thin scrollbar-thumb-accent overflow-y-scroll">
        {isEmailsLoading || isRefreshing ? (
          <div className="flex justify-center items-center h-32">
            <Spinner className="size-6" />
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No emails found</p>
            {searchQuery && (
              <p className="text-xs mt-1">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        ) : (
          filteredEmails.map((email, index) => (
            <ListPaneItem
              key={email.id || index}
              email={email}
              selectEmail={selectEmail}
              selectedEmail={selectedEmail}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ==================== Display Pane ====================
export function DisplayPane() {
  const { selectedEmail, selectEmail } = useAppContext();
  const appWindow = getCurrentWindow();
  const [windowMaximized, setWindowMaximized] = useState(false);

  useEffect(() => {
    appWindow.isMaximized().then((maximized) => {
      setWindowMaximized(maximized);
    });

    let unlisten: UnlistenFn;

    const setupListener = async () => {
      unlisten = await appWindow.onResized(async () => {
        const maximized = await appWindow.isMaximized();
        setWindowMaximized(maximized);
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  if (!selectedEmail) {
    return (
      <div className="w-3/4 flex flex-col rounded-xl bg-background/85">
        <Empty className="h-full bg-muted/30">
          <EmptyHeader>
            <EmptyTitle>No email selected</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              You need to select an email to view its contents.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="w-3/4 flex flex-col rounded-xl bg-background/85 overflow-hidden">
      {/* Header Actions */}
      <div className="p-4 flex gap-3 border-b shrink-0">
        {/* Back button */}
        <IconButton
          icon={<ArrowLeft />}
          variant="ghost"
          className="rounded-full bg-muted dark:bg-muted/50 mr-4"
          onClick={() => selectEmail(null)}
          tooltip="Back to list"
        />

        {/* Delete icon */}
        <IconButton icon={<Trash2 />} variant="ghost" tooltip="Delete" />
        {/* Copy button */}
        <IconButton icon={<Copy />} variant="ghost" tooltip="Copy" />
        {/* Download */}
        <IconButton icon={<Download />} variant="ghost" tooltip="Download" />
      </div>

      {/* Sender details */}
      <div className="flex gap-3 p-6 shrink-0">
        <Avatar size="lg">
          <AvatarImage />
          <AvatarFallback>
            {selectedEmail.sender_name?.charAt(0)?.toUpperCase() || <User2 />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1 grow">
          <span className="text-sm">
            <span className="text-sm font-semibold">
              {selectedEmail.sender_name}
            </span>{" "}
            <span className="text-muted-foreground">
              {"<" + selectedEmail.from + ">"}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">
            to: {selectedEmail.recipient_name || selectedEmail.to?.join(", ")}
          </span>
          {selectedEmail.cc && selectedEmail.cc.length > 0 && (
            <span className="text-sm text-muted-foreground">
              cc: {selectedEmail.cc.join(", ")}
            </span>
          )}
        </div>

        <span className="text-sm text-muted-foreground mr-4">
          {new Date(selectedEmail.date!).toLocaleString()}
        </span>
      </div>

      {/* Subject */}
      <span className="text-xl font-extrabold p-4 px-6 ml-2 shrink-0">
        {selectedEmail.subject || "(No Subject)"}
      </span>

      {/* Tabs for different content */}
      <Tabs
        className="flex-1 flex flex-col min-h-0 px-6 pb-4"
        defaultValue="text"
      >
        <TabsList variant="line" className="shrink-0">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="html">HTML Preview</TabsTrigger>
          <TabsTrigger value="raw-content">Raw Content</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          {!windowMaximized && (
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="text"
          className="flex-1 min-h-0 mt-4 data-[state=active]:flex data-[state=active]:flex-col"
        >
          {selectedEmail.text ? (
            <EmailTextViewer content={selectedEmail.text} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No text content available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="html"
          className="flex-1 min-h-0 mt-4 data-[state=active]:flex data-[state=active]:flex-col"
        >
          {selectedEmail.html ? (
            <HTMLPreview
              htmlContent={selectedEmail.html}
              selectedEmail={selectedEmail}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No HTML content available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="raw-content"
          className="flex-1 min-h-0 mt-4 overflow-auto"
        >
          <pre className="text-sm whitespace-pre-wrap wrap-break-word p-4 bg-muted/20 rounded-md">
            {selectedEmail.raw_content || "No raw content available"}
          </pre>
        </TabsContent>

        <TabsContent
          value="headers"
          className="flex-1 min-h-0 mt-4 overflow-auto"
        >
          <div className="p-4 bg-muted/20 rounded-md space-y-2">
            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-muted-foreground">From:</span>
              <span>
                {selectedEmail.sender_name} &lt;{selectedEmail.from}&gt;
              </span>

              <span className="font-semibold text-muted-foreground">To:</span>
              <span>{selectedEmail.to?.join(", ")}</span>

              {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                <>
                  <span className="font-semibold text-muted-foreground">
                    CC:
                  </span>
                  <span>{selectedEmail.cc.join(", ")}</span>
                </>
              )}

              <span className="font-semibold text-muted-foreground">Date:</span>
              <span>{new Date(selectedEmail.date!).toUTCString()}</span>

              <span className="font-semibold text-muted-foreground">
                Subject:
              </span>
              <span>{selectedEmail.subject}</span>

              <span className="font-semibold text-muted-foreground">
                Message ID:
              </span>
              <span className="font-mono text-xs">{selectedEmail.id}</span>
            </div>
          </div>
        </TabsContent>

        {!windowMaximized && (
          <TabsContent
            value="attachments"
            className="flex-1 min-h-0 mt-4 overflow-auto"
          >
            {selectedEmail.attachments &&
            selectedEmail.attachments.length > 0 ? (
              <div className="space-y-2">
                {selectedEmail.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/20 rounded-md"
                  >
                    <div className="text-2xl">📎</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.content_type || "Unknown type"} •{" "}
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No attachments</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ==================== Inbox Main Component ====================
export function Inbox() {
  const { emails, isEmailsLoading, refreshEmails } = useAppContext();

  // @ts-ignore
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshEmails();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEmails]);

  // Show loading spinner on initial load
  if (isEmailsLoading && emails.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner className="size-7" />
      </div>
    );
  }

  // Show empty state
  if (emails.length === 0) {
    return (
      <div className="h-full pr-1.5 pb-1.5">
        <Empty className="h-full bg-muted/30">
          <EmptyHeader>
            <EmptyTitle>No Emails</EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty">
              You're all caught up. Emails will appear here when received.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcwIcon className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Show inbox with emails
  return (
    <div className="w-full h-full flex gap-1.5 pb-1.5 pr-1.5">
      <ListPane />
      <DisplayPane />
    </div>
  );
}

// ==================== Utility Functions ====================
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
