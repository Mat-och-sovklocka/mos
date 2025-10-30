import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { notificationService } from './notifications/NotificationService';

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.origin);
    navigator.serviceWorker.register(serviceWorkerUrl.pathname)
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

async function bootstrap() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { enableDemoMode } = await import('./demo/mockServer.js');
    await enableDemoMode();

    // Demo-mode: check for missed reminders on app start and periodically
    try {
      // Ask for permission early to improve UX
      if ('Notification' in window && Notification.permission === 'default') {
        try { await notificationService.requestPermission(); } catch {}
      }
      await notificationService.checkAndShowMissedReminders();
      // Poll every 60s while app is open
      setInterval(() => {
        notificationService.checkAndShowMissedReminders().catch(() => {});
      }, 60000);
    } catch (e) {
      console.warn('[Demo] Missed reminder bootstrap failed', e);
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
