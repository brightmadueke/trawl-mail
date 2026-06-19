// src/components/EmailNotification.tsx

import { toast } from "sonner";
import { Email } from "@/types/app";

interface EmailNotificationProps {
  email: Email;
  onView: (email: Email) => void;
}

export function EmailNotification({ email, onView }: EmailNotificationProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {email.subject || "No Subject"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            From: {email.sender_name || email.from || "Unknown"}
          </p>
        </div>
      </div>
      {email.text && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {email.text}
        </p>
      )}
      <button
        onClick={() => onView(email)}
        className="w-full mt-1 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
      >
        View Email
      </button>
    </div>
  );
}

/**
 * Show a sonner toast notification for a new email
 */
export function showEmailToast(
  email: Email,
  onView: (email: Email) => void,
): void {
  toast.custom(
    (t) => (
      <EmailNotification
        email={email}
        onView={(email) => {
          onView(email);
          toast.dismiss(t);
        }}
      />
    ),
    {
      duration: 10000, // Show for 10 seconds
      position: "bottom-right",
    },
  );
}
