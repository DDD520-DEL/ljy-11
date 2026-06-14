export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const STORAGE_KEY = 'knowledge_base_notification_settings';
const LAST_NOTIFICATION_KEY = 'knowledge_base_last_notification_date';

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultNotificationSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e);
  }
  return { ...defaultNotificationSettings };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

export function sendNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (e) {
    console.error('Failed to send notification:', e);
    return null;
  }
}

function getLastNotificationDate(): string | null {
  try {
    return localStorage.getItem(LAST_NOTIFICATION_KEY);
  } catch {
    return null;
  }
}

function setLastNotificationDate(date: string): void {
  try {
    localStorage.setItem(LAST_NOTIFICATION_KEY, date);
  } catch {
    // ignore
  }
}

export function sendReviewReminder(reviewCount: number): Notification | null {
  if (reviewCount === 0) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const lastNotification = getLastNotificationDate();

  if (lastNotification === today) {
    return null;
  }

  const title = '📚 复习提醒';
  const body =
    reviewCount > 1
      ? `你有 ${reviewCount} 张卡片等待复习，保持学习节奏！`
      : `你有 1 张卡片等待复习，快来复习吧！`;

  const notification = sendNotification(title, {
    body,
    tag: 'daily-review-reminder',
    requireInteraction: true,
  });

  if (notification) {
    setLastNotificationDate(today);
  }

  return notification;
}

let reminderInterval: number | null = null;

export function startDailyReminder(
  settings: NotificationSettings,
  getReviewCount: () => number
): void {
  stopDailyReminder();

  if (!settings.enabled) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const checkAndNotify = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (
      currentHour === settings.hour &&
      currentMinute >= settings.minute &&
      currentMinute < settings.minute + 5
    ) {
      const count = getReviewCount();
      sendReviewReminder(count);
    }
  };

  checkAndNotify();

  reminderInterval = window.setInterval(checkAndNotify, 60 * 1000);
}

export function stopDailyReminder(): void {
  if (reminderInterval !== null) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
