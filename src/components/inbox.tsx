// src/components/inbox.tsx

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.tsx";
import {
  ArrowLeft,
  Copy,
  Download,
  File,
  ListFilter,
  Mail,
  MailOpen,
  RefreshCcwIcon,
  RefreshCw,
  Search,
  Trash2,
  User2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { cn } from "@/lib/utils.ts";
import { Attachment as AttachmentType, Email } from "@/types/app.ts";
import { useAppContext } from "@/components/app-context";
import IconButton from "@/components/icon-button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { EmailTextViewer } from "@/components/text-view.tsx";
import { HTMLPreview } from "@/components/html-preview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox.tsx";

// ==================== Context Menu Component ====================
interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  email: Email | null;
}

function EmailContextMenu({
  contextMenu,
  onClose,
  onDelete,
  onMarkAsRead,
  onMarkAsUnread,
  onCopyContent,
  onDownload,
  onSelectEmail,
}: {
  contextMenu: ContextMenuState;
  onClose: () => void;
  onDelete: (email: Email) => void;
  onMarkAsRead: (email: Email) => void;
  onMarkAsUnread: (email: Email) => void;
  onCopyContent: (email: Email) => void;
  onDownload: (email: Email) => void;
  onSelectEmail: (email: Email) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu.isOpen, onClose]);

  if (!contextMenu.isOpen || !contextMenu.email) return null;

  // Adjust position to prevent menu from going off screen
  const adjustedX = Math.min(contextMenu.x, window.innerWidth - 200);
  const adjustedY = Math.min(contextMenu.y, window.innerHeight - 300);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="flex flex-col">
        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer w-full text-left"
          onClick={() => {
            onSelectEmail(contextMenu.email!);
            onClose();
          }}
        >
          <Mail className="size-4" />
          Open Email
        </button>

        <DropdownMenuSeparator className="my-1" />

        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer w-full text-left"
          onClick={() => {
            if (contextMenu.email!.is_read) {
              onMarkAsUnread(contextMenu.email!);
            } else {
              onMarkAsRead(contextMenu.email!);
            }
            onClose();
          }}
        >
          <MailOpen className="size-4" />
          {contextMenu.email!.is_read ? "Mark as Unread" : "Mark as Read"}
        </button>

        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer w-full text-left"
          onClick={() => {
            onCopyContent(contextMenu.email!);
            onClose();
          }}
        >
          <Copy className="size-4" />
          Copy Content
        </button>

        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer w-full text-left"
          onClick={() => {
            onDownload(contextMenu.email!);
            onClose();
          }}
        >
          <Download className="size-4" />
          Download Email
        </button>

        <DropdownMenuSeparator className="my-1" />

        <button
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-destructive hover:text-destructive-foreground cursor-pointer w-full text-left text-destructive"
          onClick={() => {
            onDelete(contextMenu.email!);
            onClose();
          }}
        >
          <Trash2 className="size-4" />
          Delete Email
        </button>
      </div>
    </div>
  );
}

// ==================== List Pane Item ====================
function ListPaneItem({
  email,
  selectEmail,
  selectedEmail,
  isSelected,
  onToggleSelect,
  selectionMode,
  onContextMenu,
}: {
  email: Email;
  selectEmail: (email: Email) => Promise<void>;
  selectedEmail: Email | null;
  isSelected: boolean;
  onToggleSelect: (emailId: string) => void;
  selectionMode: boolean;
  onContextMenu: (e: React.MouseEvent, email: Email) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-3.5 h-20 px-4 items-center hover:bg-muted/20 dark:hover:bg-muted/20 not-hover:not-last:border-b cursor-pointer group",
        selectedEmail?.id === email.id &&
          "bg-muted dark:bg-muted/50 border-none",
        isSelected && "bg-muted dark:bg-muted/50",
      )}
      onClick={async () => {
        if (selectionMode) {
          onToggleSelect(email.id);
        } else {
          await selectEmail(email);
        }
      }}
      onContextMenu={(e) => onContextMenu(e, email)}
    >
      {/* Checkbox for selection mode */}
      {selectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(email.id)}
        />
      )}

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

