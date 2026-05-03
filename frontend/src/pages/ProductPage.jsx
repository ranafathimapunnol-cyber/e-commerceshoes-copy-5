import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingBag, ChevronLeft, Star, Truck, RotateCcw, Shield, AlertCircle, X, Check } from 'lucide-react';

import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';

const SIZE_OPTIONS = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

const COLOR_OPTIONS = [
    { name: 'Slate', hex: '#64748b' },
    { name: 'Tan', hex: '#a07850' },
    { name: 'Forest', hex: '#3d6b4f' },
];

// ================= STAR =================
function StarRating({ rating = 4.3, count = 128 }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={14}
                        className={s <= Math.round(rating) ? 'text-gray-800 fill-gray-800' : 'text-gray-200 fill-gray-200'}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-500">
                {rating} · {count} reviews
            </span>
        </div>
    );
}

// ================= FEATURE PILL =================
function FeaturePill({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
            <Icon size={15} className="text-gray-400" />
            <span>{text}</span>
        </div>
    );
}

// ================= LOADING SKELETON =================
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-white pt-20 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <div className="bg-gray-200 rounded-3xl aspect-square animate-pulse" />
                    <div className="flex gap-2 mt-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 w-14 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ================= ERROR STATE =================
const ErrorState = ({ message, onRetry }) => (
    <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-16 px-6">
        <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">{message || "We couldn't find the product you're looking for."}</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
                    Try Again
                </button>
                <button
                    onClick={() => (window.location.href = '/products')}
                    className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition">
                    Browse Products
                </button>
            </div>
        </div>
    </div>
);

// ================= SUCCESS TOAST =================
const SuccessToast = ({ message, onClose }) => (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg bg-gray-800 text-white">
            <Check size={18} />
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:text-gray-300">
                <X size={14} />
            </button>
        </div>
    </div>
);

// ================= MAIN PAGE =================
function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
    const [activeImg, setActiveImg] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [sizeError, setSizeError] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!id) {
                    setError('Invalid product ID');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);

                if (response.data) {
                    setProduct(response.data);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                if (err.response?.status === 404) {
                    setError('Product not found');
                } else if (err.response?.status === 500) {
                    setError('Server error. Please try again later.');
                } else if (err.code === 'ERR_NETWORK') {
                    setError('Cannot connect to server. Please check if the backend is running.');
                } else {
                    setError('Failed to load product. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const getImage = (img) => {
        if (!img) return '/placeholder.jpg';
        if (img.startsWith('http')) return img;
        return `http://127.0.0.1:8000${img}`;
    };

    // FIXED: Handle Add to Cart - Pass only product ID and quantity
    const handleAddToCart = async () => {
        if (!selectedSize) {
            setSizeError(true);
            setTimeout(() => setSizeError(false), 2000);
            return;
        }

        setAddingToCart(true);

        try {
            // Call addToCart with product ID and quantity only
            await addToCart(product.id, 1);
            setToastMessage(`${product.name} added to cart!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setToastMessage('Failed to add to cart');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    // FIXED: Handle Buy Now
    const handleBuyNow = async () => {
        if (!selectedSize) {
            setSizeError(true);
            setTimeout(() => setSizeError(false), 2000);
            return;
        }

        setAddingToCart(true);

        try {
            await addToCart(product.id, 1);
            navigate('/checkout');
        } catch (error) {
            console.error('Error:', error);
            setToastMessage('Failed to process');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !product) {
        return <ErrorState message={error} onRetry={handleRetry} />;
    }

    const images = product.images?.length ? product.images : [product.image].filter(Boolean);
    const wishlisted = isInWishlist(product.id);

    return (
        <div className="min-h-screen bg-white pt-20 pb-16 px-6 md:px-12">
            {showToast && <SuccessToast message={toastMessage} onClose={() => setShowToast(false)} />}

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-black transition mb-6 group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition" />
                Back
            </button>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                {/* LEFT - IMAGE SECTION */}
                <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square">
                        <img
                            src={getImage(images[activeImg] || product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-md hover:scale-110 transition">
                            <Heart size={18} className={wishlisted ? 'fill-black text-black' : 'text-gray-600'} />
                        </button>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3">
                            {images.slice(0, 4).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                                        activeImg === i ? 'border-black' : 'border-transparent'
                                    }`}>
                                    <img src={getImage(img)} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT - PRODUCT INFO */}
                <div className="space-y-5">
                    {/* Brand */}
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{product.brand || 'PREMIUM'}</p>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>

                    {/* Rating */}
                    <StarRating rating={product.rating || 4.3} count={product.reviews || 128} />

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-black">₹{product.price?.toLocaleString()}</span>
                        {product.originalPrice && (
                            <>
                                <span className="text-lg text-gray-400 line-through">
                                    ₹{product.originalPrice?.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>

                    {/* SIZE SELECTION */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${sizeError ? 'text-red-500' : 'text-gray-700'}`}>
                                Select Size {sizeError && <span className="text-red-500">*</span>}
                            </p>
                            <button className="text-xs text-gray-400 hover:text-black transition">Size Guide</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {SIZE_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        setSelectedSize(s);
                                        setSizeError(false);
                                    }}
                                    className={`w-14 h-12 rounded-xl border-2 transition-all font-medium text-sm ${
                                        selectedSize === s
                                            ? 'bg-black border-black text-white'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        {sizeError && <p className="text-xs text-red-500">Please select a size before adding to cart</p>}
                    </div>

                    {/* COLOR SELECTION */}
                    {COLOR_OPTIONS.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Select Color</p>
                            <div className="flex gap-3">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-10 h-10 rounded-full transition-all ${
                                            selectedColor.name === c.name ? 'ring-2 ring-offset-2 ring-black' : ''
                                        }`}
                                        style={{ backgroundColor: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS - FIXED */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className="flex-1 bg-white border-2 border-black text-black py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {addingToCart ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={18} />
                                    Add to Cart
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleBuyNow}
                            disabled={addingToCart}
                            className="flex-1 bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            Buy Now
                        </button>
                    </div>

                    {/* FEATURES */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                        <FeaturePill icon={Truck} text="Free Delivery" />
                        <FeaturePill icon={RotateCcw} text="Easy Returns" />
                        <FeaturePill icon={Shield} text="Secure Payment" />
                    </div>

                    {/* Stock Info */}
                    <p className="text-xs text-gray-400 text-center">✓ In Stock | Free shipping on orders above ₹5000</p>
                </div>
            </div>
        </div>
    );
}
<button
    onClick={() => {
        const cart = localStorage.getItem('cart');
        const cartData = JSON.parse(cart);
        console.log('Cart items:', cartData?.items);
        alert(
            JSON.stringify(
                cartData?.items?.map((i) => i.product_id || i.id),
                null,
                2,
            ),
        );
    }}
    className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-xs z-50">
    Debug Cart
</button>;

export default ProductDetail;
