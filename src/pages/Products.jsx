import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Heart,
    ShoppingBag,
    Star,
    SlidersHorizontal,
    X,
    Grid3x3,
    List,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Tag,
    ChevronDown,
    Filter,
} from 'lucide-react';

import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/layout/ProductCard';

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brandsList, setBrandsList] = useState([]);

    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [addingToCart, setAddingToCart] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

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
                    discount: Math.random() > 0.6 ? Math.floor(Math.random() * 40) + 10 : 0,
                    originalPrice: p.price,
                }));

                setProducts(enhanced);
                setFilteredProducts(enhanced);

                const uniqueBrands = [...new Set(enhanced.map((p) => p.brand).filter(Boolean))];
                setBrandsList(uniqueBrands);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    useEffect(() => {
        let result = [...products];

        if (priceRange !== 'all') {
            if (priceRange === '0-500') {
                result = result.filter((p) => p.price <= 500);
            } else if (priceRange === '500-1000') {
                result = result.filter((p) => p.price >= 500 && p.price <= 1000);
            } else if (priceRange === '1000-2000') {
                result = result.filter((p) => p.price >= 1000 && p.price <= 2000);
            } else if (priceRange === '2000+') {
                result = result.filter((p) => p.price >= 2000);
            }
        }

        if (selectedBrands.length > 0) {
            result = result.filter((product) => {
                return selectedBrands.includes(product.brand);
            });
        }

        if (sortBy === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        } else if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredProducts(result);
    }, [products, priceRange, sortBy, selectedBrands]);

    const handleAddToCart = async (productId) => {
        setAddingToCart((prev) => ({ ...prev, [productId]: true }));
        await addToCart(productId, 1);
        setTimeout(() => {
            setAddingToCart((prev) => ({ ...prev, [productId]: false }));
        }, 500);
    };

    const handleBuyNow = async (productId) => {
        const product = products.find((p) => p.id === productId);

        const buyNowItem = {
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image,
            quantity: 1,
        };

        localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));

        await addToCart(productId, 1);

        navigate('/checkout?type=buynow');
    };

    const handleWishlist = (productId) => {
        toggleWishlist(productId);
    };

    const clearAllFilters = () => {
        setPriceRange('all');
        setSortBy('default');
        setSelectedBrands([]);
    };

    const toggleBrand = (brand) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter((b) => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const activeFilterCount = (priceRange !== 'all' ? 1 : 0) + selectedBrands.length;

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
                {/* Header */}
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

                {/* Filter Bar */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-sm">
                                <SlidersHorizontal size={14} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                                <ChevronDown
                                    size={12}
                                    className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {activeFilterCount > 0 && (
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

                    {/* Expandable Filter Panel - Neat Layout */}
                    {isFiltersOpen && (
                        <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex flex-col md:flex-row md:gap-8">
                                {/* Price Range - Left */}
                                <div className="flex-1 mb-6 md:mb-0">
                                    <h4 className="font-semibold text-sm mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <Tag size={14} /> Price Range
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'all', label: 'All Prices' },
                                            { value: '0-500', label: 'Under ₹500' },
                                            { value: '500-1000', label: '₹500 - ₹1,000' },
                                            { value: '1000-2000', label: '₹1,000 - ₹2,000' },
                                            { value: '2000+', label: '₹2,000 & above' },
                                        ].map((range) => (
                                            <label
                                                key={range.value}
                                                className="flex items-center gap-2 text-sm cursor-pointer hover:text-black transition p-2 rounded-lg hover:bg-gray-100">
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

                                {/* Vertical Divider */}
                                <div className="hidden md:block w-px bg-gray-200"></div>

                                {/* Brands - Right */}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                        Brands
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                        {brandsList.length > 0 ? (
                                            brandsList.map((brand) => (
                                                <label
                                                    key={brand}
                                                    className="flex items-center gap-2 text-sm cursor-pointer hover:text-black transition p-2 rounded-lg hover:bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrands.includes(brand)}
                                                        onChange={() => toggleBrand(brand)}
                                                        className="rounded text-black focus:ring-black"
                                                    />
                                                    <span className="text-gray-600">{brand}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 col-span-2">No brands available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Filter Tags */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {priceRange !== 'all' && (
                                <span className="px-2 py-1 bg-black text-white text-xs rounded-full flex items-center gap-1">
                                    <Tag size={10} />
                                    {priceRange === '0-500' && 'Under ₹500'}
                                    {priceRange === '500-1000' && '₹500 - ₹1,000'}
                                    {priceRange === '1000-2000' && '₹1,000 - ₹2,000'}
                                    {priceRange === '2000+' && '₹2,000 & above'}
                                    <button onClick={() => setPriceRange('all')} className="ml-1 hover:text-gray-300">
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedBrands.map((brand) => (
                                <span
                                    key={brand}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                                    {brand}
                                    <button onClick={() => toggleBrand(brand)} className="ml-1">
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Grid/List */}
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
                                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer flex gap-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image ? `http://127.0.0.1:8000${item.image}` : '/placeholder.jpg'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase">{item.brand || 'PREMIUM'}</p>
                                    <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
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
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xl font-bold">₹{item.price?.toLocaleString()}</span>
                                        {item.discount > 0 && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{item.originalPrice}
                                            </span>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(item.id);
                                                }}
                                                className="bg-black text-white px-3 py-1.5 rounded-lg text-sm">
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyNow(item.id);
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
            </div>
        </div>
    );
}

export default Products;
