// components/NotificationCenter.jsx - Working version
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socketService from '../services/socketService';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_access');
        if (!token) return;

        fetchNotifications();
        connectSocket(token);

        return () => {
            socketService.off('notification');
            socketService.off('new_order');
        };
    }, []);

    const connectSocket = (token) => {
        socketService.connect(token);

        socketService.on('notification', (notification) => {
            console.log('Received notification:', notification);
            addNewNotification(notification);
        });

        socketService.on('new_order', (order) => {
            console.log('New order received:', order);
            addNewNotification({
                id: order.order_id,
                title: '🛒 New Order!',
                message: `Order #${order.order_id} - ₹${order.total} from ${order.username}`,
                type: 'order',
                created_at: new Date().toISOString(),
            });
        });

        setIsConnected(true);
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('admin_access');
            const response = await axios.get('/api/notifications/admin/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n) => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const addNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
            });
        }

        // Play sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch((e) => console.log('Audio play failed'));
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('admin_access');
            await axios.post(
                `/api/notifications/mark-read/${notificationId}/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition">
                <span role="img" aria-label="notifications" className="text-white/70">
                    🔔
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-900 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-white">
                            Notifications
                            {isConnected && <span className="ml-2 text-xs text-green-400">● Live</span>}
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-white/40">No notifications</div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition ${
                                        !notif.is_read ? 'bg-white/5' : ''
                                    }`}
                                    onClick={() => markAsRead(notif.id)}>
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl">{notif.title?.includes('Order') ? '🛒' : '🔔'}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">{notif.title}</p>
                                            <p className="text-xs text-white/50 mt-1">{notif.message}</p>
                                            <p className="text-xs text-white/30 mt-1">
                                                {new Date(notif.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
