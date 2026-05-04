import { motion } from 'framer-motion';
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    ShieldCheck,
    Truck,
    Tag,
    Heart,
    X,
    Clock,
    CreditCard,
    Gift,
    AlertCircle,
    CheckCircle,
    MoveRight,
    Sparkles,
    Flame,
    Star,
    RotateCcw,
    MessageCircle,
    Eye,
    Zap,
    Crown,
    Diamond,
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

function Cart() {
    const navigate = useNavigate();
    const { cart, removeItem, updateCart, addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const [removingItems, setRemovingItems] = useState({});
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
    const [savedForLater, setSavedForLater] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState({});

    const items = cart?.items || [];

    // Get cart product IDs
    const cartProductIds = useMemo(() => {
        return items.map((item) => item.product_id || item.id);
    }, [items]);

    // Filtered recommended products (exclude cart items)
    const recommendedProducts = useMemo(() => {
        return allProducts.filter((product) => !cartProductIds.includes(product.id));
    }, [allProducts, cartProductIds]);

    // Mock all products
    useEffect(() => {
        const mockProducts = [
            {
                id: 101,
                name: 'Premium Leather Jacket',
                price: 4999,
                originalPrice: 8999,
                image: '/api/placeholder/400/500',
                rating: 4.9,
                reviews: 1234,
                tag: 'Bestseller',
                discount: 44,
                brand: 'LUXE',
            },
            {
                id: 102,
                name: 'Wireless Headphones',
                price: 2999,
                originalPrice: 5999,
                image: '/api/placeholder/400/500',
                rating: 4.8,
                reviews: 892,
                tag: 'Trending',
                discount: 50,
                brand: 'AUDIO',
            },
            {
                id: 103,
                name: 'Smart Watch Pro',
                price: 3999,
                originalPrice: 7999,
                image: '/api/placeholder/400/500',
                rating: 4.9,
                reviews: 567,
                tag: 'New',
                discount: 50,
                brand: 'TECH',
            },
            {
                id: 104,
                name: 'Minimalist Backpack',
                price: 1999,
                originalPrice: 3499,
                image: '/api/placeholder/400/500',
                rating: 4.7,
                reviews: 2345,
                tag: 'Sale',
                discount: 43,
                brand: 'URBAN',
            },
            {
                id: 105,
                name: 'Premium Sunglasses',
                price: 1499,
                originalPrice: 2999,
                image: '/api/placeholder/400/500',
                rating: 4.6,
                reviews: 678,
                tag: 'Limited',
                discount: 50,
                brand: 'EYE',
            },
            {
                id: 106,
                name: 'Running Shoes',
                price: 5999,
                originalPrice: 9999,
                image: '/api/placeholder/400/500',
                rating: 4.9,
                reviews: 3456,
                tag: 'HOT',
                discount: 40,
                brand: 'SPORT',
            },
        ];
        setAllProducts(mockProducts);
    }, []);

    // Calculate totals
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + Number(item.product_price) * item.quantity, 0);
    }, [items]);

    const shipping = subtotal > 5000 ? 0 : 199;
    const discount = subtotal > 10000 ? 1000 : subtotal > 5000 ? 500 : 0;
    const couponDiscount = appliedCoupon?.value || 0;
    const total = subtotal + shipping - discount - couponDiscount;
    const savings = discount + couponDiscount;

    const handleApplyCoupon = () => {
        setCouponError('');
        const validCoupons = {
            SAVE10: { value: Math.min(500, subtotal * 0.1), message: '10% off' },
            SAVE20: { value: Math.min(1000, subtotal * 0.2), message: '20% off' },
            FREESHIP: { value: shipping === 199 ? 199 : 0, message: 'Free Shipping' },
        };

        const code = couponCode.toUpperCase();
        if (validCoupons[code]) {
            setAppliedCoupon({ code, value: validCoupons[code].value, message: validCoupons[code].message });
            setCouponCode('');
        } else {
            setCouponError('Invalid coupon. Try: SAVE10, SAVE20, FREESHIP');
        }
    };

    const handleQty = (item, qty) => {
        if (qty < 1 || qty > 10) return;
        updateCart(item.id, qty);
    };

    const handleRemoveItem = async (item) => {
        setRemovingItems((prev) => ({ ...prev, [item.id]: true }));
        setTimeout(() => {
            removeItem(item.id);
            setRemovingItems((prev) => ({ ...prev, [item.id]: false }));
            setShowRemoveConfirm(null);
        }, 300);
    };

    const handleAddToCart = async (product) => {
        setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
        await addToCart(product.id, 1);
        setTimeout(() => setAddingToCart((prev) => ({ ...prev, [product.id]: false })), 500);
    };

    const moveToWishlist = (item) => {
        toggleWishlist(item.product_id || item.id);
        removeItem(item.id);
    };

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                            <ShoppingBag size={16} className="text-black" />
                            <span className="text-sm font-medium text-gray-600">{items.length} Items</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-black">YOUR CART</h1>
                        <p className="text-gray-400 mt-2">Review and manage your items</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* LEFT - Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`group bg-white border border-gray-200 rounded-2xl transition-all duration-300 overflow-hidden ${
                                        removingItems[item.id] ? 'opacity-50 scale-95' : 'hover:shadow-lg'
                                    }`}>
                                    <div className="p-6">
                                        <div className="flex gap-6">
                                            {/* Image */}
                                            <div
                                                onClick={() => navigate(`/product/${item.product_id || item.id}`)}
                                                className="relative w-28 h-28 bg-gray-100 rounded-xl overflow-hidden cursor-pointer flex-shrink-0">
                                                <img
                                                    src={
                                                        item.product_image
                                                            ? `http://127.0.0.1:8000${item.product_image}`
                                                            : '/api/placeholder/120/120'
                                                    }
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                    alt={item.product_name}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-black mb-1">
                                                            {item.product_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400">{item.brand || 'PREMIUM'}</p>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <div className="flex text-gray-800">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={12}
                                                                        className="fill-gray-800 text-gray-800"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-400">(4.9)</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-black">
                                                            ₹{item.product_price}
                                                        </p>
                                                        {item.original_price && (
                                                            <p className="text-xs text-gray-400 line-through">
                                                                ₹{item.original_price}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                                                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                                                        <button
                                                            onClick={() => handleQty(item, item.quantity - 1)}
                                                            className="w-7 h-7 rounded-full hover:bg-white transition flex items-center justify-center">
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQty(item, item.quantity + 1)}
                                                            className="w-7 h-7 rounded-full hover:bg-white transition flex items-center justify-center">
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => moveToWishlist(item)}
                                                            className="text-gray-400 hover:text-black transition text-sm flex items-center gap-1">
                                                            <Heart size={14} /> Save
                                                        </button>
                                                        <button
                                                            onClick={() => setShowRemoveConfirm(item)}
                                                            className="text-gray-400 hover:text-red-500 transition text-sm flex items-center gap-1">
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28">
                                {/* Summary Card */}
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-6">ORDER SUMMARY</h2>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Shipping</span>
                                            <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                                {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                            </span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-₹{discount}</span>
                                            </div>
                                        )}
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-green-600 text-sm">
                                                <span>Coupon ({appliedCoupon.code})</span>
                                                <div className="flex items-center gap-1">
                                                    -₹{Math.round(appliedCoupon.value)}
                                                    <button
                                                        onClick={() => setAppliedCoupon(null)}
                                                        className="text-gray-400 hover:text-black">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 my-6"></div>

                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-xs text-gray-400">Total Amount</p>
                                            <p className="text-xs text-gray-400">Incl. all taxes</p>
                                        </div>
                                        <p className="text-3xl font-bold text-black">
                                            ₹{Math.round(total).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Coupon */}
                                    <div className="mb-6">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="COUPON CODE"
                                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition">
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                                <AlertCircle size={10} /> {couponError}
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <span className="text-[10px] text-gray-400">Try: SAVE10, SAVE20, FREESHIP</span>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all mb-4 flex items-center justify-center gap-2">
                                        <CreditCard size={18} />
                                        Proceed to Checkout
                                        <ArrowRight size={16} />
                                    </button>

                                    {/* Payment Options */}
                                    <div className="flex justify-center gap-3 py-3">
                                        <div className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono">
                                            VISA
                                        </div>
                                        <div className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono">
                                            MC
                                        </div>
                                        <div className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono">
                                            UPI
                                        </div>
                                        <div className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono">
                                            COD
                                        </div>
                                    </div>

                                    <div className="text-center text-[10px] text-gray-400">
                                        <ShieldCheck size={12} className="inline mr-1" />
                                        Secure payment guaranteed
                                    </div>
                                </div>

                                {/* Free Shipping Progress */}
                                {subtotal < 5000 && subtotal > 0 && (
                                    <div className="mt-4 bg-gray-100 rounded-2xl p-4 text-center">
                                        <Truck size={18} className="text-black inline mb-1" />
                                        <p className="text-sm font-medium text-black">
                                            Add ₹{(5000 - subtotal).toLocaleString()} more for FREE Shipping
                                        </p>
                                        <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-black rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (subtotal / 5000) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-5">
                            <Trash2 size={28} className="text-black" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Remove Item?</h3>
                        <p className="text-gray-400 text-sm mb-6">This item will be removed from your cart</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRemoveConfirm(null)}
                                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveItem(showRemoveConfirm)}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Empty Cart Component
const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pt-28 pb-20 px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag size={50} className="text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                        0
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
                <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition">
                    Start Shopping
                    <ArrowRight size={16} />
                </Link>
                <div className="flex justify-center gap-4 mt-8 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Truck size={12} /> Free Shipping
                    </span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={12} /> Secure
                    </span>
                    <span className="flex items-center gap-1">
                        <RotateCcw size={12} /> Easy Returns
                    </span>
                </div>
            </div>
        </div>
    );
};
<button
    onClick={() => {
        const cart = localStorage.getItem('cart');
        const cartData = JSON.parse(cart || '{"items":[]}');
        console.log('Cart items:', cartData.items);
        const ids = cartData.items.map((i) => i.product_id || i.id);
        alert(`Product IDs in cart: ${ids.join(', ')}`);
    }}
    className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-xs z-50">
    Debug Cart
</button>;

export default Cart;
