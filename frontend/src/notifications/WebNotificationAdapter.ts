// Web/PWA Notification Adapter
// For now, this is a no-op implementation that logs to console
// Future: could generate .ics files or use Web Push API

import { NotificationAdapter } from './NotificationAdapter';

export class WebNotificationAdapter implements NotificationAdapter {
  private scheduledReminders: Map<string, { when: Date; title: string; body: string }> = new Map();
  private storageKey = 'mos_demo_scheduled_reminders';

  async scheduleReminder(id: string, when: Date, title: string, body: string): Promise<void> {
    console.log(`[Web] Schedule reminder: ${title} at ${when.toISOString()}`);
    
    // Store the reminder for potential future use
    this.scheduledReminders.set(id, { when, title, body });

    // Persist for demo-mode missed reminder checks
    try {
      const list = this.readStorage();
      const existingIndex = list.findIndex(r => r.id === id);
      const record = { id, when: when.toISOString(), title, body, delivered: false };
      if (existingIndex >= 0) {
        list[existingIndex] = record;
      } else {
        list.push(record);
      }
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('[Web] Failed to persist scheduled reminder', e);
    }

    // For now, just log - in the future this could:
    // 1. Generate an .ics file for calendar apps
    // 2. Use Web Push API if supported
    // 3. Show a browser notification if permission granted
    
    if (this.isSupported() && Notification.permission === 'granted') {
      // Schedule a browser notification (limited reliability)
      const delay = when.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          try {
            new Notification(title, {
              body,
              icon: '/icons/icon-192x192.png',
              tag: id
            });
            this.markDelivered(id);
          } catch (e) {
            console.warn('[Web] Notification show failed', e);
          }
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
    console.log('[WebNotificationAdapter] Requesting permission...');
    
    if (!this.isSupported()) {
      console.log('[WebNotificationAdapter] Notifications not supported');
      return false;
    }

    // Log current permission state
    console.log('[WebNotificationAdapter] Current permission:', Notification.permission);
    
    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      console.log('[WebNotificationAdapter] Permission already granted');
      return true;
    }
    
    // Check if permission was previously denied
    if (Notification.permission === 'denied') {
      console.log('[WebNotificationAdapter] Permission previously denied - user must manually enable in browser settings');
      return false;
    }

    try {
      console.log('[WebNotificationAdapter] Requesting permission from user...');
      const permission = await Notification.requestPermission();
      console.log('[WebNotificationAdapter] Permission result:', permission);
      
      const granted = permission === 'granted';
      if (granted) {
        console.log('[WebNotificationAdapter] ✅ Permission granted successfully');
      } else {
        console.log('[WebNotificationAdapter] ❌ Permission denied by user');
      }
      
      return granted;
    } catch (error) {
      console.error('[WebNotificationAdapter] Error requesting permission:', error);
      return false;
    }
  }

  // Utility method to get all scheduled reminders
  getScheduledReminders(): Map<string, { when: Date; title: string; body: string }> {
    return new Map(this.scheduledReminders);
  }

  // Diagnostic method to help troubleshoot permission issues
  getDiagnosticInfo(): object {
    const info = {
      isSupported: this.isSupported(),
      currentPermission: Notification.permission,
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      scheduledRemindersCount: this.scheduledReminders.size
    };
    
    console.log('[WebNotificationAdapter] Diagnostic info:', info);
    return info;
  }

  /** Demo-mode: check for past-due reminders and show them now. */
  async checkAndShowMissedReminders(): Promise<number> {
    if (!this.isSupported() || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return 0;
    }
    const now = Date.now();
    const list = this.readStorage();
    let shown = 0;
    for (const r of list) {
      if (!r.delivered && new Date(r.when).getTime() <= now) {
        try {
          new Notification(r.title, {
            body: r.body,
            icon: '/icons/icon-192x192.png',
            tag: r.id
          });
          r.delivered = true;
          shown++;
        } catch (e) {
          console.warn('[Web] Missed reminder notification failed', e);
        }
      }
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {}
    return shown;
  }

  private readStorage(): Array<{ id: string; when: string; title: string; body: string; delivered: boolean }>{
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private markDelivered(id: string) {
    try {
      const list = this.readStorage();
      const idx = list.findIndex(r => r.id === id);
      if (idx >= 0) {
        list[idx].delivered = true;
        localStorage.setItem(this.storageKey, JSON.stringify(list));
      }
    } catch {}
  }
}
