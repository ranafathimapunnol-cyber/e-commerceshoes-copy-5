import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/layout/ProductCard';

function Wishlist() {
    const { wishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    const moveToCart = async (product) => {
        const token = localStorage.getItem('access');

        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }

        await addToCart(product.id, 1);
    };

    if (wishlist.length === 0) {
        return (
            <div className="pt-28 text-center">
                <h2 className="text-xl">Your wishlist is empty ❤️</h2>
            </div>
        );
    }

    return (
        <div className="pt-28 px-6">
            <h1 className="text-2xl font-bold mb-6">My Wishlist ❤️</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                    <div key={product.id} className="relative">
                        {/* GLOBAL PRODUCT CARD */}
                        <ProductCard product={product} />

                        {/* EXTRA ACTION */}
                        <button
                            onClick={() => moveToCart(product)}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-xl text-sm shadow-lg hover:bg-gray-800">
                            Move to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;
