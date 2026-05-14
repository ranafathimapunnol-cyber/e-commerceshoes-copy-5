// components/layout/ProductCard.jsx - Black & White Theme
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { showSuccess, showError, showWarning } from '../../utils/toast';

export default function ProductCard({ product, hideBuyNow = false }) {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart, buyNow } = useContext(CartContext);

    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!product) return null;

    const id = product.id || product.product_id;
    const productName = product.name || product.product_name || product.title || 'Product';
    const productPrice = product.price || product.selling_price || product.product_price || product.mrp || 0;
    const originalPrice = product.original_price || product.mrp || product.price || productPrice;
    let productImage = product.image || product.product_image || (product.images && product.images[0]) || '';
    const productBrand = product.brand || product.category || 'PREMIUM';

    // Stock status
    const stock = product.stock !== undefined ? product.stock : 10;
    const isOutOfStock = stock === 0;
    const isLowStock = stock > 0 && stock < 10;

    // Check if user is logged in
    const isLoggedIn = () => {
        const token = localStorage.getItem('access');
        return !!token;
    };

    const getImageUrl = () => {
        if (!productImage) {
            return `https://ui-avatars.com/api/?background=000000&color=fff&bold=true&size=300&name=${encodeURIComponent(productName.charAt(0))}`;
        }
        if (productImage.startsWith('http')) return productImage;
        if (productImage.startsWith('/media/') || productImage.startsWith('/uploads/')) {
            return `http://127.0.0.1:8000${productImage}`;
        }
        return `http://127.0.0.1:8000/${productImage.replace(/^\/+/, '')}`;
    };

    const handleWishlist = (e) => {
        e.stopPropagation();

        if (!isLoggedIn()) {
            showWarning('🔐 Please login to add items to wishlist');
            return;
        }

        toggleWishlist(product);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();

        // Check out of stock first
        if (isOutOfStock) {
            showError(`❌ ${productName} is out of stock!`);
            return;
        }

        if (!isLoggedIn()) {
            showWarning('🔐 Please login to add items to cart');
            return;
        }

        if (!id || !productPrice) {
            showError('Product data is invalid');
            return;
        }

        setAddingToCart(true);

        await addToCart(id, 1, {
            product_name: productName,
            product_price: productPrice,
            product_image: productImage,
            brand: productBrand,
            original_price: originalPrice,
        });

        showSuccess(`${productName} added to cart!`);
        setTimeout(() => setAddingToCart(false), 500);
    };

    const handleBuyNow = async (e) => {
        e.stopPropagation();

        // Check out of stock first
        if (isOutOfStock) {
            showError(`❌ ${productName} is out of stock!`);
            return;
        }

        if (!isLoggedIn()) {
            showWarning('🔐 Please login to continue');
            return;
        }

        if (!id || !productPrice) {
            showError('Product price not available');
            return;
        }

        setBuyingNow(true);

        buyNow(id, 1, {
            product_name: productName,
            product_price: productPrice,
            product_image: productImage,
            brand: productBrand,
        });

        showSuccess(`${productName} ready for checkout!`);
        navigate('/checkout');
        setTimeout(() => setBuyingNow(false), 500);
    };

    const isWishlisted = isInWishlist(id);

    // Get stock indicator for badge (black & white theme)
    const getStockIndicator = () => {
        if (isOutOfStock) {
            return { icon: XCircle, text: 'Out of Stock', color: 'text-gray-500', bg: 'bg-gray-100' };
        } else if (isLowStock) {
            return { icon: AlertCircle, text: `Only ${stock} left`, color: 'text-gray-600', bg: 'bg-gray-100' };
        } else {
            return { icon: CheckCircle, text: 'In Stock', color: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };

    const StockIcon = getStockIndicator().icon;

    return (
        <div
            onClick={() => productPrice && navigate(`/product/${id}`)}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col border border-gray-100">
            {/* Image Section */}
            <div className="relative bg-gray-50 aspect-square overflow-hidden">
                {!imageError && getImageUrl() ? (
                    <img
                        src={getImageUrl()}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt={productName}
                        onError={(e) => {
                            setImageError(true);
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-300" />
                    </div>
                )}

                {/* Wishlist Button - Black & White */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition z-10">
                    <Heart size={16} className={isWishlisted ? 'fill-black text-black' : 'text-gray-500'} />
                </button>

                {/* Discount Badge - Black */}
                {product.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        {product.discount}% OFF
                    </span>
                )}

                {/* Stock Indicator Badge - Black & White */}
                <div
                    className={`absolute bottom-3 left-3 ${getStockIndicator().bg} rounded-full px-2 py-1 flex items-center gap-1 shadow-sm z-10 border border-gray-200`}>
                    <StockIcon size={10} className={getStockIndicator().color} />
                    <span className={`text-xs font-medium ${getStockIndicator().color}`}>{getStockIndicator().text}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Brand */}
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{productBrand}</p>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm leading-tight">{productName}</h3>

                {/* Price Section */}
                <div className="flex items-baseline gap-2 mt-1 mb-3">
                    {productPrice > 0 ? (
                        <>
                            <p className="text-xl font-bold text-black">₹{Number(productPrice).toLocaleString()}</p>
                            {originalPrice > productPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                    ₹{Number(originalPrice).toLocaleString()}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Price Unavailable</p>
                    )}
                </div>

                {/* Add to Cart Button - Black & White */}
                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 mt-auto">
                    {addingToCart ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                        </div>
                    ) : (
                        'Add to Cart'
                    )}
                </button>

                {/* Buy Now Button - Black & White */}
                {!hideBuyNow && (
                    <button
                        onClick={handleBuyNow}
                        disabled={buyingNow}
                        className="w-full mt-2 bg-gray-100 text-black py-2.5 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50">
                        {buyingNow ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            'Buy Now'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
