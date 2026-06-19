import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EmailTextViewerProps {
  content: string;
  className?: string;
  isHtml?: boolean;
}

export function EmailTextViewer({
  content,
  className,
  isHtml = false,
}: EmailTextViewerProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <ScrollArea className="h-full w-full rounded-md border">
        <div className="p-4">
          {isHtml ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {content}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
