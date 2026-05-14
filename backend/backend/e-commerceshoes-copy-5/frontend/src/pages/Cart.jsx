// Cart.jsx - Updated (Only removed add to cart without login)
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
    Heart,
    X,
    CreditCard,
    AlertCircle,
    Star,
    RotateCcw,
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { showSuccess } from '../utils/toast';

function Cart() {
    const navigate = useNavigate();
    const { cart, removeItem, updateCart, clearBuyNowItems } = useContext(CartContext);
    const { toggleWishlist } = useContext(WishlistContext);

    const [removingItems, setRemovingItems] = useState({});
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

    const allItems = cart?.items || [];

    // ✅ FILTER: Only show regular items (NOT Buy Now items)
    const items = allItems.filter((item) => !item.is_buy_now);

    // Get Buy Now items for the banner
    const buyNowItems = allItems.filter((item) => item.is_buy_now === true);

    // Check if there are Buy Now items
    const hasBuyNowItems = buyNowItems.length > 0;

    // Calculate totals (only for regular items)
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + Number(item.product_price) * item.quantity, 0);
    }, [items]);

    const shipping = subtotal > 5000 ? 0 : 199;
    const discount = subtotal > 10000 ? 1000 : subtotal > 5000 ? 500 : 0;
    const couponDiscount = appliedCoupon?.value || 0;
    const total = subtotal + shipping - discount - couponDiscount;

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
            showSuccess(`Coupon ${code} applied!`);
        } else {
            setCouponError('Invalid coupon. Try: SAVE10, SAVE20, FREESHIP');
        }
    };

    const handleQty = (item, newQuantity) => {
        if (newQuantity < 1 || newQuantity > 99) return;
        const uniqueId = item.cart_item_id || item.id;
        updateCart(uniqueId, newQuantity);
    };

    const handleRemoveItem = async (item) => {
        const uniqueId = item.cart_item_id || item.id;
        setRemovingItems((prev) => ({ ...prev, [uniqueId]: true }));
        setTimeout(() => {
            removeItem(uniqueId);
            setRemovingItems((prev) => ({ ...prev, [uniqueId]: false }));
            setShowRemoveConfirm(null);
            showSuccess(`${item.product_name} removed from cart`);
        }, 300);
    };

    // Remove specific Buy Now item
    const handleRemoveBuyNowItem = (item) => {
        const uniqueId = item.cart_item_id || item.id;
        removeItem(uniqueId);
        showSuccess(`${item.product_name} removed from Buy Now`);
    };

    // Clear all Buy Now items
    const handleClearBuyNowItems = () => {
        if (window.confirm('Remove all Buy Now items? You can add them to cart normally.')) {
            clearBuyNowItems();
            showSuccess('All Buy Now items removed');
        }
    };

    const moveToWishlist = (item) => {
        toggleWishlist(item.product_id || item.id);
        const uniqueId = item.cart_item_id || item.id;
        removeItem(uniqueId);
        showSuccess(`${item.product_name} moved to wishlist`);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/')) return `http://127.0.0.1:8000${imagePath}`;
        return `http://127.0.0.1:8000/${imagePath}`;
    };

    // ✅ REMOVED: The "Save for later" button that added to wishlist without login
    // The moveToWishlist function is still there but not used in buttons now

    // Show Buy Now banner if there are Buy Now items and no regular items
    if (hasBuyNowItems && items.length === 0) {
        return (
            <div className="min-h-screen bg-white pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag size={40} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Buy Now in Progress</h2>
                        <p className="text-gray-600 mb-6">
                            You have {buyNowItems.length} Buy Now order(s) being processed.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/checkout')}
                                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
                                Complete Purchase
                            </button>
                            <button
                                onClick={handleClearBuyNowItems}
                                className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition">
                                Cancel All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0 && buyNowItems.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Buy Now Banner - WITH REMOVE BUTTONS */}
                    {hasBuyNowItems && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <ShoppingBag size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-800">Buy Now Items Ready to Checkout</p>
                                        <p className="text-sm text-blue-600">
                                            You have {buyNowItems.length} item(s) ready for immediate purchase
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                                        Checkout Now
                                    </button>
                                    <button
                                        onClick={handleClearBuyNowItems}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* List of Buy Now items with remove option */}
                            <div className="space-y-2 mt-3">
                                {buyNowItems.map((item) => {
                                    const imageUrl = getImageUrl(item.product_image);
                                    return (
                                        <div
                                            key={item.cart_item_id}
                                            className="flex items-center justify-between bg-white/50 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product_name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                                        <ShoppingBag size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{item.product_name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-sm">
                                                    ₹{Number(item.product_price).toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveBuyNowItem(item)}
                                                    className="text-red-500 hover:text-red-700 transition p-1"
                                                    title="Remove from Buy Now">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                            {items.map((item) => {
                                const uniqueId = item.cart_item_id || item.id;
                                const imageUrl = getImageUrl(item.product_image);

                                return (
                                    <div
                                        key={uniqueId}
                                        className={`group bg-white border border-gray-200 rounded-2xl transition-all duration-300 overflow-hidden hover:shadow-lg ${
                                            removingItems[uniqueId] ? 'opacity-50 scale-95' : ''
                                        }`}>
                                        <div className="p-6">
                                            <div className="flex gap-6">
                                                {/* Image Section */}
                                                <div className="relative w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                            alt={item.product_name}
                                                            onError={(e) => {
                                                                e.target.src =
                                                                    'https://via.placeholder.com/120x120?text=No+Image';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <ShoppingBag size={32} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details Section */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-black mb-1">
                                                                {item.product_name || 'Product Name Not Available'}
                                                            </h3>
                                                            <p className="text-sm text-gray-400">
                                                                {item.brand || 'PREMIUM'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-black">
                                                                ₹{Number(item.product_price || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                                                            <button
                                                                onClick={() => handleQty(item, item.quantity - 1)}
                                                                className="w-7 h-7 rounded-full hover:bg-white transition flex items-center justify-center">
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="font-medium w-8 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQty(item, item.quantity + 1)}
                                                                className="w-7 h-7 rounded-full hover:bg-white transition flex items-center justify-center">
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>

                                                        {/* Action Buttons - REMOVED "Save for later" button */}
                                                        <div className="flex gap-4">
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
                                );
                            })}
                        </div>

                        {/* RIGHT - Order Summary (unchanged) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28">
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

                                    <div className="text-center text-[10px] text-gray-400">
                                        <ShieldCheck size={12} className="inline mr-1" />
                                        Secure payment guaranteed
                                    </div>
                                </div>
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

// Empty Cart Component (unchanged)
const EmptyCart = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center pt-28 pb-20 px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingBag size={50} className="text-gray-400" />
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
            </div>
        </div>
    );
};

export default Cart;