// ==================== Bulk Actions Header ====================
function BulkActionsHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMarkAsRead,
  onDelete,
  onClose,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted dark:bg-muted/50 shrink-0">
      <div className="flex items-center gap-3">
        <IconButton
          icon={<X className="size-4" />}
          variant="ghost"
          onClick={onClose}
          tooltip="Exit selection mode"
        />
        <span className="text-sm font-medium">
          {selectedCount} of {totalCount} selected
        </span>
        {selectedCount < totalCount ? (
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0"
            onClick={onSelectAll}
          >
            Select all {totalCount}
          </Button>
        ) : (
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0"
            onClick={onDeselectAll}
          >
            Deselect all
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={<MailOpen className="size-4" />}
          variant="ghost"
          size="sm"
          onClick={onMarkAsRead}
          tooltip="Mark selected as read"
          disabled={selectedCount === 0}
        />
        <IconButton
          icon={<Trash2 className="size-4" />}
          variant="ghost"
          size="sm"
          onClick={onDelete}
          tooltip="Delete selected"
          disabled={selectedCount === 0}
          className="text-destructive hover:text-destructive"
        />
      </div>
    </div>
  );
}

// ==================== List Pane ====================
function ListPane() {
  // Get state from context
  const {
    emails,
    selectedEmail,
    isEmailsLoading,
    selectEmail,
    refreshEmails,
    markAsRead,
    deleteEmail,
  } = useAppContext();

  const [filter, setFilter] = useState<"all" | "new" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<Email | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    email: null,
  });

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

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, email: Email) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      email,
    });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      x: 0,
      y: 0,
      email: null,
    });
  }, []);

  // Context menu actions
  const handleContextMenuDelete = useCallback((email: Email) => {
    setEmailToDelete(email);
    setShowDeleteDialog(true);
  }, []);

  const handleContextMenuMarkAsRead = useCallback(
    async (email: Email) => {
      if (!email.is_read) {
        await markAsRead(email.id);
        toast.success("Email marked as read");
      }
    },
    [markAsRead],
  );

  const handleContextMenuMarkAsUnread = useCallback(async (email: Email) => {
    // Note: You'll need to implement this in your context if not already available
    // For now, we'll just show a toast
    toast.info("Mark as unread functionality coming soon");
  }, []);

  const handleContextMenuCopyContent = useCallback(async (email: Email) => {
    const content = email.text || email.html || email.raw_content || "";
    await navigator.clipboard.writeText(content);
    toast.success("Email content copied to clipboard");
  }, []);

  const handleContextMenuDownload = useCallback((email: Email) => {
    const content = email.text || email.html || email.raw_content || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email.subject || "email"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Email downloaded");
  }, []);

  const handleContextMenuSelect = useCallback(
    (email: Email) => {
      selectEmail(email);
    },
    [selectEmail],
  );

  // Handle Ctrl/Cmd+A to select all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed with 'A'
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        // Only trigger if we're in the inbox area
        e.preventDefault();

        // Enter selection mode and select all filtered emails
        setSelectionMode(true);
        const allIds = new Set(filteredEmails.map((email) => email.id));
        setSelectedEmailIds(allIds);
      }

      // Escape to exit selection mode
      if (e.key === "Escape" && selectionMode) {
        setSelectionMode(false);
        setSelectedEmailIds(new Set());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredEmails, selectionMode]);

  // Toggle individual email selection
  const toggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmailIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
        // Exit selection mode if no emails are selected
        if (newSet.size === 0) {
          setSelectionMode(false);
        }
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  }, []);

  // Select all filtered emails
  const selectAllFiltered = useCallback(() => {
    const allIds = new Set(filteredEmails.map((email) => email.id));
    setSelectedEmailIds(allIds);
    setSelectionMode(true);
  }, [filteredEmails]);

  // Deselect all
  const deselectAll = useCallback(() => {
    setSelectedEmailIds(new Set());
    setSelectionMode(false);
  }, []);

  // Mark selected as read
  const markSelectedAsRead = useCallback(async () => {
    const promises = Array.from(selectedEmailIds).map((id) => markAsRead(id));
    await Promise.allSettled(promises);
    setSelectedEmailIds(new Set());
    setSelectionMode(false);
    toast.success(`Marked ${selectedEmailIds.size} email(s) as read`);
  }, [selectedEmailIds, markAsRead]);

  // Delete selected
  const deleteSelected = useCallback(async () => {
    setEmailToDelete(null);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (emailToDelete) {
      // Delete single email
      await deleteEmail(emailToDelete.id);
      toast.success("Email deleted");
    } else {
      // Delete selected emails
      const promises = Array.from(selectedEmailIds).map((id) =>
        deleteEmail(id),
      );
      await Promise.allSettled(promises);
      setSelectedEmailIds(new Set());
      setSelectionMode(false);
      toast.success(`Deleted ${selectedEmailIds.size} email(s)`);
    }
    setShowDeleteDialog(false);
    setEmailToDelete(null);
  }, [selectedEmailIds, deleteEmail, emailToDelete]);

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

        <div className="flex justify-between items-center">
          <span className="text-sm">
            <i className="text-blue-500">Filter:</i>{" "}
            <span className="font-medium capitalize">{filter}</span>
            {filteredEmails.length !== emails.length && (
              <span className="text-muted-foreground ml-1">
                ({filteredEmails.length} of {emails.length})
              </span>
            )}
          </span>

          {/* Keyboard shortcut hint */}
          <span className="text-xs text-muted-foreground">
            {navigator.platform.includes("Mac") ? "⌘+A" : "Ctrl+A"} to select
            all
          </span>
        </div>
      </div>

      {/* Bulk Actions Header */}
      {selectionMode && (
        <BulkActionsHeader
          selectedCount={selectedEmailIds.size}
          totalCount={filteredEmails.length}
          onSelectAll={selectAllFiltered}
          onDeselectAll={deselectAll}
          onMarkAsRead={markSelectedAsRead}
          onDelete={deleteSelected}
          onClose={deselectAll}
        />
      )}

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
              isSelected={selectedEmailIds.has(email.id)}
              onToggleSelect={toggleEmailSelection}
              selectionMode={selectionMode}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      <EmailContextMenu
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onDelete={handleContextMenuDelete}
        onMarkAsRead={handleContextMenuMarkAsRead}
        onMarkAsUnread={handleContextMenuMarkAsUnread}
        onCopyContent={handleContextMenuCopyContent}
        onDownload={handleContextMenuDownload}
        onSelectEmail={handleContextMenuSelect}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {emailToDelete
                ? "Delete Email"
                : `Delete ${selectedEmailIds.size} Email${selectedEmailIds.size > 1 ? "s" : ""}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {emailToDelete
                ? "Are you sure you want to delete this email? This action cannot be undone."
                : `Are you sure you want to delete ${selectedEmailIds.size} email${selectedEmailIds.size > 1 ? "s" : ""}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete{" "}
              {emailToDelete
                ? ""
                : `${selectedEmailIds.size} email${selectedEmailIds.size > 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== Display Pane ====================
function DisplayPane() {
  const { selectedEmail, selectEmail, deleteEmail } = useAppContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = useCallback(async () => {
    if (selectedEmail) {
      await deleteEmail(selectedEmail.id);
      toast.success("Email deleted");
    }
  }, [selectedEmail, deleteEmail]);

  const handleCopy = useCallback(async () => {
    if (selectedEmail) {
      const content =
        selectedEmail.text ||
        selectedEmail.html ||
        selectedEmail.raw_content ||
        "";
      await navigator.clipboard.writeText(content);
      toast.success("Email content copied to clipboard");
    }
  }, [selectedEmail]);

  const handleDownload = useCallback(() => {
    if (selectedEmail) {
      const content =
        selectedEmail.text ||
        selectedEmail.html ||
        selectedEmail.raw_content ||
        "";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedEmail.subject || "email"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Email downloaded");
    }
  }, [selectedEmail]);

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
        <IconButton
          icon={<Trash2 />}
          variant="ghost"
          tooltip="Delete"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive"
        />
        {/* Copy button */}
        <IconButton
          icon={<Copy />}
          variant="ghost"
          tooltip="Copy content"
          onClick={handleCopy}
        />
        {/* Download */}
        <IconButton
          icon={<Download />}
          variant="ghost"
          tooltip="Download"
          onClick={handleDownload}
        />
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
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
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
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-48 p-4 font-semibold">
                    Header
                  </TableHead>
                  <TableHead className="p-4 font-semibold">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    From
                  </TableCell>
                  <TableCell className="p-4">
                    {selectedEmail.sender_name} &lt;{selectedEmail.from}&gt;
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    To
                  </TableCell>
                  <TableCell className="p-4">
                    {selectedEmail.to?.join(", ")}
                  </TableCell>
                </TableRow>
                {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                  <TableRow>
                    <TableCell className="p-4 font-medium text-muted-foreground">
                      CC
                    </TableCell>
                    <TableCell className="p-4">
                      {selectedEmail.cc.join(", ")}
                    </TableCell>
                  </TableRow>
                )}
                {selectedEmail.bcc && selectedEmail.bcc.length > 0 && (
                  <TableRow>
                    <TableCell className="p-4 font-medium text-muted-foreground">
                      BCC
                    </TableCell>
                    <TableCell className="p-4">
                      {selectedEmail.bcc.join(", ")}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Date
                  </TableCell>
                  <TableCell className="p-4">
                    {new Date(selectedEmail.date).toUTCString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Subject
                  </TableCell>
                  <TableCell className="p-4">{selectedEmail.subject}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Message-ID
                  </TableCell>
                  <TableCell className="p-4 font-mono text-xs">
                    {selectedEmail.id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Has HTML
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge
                      variant={selectedEmail.html ? "default" : "secondary"}
                    >
                      {selectedEmail.html ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Has Attachments
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge
                      variant={
                        selectedEmail.attachments?.length
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedEmail.attachments?.length ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="p-4 font-medium text-muted-foreground">
                    Is Read
                  </TableCell>
                  <TableCell className="p-4">
                    <Badge
                      variant={selectedEmail.is_read ? "default" : "secondary"}
                    >
                      {selectedEmail.is_read ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent
          value="attachments"
          className="flex-1 min-h-0 mt-4 overflow-auto"
        >
          {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
            <div className="flex gap-2">
              {selectedEmail.attachments.map((attachment, index) => (
                <Attachment attachment={attachment} key={index} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No attachments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog for Display Pane */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== Attachment component ====================
function Attachment({ attachment }: { attachment: AttachmentType }) {
  return (
    <div className="flex flex-col w-60 rounded-lg border overflow-hidden bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
      {/* Preview area */}
      <div className="h-40 w-full bg-muted/30 flex items-center justify-center">
        {attachment.content_type?.startsWith("image/") ? (
          <img
            src={attachment.path || "/placeholder-image.svg"}
            alt={attachment.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <File className="size-12 text-muted-foreground/50" />
        )}
      </div>

      {/* File info */}
      <div className="p-3 flex flex-col gap-1 border-t">
        <div className="flex items-center gap-2">
          <File className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              title={attachment.filename}
            >
              {attachment.filename}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {attachment.content_type || "Unknown type"} •{" "}
              {formatFileSize(attachment.size)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Inbox Main Component ====================
export default function Inbox() {
  const { emails, isEmailsLoading, refreshEmails } = useAppContext();

  const handleRefresh = useCallback(async () => {
    await refreshEmails();
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
