import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/types';
import { socket, SOCKET_EVENTS } from '@/lib/socket';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleNewNotification = (data: unknown) => {
      const notification = data as Notification;
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
}