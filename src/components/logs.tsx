// src/components/Logs.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Info,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  XCircle
} from "lucide-react";
import { LogEntry } from "@/types/app";
import { useAppContext } from "@/components/app-context";
import { cn } from "@/lib/utils";
import IconButton from "@/components/icon-button.tsx";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group.tsx"; // Props interface

// Props interface
interface LogsProps {
  maxHeight?: string;
  showHeader?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  className?: string;
}

// Log level configuration with colors and icons
const LOG_LEVELS = {
  error: {
    label: "Error",
    color: "destructive" as const,
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
  warn: {
    label: "Warning",
    color: "secondary" as const,
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    dotColor: "bg-yellow-500",
  },
  info: {
    label: "Info",
    color: "default" as const,
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  debug: {
    label: "Debug",
    color: "outline" as const,
    icon: CheckCircle,
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    textColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-800",
    dotColor: "bg-gray-400",
  },
};

export function Logs({ showHeader = true, className = "" }: LogsProps) {
  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters] = useState<Set<string>>(
    new Set(["error", "warn", "info", "debug"]),
  );
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinnedLogs, setPinnedLogs] = useState<Set<string>>(new Set());
  const [showTimestamps] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Refs for scrolling
  const containerRef = useRef<HTMLDivElement>(null);

  // Get state from context
  const { serverStatus, logs, isLogsLoading, refreshLogs, clearLogs } =
    useAppContext();

  // Track when logs were last updated
  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [logs]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      const aPinned = pinnedLogs.has(a.timestamp);
      const bPinned = pinnedLogs.has(b.timestamp);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    return sorted.filter((log) => {
      const level = log.level.toLowerCase();
      if (!activeFilters.has(level)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          level.includes(query) ||
          log.context?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [logs, activeFilters, searchQuery, pinnedLogs]);

  // Count logs by level
  const logCounts = useMemo(() => {
    const counts = { error: 0, warn: 0, info: 0, debug: 0 };
    logs.forEach((log) => {
      const level = log.level.toLowerCase() as keyof typeof counts;
      if (level in counts) {
        counts[level]++;
      }
    });
    return counts;
  }, [logs]);

  // Toggle log expansion
  const toggleExpand = useCallback((logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  }, []);

  // Toggle all logs expansion
  const toggleAllExpanded = useCallback(() => {
    if (showAllDetails) {
      setExpandedLogs(new Set());
    } else {
      setExpandedLogs(new Set(filteredLogs.map((log) => log.timestamp)));
    }
    setShowAllDetails(!showAllDetails);
  }, [showAllDetails, filteredLogs]);

  // Toggle pin log
  const togglePin = useCallback((logId: string) => {
    setPinnedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  }, []);

  // Copy log to clipboard
  const copyLog = useCallback(async (log: LogEntry) => {
    const logText = `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.context ? `\nContext: ${log.context}` : ""}`;
    try {
      await navigator.clipboard.writeText(logText);
      setCopiedId(log.timestamp);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy log:", err);
    }
  }, []);

  // Copy all filtered logs
  const copyAllLogs = useCallback(async () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.context ? ` (${log.context})` : ""}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(logText);
    } catch (err) {
      console.error("Failed to copy logs:", err);
    }
  }, [filteredLogs]);

  // Export logs to file
  const exportLogs = useCallback(() => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}${log.context ? `\n  Context: ${log.context}` : ""}`,
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trawlmail-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  // Format timestamp relative to now
  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 5) return "just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }, []);

  // Format full timestamp
  const formatFullTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, []);

  // Get relative time color
  const getTimeColor = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (diffMs < 10000) return "text-green-500";
    if (diffMs < 60000) return "text-blue-500";
    return "text-muted-foreground";
  };

  // Individual Log Entry Component
  const LogEntryItem = ({ log, index }: { log: LogEntry; index: number }) => {
    const level = log.level.toLowerCase() as keyof typeof LOG_LEVELS;
    const config = LOG_LEVELS[level] || LOG_LEVELS.info;
    const isExpanded = expandedLogs.has(log.timestamp);
    const isCopied = copiedId === log.timestamp;
    const isPinned = pinnedLogs.has(log.timestamp);
    const isNew =
      index < 3 && Date.now() - new Date(log.timestamp).getTime() < 5000;
    const timeColor = getTimeColor(log.timestamp);
    const hasDetails = log.context !== null && log.context !== undefined;

    return (
      <div
        className={cn(
          "group relative transition-all duration-200",
          isPinned && "bg-muted/20 border-l-2 border-l-blue-500",
          isNew && "animate-in fade-in slide-in-from-top-1",
        )}
      >
        {/* Main Row */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-2 cursor-pointer",
            "hover:bg-muted/30 transition-colors duration-150",
            isExpanded && "bg-muted/10",
          )}
          onClick={() => hasDetails && toggleExpand(log.timestamp)}
        >
          {/* Expand/Collapse Indicator */}
          {hasDetails && (
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Pin Indicator */}
          {isPinned && <Pin className="shrink-0 h-3.5 w-3.5 text-blue-500" />}

          {/* Level Indicator Dot */}
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              config.dotColor,
              level === "error" && "animate-pulse",
              isPinned && "ring-2 ring-offset-1 ring-current/20",
            )}
          />

          {/* Timestamp */}
          {showTimestamps && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs cursor-default tabular-nums w-16",
                    timeColor,
                  )}
                >
                  {formatTime(log.timestamp)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-xs">
                {formatFullTimestamp(log.timestamp)}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Level Badge */}
          <Badge
            variant={config.color}
            className={cn("shrink-0 p-0 size-3.5 text-[10px] text-center")}
          >
            {level.toUpperCase().substring(0, 1)}
          </Badge>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "text-xs leading-relaxed wrap-break-word",
                level === "error" && "font-medium",
              )}
            >
              {log.message}
            </span>
          </div>

          {/* Has Details Indicator */}
          {hasDetails && (
            <FileText className="shrink-0 h-3 w-3 text-muted-foreground/50" />
          )}

          {/* Action Buttons (shown on hover) */}
          <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <IconButton
              icon={
                isPinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )
              }
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                togglePin(log.timestamp);
              }}
              tooltip={isPinned ? "Unpin log" : "Pin log"}
            />
            <IconButton
              icon={
                isCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
              variant="ghost"
              size="sm"
              onClick={async (e) => {
                e.stopPropagation();
                await copyLog(log);
              }}
              tooltip={isCopied ? "Copied!" : "Copy log"}
            />
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && hasDetails && (
          <div
            className={cn(
              "px-4 pb-3 pt-1 space-y-2",
              "border-t border-border/50",
              config.bgColor,
            )}
          >
            {/* Timestamp Detail */}
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Timestamp
                </p>
                <p className="text-xs font-mono">
                  {formatFullTimestamp(log.timestamp)}
                  <span className="text-muted-foreground ml-1">
                    ({new Date(log.timestamp).toISOString()})
                  </span>
                </p>
              </div>
            </div>

            {/* Level Detail */}
            <div className="flex items-start gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Level
                </p>
                <Badge variant={config.color} className="text-xs">
                  {level.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Context Detail */}
            {log.context && (
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">
                    Context
                  </p>
                  <div
                    className={cn(
                      "p-2 rounded-md text-xs font-mono",
                      "bg-background/50 border border-border/50",
                      "max-h-32 overflow-y-auto",
                    )}
                  >
                    <pre className="whitespace-pre-wrap break-all">
                      {typeof log.context === "string"
                        ? log.context
                        : JSON.stringify(log.context, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Log Data */}
            <div className="flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Raw Data
                </p>
                <div
                  className={cn(
                    "p-2 rounded-md text-xs font-mono",
                    "bg-background/50 border border-border/50",
                    "max-h-32 overflow-y-auto",
                  )}
                >
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(log, null, 2)}
                  </pre>
                </div>
                <IconButton
                  icon={<Copy className="h-3 w-3" />}
                  variant="ghost"
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(
                      JSON.stringify(log, null, 2),
                    );
                  }}
                  tooltip="Copy raw data"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        className,
        "transition-all duration-200 h-full w-full flex flex-col overflow-hidden",
      )}
    >
      {/* Header */}
      {showHeader && (
        <CardHeader className="p-2 px-4 space-y-4">
          <div className="flex items-center gap-4">
            {/* search*/}
            <InputGroup>
              <InputGroupInput
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              {searchQuery && (
                <InputGroupAddon align="inline-end">
                  <IconButton
                    icon={<XCircle />}
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                  />
                </InputGroupAddon>
              )}
            </InputGroup>

            <div className="w-full grow" />

            <div className="flex items-center gap-2.5">
              {/* Toggle all details */}
              <IconButton
                icon={
                  showAllDetails ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )
                }
                onClick={toggleAllExpanded}
                tooltip={
                  showAllDetails ? "Hide all details" : "Show all details"
                }
              />
              <IconButton
                icon={<RefreshCw />}
                onClick={() => refreshLogs()}
                tooltip="Refresh logs"
              />
              <IconButton
                icon={<Copy />}
                onClick={copyAllLogs}
                tooltip="Copy all"
              />
              <IconButton
                icon={<Download />}
                onClick={exportLogs}
                tooltip="Save to file"
              />
              <IconButton
                icon={<Trash2 />}
                onClick={clearLogs}
                tooltip="Delete all"
              />
            </div>
          </div>

          {/* Stats Row */}
          <CardDescription className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span>
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">
                Updated {formatTime(lastUpdateTime.toISOString())}
              </span>
            </span>
            <span className="text-muted-foreground">
              {pinnedLogs.size > 0 && `${pinnedLogs.size} pinned • `}
              {expandedLogs.size > 0 && `${expandedLogs.size} expanded • `}
              {Object.values(logCounts).reduce((a, b) => a + b, 0)} total
            </span>
          </CardDescription>

          <Separator />
        </CardHeader>
      )}

      {/* Logs Content */}
      <CardContent
        ref={containerRef}
        className="p-0 h-full overflow-y-auto flex-1"
      >
        {isLogsLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-2">
              {searchQuery || activeFilters.size < 4 ? (
                <>
                  <Filter className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No logs match your filters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search or filter settings
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No logs to display
                  </p>
                  {!serverStatus.is_running && (
                    <p className="text-xs text-muted-foreground">
                      Start the SMTP server to begin receiving logs
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredLogs.map((log, index) => (
              <LogEntryItem
                key={`${log.timestamp}-${index}`}
                log={log}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Logs;
