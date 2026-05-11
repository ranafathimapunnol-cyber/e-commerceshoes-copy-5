// admin/pages/EditProduct.jsx - ALL TEXT WHITE
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import AdminLayout from '../components/AdminLayout';
import { showSuccess, showError } from '../../utils/toast';
import { ArrowLeft, Package, Edit3, Layers, DollarSign, Tag, TrendingUp } from 'lucide-react';

const GlassCard = ({ children }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

const OverviewCard = ({ title, value, icon: Icon }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-white/50">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
                <Icon size={22} className="text-white/60" />
            </div>
        </div>
    </div>
);

function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [categories, setCategories] = useState([
        { id: 1, name: 'New' },
        { id: 2, name: 'Men' },
        { id: 3, name: 'Women' },
        { id: 4, name: 'Kids' },
    ]);
    const [productCount, setProductCount] = useState(0);
    const [averagePrice, setAveragePrice] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        size: '',
        color: '',
        gender: 'UNISEX',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProductData();
        fetchProduct();
    }, [id]);

    const fetchProductData = async () => {
        try {
            const response = await axiosInstance.get('products/');
            const products = response.data.results || response.data || [];
            setProductCount(products.length);

            if (products.length > 0) {
                const total = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
                const avg = total / products.length;
                setAveragePrice(avg);
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axiosInstance.get(`products/${id}/`);
            const product = response.data;

            // Map category name to category id for the dropdown
            let categoryId = '';
            if (product.category_name) {
                const foundCategory = categories.find((cat) => cat.name === product.category_name);
                if (foundCategory) {
                    categoryId = foundCategory.id;
                }
            } else if (product.category?.name) {
                const foundCategory = categories.find((cat) => cat.name === product.category.name);
                if (foundCategory) {
                    categoryId = foundCategory.id;
                }
            }

            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                stock: product.stock || '',
                category: categoryId,
                brand: product.brand || '',
                size: product.size || '',
                color: product.color || '',
                gender: product.gender || 'UNISEX',
            });

            if (product.image) {
                const imageUrl = product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`;
                setCurrentImage(imageUrl);
                setImagePreview(imageUrl);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showError('Failed to load product');
            navigate('/admin/products');
        } finally {
            setFetching(false);
        }
    };

    const formatPrice = (price) => {
        if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
        if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
        return `₹${Math.round(price)}`;
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
            submitData.append('stock', parseInt(formData.stock));

            const selectedCategory = categories.find((cat) => cat.id == formData.category);
            if (selectedCategory) {
                submitData.append('category_name', selectedCategory.name);
            }

            if (formData.brand) submitData.append('brand', formData.brand);
            if (formData.size) submitData.append('size', formData.size);
            if (formData.color) submitData.append('color', formData.color);
            if (formData.gender) submitData.append('gender', formData.gender);
            if (image) submitData.append('image', image);

            await axiosInstance.put(`products/update/${id}/`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            showSuccess('Product updated successfully!');
            setTimeout(() => {
                navigate('/admin/products');
            }, 1500);
        } catch (error) {
            console.error('Error updating product:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update product';
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <OverviewCard title="Total Products" value={productCount} icon={Package} />
                <OverviewCard title="Total Categories" value={categories.length} icon={Layers} />
                <OverviewCard title="Average Price" value={formatPrice(averagePrice)} icon={DollarSign} />
                <OverviewCard title="Editing Product" value={`#${id}`} icon={Edit3} />
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
                                <Edit3 size={24} className="text-white/60" />
                            </div>
                            <div>
                                <h1
                                    className="text-2xl font-bold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Edit Product
                                </h1>
                                <p className="text-sm text-white/40 mt-0.5">Update product information</p>
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

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30"
                                    placeholder="Enter brand name"
                                />
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

                            {/* Size & Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Size</label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30"
                                        placeholder="e.g., S, M, L, XL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Color</label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-white/30"
                                        placeholder="e.g., Black, White, Red"
                                    />
                                </div>
                            </div>

                            {/* Gender & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white">
                                        <option value="UNISEX" className="bg-gray-800">
                                            UNISEX
                                        </option>
                                        <option value="MEN" className="bg-gray-800">
                                            MEN
                                        </option>
                                        <option value="WOMEN" className="bg-gray-800">
                                            WOMEN
                                        </option>
                                        <option value="KIDS" className="bg-gray-800">
                                            KIDS
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white">
                                        <option value="" className="bg-gray-800">
                                            Select Category
                                        </option>
                                        <option value="1" className="bg-gray-800">
                                            New
                                        </option>
                                        <option value="2" className="bg-gray-800">
                                            Men
                                        </option>
                                        <option value="3" className="bg-gray-800">
                                            Women
                                        </option>
                                        <option value="4" className="bg-gray-800">
                                            Kids
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-1">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-white/20 file:text-white hover:file:bg-white/30"
                                />
                                {imagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-xl border border-white/20"
                                        />
                                        {currentImage && !image && (
                                            <p className="text-xs text-white/40 mt-1">
                                                Current image (will be replaced if you upload new)
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gray-400 border-2  text-black py-2.5 rounded-xl font-medium hover:bg-gray-500 transition disabled:opacity-50">
                                    {loading ? 'Updating Product...' : 'Update Product'}
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

export default EditProduct;
