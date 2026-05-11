// src/admin/components/NotificationBell.jsx - CORRECTED API ENDPOINTS
import { useState, useEffect } from 'react';
import { Bell, X, ShoppingBag, Trash2, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { showSuccess, showError } from '../../utils/toast';
import toast from 'react-hot-toast';
const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getToken = () => localStorage.getItem('admin_access');
    const API_BASE = 'http://127.0.0.1:8000/api/notifications'; // ✅ CORRECT BASE URL

    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await axios.get(`${API_BASE}/admin/`, {
                // ✅ Matches get_admin_notifications
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n) => !n.is_read).length);
        } catch (err) {
            console.error('Fetch error:', err);
            showError('Failed to load notifications');
        }
    };

    const markAsRead = async (id) => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.post(
                `${API_BASE}/mark-read/${id}/`, // ✅ Matches mark_notification_read
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            setUnreadCount((prev) => Math.max(0, prev - 1));
            showSuccess('Marked as read');
        } catch (err) {
            console.error('Mark read error:', err);
            showError('Failed to mark as read');
        }
    };

    // ✅ WORKING SINGLE DELETE - matches your backend
    const deleteNotification = async (id) => {
        const token = getToken();
        if (!token) return;

        setIsDeleting(true);

        try {
            const response = await axios.delete(`${API_BASE}/delete/${id}/`, {
                // ✅ Matches delete_notification
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                const wasUnread = notifications.find((n) => n.id === id)?.is_read === false;
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                if (wasUnread) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }
                showSuccess(response.data.message || 'Notification deleted permanently');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showError(err.response?.data?.error || 'Failed to delete notification');
            await fetchNotifications(); // Refresh to ensure consistency
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ WORKING DELETE ALL - matches your backend
    const deleteAll = async () => {
        const token = getToken();
        if (!token) return;

        if (!window.confirm('Delete ALL notifications permanently? This cannot be undone.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await axios.delete(`${API_BASE}/clear-all/`, {
                // ✅ Matches clear_all_notifications
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setNotifications([]);
                setUnreadCount(0);
                showSuccess(response.data.message || 'All notifications deleted permanently');
            }
        } catch (err) {
            console.error('Delete all error:', err);
            showError(err.response?.data?.error || 'Failed to delete all notifications');
            await fetchNotifications(); // Refresh to ensure consistency
        } finally {
            setIsDeleting(false);
        }
    };

    const markAllAsRead = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await axios.post(
                `${API_BASE}/mark-all-read/`, // ✅ Matches mark_all_read
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
            showSuccess(response.data.message || 'All marked as read');
        } catch (err) {
            console.error('Mark all read error:', err);
            showError('Failed to mark all as read');
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 10 seconds for new notifications
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (title, type) => {
        if (type === 'order' || title?.toLowerCase().includes('order')) {
            return <ShoppingBag size={16} className="text-blue-400" />;
        }
        return <Bell size={16} className="text-gray-400" />;
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
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-900/95">
                            <div>
                                <h3 className="font-semibold text-white">Notifications</h3>
                                <p className="text-xs text-white/40">
                                    {notifications.length} total • {unreadCount} unread
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={isDeleting}
                                        className="text-xs text-white/50 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 disabled:opacity-50">
                                        <CheckCheck size={12} className="inline mr-1" /> Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={deleteAll}
                                        disabled={isDeleting}
                                        className="text-xs text-red-400/70 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 disabled:opacity-50">
                                        <Trash2 size={12} className="inline mr-1" /> Delete all
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-white/40">No notifications</div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b border-white/10 transition group ${!n.is_read ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}>
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="flex-shrink-0 mt-0.5 cursor-pointer"
                                                onClick={() => !n.is_read && markAsRead(n.id)}>
                                                {getIcon(n.title, n.notification_type)}
                                            </div>
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => !n.is_read && markAsRead(n.id)}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-white">{n.title}</p>
                                                    {!n.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                    )}
                                                    {n.is_read && <span className="text-[10px] text-white/30">Read</span>}
                                                </div>
                                                <p className="text-xs text-white/60">{n.message}</p>
                                                <p className="text-xs text-white/30 mt-1">{formatTime(n.created_at)}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                disabled={isDeleting}
                                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 p-1 rounded disabled:opacity-30">
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
