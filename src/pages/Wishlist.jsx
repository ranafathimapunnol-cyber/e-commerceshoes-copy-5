import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Heart, Trash2, Star, ArrowRight, Sparkles, ShoppingCart } from 'lucide-react';

function Wishlist() {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const [addingToCart, setAddingToCart] = useState({});
    const [removingItem, setRemovingItem] = useState(null);

    const items = Array.isArray(wishlist) ? wishlist.filter((p) => p && p.id) : [];

    // ✅ FIXED: Add to cart + remove from wishlist instantly
    const handleAddToCart = (product) => {
        setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

        addToCart(product.id, 1, {
            product_name: product.name,
            product_price: product.price,
            product_image: product.image,
            brand: product.brand,
            original_price: product.originalPrice,
        });

        // 🔥 Remove from wishlist immediately
        setRemovingItem(product.id);

        setTimeout(() => {
            toggleWishlist(product); // remove from wishlist
            setRemovingItem(null);
            setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
        }, 300);
    };

    const handleRemove = (product) => {
        setRemovingItem(product.id);
        setTimeout(() => {
            toggleWishlist(product);
            setRemovingItem(null);
        }, 300);
    };

    if (items.length === 0) {
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
                        {items.length} {items.length === 1 ? 'item' : 'items'} waiting for you
                    </p>
                </div>

                {/* Products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product) => {
                        const imageUrl = product.image?.startsWith('http')
                            ? product.image
                            : `http://127.0.0.1:8000${product.image}`;

                        const discount = product.discount || 25;
                        const originalPrice = product.originalPrice || Math.floor(product.price * (1 + discount / 100));

                        const rating = product.rating || 4.5;
                        const reviews = product.reviews || 128;

                        return (
                            <div
                                key={product.id}
                                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                                    removingItem === product.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}>
                                {/* Image */}
                                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                    />

                                    {/* Discount */}
                                    <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        -{discount}%
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => handleRemove(product)}
                                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition">
                                        <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p className="text-[10px] text-gray-400 uppercase mb-1">{product.brand || 'PREMIUM'}</p>

                                    <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                                        {product.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={9}
                                                className={
                                                    star <= Math.floor(rating)
                                                        ? 'text-gray-800 fill-gray-800'
                                                        : 'text-gray-200'
                                                }
                                            />
                                        ))}
                                        <span className="text-[9px] text-gray-400">({reviews})</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{product.price?.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 line-through">
                                            ₹{originalPrice?.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* ✅ ONLY ADD TO CART BUTTON */}
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={addingToCart[product.id]}
                                        className="w-full bg-black text-white py-2 rounded-xl text-xs font-medium hover:bg-gray-800 transition flex items-center justify-center gap-1.5">
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

                {/* Continue Shopping */}
                <div className="text-center mt-12">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all">
                        Continue Shopping
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
const EmptyWishlist = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-16 px-4 flex items-center justify-center">
            <div className="text-center max-w-md w-full">
                {/* Animated Heart */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center relative">
                        <span className="text-5xl animate-pulse">🩶</span>

                        {/* Glow Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-ping opacity-40"></div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                        0 items
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-3">Your Wishlist is Empty</h1>

                {/* Subtitle */}
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Looks like you haven’t saved anything yet. Start exploring and add your favorite products here ❤️
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/products"
                        className="group inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all">
                        Explore Products
                        <span className="group-hover:translate-x-1 transition">→</span>
                    </Link>

                    <Link
                        to="/cart"
                        className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition">
                        Go to Cart
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-10 flex justify-center gap-6 text-xs text-gray-400">
                    <span className="flex items-center gap-1">🚚 Free Shipping</span>
                    <span className="flex items-center gap-1">🔁 Easy Returns</span>
                    <span className="flex items-center gap-1">⚡ Fast Delivery</span>
                </div>
            </div>
        </div>
    );
};
export default Wishlist;
