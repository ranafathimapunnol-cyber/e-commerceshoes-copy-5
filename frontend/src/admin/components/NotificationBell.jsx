// src/admin/components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingBag, Trash2, CheckCheck } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { socket, isConnected } = useSocket();

    const getToken = () => localStorage.getItem('admin_access');
    const API_BASE = 'http://127.0.0.1:8000/api/notifications';

    // Play notification sound
    const playSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch((e) => console.log('Sound error:', e));
        } catch (e) {
            console.log('Sound not supported');
        }
    };

    // Show toast for new order (Black background, white text)
    const showOrderToast = (orderData) => {
        toast.custom(
            (t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } bg-black rounded-lg shadow-xl border border-gray-800 w-96`}>
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-green-400" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">New Order Received!</p>
                                <p className="text-xs text-gray-400 mt-1">Order #{orderData.order_id || 'N/A'}</p>
                                <p className="text-xs text-gray-500 mt-1">{orderData.items_count || 0} items</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                window.location.href = '/admin/orders';
                            }}
                            className="w-full px-3 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-gray-900 transition-colors rounded-b-lg">
                            View Order →
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
                position: 'top-right',
            },
        );
        playSound();
    };

    // Show simple toast for other notifications
    const showSimpleToast = (title, message) => {
        toast.success(message || title, {
            duration: 5000,
            position: 'top-right',
            icon: '🔔',
            style: {
                background: 'black',
                color: 'white',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '1px solid #333',
            },
        });
        playSound();
    };

    // Fetch notifications from API
    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await axios.get(`${API_BASE}/admin/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data);
            const unread = res.data.filter((n) => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    // Poll for new notifications every 5 seconds
    useEffect(() => {
        fetchNotifications();

        let lastCount = notifications.length;

        const interval = setInterval(async () => {
            const token = getToken();
            if (!token) return;

            try {
                const res = await axios.get(`${API_BASE}/admin/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const newNotifications = res.data;

                if (newNotifications.length > lastCount) {
                    const newOnes = newNotifications.slice(0, newNotifications.length - lastCount);

                    newOnes.forEach((notification) => {
                        if (
                            notification.title?.toLowerCase().includes('order') ||
                            notification.notification_type === 'order'
                        ) {
                            // Extract order ID from message
                            const orderMatch = notification.message.match(/#(\d+)/);
                            const orderId = orderMatch ? orderMatch[1] : notification.id;

                            showOrderToast({
                                order_id: orderId,
                                items_count: 1,
                            });
                        } else {
                            showSimpleToast(notification.title, notification.message);
                        }
                    });
                }

                setNotifications(newNotifications);
                setUnreadCount(newNotifications.filter((n) => !n.is_read).length);
                lastCount = newNotifications.length;
            } catch (err) {
                console.error('Poll error:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Socket.IO real-time listeners
    useEffect(() => {
        if (!socket) return;

        console.log('Socket connected for notifications');

        socket.on('admin:newNotification', (data) => {
            console.log('Real-time notification:', data);

            if (data.notificationType === 'order' || data.title?.toLowerCase().includes('order')) {
                showOrderToast({
                    order_id: data.orderId || data.data?.order_id,
                    items_count: data.itemsCount || data.data?.items_count || 1,
                });
            } else {
                showSimpleToast(data.title || 'New Notification', data.message);
            }
            fetchNotifications();
        });

        socket.on('new_order', (orderData) => {
            console.log('New order event:', orderData);
            showOrderToast({
                order_id: orderData.order_id,
                items_count: orderData.items_count || 1,
            });
            fetchNotifications();
        });

        return () => {
            socket.off('admin:newNotification');
            socket.off('new_order');
        };
    }, [socket]);

    const markAsRead = async (id) => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.post(`${API_BASE}/mark-read/${id}/`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
            toast.success('Marked as read', {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        } catch (err) {
            console.error('Mark read error:', err);
            toast.error('Failed to mark as read', {
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        }
    };

    const deleteNotification = async (id) => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.delete(`${API_BASE}/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const wasUnread = notifications.find((n) => n.id === id)?.is_read === false;
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
            toast.success('Deleted', {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete', {
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        }
    };

    const deleteAll = async () => {
        if (!window.confirm('Delete ALL notifications permanently?')) return;

        const token = getToken();
        if (!token) return;

        try {
            await axios.delete(`${API_BASE}/clear-all/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications deleted', {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        } catch (err) {
            console.error('Delete all error:', err);
            toast.error('Failed to delete all', {
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        }
    };

    const markAllAsRead = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.post(`${API_BASE}/mark-all-read/`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('All marked as read', {
                duration: 2000,
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        } catch (err) {
            console.error('Mark all read error:', err);
            toast.error('Failed to mark all as read', {
                position: 'top-right',
                style: {
                    background: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    border: '1px solid #333',
                },
            });
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const mins = Math.floor((new Date() - new Date(dateStr)) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        if (mins < 1440) return `${Math.floor(mins / 60)} hour ago`;
        return `${Math.floor(mins / 1440)} day ago`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition">
                <Bell size={20} className="text-white/70" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {isConnected && <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-96 bg-black rounded-2xl border border-gray-800 shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black">
                            <div>
                                <h3 className="font-semibold text-white">Notifications</h3>
                                <p className="text-xs text-gray-400">
                                    {notifications.length} total • {unreadCount} unread
                                    {isConnected && <span className="ml-2 text-green-400">● Live</span>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-900">
                                        <CheckCheck size={12} className="inline mr-1" /> Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={deleteAll}
                                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10">
                                        <Trash2 size={12} className="inline mr-1" /> Delete all
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto bg-black">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b border-gray-800 transition group ${
                                            !n.is_read ? 'bg-gray-900' : 'hover:bg-gray-900/50'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => !n.is_read && markAsRead(n.id)}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ShoppingBag size={16} className="text-blue-400" />
                                                    <p className="text-sm font-medium text-white">{n.title}</p>
                                                    {!n.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">{n.message}</p>
                                                <p className="text-xs text-gray-600 mt-1">{formatTime(n.created_at)}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
