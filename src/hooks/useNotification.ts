import { useState, useEffect, useCallback } from 'react';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  startDailyReminder,
  stopDailyReminder,
  isNotificationSupported,
  sendTestReviewReminder,
} from '../utils/notification';
import { useStore } from '../store/useStore';

export function useNotification() {
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    getNotificationSettings()
  );
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });

  const getReviewQueue = useStore((state) => state.getReviewQueue);

  const getReviewCount = useCallback(() => {
    return getReviewQueue().length;
  }, [getReviewQueue]);

  useEffect(() => {
    if (!isNotificationSupported()) {
      return;
    }

    const handlePermissionChange = () => {
      setPermission(Notification.permission);
    };

    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((status) => {
          status.addEventListener('change', handlePermissionChange);
        })
        .catch(() => {
          // ignore
        });
    }

    return () => {
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'notifications' as PermissionName })
          .then((status) => {
            status.removeEventListener('change', handlePermissionChange);
          })
          .catch(() => {
            // ignore
          });
      }
    };
  }, []);

  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      startDailyReminder(settings, getReviewCount);
    } else {
      stopDailyReminder();
    }

    return () => {
      stopDailyReminder();
    };
  }, [settings, permission, getReviewCount]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveNotificationSettings(updated);
      return updated;
    });
  }, []);

  const enableNotifications = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);

    if (perm === 'granted') {
      updateSettings({ enabled: true });
      return true;
    }
    return false;
  }, [updateSettings]);

  const disableNotifications = useCallback(() => {
    updateSettings({ enabled: false });
  }, [updateSettings]);

  const setReminderTime = useCallback(
    (hour: number, minute: number) => {
      updateSettings({ hour, minute });
    },
    [updateSettings]
  );

  const testNotification = useCallback(() => {
    const count = getReviewCount();
    return sendTestReviewReminder(count || 5);
  }, [getReviewCount]);

  return {
    settings,
    permission,
    isSupported: isNotificationSupported(),
    enableNotifications,
    disableNotifications,
    setReminderTime,
    testNotification,
  };
}
