import { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Heart,
    ShoppingBag,
    Eye,
    Star,
    SlidersHorizontal,
    X,
    Check,
    Grid3x3,
    List,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Flame,
    Tag,
    Award,
    Gem,
    ChevronDown,
} from 'lucide-react';

import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/layout/ProductCard';

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);

    const [addingToCart, setAddingToCart] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    // Extract unique categories and brands
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

    // ================= FETCH =================
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams(location.search);
                const category = params.get('category');
                const sub_category = params.get('subcategory');

                let url = 'http://127.0.0.1:8000/api/products/';
                const query = [];

                if (category) query.push(`category=${category}`);
                if (sub_category) query.push(`sub_category=${sub_category}`);

                if (query.length) url += `?${query.join('&')}`;

                const res = await axios.get(url);

                const enhanced = res.data.map((p) => ({
                    ...p,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    reviews: Math.floor(Math.random() * 500) + 50,
                    isNew: Math.random() > 0.7,
                    isTrending: Math.random() > 0.8,
                    discount: Math.random() > 0.6 ? Math.floor(Math.random() * 40) + 10 : 0,
                    originalPrice: p.price,
                }));

                setProducts(enhanced);
                setFilteredProducts(enhanced);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    // ================= FILTER / SORT =================
    useEffect(() => {
        let result = [...products];

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) result = result.filter((p) => p.price >= min && p.price <= max);
            else if (priceRange === '2000+') result = result.filter((p) => p.price >= 2000);
        }

        if (selectedCategories.length) result = result.filter((p) => selectedCategories.includes(p.category));
        if (selectedBrands.length) result = result.filter((p) => selectedBrands.includes(p.brand));

        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
        if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFilteredProducts(result);
    }, [products, priceRange, sortBy, selectedCategories, selectedBrands]);

    // ================= ACTIONS =================
    const handleAddToCart = async (productId) => {
        setAddingToCart((prev) => ({ ...prev, [productId]: true }));
        await addToCart(productId, 1);
        setTimeout(() => {
            setAddingToCart((prev) => ({ ...prev, [productId]: false }));
        }, 500);
    };

    const handleBuyNow = async (productId) => {
        await addToCart(productId, 1);
        navigate('/checkout');
    };

    const handleWishlist = (productId) => {
        toggleWishlist(productId);
    };

    const clearAllFilters = () => {
        setPriceRange('all');
        setSortBy('default');
        setSelectedCategories([]);
        setSelectedBrands([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-28 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 pt-28 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with Badge - Matching other pages */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <Sparkles size={14} className="text-black" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Our Collection</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">All Products</h1>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Explore our premium collection of high-quality products
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
                        <TrendingUp size={14} />
                        <span>{filteredProducts.length} Products Available</span>
                    </div>
                </div>

                {/* Filter and Sort Bar */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Filter Button */}
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-sm">
                                <SlidersHorizontal size={14} />
                                Filters
                                {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange !== 'all') && (
                                    <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                                        {selectedCategories.length + selectedBrands.length + (priceRange !== 'all' ? 1 : 0)}
                                    </span>
                                )}
                                <ChevronDown
                                    size={12}
                                    className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Active Filters */}
                            {(priceRange !== 'all' || selectedCategories.length > 0 || selectedBrands.length > 0) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-full transition">
                                    <X size={12} />
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer">
                                <option value="default">Default</option> 
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>

                            {/* View Toggle */}
                            <div className="flex bg-gray-100 rounded-full p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-full transition ${
                                        viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400'
                                    }`}>
                                    <Grid3x3 size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-full transition ${
                                        viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400'
                                    }`}>
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Tags */}
                    {(priceRange !== 'all' || selectedCategories.length > 0 || selectedBrands.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {priceRange !== 'all' && (
                                <span className="px-2 py-1 bg-black text-white text-xs rounded-full flex items-center gap-1">
                                    <Tag size={10} /> ₹{priceRange}
                                    <button onClick={() => setPriceRange('all')} className="ml-1 hover:text-gray-300">
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedCategories.map((cat) => (
                                <span
                                    key={cat}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                                    {cat}
                                    <button
                                        onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}>
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedBrands.map((brand) => (
                                <span
                                    key={brand}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                                    {brand}
                                    <button onClick={() => setSelectedBrands(selectedBrands.filter((b) => b !== brand))}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Expandable Filter Panel */}
                    {isFiltersOpen && (
                        <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Tag size={14} /> Price Range
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'all', label: 'All Prices' },
                                            { value: '0-500', label: 'Under ₹500' },
                                            { value: '500-1000', label: '₹500 - ₹1,000' },
                                            { value: '1000-2000', label: '₹1,000 - ₹2,000' },
                                            { value: '2000+', label: '₹2,000 & above' },
                                        ].map((range) => (
                                            <label
                                                key={range.value}
                                                className="flex items-center gap-2 text-sm cursor-pointer hover:text-black transition">
                                                <input
                                                    type="radio"
                                                    name="price"
                                                    value={range.value}
                                                    checked={priceRange === range.value}
                                                    onChange={(e) => setPriceRange(e.target.value)}
                                                    className="text-black focus:ring-black"
                                                />
                                                <span className="text-gray-600">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {categories.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Award size={14} /> Categories
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat}
                                                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-black transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(cat)}
                                                        onChange={(e) => {
                                                            if (e.target.checked)
                                                                setSelectedCategories([...selectedCategories, cat]);
                                                            else
                                                                setSelectedCategories(
                                                                    selectedCategories.filter((c) => c !== cat),
                                                                );
                                                        }}
                                                        className="rounded text-black focus:ring-black"
                                                    />
                                                    <span className="text-gray-600">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {brands.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <Gem size={14} /> Brands
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {brands.map((brand) => (
                                                <label
                                                    key={brand}
                                                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-black transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrands.includes(brand)}
                                                        onChange={(e) => {
                                                            if (e.target.checked)
                                                                setSelectedBrands([...selectedBrands, brand]);
                                                            else
                                                                setSelectedBrands(
                                                                    selectedBrands.filter((b) => b !== brand),
                                                                );
                                                        }}
                                                        className="rounded text-black focus:ring-black"
                                                    />
                                                    <span className="text-gray-600">{brand}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* PRODUCTS - GRID VIEW */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your filters to find what you're looking for</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
                            Clear All Filters
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((item) => (
                            <ProductCard
                                key={item.id}
                                product={item}
                                isWishlisted={isInWishlist(item.id)}
                                isAdding={addingToCart[item.id]}
                                onWishlist={() => handleWishlist(item.id)}
                                onAddToCart={() => handleAddToCart(item.id)}
                                onBuyNow={() => handleBuyNow(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProducts.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/product/${item.id}`)}
                                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image ? `http://127.0.0.1:8000${item.image}` : '/placeholder.jpg'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase">{item.brand || 'PREMIUM'}</p>
                                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{item.name}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={
                                                            star <= Math.floor(item.rating)
                                                                ? 'text-gray-800 fill-gray-800'
                                                                : 'text-gray-200'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">({item.reviews})</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                                        <div>
                                            <span className="text-xl font-bold text-black">
                                                ₹{item.price?.toLocaleString()}
                                            </span>
                                            {item.discount > 0 && (
                                                <span className="text-xs text-gray-400 line-through ml-2">
                                                    ₹{item.originalPrice}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(item.id);
                                                }}
                                                disabled={addingToCart[item.id]}
                                                className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                                                {addingToCart[item.id] ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <ShoppingBag size={14} />
                                                )}
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyNow(item.id);
                                                }}
                                                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
