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
    ChevronRight,
    Zap,
    Navigation,
    Home,
    Box,
    AlertCircle,
} from 'lucide-react';

// ✅ ADD THIS HELPER FUNCTION AT THE TOP
const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return 'https://via.placeholder.com/60x60?text=Product';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    if (imagePath.startsWith('/media/')) {
        return `${imagePath}`;
    }
    if (imagePath.startsWith('/')) {
        return `${imagePath}`;
    }
    return `/media/${imagePath}`;
};

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

            const response = await axios.get('/api/orders/my-orders/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Orders fetched:', response.data);
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

    // Complete status tracking system
    const getTrackingStatus = (status) => {
        const trackingSteps = {
            pending: {
                label: 'Order Placed',
                icon: Clock,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
                progress: 0,
                description: 'Your order has been received and is waiting for confirmation',
            },
            confirmed: {
                label: 'Order Confirmed',
                icon: CheckCircle,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                progress: 25,
                description: 'Your order has been confirmed and is being processed',
            },
            processing: {
                label: 'Processing',
                icon: Package,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
                progress: 50,
                description: 'Your order is being prepared for shipment',
            },
            shipped: {
                label: 'Shipped',
                icon: Truck,
                color: 'text-indigo-500',
                bg: 'bg-indigo-50',
                progress: 75,
                description: 'Your order has been dispatched and is on its way',
            },
            out_for_delivery: {
                label: 'Out for Delivery',
                icon: Navigation,
                color: 'text-teal-500',
                bg: 'bg-teal-50',
                progress: 90,
                description: 'Your order is out for delivery today',
            },
            delivered: {
                label: 'Delivered',
                icon: Home,
                color: 'text-green-500',
                bg: 'bg-green-50',
                progress: 100,
                description: 'Your order has been successfully delivered',
            },
            cancelled: {
                label: 'Cancelled',
                icon: XCircle,
                color: 'text-red-500',
                bg: 'bg-red-50',
                progress: 0,
                description: 'Your order has been cancelled',
            },
        };
        return trackingSteps[status] || trackingSteps['pending'];
    };

    // Get estimated delivery date
    const getEstimatedDelivery = (order) => {
        if (order.status === 'delivered') return 'Delivered';
        if (order.status === 'cancelled') return 'Cancelled';

        const orderDate = new Date(order.created_at);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(orderDate.getDate() + 5);

        return estimatedDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Get delivery progress percentage
    const getDeliveryProgress = (status) => {
        const progress = {
            pending: 0,
            confirmed: 25,
            processing: 50,
            shipped: 75,
            out_for_delivery: 90,
            delivered: 100,
        };
        return progress[status] || 0;
    };

    const getItemPrice = (item) => {
        return item.price || item.product?.price || item.item_price || 0;
    };

    const getItemTotal = (item) => {
        const price = getItemPrice(item);
        return price * item.quantity;
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
                        <p className="text-gray-500 text-sm mt-1">Track your orders in real-time</p>
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
                            const trackingStatus = getTrackingStatus(order.status);
                            const StatusIcon = trackingStatus.icon;
                            const deliveryProgress = getDeliveryProgress(order.status);
                            const estimatedDelivery = getEstimatedDelivery(order);

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                    {/* Order Header */}
                                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                                        <div className="flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-mono">Order #{order.id}</p>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <div
                                                        className={`px-3 py-1 rounded-full ${trackingStatus.bg} flex items-center gap-1.5`}>
                                                        <StatusIcon size={12} className={trackingStatus.color} />
                                                        <span className={`text-xs font-semibold ${trackingStatus.color}`}>
                                                            {trackingStatus.label}
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

                                    {/* Tracking Progress Bar */}
                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <div className="px-5 pt-5">
                                            <div className="flex justify-between mb-2 text-[10px] md:text-xs">
                                                <span
                                                    className={`${deliveryProgress >= 0 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Ordered
                                                </span>
                                                <span
                                                    className={`${deliveryProgress >= 25 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Confirmed
                                                </span>
                                                <span
                                                    className={`${deliveryProgress >= 50 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Processing
                                                </span>
                                                <span
                                                    className={`${deliveryProgress >= 75 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Shipped
                                                </span>
                                                <span
                                                    className={`${deliveryProgress >= 90 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Out for Delivery
                                                </span>
                                                <span
                                                    className={`${deliveryProgress >= 100 ? 'text-black font-medium' : 'text-gray-400'}`}>
                                                    Delivered
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                                                    style={{ width: `${deliveryProgress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    <Zap size={10} />
                                                    {deliveryProgress}% Complete
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Truck size={10} />
                                                    Est. Delivery: {estimatedDelivery}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delivery Status Message */}
                                    {order.status !== 'cancelled' && (
                                        <div className="px-5 pt-3">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <AlertCircle size={10} className="text-blue-500" />
                                                {trackingStatus.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Order Items Preview - ✅ FIXED IMAGE URL */}
                                    <div className="p-5">
                                        <div className="space-y-3">
                                            {order.items &&
                                                order.items.slice(0, 2).map((item) => {
                                                    // ✅ Get the image path correctly
                                                    const imagePath = item.product?.image || item.image || item.image_url;
                                                    const imageUrl = getImageUrl(imagePath);

                                                    return (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.product?.name || 'Product'}
                                                                className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                                                onError={(e) => {
                                                                    e.target.src =
                                                                        'https://via.placeholder.com/60x60?text=Product';
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-800">
                                                                    {item.product?.name || 'Product'}
                                                                </h4>
                                                                <p className="text-sm text-gray-400">
                                                                    Qty: {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="font-semibold">
                                                                ₹{getItemTotal(item).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            {order.items && order.items.length > 2 && (
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
                                            Track Order
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal with Enhanced Tracking */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    getItemPrice={getItemPrice}
                    getItemTotal={getItemTotal}
                    getTrackingStatus={getTrackingStatus}
                    getImageUrl={getImageUrl}
                />
            )}
        </div>
    );
}

// Order Details Modal Component with Enhanced Tracking - ✅ FIXED IMAGE URL
const OrderDetailsModal = ({ order, onClose, getItemPrice, getItemTotal, getTrackingStatus, getImageUrl }) => {
    const trackingSteps = [
        { key: 'pending', label: 'Order Placed', icon: Clock, date: order.created_at },
        { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
        { key: 'processing', label: 'Processing', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
        { key: 'delivered', label: 'Delivered', icon: Home },
    ];

    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentStepIndex = orderStatuses.indexOf(order.status);

    const getStatusColor = (stepIndex) => {
        if (stepIndex < currentStepIndex) return 'bg-green-500 text-white';
        if (stepIndex === currentStepIndex) return 'bg-black text-white';
        return 'bg-gray-200 text-gray-400';
    };

    const getLineColor = (stepIndex) => {
        return stepIndex < currentStepIndex ? 'bg-green-500' : 'bg-gray-200';
    };

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
                    {/* Enhanced Tracking Timeline */}
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5">
                        <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                            <Truck size={16} />
                            Order Tracking Timeline
                        </h3>

                        <div className="relative">
                            {trackingSteps.map((step, idx) => {
                                const StepIcon = step.icon;
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;

                                return (
                                    <div key={step.key} className="relative flex items-start gap-4 mb-6 last:mb-0">
                                        {/* Vertical line */}
                                        {idx < trackingSteps.length - 1 && (
                                            <div
                                                className={`absolute left-5 top-8 w-0.5 h-12 transition-colors duration-500 ${
                                                    idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                                                }`}
                                                style={{ left: '20px' }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <div
                                            className={`z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                                isCurrent
                                                    ? 'bg-black text-white ring-4 ring-black/20 scale-110'
                                                    : isCompleted
                                                      ? 'bg-green-500 text-white'
                                                      : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            <StepIcon size={16} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-4">
                                            <p
                                                className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {step.label}
                                            </p>
                                            {isCurrent && <p className="text-xs text-green-600 mt-1">Current Status</p>}
                                            {step.key === 'pending' && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(step.date).toLocaleString()}
                                                </p>
                                            )}
                                            {step.key === order.status && order.updated_at && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(order.updated_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Progress Summary */}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-blue-800">Delivery Progress</p>
                                <p className="text-sm font-bold text-blue-800">
                                    {Math.round(((currentStepIndex + 1) / trackingSteps.length) * 100)}%
                                </p>
                            </div>
                            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentStepIndex + 1) / trackingSteps.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
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

                    {/* Order Items - ✅ FIXED IMAGE URL */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-3">
                            {order.items &&
                                order.items.map((item) => {
                                    // ✅ Get the image path correctly
                                    const imagePath = item.product?.image || item.image || item.image_url;
                                    const imageUrl = getImageUrl
                                        ? getImageUrl(imagePath)
                                        : imagePath
                                          ? `${imagePath}`
                                          : 'https://via.placeholder.com/60x60?text=Product';

                                    return (
                                        <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                                            <img
                                                src={imageUrl}
                                                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                                alt={item.product?.name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                                                <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                                <p className="text-sm text-gray-400">Price: ₹{getItemPrice(item)} each</p>
                                            </div>
                                            <p className="font-semibold">₹{getItemTotal(item).toLocaleString()}</p>
                                        </div>
                                    );
                                })}
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
