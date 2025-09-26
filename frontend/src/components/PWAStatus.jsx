import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const PWAStatus = () => {
  const { isSupported, hasPermission, requestPermission, adapterType } = useNotifications();
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handlePermissionClick = async () => {
    await requestPermission();
  };

  if (!isSupported) {
    return (
      <div className="alert alert-info">
        <h6>PWA Status</h6>
        <p>Notifications not supported in this environment.</p>
        <small>Adapter: {adapterType}</small>
      </div>
    );
  }

  return (
    <div className="alert alert-info">
      <h6>PWA Status</h6>
      <div className="d-flex flex-column gap-2">
        <div>
          <strong>Adapter:</strong> {adapterType}
        </div>
        <div>
          <strong>Notifications:</strong> 
          {hasPermission ? (
            <span className="text-success ms-1">✓ Enabled</span>
          ) : (
            <span className="text-warning ms-1">⚠ Disabled</span>
          )}
        </div>
        {isInstallable && (
          <div>
            <strong>Install:</strong> 
            <button 
              className="btn btn-sm btn-primary ms-2"
              onClick={handleInstallClick}
            >
              Install App
            </button>
          </div>
        )}
        {!hasPermission && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={handlePermissionClick}
          >
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAStatus;
