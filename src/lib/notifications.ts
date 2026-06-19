// src/lib/notifications.ts

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { Email } from "@/types/app";

/**
 * Check and request notification permission
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    return permissionGranted;
  } catch (error) {
    console.error("Failed to check/request notification permission:", error);
    return false;
  }
}

/**
 * Send a system notification for a new email
 */
export async function sendEmailNotification(email: Email): Promise<void> {
  try {
    const hasPermission = await ensureNotificationPermission();

    if (!hasPermission) {
      console.log("Notification permission not granted");
      return;
    }

    // Create notification body from email content
    const body = email.text
      ? email.text.substring(0, 200) + (email.text.length > 200 ? "..." : "")
      : "New email received";

    sendNotification({
      title: `📧 ${email.subject || "New Email"}`,
      body: `From: ${email.sender_name || email.from || "Unknown"}\n${body}`,
      // Tauri v2 notification doesn't support buttons directly,
      // but we can handle the click event in the frontend
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

/**
 * Focus the main window
 */
export async function focusWindow(): Promise<void> {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const window = getCurrentWindow();
    await window.setFocus();
  } catch (error) {
    console.error("Failed to focus window:", error);
  }
}
