// pages/Wishlist.jsx - COMPLETE WORKING VERSION
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Heart, Trash2, Star, ArrowRight, Sparkles, ShoppingCart, Loader2, Zap } from 'lucide-react';
import { showSuccess, showWarning, showError } from '../utils/toast';

function Wishlist() {
    const navigate = useNavigate();
    const { wishlist, loading, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const [addingToCart, setAddingToCart] = useState({});
    const [removingItem, setRemovingItem] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to view your wishlist');
            navigate('/login');
        }
    }, [navigate]);

    // Add to cart and remove from wishlist
    const handleAddToCart = async (product) => {
        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to add items to cart');
            navigate('/login');
            return;
        }

        if (!product.id) {
            showError('Invalid product');
            return;
        }

        setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

        try {
            // Add to cart
            await addToCart(product.id, 1, {
                product_name: product.name,
                product_price: product.price,
                product_image: product.image,
                brand: product.brand,
            });

            // Remove from wishlist after successful add to cart
            removeFromWishlist(product.id);
            showSuccess(`${product.name} moved to cart!`);
        } catch (error) {
            console.error('Add to cart error:', error);
            showError('Failed to add to cart');
        } finally {
            setTimeout(() => {
                setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
            }, 500);
        }
    };

    const handleRemove = (product) => {
        setRemovingItem(product.id);
        setTimeout(() => {
            removeFromWishlist(product.id);
            setRemovingItem(null);
        }, 300);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/')) return `http://127.0.0.1:8000${imagePath}`;
        return `http://127.0.0.1:8000/media/${imagePath}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-16 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return <EmptyWishlist />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4 border border-gray-100">
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Saved Items</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">My Wishlist</h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} waiting for you
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((product) => {
                        const imageUrl = getImageUrl(product.image);
                        const discount = product.discount || 25;
                        const originalPrice = product.originalPrice || Math.floor(product.price * (1 + discount / 100));
                        const rating = product.rating || 4.5;
                        const reviews = product.reviews || 128;

                        return (
                            <div
                                key={product.id}
                                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                                    removingItem === product.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}
                                style={{ transition: 'all 0.3s ease' }}>
                                {/* Image Container */}
                                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                        }}
                                    />

                                    {/* Discount Badge */}
                                    <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                                        -{discount}%
                                    </div>

                                    {/* Rating Badge */}
                                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                                        <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                        <span className="text-[9px] font-medium text-gray-700">{rating}</span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(product)}
                                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition z-10 group/remove">
                                        <Trash2 size={14} className="text-gray-500 hover:text-red-500 transition" />
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    {/* Brand */}
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                        {product.brand || 'PREMIUM'}
                                    </p>

                                    {/* Name */}
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                                        {product.name}
                                    </h3>

                                    {/* Stars */}
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={9}
                                                    className={
                                                        star <= Math.floor(rating)
                                                            ? 'text-gray-800 fill-gray-800'
                                                            : 'text-gray-200 fill-gray-200'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[9px] text-gray-400">({reviews})</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{product.price?.toLocaleString()}
                                        </span>
                                        {originalPrice && originalPrice > product.price && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                                ₹{originalPrice?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={addingToCart[product.id]}
                                        className="w-full bg-black text-white py-2 rounded-xl text-xs font-medium hover:bg-gray-800 transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                                        {addingToCart[product.id] ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag size={12} />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Continue Shopping Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all group">
                        Continue Shopping
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Empty Wishlist Component
const EmptyWishlist = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-16 px-4 md:px-8 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                        <Heart size={48} className="text-gray-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                        0
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black mb-3">Your Wishlist is Empty</h1>
                <p className="text-gray-400 mb-6">
                    Save your favorite items here and shop them later.
                    <br />
                    Start exploring our collection!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition group">
                        <Sparkles size={16} />
                        Start Shopping
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <ShoppingCart size={12} /> Free Shipping
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart size={12} /> Easy Returns
                    </span>
                    <span className="flex items-center gap-1">
                        <Zap size={12} /> Fast Delivery
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
