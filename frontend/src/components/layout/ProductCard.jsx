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

    // ✅ ONLY ID FIX (SAFE)
    const getId = (p) => p?.id;

    const id = getId(product);

    const handleWishlist = (e) => {
        e.stopPropagation();

        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to add items to wishlist');
            navigate('/login');
            return;
        }

        // ✅ FIX: pass FULL product, NOT id
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
        setAddingToCart(false);
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
    const originalPrice =
        product.originalPrice ||
        Math.floor(product.price * (1 + discount / 100));

    const rating = product.rating || 4.5;
    const reviews = product.reviews || 128;

    return (
        <div
            onClick={() => navigate(`/product/${id}`)}
            className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                    src={
                        product.image?.startsWith('http')
                            ? product.image
                            : `http://127.0.0.1:8000${product.image}`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                </div>

                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md hover:scale-110 transition"
                >
                    <Heart
                        size={16}
                        className={
                            isWishlisted
                                ? 'fill-black text-black'
                                : 'text-gray-600'
                        }
                    />
                </button>
            </div>

            <div className="p-4">
                <p className="text-xs text-gray-400 uppercase mb-1">
                    {product.brand || 'PREMIUM'}
                </p>

                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={12}
                            className={
                                star <= rating
                                    ? 'text-gray-800 fill-gray-800'
                                    : 'text-gray-300 fill-gray-300'
                            }
                        />
                    ))}
                    <span className="text-xs text-gray-400">
                        {reviews} reviews
                    </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold">
                        ₹{product.price?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                        ₹{originalPrice?.toLocaleString()}
                    </span>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-black text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 mb-2"
                >
                    {addingToCart ? 'Adding...' : (
                        <>
                            <ShoppingBag size={14} />
                            Add to Cart
                        </>
                    )}
                </button>

                <button
                    onClick={handleBuyNow}
                    className="w-full bg-gray-100 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                    <Zap size={14} />
                    Buy Now
                </button>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t">
                    <Truck size={12} />
                    <Shield size={12} />
                </div>
            </div>
        </div>
    );
}