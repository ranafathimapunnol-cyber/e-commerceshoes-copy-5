import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

import { CartContext } from '../context/CartContext';
import ProductCard from '../components/layout/ProductCard';
import { Sparkles } from 'lucide-react';

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
                let url = 'http://127.0.0.1:8000/api/products/';
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
        };
        return names[formattedCategory] || formattedCategory;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - mt-12 for navbar spacing */}
            <div className="relative mt-32">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1605348532760-6753d2cba29c?w=1600"
                        className="w-full h-72 object-cover opacity-30"
                        alt="hero"
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-14 py-16">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-6 text-sm">
                        ← Back
                    </Link>

                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white capitalize">
                            {getCategoryDisplayName()}
                        </h1>
                        <p className="text-white/50 text-sm mt-3">{products.length} products</p>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-6 md:px-14 py-12 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopByCategory;
