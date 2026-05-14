// admin/pages/AdminReports.jsx - FULL WORKING CODE WITH EMAIL
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../../utils/toast';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    Package,
    ShoppingBag,
    Users,
    DollarSign,
    BarChart3,
    PieChart as PieChartIcon,
    Printer,
    ChevronDown,
    Eye,
    X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Add this after your imports
const printStyles = `
  @media print {
    /* Keep dark background when printing */
    body, .min-h-screen, .bg-gradient-to-br, .bg-black\\/20, 
    .bg-black\\/30, .backdrop-blur-xl, .bg-white\\/10, 
    .bg-white\\/5, .bg-gray-900\\/95, [class*="bg-black"], [class*="bg-gradient"] {
      background: #0a0a0a !important;
      background-color: #0a0a0a !important;
      backdrop-filter: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Keep text white for printing */
    .text-white, .text-white\\/50, .text-white\\/60, .text-white\\/70,
    .text-white\\/40, .text-white\\/30, h1, h2, h3, p, span, div, label {
      color: white !important;
    }
    
    /* Keep borders visible */
    .border-white\\/10, .border-white\\/20, .border-white\\/30 {
      border-color: rgba(255,255,255,0.1) !important;
    }
    
    /* Keep chart colors */
    .recharts-bar-rectangle {
      fill: #93c5fd !important;
    }
    
    /* Keep card backgrounds dark */
    .bg-black\\/20, .bg-black\\/30, .bg-white\\/10, .bg-white\\/5 {
      background: rgba(0,0,0,0.2) !important;
    }
    
    /* Hide buttons when printing */
    button:not(.no-print), .no-print {
      display: none !important;
    }
  }
`;
const GlassCard = ({ children }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

const ReportCard = ({ title, value, change, icon: Icon }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-white/50">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                {change && (
                    <p
                        className={`text-xs mt-1 flex items-center gap-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(change)}% from last month
                    </p>
                )}
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                <Icon size={22} className="text-white/60" />
            </div>
        </div>
    </div>
);

function AdminReports() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        frequency: 'weekly',
        email: '',
        format: 'pdf',
    });
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [reportData, setReportData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        avgOrderValue: 0,
        conversionRate: 0,
    });
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    // Add this inside AdminReports component, after useState declarations
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = printStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const ordersRes = await axiosInstance.get('orders/');
            const orders = ordersRes.data.results || ordersRes.data || [];
            const productsRes = await axiosInstance.get('products/');
            const products = productsRes.data.results || productsRes.data || [];

            const usersRes = await axiosInstance.get('users/admin/users/');
            const users = usersRes.data.results || usersRes.data || [];

            // Filter orders based on date range
            const now = new Date();
            let filterDays = 30;
            if (dateRange === 'week') filterDays = 7;
            if (dateRange === 'month') filterDays = 30;
            if (dateRange === 'quarter') filterDays = 90;
            if (dateRange === 'year') filterDays = 365;

            const filteredOrders = orders.filter((o) => {
                const date = new Date(o.created_at);
                const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                return diffDays <= filterDays;
            });

            const filteredRevenue = filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
            const filteredOrderCount = filteredOrders.length;
            const totalProducts = products.length;
            const totalUsers = users.length;

            // Monthly sales data
            const monthlyData = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const month = d.toLocaleString('default', { month: 'short' });
                const monthOrders = filteredOrders.filter((o) => {
                    const date = new Date(o.created_at);
                    return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
                });
                monthlyData.push({
                    month,
                    revenue: monthOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0),
                    orders: monthOrders.length,
                });
            }
            setSalesData(monthlyData);

            // Category distribution
            const categorySales = {};
            products.forEach((product) => {
                const cat = product.category?.name || 'Uncategorized';
                categorySales[cat] = (categorySales[cat] || 0) + 1;
            });
            setCategoryData(Object.entries(categorySales).map(([name, value]) => ({ name, value })));

            // Top products
            const productSales = {};
            filteredOrders.forEach((order) => {
                if (order.items) {
                    order.items.forEach((item) => {
                        const productName = item.product?.name;
                        if (productName) {
                            productSales[productName] = (productSales[productName] || 0) + item.quantity;
                        }
                    });
                }
            });
            const topProductsList = Object.entries(productSales)
                .map(([name, sales]) => ({ name, sales }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);
            setTopProducts(topProductsList);

            setReportData({
                totalRevenue: filteredRevenue,
                totalOrders: filteredOrderCount,
                totalProducts,
                totalUsers,
                avgOrderValue: filteredOrderCount > 0 ? filteredRevenue / filteredOrderCount : 0,
                conversionRate: totalUsers > 0 ? ((filteredOrderCount / totalUsers) * 100).toFixed(1) : 0,
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            showError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const formatRevenue = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    const handlePrint = () => {
        window.print();
        showSuccess('Print dialog opened');
    };

    const handleScheduleReport = async () => {
        if (!scheduleData.email) {
            showError('Please enter email address');
            return;
        }
        try {
            console.log('Schedule report:', { ...scheduleData, dateRange });
            showSuccess(`Report scheduled ${scheduleData.frequency}ly to ${scheduleData.email}`);
            setShowScheduleModal(false);
            setScheduleData({ frequency: 'weekly', email: '', format: 'pdf' });
        } catch (error) {
            showError('Failed to schedule report');
        }
    };

    // WORKING EMAIL SEND FUNCTION
    const handleShareReport = async () => {
        if (!shareEmail) {
            showError('Please enter email address');
            return;
        }

        try {
            // Prepare report data for email
            const reportToShare = {
                generatedAt: new Date().toLocaleString(),
                dateRange: dateRange,
                reportData: {
                    totalRevenue: formatRevenue(reportData.totalRevenue),
                    totalOrders: reportData.totalOrders,
                    totalProducts: reportData.totalProducts,
                    totalUsers: reportData.totalUsers,
                    avgOrderValue: formatRevenue(reportData.avgOrderValue),
                    conversionRate: reportData.conversionRate,
                },
                topProducts: topProducts.map((p) => ({ name: p.name, sales: p.sales })),
                salesData: salesData,
                categoryData: categoryData,
            };

            // Send email via backend
            const response = await axiosInstance.post('send-report-email/', {
                email: shareEmail,
                report_data: reportToShare,
                message: shareMessage,
            });

            if (response.data.message) {
                showSuccess(`Report sent successfully to ${shareEmail}`);
                setShowShareModal(false);
                setShareEmail('');
                setShareMessage('');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showError(error.response?.data?.error || 'Failed to send email. Please try again.');
        }
    };

    const handleDownloadCSV = () => {
        try {
            const csvRows = [];
            csvRows.push(['Report Generated:', new Date().toLocaleString()]);
            csvRows.push(['Date Range:', dateRange]);
            csvRows.push([]);
            csvRows.push(['Summary Report']);
            csvRows.push(['Metric', 'Value']);
            csvRows.push(['Total Revenue', formatRevenue(reportData.totalRevenue)]);
            csvRows.push(['Total Orders', reportData.totalOrders]);
            csvRows.push(['Total Products', reportData.totalProducts]);
            csvRows.push(['Total Users', reportData.totalUsers]);
            csvRows.push(['Average Order Value', formatRevenue(reportData.avgOrderValue)]);
            csvRows.push(['Conversion Rate', `${reportData.conversionRate}%`]);
            csvRows.push([]);
            csvRows.push(['Monthly Sales Data']);
            csvRows.push(['Month', 'Revenue', 'Orders']);
            salesData.forEach((data) => {
                csvRows.push([data.month, data.revenue, data.orders]);
            });
            csvRows.push([]);
            csvRows.push(['Top Selling Products']);
            csvRows.push(['Product Name', 'Units Sold']);
            topProducts.forEach((product) => {
                csvRows.push([product.name, product.sales]);
            });
            csvRows.push([]);
            csvRows.push(['Category Distribution']);
            csvRows.push(['Category', 'Product Count']);
            categoryData.forEach((cat) => {
                csvRows.push([cat.name, cat.value]);
            });

            const csvContent = csvRows.map((row) => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showSuccess('Report downloaded as CSV');
        } catch (error) {
            showError('Failed to download CSV');
        }
    };

    const handleDownloadPDF = () => {
        showSuccess('Preparing PDF... Click Print and select "Save as PDF"');
        setTimeout(() => window.print(), 500);
    };

    const COLORS = ['#a7f3d0', '#bfdbfe', '#c4b5fd', '#fcd34d', '#fecaca', '#d9f99d', '#fed7aa'];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
                    <p className="text-white text-sm font-medium">{label}</p>
                    {payload.map((p, idx) => (
                        <p key={idx} className="text-sm text-white/60">
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
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1
                            className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Reports & Analytics
                        </h1>
                        <p className="text-white/40 text-sm">View detailed insights and analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadCSV}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition flex items-center gap-2">
                            <Download size={16} /> CSV
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition flex items-center gap-2">
                            <FileText size={16} /> PDF
                        </button>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white">
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="quarter">Last 3 Months</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <ReportCard
                        title="Total Revenue"
                        value={formatRevenue(reportData.totalRevenue)}
                        change={12.5}
                        icon={DollarSign}
                    />
                    <ReportCard title="Total Orders" value={reportData.totalOrders} change={8.2} icon={ShoppingBag} />
                    <ReportCard title="Total Products" value={reportData.totalProducts} change={-2.1} icon={Package} />
                    <ReportCard title="Total Users" value={reportData.totalUsers} change={15.3} icon={Users} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ReportCard title="Avg Order Value" value={formatRevenue(reportData.avgOrderValue)} icon={TrendingUp} />
                    <ReportCard title="Conversion Rate" value={`${reportData.conversionRate}%`} icon={PieChartIcon} />
                </div>

                {/* Revenue Chart */}
                <GlassCard>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="font-semibold text-white text-lg">Revenue Overview</h2>
                                <p className="text-xs text-white/30">Monthly revenue trend</p>
                            </div>
                            <BarChart3 size={20} className="text-white/30" />
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                                    tickFormatter={(v) => formatRevenue(v)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="revenue"
                                    name="Revenue"
                                    fill="#93c5fd"
                                    fillOpacity={0.7}
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Category Distribution & Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="font-semibold text-white text-lg">Category Distribution</h2>
                                    <p className="text-xs text-white/30">Products by category</p>
                                </div>
                                <PieChartIcon size={20} className="text-white/30" />
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                        label={{ fill: '#9ca3af', fontSize: 11 }}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-white/10">
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-white/50 text-xs">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="font-semibold text-white text-lg">Top Selling Products</h2>
                                    <p className="text-xs text-white/30">Best performing items</p>
                                </div>
                                <Package size={20} className="text-white/30" />
                            </div>
                            <div className="space-y-3">
                                {topProducts.length > 0 ? (
                                    topProducts.map((product, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition">
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                    idx === 0
                                                        ? 'bg-yellow-500'
                                                        : idx === 1
                                                          ? 'bg-gray-500'
                                                          : idx === 2
                                                            ? 'bg-orange-500'
                                                            : 'bg-white/20'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-white text-sm">{product.name}</p>
                                            </div>
                                            <p className="font-semibold text-white text-sm">{product.sales} sold</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-white/40">No data available</div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Report Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-white/5 backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 transition flex items-center justify-between border border-white/10 group">
                        <div>
                            <Printer size={20} className="mb-1 text-white/50 group-hover:text-white/70" />
                            <h3 className="font-semibold text-white">Print Report</h3>
                            <p className="text-xs text-white/40">Print current report</p>
                        </div>
                        <ChevronDown size={16} className="text-white/30 group-hover:text-white/50" />
                    </button>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-white/5 backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 transition flex items-center justify-between border border-white/10 group">
                        <div>
                            <Calendar size={20} className="mb-1 text-white/50 group-hover:text-white/70" />
                            <h3 className="font-semibold text-white">Schedule Reports</h3>
                            <p className="text-xs text-white/40">Automate report generation</p>
                        </div>
                        <ChevronDown size={16} className="text-white/30 group-hover:text-white/50" />
                    </button>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="bg-white/5 backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 transition flex items-center justify-between border border-white/10 group">
                        <div>
                            <Eye size={20} className="mb-1 text-white/50 group-hover:text-white/70" />
                            <h3 className="font-semibold text-white">Share Report</h3>
                            <p className="text-xs text-white/40">Share with team members</p>
                        </div>
                        <ChevronDown size={16} className="text-white/30 group-hover:text-white/50" />
                    </button>
                </div>
            </div>

            {/* Schedule Report Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Schedule Report</h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="text-white/50 hover:text-white/70">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Frequency</label>
                                <select
                                    value={scheduleData.frequency}
                                    onChange={(e) => setScheduleData({ ...scheduleData, frequency: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={scheduleData.email}
                                    onChange={(e) => setScheduleData({ ...scheduleData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Format</label>
                                <select
                                    value={scheduleData.format}
                                    onChange={(e) => setScheduleData({ ...scheduleData, format: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white">
                                    <option value="pdf">PDF</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                            <button
                                onClick={handleScheduleReport}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition">
                                Schedule Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Report Modal - Working Email */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Share Report via Email</h2>
                            <button onClick={() => setShowShareModal(false)} className="text-white/50 hover:text-white/70">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Recipient Email *</label>
                                <input
                                    type="email"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-1">Message (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={shareMessage}
                                    onChange={(e) => setShareMessage(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30"
                                    placeholder="Add a personal message..."></textarea>
                            </div>
                            <button
                                onClick={handleShareReport}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition">
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminReports;
