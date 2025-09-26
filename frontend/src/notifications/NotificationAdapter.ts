// Notification Adapter Interface
// This allows us to swap implementations for Web/PWA vs Capacitor

export interface NotificationAdapter {
  /**
   * Schedule a reminder notification
   * @param id - Unique identifier for the reminder
   * @param when - When to show the notification
   * @param title - Notification title
   * @param body - Notification body text
   */
  scheduleReminder(id: string, when: Date, title: string, body: string): Promise<void>;

  /**
   * Cancel a scheduled reminder
   * @param id - Unique identifier for the reminder
   */
  cancelReminder(id: string): Promise<void>;

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean;

  /**
   * Request notification permissions
   */
  requestPermission(): Promise<boolean>;
}
