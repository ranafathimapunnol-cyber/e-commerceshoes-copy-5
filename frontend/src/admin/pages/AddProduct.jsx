// admin/pages/AddProduct.jsx - FIXED VISIBILITY (WHITE TEXT ON DARK BACKGROUND)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../../utils/toast';
import { ArrowLeft, Package, Layers, DollarSign, Tag, TrendingUp, PlusCircle } from 'lucide-react';

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

function AddProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productCount, setProductCount] = useState(0);
    const [categories, setCategories] = useState([
        { id: 1, name: 'New' },
        { id: 2, name: 'Men' },
        { id: 3, name: 'Women' },
        { id: 4, name: 'Kids' },
    ]);
    const [averagePrice, setAveragePrice] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProductData();
        // No need to fetch categories - using hardcoded ones
    }, []);

    const fetchProductData = async () => {
        try {
            const response = await axiosInstance.get('products/');
            const products = response.data.results || response.data || [];
            setProductCount(products.length);

            if (products.length > 0) {
                const total = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                const avg = total / products.length;
                setAveragePrice(avg);

                const totalStockCount = products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
                setTotalStock(totalStockCount);
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    };

    const formatPrice = (price) => {
        if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
        return `₹${Math.round(price)}`;
    };

    const formatStockValue = () => {
        const stockValue = averagePrice * totalStock;
        if (stockValue >= 100000) return `₹${(stockValue / 100000).toFixed(1)}L`;
        if (stockValue >= 1000) return `₹${(stockValue / 1000).toFixed(1)}K`;
        return `₹${Math.round(stockValue)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock is required';
        if (!image) newErrors.image = 'Product image is required';
        if (!formData.category) newErrors.category = 'Category is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showError('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('price', parseFloat(formData.price));
            submitData.append('stock', parseInt(formData.stock, 10));
            submitData.append('category_name', formData.category);
            if (image) submitData.append('image', image);
            await axiosInstance.post('products/add/', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            showSuccess('Product added successfully!');
            setTimeout(() => navigate('/admin/products'), 1500);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to add product';
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            {/* Overview Cards - All 4 cards kept */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <OverviewCard title="Total Products" value={productCount} icon={Package} trend={true} trendValue="12" />
                <OverviewCard title="Total Categories" value={categories.length} icon={Layers} />
                <OverviewCard title="Average Price" value={formatPrice(averagePrice)} icon={DollarSign} />
                <OverviewCard title="Stock Value" value={formatStockValue()} icon={Tag} />
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="text-white/60 hover:text-white transition flex items-center gap-2">
                        <ArrowLeft size={18} /> Back to Products
                    </button>
                </div>

                <GlassCard>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="p-2 rounded-xl bg-white/10">
                                <PlusCircle size={24} className="text-white/60" />
                            </div>
                            <div>
                                <h1
                                    className="text-2xl font-bold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Add New Product
                                </h1>
                                <p className="text-sm text-white/40 mt-0.5">Create a new product in your catalog</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30 ${
                                        errors.name ? 'border-red-500' : 'border-white/20'
                                    }`}
                                    placeholder="Enter product name"
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30 ${
                                        errors.description ? 'border-red-500' : 'border-white/20'
                                    }`}
                                    placeholder="Enter product description"
                                />
                                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                            </div>

                            {/* Price & Stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30 ${
                                            errors.price ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30 ${
                                            errors.stock ? 'border-red-500' : 'border-white/20'
                                        }`}
                                        placeholder="0"
                                    />
                                    {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                                </div>
                            </div>

                            {/* Category Dropdown - Only 4 categories: New, Men, Women, Kids */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white ${
                                        errors.category ? 'border-red-500' : 'border-white/20'
                                    }`}>
                                    <option value="" className="bg-gray-800">
                                        Select Category
                                    </option>
                                    <option value="New" className="bg-gray-800">
                                        New
                                    </option>
                                    <option value="Men" className="bg-gray-800">
                                        Men
                                    </option>
                                    <option value="Women" className="bg-gray-800">
                                        Women
                                    </option>
                                    <option value="Kids" className="bg-gray-800">
                                        Kids
                                    </option>
                                </select>
                                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Product Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={`w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-white/20 file:text-white hover:file:bg-white/30 ${
                                        errors.image ? 'border-red-500' : 'border-white/20'
                                    }`}
                                />
                                {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                                {imagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-xl border border-white/20"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gray-400 border-2  text-black py-2.5 rounded-xl font-medium hover:bg-gray-500 transition disabled:opacity-50">
                                    {loading ? 'Adding Product...' : 'Add Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    className="px-6 py-2.5 bg-white/10 backdrop-blur-xl text-white/70 rounded-xl font-medium hover:bg-white/20 transition border border-white/20">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </GlassCard>
            </div>
        </AdminLayout>
    );
}

export default AddProduct;
