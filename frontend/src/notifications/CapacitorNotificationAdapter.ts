// Capacitor Notification Adapter
// This will be used when the app is wrapped with Capacitor
// Provides reliable local notifications on mobile devices

import { NotificationAdapter } from './NotificationAdapter';

// These imports will be available when Capacitor is added
// import { LocalNotifications } from '@capacitor/local-notifications';

export class CapacitorNotificationAdapter implements NotificationAdapter {
  private scheduledReminders: Map<string, number> = new Map();

  async scheduleReminder(id: string, when: Date, title: string, body: string): Promise<void> {
    console.log(`[Capacitor] Schedule reminder: ${title} at ${when.toISOString()}`);
    
    try {
      // Ensure permissions are granted
      await this.ensurePermission();

      // Generate a stable integer ID from the string ID
      const notificationId = this.hashCode(id);

      // Schedule the notification
      // await LocalNotifications.schedule({
      //   notifications: [{
      //     id: notificationId,
      //     title,
      //     body,
      //     schedule: { at: when }
      //   }]
      // });

      // Store the mapping for cancellation
      this.scheduledReminders.set(id, notificationId);
      
      console.log(`[Capacitor] Reminder scheduled with ID: ${notificationId}`);
    } catch (error) {
      console.error('[Capacitor] Failed to schedule reminder:', error);
      throw error;
    }
  }

  async cancelReminder(id: string): Promise<void> {
    console.log(`[Capacitor] Cancel reminder: ${id}`);
    
    const notificationId = this.scheduledReminders.get(id);
    if (notificationId) {
      try {
        // await LocalNotifications.cancel({
        //   notifications: [{ id: notificationId }]
        // });
        
        this.scheduledReminders.delete(id);
        console.log(`[Capacitor] Reminder cancelled: ${notificationId}`);
      } catch (error) {
        console.error('[Capacitor] Failed to cancel reminder:', error);
        throw error;
      }
    }
  }

  isSupported(): boolean {
    // Check if Capacitor is available
    // return typeof window !== 'undefined' && window.Capacitor;
    return false; // Will be true when Capacitor is added
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      // const { display } = await LocalNotifications.checkPermissions();
      // if (display !== 'granted') {
      //   const result = await LocalNotifications.requestPermissions();
      //   return result.display === 'granted';
      // }
      return true;
    } catch (error) {
      console.error('[Capacitor] Failed to request permissions:', error);
      return false;
    }
  }

  private async ensurePermission(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }
  }

  // Simple string to integer hash function
  // Ensures stable notification IDs for Capacitor
  private hashCode(str: string): number {
    return Math.abs(
      str.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
    ) % 2147483647; // Max 32-bit signed integer
  }
}
