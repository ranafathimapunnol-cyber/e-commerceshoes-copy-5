import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

import ProductCard from '../components/layout/ProductCard'; // ✅ GLOBAL CARD

function NewArrivals() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get('http://localhost:8000/api/products/new-arrivals/')
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (products.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="mt-16 bg-white py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* HEADER (UNCHANGED UI) */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <Flame size={14} className="text-black" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Just Dropped</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">New Arrivals</h2>

                    <p className="text-gray-400 max-w-md mx-auto">
                        Fresh styles just landed. Be the first to shop our latest collection.
                    </p>
                </div>

                {/* ✅ GLOBAL PRODUCT CARD USAGE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isWishlisted={false}
                            isAdding={false}
                            onWishlist={() => {}}
                            onAddToCart={() => {}}
                            onBuyNow={() => navigate(`/product/${product.id}`)}
                        />
                    ))}
                </div>

                {/* VIEW ALL */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all group">
                        View All New Arrivals
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== KEEP YOUR EXISTING LOADING + EMPTY UI (UNCHANGED) ===== */

const LoadingSkeleton = () => (
    <div className="bg-white py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
            <div className="h-10 w-60 bg-gray-200 mx-auto rounded mb-4 animate-pulse" />
            <div className="h-4 w-80 bg-gray-200 mx-auto rounded animate-pulse" />
        </div>
    </div>
);

const EmptyState = () => (
    <div className="bg-white py-16 px-4 md:px-8 text-center">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="text-xl font-bold">No New Arrivals</h3>
    </div>
);

export default NewArrivals;
