import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../context/CartContext'; // ✅ Fixed path
import { WishlistContext } from '../../context/WishlistContext'; // ✅ Fixed path
import api from '../../utils/api';
import { ArrowRight, Sparkles, Eye, ShoppingBag, Star, TrendingUp, Zap, Award } from 'lucide-react';

function Featured() {
    const [hoveredIndex, setHoveredIndex] = useState(null); // For hover effects on products
    const [isVisible, setIsVisible] = useState(false);
    const [loadedImages, setLoadedImages] = useState({});
    const [products, setProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState({});

    const sectionRef = useRef(null);
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/products/'); // Fetch all products

                const featuredProducts = [res.data[1], res.data[2], res.data[4]];

                setProducts(featuredProducts);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const handleImageLoad = (id) => {
        setLoadedImages((prev) => ({ ...prev, [id]: true }));
    };

    const handleShopNow = (product) => {
        navigate(`/product/${product.id}`);
    };

    const handleQuickView = (product, e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();

        // ✅ CHECK LOGIN STATUS
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }

        setAddingToCart((prev) => ({ ...prev, [product.id]: true }));

        try {
            await addToCart(product.id, 1);
            alert(`${product.name} added to cart! ✅`);
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Failed to add to cart. Please try again.');
        } finally {
            setTimeout(() => {
                setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
            }, 500);
        }
    };

    if (products.length === 0) return null;

    return (
        <div ref={sectionRef} className="relative py-28 px-4 md:px-10 bg-black text-white overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 bg-white/5 px-5 py-2 rounded-full border border-white/10 mb-6">
                        <TrendingUp size={14} />
                        TRENDING NOW
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter">FEATURED</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {products.map((product, idx) => {
                        const TagIcon = idx === 0 ? Zap : idx === 1 ? Award : Sparkles;
                        return (
                            <div
                                key={product.id}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="relative group cursor-pointer">
                                <div className="absolute -inset-1 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative bg-black border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="relative h-72 overflow-hidden bg-gray-900">
                                        {!loadedImages[product.id] && (
                                            <div className="absolute inset-0 animate-pulse bg-gray-800" />
                                        )}
                                        <img
                                            src={
                                                product.image?.startsWith('http')
                                                    ? product.image
                                                    : `http://127.0.0.1:8000${product.image}`
                                            }
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onLoad={() => handleImageLoad(product.id)}
                                            alt={product.name}
                                        />
                                        <div className="absolute top-4 left-4 bg-white text-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                            <TagIcon size={12} />
                                            TRENDING
                                        </div>
                                        <div
                                            className={`absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 transition-all duration-300 ${
                                                hoveredIndex === idx
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-4'
                                            }`}>
                                            {/* Eye Button - Quick View */}
                                            <button
                                                onClick={(e) => handleQuickView(product, e)}
                                                className="bg-white text-black p-3 rounded-full hover:scale-110 transition shadow-lg">
                                                <Eye size={16} />
                                            </button>
                                            {/* Shopping Bag Button - Add to Cart */}
                                            <button
                                                onClick={(e) => handleAddToCart(product, e)}
                                                disabled={addingToCart[product.id]}
                                                className="bg-white text-black p-3 rounded-full hover:scale-110 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                                {addingToCart[product.id] ? (
                                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <ShoppingBag size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                            4.8 (120+)
                                        </div>
                                        <h3 className="text-2xl font-bold mt-2">{product.name}</h3>
                                        <p className="text-white/50 text-sm mt-2 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between mt-5">
                                            <div>
                                                <p className="text-xl font-bold">₹{product.price?.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleShopNow(product)}
                                                className="bg-white text-black px-5 py-2 rounded-full text-xs flex items-center gap-2 hover:scale-105 transition">
                                                SHOP NOW
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Featured;
