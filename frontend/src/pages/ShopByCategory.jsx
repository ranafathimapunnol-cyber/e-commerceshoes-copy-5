import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { CartContext } from '../context/CartContext';
import ProductCard from '../components/layout/ProductCard';
import { Sparkles, Flame, ArrowRight } from 'lucide-react';

function ShopByCategory() {
    const { category } = useParams();
    const { cart } = useContext(CartContext);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const formattedCategory = category?.toLowerCase() === 'new' ? 'UNISEX' : category?.toUpperCase();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/api/products/';
                if (formattedCategory === 'UNISEX') {
                    url += '?gender=UNISEX';
                } else {
                    url += `?category=${formattedCategory}`;
                }
                const res = await axios.get(url);
                setProducts(res.data || []);
            } catch (err) {
                console.error(err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [formattedCategory]);

    const getCategoryDisplayName = () => {
        const names = {
            MENS: "Men's Collection",
            WOMENS: "Women's Collection",
            UNISEX: 'New Arrivals',
            KIDS: "Kids' Collection",
            ACCESSORIES: 'Accessories',
        };
        return names[formattedCategory] || formattedCategory;
    };

    const getCategoryBadge = () => {
        const badges = {
            MENS: "Men's Style",
            WOMENS: "Women's Style",
            UNISEX: 'Just Dropped',
            KIDS: "Kids' Style",
            ACCESSORIES: 'Complete Your Look',
        };
        return badges[formattedCategory] || 'Premium Collection';
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (products.length === 0) {
        return <EmptyState categoryName={getCategoryDisplayName()} />;
    }

    return (
        <div className="bg-white py-16 px-4 md:px-8 mt-12">
            <div className="max-w-7xl mx-auto">
                {/* HEADER - Same style as NewArrivals */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <Flame size={14} className="text-black" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                            {getCategoryBadge()}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">
                        {getCategoryDisplayName()}
                    </h2>

                    <p className="text-gray-400 max-w-md mx-auto">
                        Discover premium {formattedCategory?.toLowerCase()} collection crafted with exceptional quality and
                        style.
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
                        <Sparkles size={14} />
                        <span>{products.length} Products Available</span>
                    </div>
                </div>

                {/* Product Grid */}
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

                {/* View All Products Button */}
                <div className="text-center mt-12">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all group">
                        View All Products
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Loading Skeleton - Same as NewArrivals
const LoadingSkeleton = () => (
    <div className="bg-white py-16 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <div className="h-8 w-32 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse" />
                <div className="h-4 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                        <div className="aspect-square bg-gray-200" />
                        <div className="p-4 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                            <div className="h-8 bg-gray-200 rounded-xl w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Empty State - Same as NewArrivals style
const EmptyState = ({ categoryName }) => (
    <div className="bg-white py-16 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-6">{categoryName} collection is currently empty. Check back soon!</p>
            <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
                Browse All Products
                <ArrowRight size={16} />
            </Link>
        </div>
    </div>
);

export default ShopByCategory;
