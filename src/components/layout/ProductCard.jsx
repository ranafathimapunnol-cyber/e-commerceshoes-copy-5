// components/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { showSuccess, showError, showWarning } from '../../utils/toast';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart, buyNow } = useContext(CartContext);

    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!product) return null;

    const id = product.id || product.product_id;
    const productName = product.name || product.product_name || product.title || 'Product';

    // Safe price extraction
    const productPrice = product.price || product.selling_price || product.product_price || product.mrp || null;
    const originalPrice = product.original_price || product.mrp || product.price || productPrice;
    let productImage = product.image || product.product_image || (product.images && product.images[0]) || '';
    const productBrand = product.brand || product.category || 'PREMIUM';

    const getImageUrl = () => {
        if (!productImage) {
            return `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=300&name=${encodeURIComponent(productName.charAt(0))}`;
        }
        if (productImage.startsWith('http')) return productImage;
        if (productImage.startsWith('/media/') || productImage.startsWith('/uploads/')) {
            return `http://127.0.0.1:8000${productImage}`;
        }
        return `http://127.0.0.1:8000/${productImage.replace(/^\/+/, '')}`;
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlist(product);
    };

    // Add to Cart
    const handleAddToCart = async (e) => {
        e.stopPropagation();

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

    // Buy Now - adds to cart with is_buy_now = true
    const handleBuyNow = async (e) => {
        e.stopPropagation();

        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to continue');
            navigate('/login');
            return;
        }

        if (!id || !productPrice) {
            showError('Product price not available');
            return;
        }

        setBuyingNow(true);

        // Add to cart with is_buy_now = true flag
        buyNow(id, 1, {
            product_name: productName,
            product_price: productPrice,
            product_image: productImage,
            brand: productBrand,
        });

        showSuccess(`${productName} added for Buy Now!`);

        // Go to checkout
        navigate('/checkout');

        setTimeout(() => setBuyingNow(false), 500);
    };

    const isWishlisted = isInWishlist(id);

    return (
        <div
            onClick={() => productPrice && navigate(`/product/${id}`)}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition cursor-pointer">
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square">
                {!imageError && getImageUrl() ? (
                    <img
                        src={getImageUrl()}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        alt={productName}
                        onError={(e) => {
                            setImageError(true);
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-400" />
                    </div>
                )}

                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition z-10">
                    <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {product.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        {product.discount}% OFF
                    </span>
                )}

                {!productPrice && (
                    <span className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Price Unavailable
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{productName}</h3>

                <div className="flex items-center gap-2 mb-3">
                    {productPrice ? (
                        <>
                            <p className="text-lg font-bold text-black">₹{Number(productPrice).toLocaleString()}</p>
                            {originalPrice > productPrice && (
                                <p className="text-sm text-gray-400 line-through">
                                    ₹{Number(originalPrice).toLocaleString()}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-red-500">Price Unavailable</p>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !productPrice}
                    className="w-full bg-black text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50">
                    {addingToCart ? 'Adding...' : productPrice ? 'Add to Cart' : 'Unavailable'}
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={buyingNow || !productPrice}
                    className="w-full bg-gray-100 text-black py-2.5 rounded-xl font-medium hover:bg-gray-200 transition mt-2 disabled:opacity-50">
                    {buyingNow ? 'Processing...' : 'Buy Now'}
                </button>
            </div>
        </div>
    );
}
