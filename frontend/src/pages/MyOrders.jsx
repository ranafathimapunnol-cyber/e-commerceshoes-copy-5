// src/pages/MyOrders.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    PackageCheck,
    Eye,
    Calendar,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    MapPin,
    CreditCard,
    IndianRupee,
} from 'lucide-react';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://127.0.0.1:8000/api/orders/my-orders/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending', step: 1 },
            confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed', step: 2 },
            shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped', step: 3 },
            delivered: { icon: Package, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered', step: 4 },
            cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled', step: 0 },
        };
        return configs[status] || configs['pending'];
    };

    const getProgressWidth = (status) => {
        const steps = { pending: 25, confirmed: 50, shipped: 75, delivered: 100, cancelled: 0 };
        return steps[status] || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-28 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 px-4 md:px-8 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <ShoppingBag size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black">My Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">Track and manage all your orders</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <PackageCheck size={70} className="mx-auto text-gray-300 mb-5" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                    {/* Order Header */}
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">Order #{order.id}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div
                                                        className={`px-3 py-1 rounded-full ${statusConfig.bg} flex items-center gap-1`}>
                                                        <StatusIcon size={12} className={statusConfig.color} />
                                                        <span className={`text-xs font-semibold ${statusConfig.color}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Calendar size={12} />
                                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Total Amount</p>
                                                <p className="text-2xl font-bold text-black">
                                                    ₹{parseInt(order.total_price).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {order.status !== 'cancelled' && (
                                        <div className="px-5 pt-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400">Pending</span>
                                                <span className="text-xs text-gray-400">Confirmed</span>
                                                <span className="text-xs text-gray-400">Shipped</span>
                                                <span className="text-xs text-gray-400">Delivered</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full transition-all duration-500"
                                                    style={{ width: `${getProgressWidth(order.status)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Items Preview */}
                                    <div className="p-5">
                                        <div className="space-y-3">
                                            {order.items.slice(0, 2).map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <img
                                                        src={
                                                            item.product?.image
                                                                ? `http://127.0.0.1:8000${item.product.image}`
                                                                : '/api/placeholder/60/60'
                                                        }
                                                        alt={item.product?.name}
                                                        className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800">{item.product?.name}</h4>
                                                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <p className="text-xs text-gray-400 text-center pt-2">
                                                    +{order.items.length - 2} more items
                                                </p>
                                            )}
                                        </div>

                                        {/* View Details Button */}
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="mt-4 w-full py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                            <Eye size={14} />
                                            View Order Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
}

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
    const statusConfig = {
        pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        delivered: { icon: Package, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    };
    const config = statusConfig[order.status] || statusConfig['pending'];
    const StatusIcon = config.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Order Details #{order.id}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        ✕
                    </button>
                </div>

                <div className="p-5 space-y-6">
                    {/* Status Banner */}
                    <div className={`${config.bg} border ${config.border} rounded-xl p-4 flex items-center gap-3`}>
                        <StatusIcon size={24} className={config.color} />
                        <div>
                            <p className="font-semibold">Order Status: {order.status_display}</p>
                            {order.tracking_number && (
                                <p className="text-sm text-gray-500">Tracking: {order.tracking_number}</p>
                            )}
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                        <h3 className="font-semibold mb-3">Order Timeline</h3>
                        <div className="space-y-3">
                            {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => {
                                const isCompleted =
                                    ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= index;
                                const statusNames = {
                                    pending: 'Order Placed',
                                    confirmed: 'Order Confirmed',
                                    shipped: 'Order Shipped',
                                    delivered: 'Order Delivered',
                                };
                                return (
                                    <div key={status} className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            {isCompleted && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {statusNames[status]}
                                            </p>
                                            {isCompleted && status === order.status && (
                                                <p className="text-xs text-gray-400">
                                                    {new Date(order.updated_at || order.created_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin size={14} /> Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600">{order.shipping_address || 'Address not provided'}</p>
                    </div>

                    {/* Payment Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Information
                        </h3>
                        <p className="text-sm text-gray-600">
                            Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                        <p className="text-sm text-gray-600">Status: {order.is_paid ? 'Paid' : 'Pending'}</p>
                    </div>

                    {/* Order Items */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                                    <img
                                        src={
                                            item.product?.image
                                                ? `http://127.0.0.1:8000${item.product.image}`
                                                : '/api/placeholder/60/60'
                                        }
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.product?.name}</h4>
                                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                        <p className="text-sm text-gray-400">Price: ₹{item.price} each</p>
                                    </div>
                                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>₹{parseInt(order.total_price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>₹{parseInt(order.total_price).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
