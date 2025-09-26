// Web/PWA Notification Adapter
// For now, this is a no-op implementation that logs to console
// Future: could generate .ics files or use Web Push API

import { NotificationAdapter } from './NotificationAdapter';

export class WebNotificationAdapter implements NotificationAdapter {
  private scheduledReminders: Map<string, { when: Date; title: string; body: string }> = new Map();

  async scheduleReminder(id: string, when: Date, title: string, body: string): Promise<void> {
    console.log(`[Web] Schedule reminder: ${title} at ${when.toISOString()}`);
    
    // Store the reminder for potential future use
    this.scheduledReminders.set(id, { when, title, body });

    // For now, just log - in the future this could:
    // 1. Generate an .ics file for calendar apps
    // 2. Use Web Push API if supported
    // 3. Show a browser notification if permission granted
    
    if (this.isSupported() && Notification.permission === 'granted') {
      // Schedule a browser notification (limited reliability)
      const delay = when.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            tag: id
          });
        }, delay);
      }
    }
  }

  async cancelReminder(id: string): Promise<void> {
    console.log(`[Web] Cancel reminder: ${id}`);
    this.scheduledReminders.delete(id);
    
    // Note: Browser notifications can't be easily cancelled once scheduled
    // This is a limitation of the web platform
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Utility method to get all scheduled reminders
  getScheduledReminders(): Map<string, { when: Date; title: string; body: string }> {
    return new Map(this.scheduledReminders);
  }
}
