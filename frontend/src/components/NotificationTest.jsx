import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationTest = () => {
  const { 
    isSupported, 
    hasPermission, 
    requestPermission, 
    scheduleReminder,
    adapterType 
  } = useNotifications();
  
  const [testResult, setTestResult] = useState('');

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      setTestResult(granted ? '✅ Permission granted!' : '❌ Permission denied');
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  const handleTestNotification = async () => {
    try {
      const testTime = new Date(Date.now() + 5000); // 5 seconds from now
      await scheduleReminder(
        'test-reminder-1',
        testTime,
        '🧪 Test Reminder',
        'This is a test notification from MOS!'
      );
      setTestResult(`✅ Test notification scheduled for ${testTime.toLocaleTimeString()}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  const handleTestImmediateNotification = async () => {
    try {
      const testTime = new Date(Date.now() + 1000); // 1 second from now
      await scheduleReminder(
        'test-reminder-2',
        testTime,
        '⚡ Immediate Test',
        'This should appear very soon!'
      );
      setTestResult(`✅ Immediate test scheduled for ${testTime.toLocaleTimeString()}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5>🧪 Notification System Test</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <strong>Adapter Type:</strong> {adapterType}
        </div>
        <div className="mb-3">
          <strong>Supported:</strong> {isSupported ? '✅ Yes' : '❌ No'}
        </div>
        <div className="mb-3">
          <strong>Permission:</strong> {hasPermission ? '✅ Granted' : '❌ Not granted'}
        </div>
        
        <div className="d-flex flex-column gap-2">
          {!hasPermission && (
            <button 
              className="btn btn-primary"
              onClick={handleRequestPermission}
            >
              🔔 Request Notification Permission
            </button>
          )}
          
          {hasPermission && (
            <>
              <button 
                className="btn btn-success"
                onClick={handleTestImmediateNotification}
              >
                ⚡ Test Immediate Notification (1s)
              </button>
              
              <button 
                className="btn btn-info"
                onClick={handleTestNotification}
              >
                🧪 Test Delayed Notification (5s)
              </button>
            </>
          )}
        </div>
        
        {testResult && (
          <div className="mt-3">
            <div className="alert alert-info">
              <strong>Result:</strong> {testResult}
            </div>
          </div>
        )}
        
        <div className="mt-3">
          <small className="text-muted">
            <strong>Note:</strong> Check the browser console for detailed logs from the notification adapter.
          </small>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;
