// pages/admin/Dashboard.jsx - DARKER UNIFIED THEME
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import {
    Package,
    ShoppingBag,
    Users,
    DollarSign,
    CheckCircle,
    Calendar,
    ArrowRight,
    RefreshCw,
    Loader2,
    Plus,
    TrendingUp,
    Award,
    Wallet,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingDown,
    Download,
} from 'lucide-react';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart,
    Tooltip,
} from 'recharts';

// DARKER UNIFIED GLASS CARD
const GlassCard = ({ children }) => (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300">
        {children}
    </div>
);

// DARKER STAT CARD
const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white/5">
                    <Icon size={22} className="text-white/60" />
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {value}
                    </p>
                    <p className="text-xs text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {title}
                    </p>
                    {trend && (
                        <p
                            className="text-xs text-green-400 mt-1 flex items-center justify-end gap-1"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            <TrendingUp size={12} /> +{trend}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        shippedOrders: 0,
        cancelledOrders: 0,
        monthlyRevenue: 0,
        avgOrderValue: 0,
        growthRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [orderStatusData, setOrderStatusData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('admin_access');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const productsRes = await axiosInstance.get('products/');
            const products = productsRes.data.results || productsRes.data || [];
            const totalProducts = products.length;

            const ordersRes = await axiosInstance.get('orders/');
            const orders = ordersRes.data.results || ordersRes.data || [];
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
            const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'Pending').length;
            const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'Delivered').length;
            const shippedOrders = orders.filter((o) => o.status === 'shipped' || o.status === 'Shipped').length;
            const cancelledOrders = orders.filter((o) => o.status === 'cancelled' || o.status === 'Cancelled').length;
            const processingOrders = totalOrders - completedOrders - pendingOrders - shippedOrders - cancelledOrders;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const thisMonthRevenue = orders.reduce((sum, order) => {
                const date = new Date(order.created_at);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    return sum + (parseFloat(order.total_price) || 0);
                }
                return sum;
            }, 0);

            const monthlyData = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const month = d.toLocaleString('default', { month: 'short' });
                const monthOrders = orders.filter((o) => {
                    const date = new Date(o.created_at);
                    return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
                });
                monthlyData.push({
                    month,
                    revenue: monthOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0),
                    orders: monthOrders.length,
                });
            }
            setMonthlySales(monthlyData);

            setOrderStatusData([
                { name: 'Delivered', value: completedOrders, color: '#34d399' },
                { name: 'Shipped', value: shippedOrders, color: '#60a5fa' },
                { name: 'Processing', value: processingOrders, color: '#a78bfa' },
                { name: 'Pending', value: pendingOrders, color: '#fbbf24' },
                { name: 'Cancelled', value: cancelledOrders, color: '#f87171' },
            ]);

            let totalUsers = 0;
            try {
                const usersRes = await axiosInstance.get('users/admin/users/');
                totalUsers = usersRes.data.results?.length || usersRes.data?.length || 0;
            } catch (err) {
                totalUsers = 0;
            }

            const recent = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

            const productSales = {};
            orders.forEach((order) => {
                if (order.items) {
                    order.items.forEach((item) => {
                        const productId = item.product?.id;
                        const productName = item.product?.name;
                        if (productId) {
                            productSales[productId] = productSales[productId] || {
                                id: productId,
                                name: productName,
                                sales: 0,
                                revenue: 0,
                            };
                            productSales[productId].sales += item.quantity;
                            productSales[productId].revenue += (item.price || 0) * item.quantity;
                        }
                    });
                }
            });
            const topProductsList = Object.values(productSales)
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            setStats({
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
                pendingOrders,
                completedOrders,
                shippedOrders,
                cancelledOrders,
                monthlyRevenue: thisMonthRevenue,
                avgOrderValue,
                growthRate: 12.5,
            });
            setRecentOrders(recent);
            setTopProducts(topProductsList);
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 401) navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setTimeout(() => setRefreshing(false), 500);
    };

    const formatRevenue = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
                    <p className="text-white text-sm font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {label}
                    </p>
                    {payload.map((p, idx) => (
                        <p key={idx} className="text-sm text-white/60" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {p.name}: {p.name === 'Revenue' ? formatRevenue(p.value) : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 size={48} className="animate-spin text-white/40 mx-auto mb-4" />
                    <p className="text-white/30" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Loading dashboard...
                    </p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1
                            className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            DASHBOARD
                        </h1>
                        <p className="text-white/40 text-sm mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Welcome back! Here's your store performance overview.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin/add-product"
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 transition border border-white/10"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            <Plus size={16} /> Add Product
                        </Link>
                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl text-white/60 rounded-xl hover:bg-white/10 transition border border-white/10"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards - Darker */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
                    <StatCard
                        title="Total Revenue"
                        value={formatRevenue(stats.totalRevenue)}
                        icon={DollarSign}
                        trend={12}
                    />
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
                    <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
                </div>

                {/* Key Metrics - Darker */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className="text-sm text-white/40"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Avg Order Value
                                    </p>
                                    <p
                                        className="text-2xl font-bold text-white"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        ₹{Math.round(stats.avgOrderValue).toLocaleString()}
                                    </p>
                                </div>
                                <Wallet size={32} className="text-white/30" />
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className="text-sm text-white/40"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Growth Rate
                                    </p>
                                    <p
                                        className="text-2xl font-bold text-green-400"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        +{stats.growthRate}%
                                    </p>
                                </div>
                                <TrendingUp size={32} className="text-white/30" />
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className="text-sm text-white/40"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Completion Rate
                                    </p>
                                    <p
                                        className="text-2xl font-bold text-white"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {((stats.completedOrders / (stats.totalOrders || 1)) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <CheckCircle size={32} className="text-white/30" />
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p
                                        className="text-sm text-white/40"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        This Month
                                    </p>
                                    <p
                                        className="text-2xl font-bold text-white"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {formatRevenue(stats.monthlyRevenue)}
                                    </p>
                                </div>
                                <Calendar size={32} className="text-white/30" />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Revenue vs Orders Area Chart */}
                <GlassCard>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2
                                    className="font-semibold text-white text-lg"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Revenue vs Orders
                                </h2>
                                <p className="text-xs text-white/30" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Compare revenue and order trends
                                </p>
                            </div>
                            <BarChart3 size={20} className="text-white/30" />
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={monthlySales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: "'Playfair Display', serif" }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: "'Playfair Display', serif" }}
                                    tickFormatter={(v) => formatRevenue(v)}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: "'Playfair Display', serif" }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    fill="#f59e0b"
                                    fillOpacity={0.2}
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Pie Chart + Line Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2
                                        className="font-semibold text-white text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Order Status
                                    </h2>
                                    <p
                                        className="text-xs text-white/30"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Distribution by status
                                    </p>
                                </div>
                                <PieChartIcon size={20} className="text-white/30" />
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                        {orderStatusData.map((e, i) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t border-white/10">
                                {orderStatusData.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                                        <span
                                            className="text-white/50 text-xs"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {s.name}: {s.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2
                                        className="font-semibold text-white text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Sales Trend
                                    </h2>
                                    <p
                                        className="text-xs text-white/30"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Monthly orders
                                    </p>
                                </div>
                                <TrendingUp size={20} className="text-white/30" />
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={monthlySales}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: "'Playfair Display', serif" }}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontFamily: "'Playfair Display', serif" }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        name="Orders"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Orders - Darker */}
                <GlassCard>
                    <div className="px-5 py-4 border-b border-white/10 bg-black/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2
                                    className="font-semibold text-white text-lg"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Recent Orders
                                </h2>
                                <p className="text-xs text-white/30" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Latest transactions
                                </p>
                            </div>
                            <Link
                                to="/admin/orders"
                                className="text-sm text-white/40 hover:text-white transition flex items-center gap-1"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/20">
                                <tr className="border-b border-white/10">
                                    <th
                                        className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Order ID
                                    </th>
                                    <th
                                        className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Customer
                                    </th>
                                    <th
                                        className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Amount
                                    </th>
                                    <th
                                        className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Status
                                    </th>
                                    <th
                                        className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition">
                                        <td
                                            className="px-5 py-3 text-sm font-medium text-white"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            #{order.id}
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm text-white/50"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {order.user_name || 'Guest'}
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm font-semibold text-white"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            ₹{order.total_price?.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs bg-white/10 text-white/70`}
                                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm text-white/40"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* Top Products & Quick Actions - Darker */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GlassCard className="lg:col-span-1">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2
                                        className="font-semibold text-white text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Top Products
                                    </h2>
                                    <p
                                        className="text-xs text-white/30"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Best selling items
                                    </p>
                                </div>
                                <Award size={18} className="text-white/40" />
                            </div>
                            <div className="space-y-3">
                                {topProducts.map((product, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                idx === 0
                                                    ? 'bg-yellow-500/30 text-yellow-200'
                                                    : idx === 1
                                                      ? 'bg-gray-500/30 text-gray-200'
                                                      : idx === 2
                                                        ? 'bg-orange-500/30 text-orange-200'
                                                        : 'bg-white/10 text-white/60'
                                            }`}
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className="font-medium text-white text-sm"
                                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {product.name || 'Product'}
                                            </p>
                                            <p
                                                className="text-xs text-white/30"
                                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                                {product.sales} sold
                                            </p>
                                        </div>
                                        <p
                                            className="font-semibold text-white text-sm"
                                            style={{ fontFamily: "'Playfair Display', serif" }}>
                                            ₹{Math.round(product.revenue).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/admin/products"
                                className="mt-4 block text-center text-sm text-white/40 hover:text-white transition"
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                Manage Products →
                            </Link>
                        </div>
                    </GlassCard>

                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                to="/admin/add-product"
                                className="bg-gradient-to-br from-indigo-600/40 to-purple-600/40 backdrop-blur-sm rounded-xl p-5 text-white hover:shadow-2xl transition-all duration-300 flex items-center justify-between group border border-white/10">
                                <div>
                                    <Package size={24} className="mb-2 text-indigo-300" />
                                    <h3
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Add Product
                                    </h3>
                                    <p
                                        className="text-xs text-white/50"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Add new items to catalog
                                    </p>
                                </div>
                                <ArrowRight
                                    size={20}
                                    className="opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1"
                                />
                            </Link>
                            <Link
                                to="/admin/users"
                                className="bg-gradient-to-br from-emerald-600/40 to-teal-600/40 backdrop-blur-sm rounded-xl p-5 text-white hover:shadow-2xl transition-all duration-300 flex items-center justify-between group border border-white/10">
                                <div>
                                    <Users size={24} className="mb-2 text-emerald-300" />
                                    <h3
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Manage Users
                                    </h3>
                                    <p
                                        className="text-xs text-white/50"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        View and manage customers
                                    </p>
                                </div>
                                <ArrowRight
                                    size={20}
                                    className="opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1"
                                />
                            </Link>
                            <Link
                                to="/admin/orders"
                                className="col-span-2 bg-gradient-to-br from-rose-600/40 to-pink-600/40 backdrop-blur-sm rounded-xl p-5 text-white hover:shadow-2xl transition-all duration-300 flex items-center justify-between group border border-white/10">
                                <div>
                                    <ShoppingBag size={24} className="mb-2 text-rose-300" />
                                    <h3
                                        className="font-semibold text-lg"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        View All Orders
                                    </h3>
                                    <p
                                        className="text-xs text-white/50"
                                        style={{ fontFamily: "'Playfair Display', serif" }}>
                                        Track and manage all orders
                                    </p>
                                </div>
                                <ArrowRight
                                    size={20}
                                    className="opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;
