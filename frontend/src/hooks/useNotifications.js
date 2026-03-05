import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationAPI.getAll({ page: 1, per_page: 20 });
            setNotifications(res.data.items);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnreadCount(res.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

    const markAsRead = async (id) => {
        await notificationAPI.markRead(id);
        await fetchNotifications();
        await fetchUnreadCount();
    };

    const markAllRead = async () => {
        await notificationAPI.markAllRead();
        await fetchNotifications();
        setUnreadCount(0);
    };

    return {
        notifications, unreadCount, loading,
        fetchNotifications, markAsRead, markAllRead, fetchUnreadCount,
    };
}
