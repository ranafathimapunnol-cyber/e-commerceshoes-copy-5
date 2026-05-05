// ProductPage.jsx - Fixed to fetch actual product data
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCart,
    Heart,
    Star,
    Truck,
    RotateCcw,
    ShieldCheck,
    Minus,
    Plus,
    Check,
    AlertCircle,
    ChevronLeft,
    CreditCard,
    ArrowRight,
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { showSuccess, showError, showWarning } from '../utils/toast';

function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, buyNow } = useContext(CartContext);
    const { wishlist, toggleWishlist } = useContext(WishlistContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [showCartMessage, setShowCartMessage] = useState(false);
    const [error, setError] = useState(null);

    // Fetch product data from API
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                // ✅ Fetch actual product from your backend API
                const token = localStorage.getItem('access');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
                    headers: headers,
                });

                if (!response.ok) {
                    throw new Error('Product not found');
                }

                const data = await response.json();
                console.log('Fetched product:', data);

                // Map the API response to your product format
                setProduct({
                    id: data.id,
                    name: data.name || data.product_name,
                    brand: data.brand || data.category || 'PREMIUM',
                    price: data.price || data.selling_price || data.product_price,
                    originalPrice: data.original_price || data.mrp,
                    description: data.description || data.product_description,
                    images: data.images || (data.image ? [data.image] : ['https://via.placeholder.com/400']),
                    rating: data.rating || 4.5,
                    inStock: data.stock > 0 || data.in_stock === true,
                    stock: data.stock,
                });
            } catch (error) {
                console.error('Error fetching product:', error);
                setError(error.message);
                showError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    // Add to Cart
    const handleAddToCart = async () => {
        if (!product) return;

        setAddingToCart(true);

        const productData = {
            product_name: product.name,
            product_price: product.price,
            product_image: product.images?.[0] || 'https://via.placeholder.com/120',
            brand: product.brand,
            original_price: product.originalPrice || product.price,
        };

        await addToCart(product.id, quantity, productData);

        showSuccess(`${product.name} added to cart!`);
        setShowCartMessage(true);
        setTimeout(() => setShowCartMessage(false), 3000);
        setAddingToCart(false);
    };

    // Buy Now
    const handleBuyNow = async () => {
        if (!product) return;

        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to continue');
            navigate('/login');
            return;
        }

        setBuyingNow(true);

        const productData = {
            product_name: product.name,
            product_price: product.price,
            product_image: product.images?.[0] || 'https://via.placeholder.com/120',
            brand: product.brand,
        };

        // Use buyNow to replace cart with only this product
        buyNow(product.id, quantity, productData);

        showSuccess('Redirecting to checkout...');
        navigate('/checkout');
        setBuyingNow(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading product...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                    <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
                        Browse Products <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    // Helper for image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/')) return `http://127.0.0.1:8000${imagePath}`;
        return `http://127.0.0.1:8000/${imagePath}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 pt-28">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-gray-500 hover:text-black">
                            Home
                        </Link>
                        <ChevronLeft size={14} className="text-gray-400" />
                        <Link to="/products" className="text-gray-500 hover:text-black">
                            Products
                        </Link>
                        <ChevronLeft size={14} className="text-gray-400" />
                        <span className="text-black font-medium">{product.name}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left - Product Images */}
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                            <img
                                src={getImageUrl(product.images?.[selectedImage])}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                                }}
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                                            selectedImage === idx ? 'border-black' : 'border-transparent'
                                        }`}>
                                        <img
                                            src={getImageUrl(img)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-black">{product.name}</h1>
                            <p className="text-gray-500 mt-2">{product.brand}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        className={
                                            i < Math.floor(product.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">{product.rating} / 5</span>
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-black">₹{Number(product.price).toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-lg text-gray-400 line-through">
                                    ₹{Number(product.originalPrice).toLocaleString()}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed">{product.description}</p>

                        {product.inStock ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <Check size={16} />
                                <span className="text-sm">In Stock ({product.stock || 'Available'})</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle size={16} />
                                <span className="text-sm">Out of Stock</span>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <p className="font-medium">Quantity</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-full">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= 10}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-400">Max 10 per order</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!product.inStock || addingToCart}
                                className="flex-1 bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                {addingToCart ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Adding...
                                    </div>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} /> Add to Cart
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={!product.inStock || buyingNow}
                                className="flex-1 bg-gray-100 text-black py-4 rounded-full font-semibold hover:bg-gray-200 transition disabled:opacity-50">
                                {buyingNow ? 'Processing...' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Delivery Info */}
                        <div className="border-t pt-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <Truck size={18} className="text-gray-400" />
                                <span className="text-sm">Free delivery on orders above ₹5000</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <RotateCcw size={18} className="text-gray-400" />
                                <span className="text-sm">30 days return policy</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={18} className="text-gray-400" />
                                <span className="text-sm">1 year warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showCartMessage && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-slide-in">
                    <Check size={18} />
                    Added to cart successfully!
                </div>
            )}
        </div>
    );
}

export default ProductPage;
