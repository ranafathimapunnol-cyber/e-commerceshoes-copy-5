import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Zap, Truck, Shield } from 'lucide-react';
import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const id = product?.id;

    const handleWishlist = (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to add items to wishlist');
            navigate('/login');
            return;
        }
        toggleWishlist(product);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }
        setAddingToCart(true);
        await addToCart(id, 1);
        setTimeout(() => setAddingToCart(false), 500);
    };

    const handleBuyNow = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to purchase');
            navigate('/login');
            return;
        }
        await addToCart(id, 1);
        navigate('/checkout');
    };

    const isWishlisted = isInWishlist(id);
    const discount = product.discount || 25;
    const originalPrice = product.originalPrice || Math.floor(product.price * (1 + discount / 100));
    const rating = product.rating || 4.5;
    const reviews = product.reviews || 128;

    return (
        <div
            onClick={() => navigate(`/product/${id}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                    src={product.image?.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-700"
                    style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                    -{discount}%
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition z-10">
                    <Heart size={16} className={isWishlisted ? 'fill-black text-black' : 'text-gray-600'} />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Brand */}
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.brand || 'PREMIUM'}</p>

                {/* Title */}
                <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={10}
                                className={star <= rating ? 'text-gray-800 fill-gray-800' : 'text-gray-200 fill-gray-200'}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] text-gray-400">({reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 line-through">₹{originalPrice?.toLocaleString()}</span>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {addingToCart ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingBag size={14} />
                            Add to Cart
                        </>
                    )}
                </button>

                {/* Buy Now Button */}
                <button
                    onClick={handleBuyNow}
                    className="w-full mt-2 bg-gray-100 text-gray-800 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2">
                    <Zap size={14} />
                    Buy Now
                </button>

                {/* Delivery Info - No border line */}
                <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                        <Truck size={10} className="text-gray-400" />
                        <span className="text-[8px] text-gray-400">Free Shipping</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1">
                        <Shield size={10} className="text-gray-400" />
                        <span className="text-[8px] text-gray-400">Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
