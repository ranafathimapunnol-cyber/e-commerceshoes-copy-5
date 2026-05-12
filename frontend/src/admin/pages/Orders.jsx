import { useState, useEffect } from 'react';
import adminAxios from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../../utils/toast';
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Search,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Eye,
    Package,
    User,
    Calendar,
    Truck,
    CreditCard,
    MapPin,
    Hash,
    X,
    Image as ImageIcon,
} from 'lucide-react';

const GlassCard = ({ children }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

const OverviewCard = ({ title, value, icon: Icon }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-white/50 truncate">{title}</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1 truncate">{value}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-white/10 flex-shrink-0">
                <Icon size={18} className="sm:w-[22px] sm:h-[22px] text-white/60" />
            </div>
        </div>
    </div>
);

// Modal Component for Order Details with Product Images
const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'shipped':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'processing':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-white/10 text-white/60';
        }
    };

    // Function to get product image URL
    const getProductImageUrl = (item) => {
        if (item.product_image) return item.product_image;
        if (item.image) return item.image;
        if (item.product?.image) return item.product.image;
        if (item.product?.product_image) return item.product.product_image;
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black ">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-white/10 bg-black/90 backdrop-blur-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Order Details</h2>
                        <p className="text-white/40 text-sm">Order #{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
                        <X size={24} className="text-white/60" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <User size={18} className="text-purple-400" />
                                <span className="text-white/40 text-sm">Customer</span>
                            </div>
                            <p className="text-white font-medium">{order.user_name || 'Guest User'}</p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar size={18} className="text-purple-400" />
                                <span className="text-white/40 text-sm">Order Date</span>
                            </div>
                            <p className="text-white font-medium">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign size={18} className="text-purple-400" />
                                <span className="text-white/40 text-sm">Total Amount</span>
                            </div>
                            <p className="text-white font-bold text-xl">₹{order.total_price?.toLocaleString()}</p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Truck size={18} className="text-purple-400" />
                                <span className="text-white/40 text-sm">Status</span>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                {order.status_display || order.status}
                            </span>
                        </div>
                    </div>

                    {/* Payment & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <CreditCard size={18} className="text-purple-400" />
                                <h3 className="text-white font-semibold">Payment Information</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-white/40">Method:</span>
                                    <span className="text-white capitalize">{order.payment_method || 'COD'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Payment Status:</span>
                                    <span className={`${order.is_paid ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {order.is_paid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <MapPin size={18} className="text-purple-400" />
                                <h3 className="text-white font-semibold">Shipping Address</h3>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {order.shipping_address || 'No address provided'}
                            </p>
                            {order.tracking_number && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                    <span className="text-white/40 text-sm">Tracking #: </span>
                                    <span className="text-white text-sm">{order.tracking_number}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products Table with Images */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Package size={18} className="text-purple-400" />
                                <h3 className="text-white font-semibold">Ordered Products</h3>
                                <span className="text-white/40 text-sm">({order.items?.length || 0} items)</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr className="border-b border-white/10">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {order.items?.map((item, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {getProductImageUrl(item) ? (
                                                        <img
                                                            src={getProductImageUrl(item)}
                                                            alt={item.product_name || item.product?.name}
                                                            className="w-16 h-16 object-cover rounded-lg bg-white/5"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    'https://via.placeholder.com/80x80?text=No+Image';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                                                            <ImageIcon size={24} className="text-white/30" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {item.product_name || item.product?.name}
                                                        </p>
                                                        <p className="text-white/40 text-xs">
                                                            SKU: {item.product_id || item.product?.id}
                                                        </p>
                                                        {item.size && (
                                                            <p className="text-white/40 text-xs">Size: {item.size}</p>
                                                        )}
                                                        {item.color && (
                                                            <p className="text-white/40 text-xs">Color: {item.color}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-white">₹{item.price?.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg text-white">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-white font-semibold">
                                                ₹{(item.price * item.quantity)?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/5 border-t border-white/10">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right text-white font-semibold">
                                            Total:
                                        </td>
                                        <td className="px-4 py-3 text-white font-bold text-lg">
                                            ₹{order.total_price?.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        shippedOrders: 0,
        cancelledOrders: 0,
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        calculateStats(orders);
    }, [orders]);

    useEffect(() => {
        let filtered = orders;
        if (searchTerm) {
            filtered = filtered.filter(
                (order) =>
                    order.id?.toString().includes(searchTerm) ||
                    order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }
        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, orders]);

    const calculateStats = (ordersData) => {
        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const pendingOrders = ordersData.filter((order) => order.status === 'pending').length;
        const completedOrders = ordersData.filter((order) => order.status === 'delivered').length;
        const shippedOrders = ordersData.filter((order) => order.status === 'shipped').length;
        const cancelledOrders = ordersData.filter((order) => order.status === 'cancelled').length;

        setStats({
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            shippedOrders,
            cancelledOrders,
        });
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminAxios.get('orders/');
            const ordersData = response.data;
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            await adminAxios.patch(`orders/${orderId}/status/`, { status });
            showSuccess(`Order #${orderId} status updated to ${status}`);
            fetchOrders();
        } catch (error) {
            console.error('Update failed:', error);
            showError(error.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatRevenue = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <>
            <AdminLayout>
                {/* Overview Cards - Row 1 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
                    <OverviewCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
                    <OverviewCard title="Total Revenue" value={formatRevenue(stats.totalRevenue)} icon={DollarSign} />
                    <OverviewCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} />
                    <OverviewCard title="Completed" value={stats.completedOrders} icon={CheckCircle} />
                </div>

                {/* Overview Cards - Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-6">
                    <OverviewCard title="Shipped" value={stats.shippedOrders} icon={TrendingUp} />
                    <OverviewCard title="Cancelled" value={stats.cancelledOrders} icon={XCircle} />
                    <OverviewCard
                        title="Avg Order"
                        value={stats.totalOrders > 0 ? formatRevenue(stats.totalRevenue / stats.totalOrders) : '₹0'}
                        icon={DollarSign}
                    />
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1
                            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Orders
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm">Manage and track customer orders</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl px-3 sm:px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-white/60 text-xs sm:text-sm flex items-center gap-2">
                            <ShoppingCart size={14} className="sm:w-4 sm:h-4" /> Total: {orders.length} orders
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-sm placeholder-white/30"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white text-sm">
                        <option value="all" className="bg-gray-900">
                            All Status
                        </option>
                        <option value="pending" className="bg-gray-900">
                            Pending
                        </option>
                        <option value="processing" className="bg-gray-900">
                            Processing
                        </option>
                        <option value="shipped" className="bg-gray-900">
                            Shipped
                        </option>
                        <option value="delivered" className="bg-gray-900">
                            Delivered
                        </option>
                        <option value="cancelled" className="bg-gray-900">
                            Cancelled
                        </option>
                    </select>
                </div>

                {/* Orders Table */}
                <GlassCard>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-white/5">
                                <tr className="border-b border-white/10">
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Order ID
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Items
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {currentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-white/40">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/5 transition">
                                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-white">
                                                #{order.id}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-white/60 truncate max-w-[150px]">
                                                {order.user_name || 'Guest'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-white">
                                                ₹{order.total_price?.toLocaleString()}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-white/60">
                                                {order.items?.length || 0} items
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                                        order.status === 'delivered'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : order.status === 'shipped'
                                                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                              : order.status === 'processing'
                                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                                : order.status === 'pending'
                                                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                                  : order.status === 'cancelled'
                                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                    : 'bg-white/10 text-white/60'
                                                    }`}>
                                                    {order.status_display || order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-white/40 whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                                                        title="View Order Details">
                                                        <Eye size={18} />
                                                    </button>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        disabled={updatingId === order.id}
                                                        className="px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-white/10">
                            <p className="text-xs sm:text-sm text-white/40">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of{' '}
                                {filteredOrders.length}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition">
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="hidden sm:flex gap-2">
                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => goToPage(pageNum)}
                                                className={`px-3 py-1 rounded-lg text-sm transition ${
                                                    currentPage === pageNum
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}>
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </AdminLayout>

            {/* Order Details Modal */}
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </>
    );
}

export default Orders;
