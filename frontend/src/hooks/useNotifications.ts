// React hook for using the notification service
import { useState, useEffect } from 'react';
import { notificationService } from '../notifications/NotificationService';

export interface UseNotificationsReturn {
  isSupported: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleReminder: (id: string, when: Date, title: string, body: string) => Promise<void>;
  cancelReminder: (id: string) => Promise<void>;
  adapterType: string;
}

export function useNotifications(): UseNotificationsReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = notificationService.isSupported();
    setIsSupported(supported);

    if (supported) {
      // Check current permission status
      checkPermissionStatus();
    }
  }, []);

  const checkPermissionStatus = async () => {
    if (notificationService.isSupported()) {
      // For web notifications, check the permission directly
      if ('Notification' in window) {
        setHasPermission(Notification.permission === 'granted');
      } else {
        // For Capacitor, we'd check differently
        setHasPermission(false);
      }
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    return granted;
  };

  const scheduleReminder = async (
    id: string, 
    when: Date, 
    title: string, 
    body: string
  ): Promise<void> => {
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }
    
    return notificationService.scheduleReminder(id, when, title, body);
  };

  const cancelReminder = async (id: string): Promise<void> => {
    return notificationService.cancelReminder(id);
  };

  return {
    isSupported,
    hasPermission,
    requestPermission,
    scheduleReminder,
    cancelReminder,
    adapterType: notificationService.getAdapterType()
  };
}
