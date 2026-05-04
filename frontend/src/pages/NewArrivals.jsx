import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowRight,
    Sparkles,
    Flame,
    SlidersHorizontal,
    X,
    Tag,
    ChevronDown,
    Grid3x3,
    List,
    Star,
    ShoppingBag,
} from 'lucide-react';

import ProductCard from '../components/layout/ProductCard';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

function NewArrivals() {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [addingToCart, setAddingToCart] = useState({});

    // Extract unique categories and brands
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:8000/api/products/new-arrivals/')
            .then((res) => {
                const enhanced = res.data.map((p) => ({
                    ...p,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    reviews: Math.floor(Math.random() * 500) + 50,
                    discount: Math.random() > 0.6 ? Math.floor(Math.random() * 40) + 10 : 0,
                    originalPrice: p.price,
                }));
                setProducts(enhanced);
                setFilteredProducts(enhanced);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filter and Sort
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

        setFilteredProducts(result);
    }, [products, priceRange, sortBy, selectedCategories, selectedBrands]);

    const handleAddToCart = async (productId) => {
        setAddingToCart((prev) => ({ ...prev, [productId]: true }));
        await addToCart(productId, 1);
        setTimeout(() => setAddingToCart((prev) => ({ ...prev, [productId]: false })), 500);
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

    if (loading) return <LoadingSkeleton />;
    if (products.length === 0) return <EmptyState />;

    return (
        <div className="mt-16 bg-white py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <Flame size={14} className="text-black" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Just Dropped</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">New Arrivals</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Fresh styles just landed. Be the first to shop our latest collection.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
                        <Sparkles size={14} />
                        <span>{filteredProducts.length} Products Available</span>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-sm">
                                <SlidersHorizontal size={14} /> Filters
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
                            {(priceRange !== 'all' || selectedCategories.length > 0 || selectedBrands.length > 0) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-full transition">
                                    <X size={12} /> Clear all
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
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
                            <div className="flex bg-gray-100 rounded-full p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-full transition ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400'}`}>
                                    <Grid3x3 size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-full transition ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400'}`}>
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(priceRange !== 'all' || selectedCategories.length > 0 || selectedBrands.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {priceRange !== 'all' && (
                                <span className="px-2 py-1 bg-black text-white text-xs rounded-full flex items-center gap-1">
                                    <Tag size={10} /> ₹{priceRange}
                                    <button onClick={() => setPriceRange('all')}>×</button>
                                </span>
                            )}
                            {selectedCategories.map((cat) => (
                                <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {cat}
                                    <button
                                        onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}>
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedBrands.map((brand) => (
                                <span key={brand} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {brand}
                                    <button onClick={() => setSelectedBrands(selectedBrands.filter((b) => b !== brand))}>
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Filter Panel */}
                    {isFiltersOpen && (
                        <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="font-semibold text-sm mb-3">Price Range</h4>
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
                                                className="flex items-center gap-2 text-sm cursor-pointer">
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
                                        <h4 className="font-semibold text-sm mb-3">Categories</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {categories.map((cat) => (
                                                <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
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
                                        <h4 className="font-semibold text-sm mb-3">Brands</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {brands.map((brand) => (
                                                <label
                                                    key={brand}
                                                    className="flex items-center gap-2 text-sm cursor-pointer">
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

                {/* Products */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <button onClick={clearAllFilters} className="px-6 py-2 bg-black text-white rounded-full">
                            Clear Filters
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWishlisted={isInWishlist(product.id)}
                                isAdding={addingToCart[product.id]}
                                onWishlist={() => handleWishlist(product.id)}
                                onAddToCart={() => handleAddToCart(product.id)}
                                onBuyNow={() => handleBuyNow(product.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex gap-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={product.image ? `http://127.0.0.1:8000${product.image}` : '/placeholder.jpg'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase">{product.brand}</p>
                                    <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={12}
                                                    className={
                                                        star <= Math.floor(product.rating)
                                                            ? 'text-gray-800 fill-gray-800'
                                                            : 'text-gray-200'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">({product.reviews})</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xl font-bold">₹{product.price?.toLocaleString()}</span>
                                        {product.discount > 0 && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{product.originalPrice}
                                            </span>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product.id);
                                                }}
                                                className="bg-black text-white px-3 py-1.5 rounded-lg text-sm">
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyNow(product.id);
                                                }}
                                                className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all group">
                        View All New Arrivals <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

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
