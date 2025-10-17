// Notification Service - Factory and main interface
// Automatically detects the environment and provides the appropriate adapter

import { NotificationAdapter } from './NotificationAdapter';
import { WebNotificationAdapter } from './WebNotificationAdapter';
import { CapacitorNotificationAdapter } from './CapacitorNotificationAdapter';

export class NotificationService {
  private adapter: NotificationAdapter;

  constructor() {
    // Auto-detect environment and choose appropriate adapter
    this.adapter = this.createAdapter();
  }

  private createAdapter(): NotificationAdapter {
    // Check if we're running in Capacitor
    if (this.isCapacitorEnvironment()) {
      console.log('[NotificationService] Using Capacitor adapter');
      return new CapacitorNotificationAdapter();
    } else {
      console.log('[NotificationService] Using Web adapter');
      return new WebNotificationAdapter();
    }
  }

  private isCapacitorEnvironment(): boolean {
    // Check for Capacitor-specific globals
    return typeof window !== 'undefined' && 
           (window as any).Capacitor !== undefined;
  }

  // Delegate methods to the appropriate adapter
  async scheduleReminder(id: string, when: Date, title: string, body: string): Promise<void> {
    return this.adapter.scheduleReminder(id, when, title, body);
  }

  async cancelReminder(id: string): Promise<void> {
    return this.adapter.cancelReminder(id);
  }

  isSupported(): boolean {
    return this.adapter.isSupported();
  }

  async requestPermission(): Promise<boolean> {
    return this.adapter.requestPermission();
  }

  // Utility method to get adapter type
  getAdapterType(): string {
    return this.isCapacitorEnvironment() ? 'Capacitor' : 'Web';
  }

  // Expose adapter for diagnostics
  getAdapter(): NotificationAdapter {
    return this.adapter;
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();
