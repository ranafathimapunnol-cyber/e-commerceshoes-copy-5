import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2, Sparkles, ArrowRight, Star, Truck } from 'lucide-react';

function Wishlist() {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const [addingToCart, setAddingToCart] = useState({});

    const items = Array.isArray(wishlist) ? wishlist.filter((p) => p && p.id) : [];

    const handleAddToCart = async (productId) => {
        setAddingToCart((prev) => ({ ...prev, [productId]: true }));
        await addToCart(productId, 1);
        setTimeout(() => setAddingToCart((prev) => ({ ...prev, [productId]: false })), 500);
    };

    if (items.length === 0) {
        return <EmptyWishlist />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with Stats */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Heart size={14} className="text-red-500" />
                            <span>My Collection</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-black">Wishlist</h1>
                        <p className="text-gray-400 text-sm mt-1">{items.length} saved items</p>
                    </div>
                    <Link
                        to="/products"
                        className="flex items-center gap-2 text-gray-500 hover:text-black transition text-sm">
                        Continue Shopping <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                            <div className="relative">
                                <img
                                    src={product.image ? `http://127.0.0.1:8000${product.image}` : '/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                                />
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition">
                                    <Heart size={16} className="fill-black text-black" />
                                </button>
                                {product.discount > 0 && (
                                    <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                                        {product.brand || 'PREMIUM'}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                        <span className="text-xs text-gray-500">4.5</span>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h3>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-xl font-bold text-gray-900">
                                        ₹{product.price?.toLocaleString()}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        disabled={addingToCart[product.id]}
                                        className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                        {addingToCart[product.id] ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingBag size={14} />
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                        View
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <Truck size={12} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-500">Free Shipping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const EmptyWishlist = () => (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Heart size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Save your favorite items here and shop them later.</p>
            <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
                <Sparkles size={16} />
                Start Shopping
            </Link>
        </div>
    </div>
);

export default Wishlist;
