import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Mail,
    Calendar,
    Package,
    Heart,
    ShoppingBag,
    LogOut,
    Settings,
    Edit2,
    MapPin,
    Phone,
    Award,
    TrendingUp,
    Shield,
    Clock,
    ChevronRight,
} from 'lucide-react';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Fetch user profile
                const profileRes = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(profileRes.data);

                // Fetch user orders
                const ordersRes = await axios.get('http://127.0.0.1:8000/api/orders/my-orders/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(ordersRes.data || []);
            } catch (error) {
                console.error(error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getTotalSpent = () => {
        return orders.reduce((total, order) => total + (parseFloat(order.total_price) || 0), 0);
    };

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            delivered: orders.filter((o) => o.status === 'delivered').length,
            pending: orders.filter((o) => o.status === 'pending').length,
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
        };
        return stats;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const orderStats = getOrderStats();
    const totalSpent = getTotalSpent();

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black">My Account</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your profile and track your orders</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-28">
                            {/* Profile Summary */}
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                        {getInitials(user?.username)}
                                    </div>
                                    <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition">
                                        <Edit2 size={12} className="text-gray-600" />
                                    </button>
                                </div>
                                <h2 className="text-xl font-bold text-black mt-4">{user?.username}</h2>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600 font-medium">Active</span>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="p-2 space-y-1">
                                {[
                                    { id: 'overview', label: 'Overview', icon: User },
                                    { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
                                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                                    { id: 'settings', label: 'Settings', icon: Settings },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${
                                            activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <tab.icon size={18} />
                                            <span className="text-sm font-medium">{tab.label}</span>
                                        </div>
                                        {tab.badge > 0 && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                    activeTab === tab.id
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Logout Button */}
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Total Orders',
                                            value: orderStats.total,
                                            icon: ShoppingBag,
                                            color: 'bg-blue-50 text-blue-600',
                                        },
                                        {
                                            label: 'Total Spent',
                                            value: `₹${totalSpent.toLocaleString()}`,
                                            icon: Award,
                                            color: 'bg-green-50 text-green-600',
                                        },
                                        {
                                            label: 'Delivered',
                                            value: orderStats.delivered,
                                            icon: Package,
                                            color: 'bg-purple-50 text-purple-600',
                                        },
                                        {
                                            label: 'Member Since',
                                            value: '2024',
                                            icon: Calendar,
                                            color: 'bg-orange-50 text-orange-600',
                                        },
                                    ].map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                            <div
                                                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                                <stat.icon size={18} />
                                            </div>
                                            <p className="text-2xl font-bold text-black">{stat.value}</p>
                                            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Orders */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-black">Recent Orders</h3>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="text-sm text-gray-400 hover:text-black transition flex items-center gap-1">
                                            View All <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    {orders.slice(0, 3).length === 0 ? (
                                        <div className="text-center py-8">
                                            <Package size={40} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-400">No orders yet</p>
                                            <Link to="/products" className="text-sm text-black underline mt-2 inline-block">
                                                Start Shopping
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {orders.slice(0, 3).map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-black">Order #{order.id}</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-black">
                                                            ₹{parseFloat(order.total_price).toLocaleString()}
                                                        </p>
                                                        <span
                                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                                order.status === 'delivered'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : order.status === 'pending'
                                                                      ? 'bg-yellow-100 text-yellow-700'
                                                                      : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Account Info */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-black mb-4">Account Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <User size={18} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Username</p>
                                                <p className="text-sm font-medium text-black">{user?.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Mail size={18} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Email Address</p>
                                                <p className="text-sm font-medium text-black">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-black mb-4">My Orders</h3>
                                {orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package size={60} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                                <div className="flex flex-wrap justify-between items-start gap-4">
                                                    <div>
                                                        <p className="font-bold text-black">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {order.items?.length || 0} items
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-black">
                                                            ₹{parseFloat(order.total_price).toLocaleString()}
                                                        </p>
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                                                order.status === 'delivered'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : order.status === 'pending'
                                                                      ? 'bg-yellow-100 text-yellow-700'
                                                                      : order.status === 'shipped'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {order.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/order/${order.id}`)}
                                                    className="mt-3 text-sm text-gray-500 hover:text-black transition flex items-center gap-1">
                                                    View Details <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-black mb-4">My Wishlist</h3>
                                <div className="text-center py-12">
                                    <Heart size={60} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">Your wishlist is empty</p>
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center gap-2 text-black underline mt-2">
                                        Browse Products
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-black mb-4">Account Settings</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield size={18} className="text-green-600" />
                                            <p className="font-medium text-black">Security</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">
                                            Manage your password and security settings
                                        </p>
                                        <button className="text-sm text-black underline">Change Password</button>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Bell size={18} className="text-blue-600" />
                                            <p className="font-medium text-black">Notifications</p>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">Manage your email preferences</p>
                                        <button className="text-sm text-black underline">Configure</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
