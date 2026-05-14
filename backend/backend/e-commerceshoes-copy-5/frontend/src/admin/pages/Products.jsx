// admin/pages/Products.jsx - CATEGORY FUNCTION REMOVED
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { Edit, Trash2, Package, Plus, ChevronLeft, ChevronRight, Search, TrendingUp, DollarSign, Tags } from 'lucide-react';
import { showSuccess, showError } from '../../utils/toast';
import toast from 'react-hot-toast';
const GlassCard = ({ children }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

const OverviewCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-white/50">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                {trend && (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> +{trendValue} from last month
                    </p>
                )}
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                <Icon size={22} className="text-white/60" />
            </div>
        </div>
    </div>
);

function ProductsAdmin() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Stats for overview cards
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        averagePrice: 0,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) => product.name?.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredProducts(filtered);
        }
        setCurrentPage(1);
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('products/');
            const productsData = response.data.results || response.data || [];

            setProducts(productsData);
            setFilteredProducts(productsData);

            // Calculate stats
            const totalProducts = productsData.length;
            const totalStock = productsData.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
            const averagePrice =
                totalProducts > 0
                    ? productsData.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / totalProducts
                    : 0;

            setStats({
                totalProducts,
                totalStock,
                averagePrice,
            });
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 401) navigate('/admin/login');
            else alert('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, productName) => {
        if (!window.confirm(`Delete "${productName}"?`)) return;
        setDeletingId(id);
        try {
            await axiosInstance.delete(`products/delete/${id}/`);
            // ✅ Success toast
            showSuccess(`${productName} deleted successfully`);
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            // ✅ Error toast with specific message
            if (error.response?.status === 400 || error.response?.data?.message?.includes('pending')) {
                showError(
                    `Cannot delete "${productName}". It has pending orders. Please cancel or complete the orders first.`,
                );
            } else {
                showError(
                    `Failed to delete "${productName}". ${error.response?.data?.message || 'It has pending orders. Please cancel or complete the orders first'}`,
                );
            }
        } finally {
            setDeletingId(null);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
    };

    const formatPrice = (price) => {
        if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
        return `₹${Math.round(price)}`;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
        <AdminLayout>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                <OverviewCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    trend={true}
                    trendValue="12"
                />
                <OverviewCard title="Total Stock" value={stats.totalStock.toLocaleString()} icon={Tags} />
                <OverviewCard title="Average Price" value={formatPrice(stats.averagePrice)} icon={DollarSign} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1
                        className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Products
                    </h1>
                    <p className="text-white/40 text-sm">Manage your product catalog • Total: {products.length}</p>
                </div>
                <Link
                    to="/admin/add-product"
                    className="bg-transparent text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2 shadow-lg">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30"
                    />
                </div>
            </div>

            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {currentProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4">
                                        {getImageUrl(product.image) ? (
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded-lg border border-white/10"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                                <Package size={24} className="text-white/30" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{product.name}</td>
                                    <td className="px-6 py-4 font-semibold text-white">
                                        ₹{product.price?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                                product.stock > 50
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : product.stock > 0
                                                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    product.stock > 50
                                                        ? 'bg-green-400'
                                                        : product.stock > 0
                                                          ? 'bg-yellow-400'
                                                          : 'bg-red-400'
                                                }`}></span>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/edit-product/${product.id}`}
                                                className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id, product.name)}
                                                disabled={deletingId === product.id}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50">
                                                {deletingId === product.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <p className="text-sm text-white/40">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of{' '}
                            {filteredProducts.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i + 1)}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        currentPage === i + 1
                                            ? 'bg-transparent text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}>
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </AdminLayout>
    );
}

export default ProductsAdmin;
