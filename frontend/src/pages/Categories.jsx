import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    SlidersHorizontal,
    X,
    Tag,
    ChevronDown,
    Grid3x3,
    List,
    Star,
    ShoppingBag,
    Sparkles,
    TrendingUp,
} from 'lucide-react';

import ProductCard from '../components/layout/ProductCard';

function Categories() {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedBrands, setSelectedBrands] = useState([]);

    const categories = [
        { id: 'MENS', name: 'MEN', image: '/categories/men.jpg' },
        { id: 'WOMENS', name: 'WOMEN', image: '/categories/w1.jpg' },
        { id: 'KIDS', name: 'KIDS', image: '/categories/kids.jpg' },
        { id: 'ACCESSORIES', name: 'NEW', image: '/categories/new.jpg' },
    ];

    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

    useEffect(() => {
        if (selectedCategory) {
            fetchProductsByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (products.length > 0) {
            filterAndSortProducts();
        }
    }, [products, sortBy, priceRange, selectedBrands]);

    const fetchProductsByCategory = async (categoryId) => {
        setLoading(true);
        try {
            let url = '/api/products/';
            if (categoryId === 'ACCESSORIES') {
                url += '?gender=UNISEX';
            } else {
                url += `?category=${categoryId}`;
            }
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
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let result = [...products];

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) result = result.filter((p) => p.price >= min && p.price <= max);
            else if (priceRange === '2000+') result = result.filter((p) => p.price >= 2000);
        }

        if (selectedBrands.length) result = result.filter((p) => selectedBrands.includes(p.brand));

        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

        setFilteredProducts(result);
    };

    const clearAllFilters = () => {
        setPriceRange('all');
        setSortBy('default');
        setSelectedBrands([]);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category.id);
        setSelectedBrands([]);
        setPriceRange('all');
        setSortBy('default');
    };

    if (!selectedCategory) {
        return (
            <div className="py-16 px-6 bg-white mt-12">
                <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center tracking-widest uppercase">
                    Shop By Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300 flex items-center justify-center">
                                <h2 className="text-white text-2xl font-bold tracking-widest opacity-0 group-hover:opacity-100 transition duration-300">
                                    {cat.name}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentCategory = categories.find((c) => c.id === selectedCategory);

    return (
        <div className="bg-white min-h-screen pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-sm text-gray-500 hover:text-black transition mb-4 flex items-center gap-1">
                        ← Back to Categories
                    </button>
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                            <Sparkles size={14} className="text-black" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                                {currentCategory?.name} Collection
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3">
                            {currentCategory?.name}
                        </h1>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Explore our premium {currentCategory?.name?.toLowerCase()} collection
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3 text-gray-400 text-sm">
                            <TrendingUp size={14} />
                            <span>{filteredProducts.length} Products Available</span>
                        </div>
                    </div>
                </div>

                {/* Filter and Sort Bar */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-sm">
                                <SlidersHorizontal size={14} /> Filters
                                {(selectedBrands.length > 0 || priceRange !== 'all') && (
                                    <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center">
                                        {selectedBrands.length + (priceRange !== 'all' ? 1 : 0)}
                                    </span>
                                )}
                                <ChevronDown
                                    size={12}
                                    className={`transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {(priceRange !== 'all' || selectedBrands.length > 0) && (
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

                    {isFiltersOpen && (
                        <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {brands.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Brands</h4>
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

                {/* Products Display */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredProducts.length === 0 ? (
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
                            <ProductCard key={product.id} product={product} />
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
                                        src={product.image ? `${product.image}` : '/placeholder.jpg'}
                                        className="w-full h-full object-cover"
                                        alt={product.name}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase">{product.brand}</p>
                                    <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((star, idx) => (
                                                <Star
                                                    key={idx}
                                                    size={12}
                                                    className={
                                                        idx <= Math.floor(product.rating)
                                                            ? 'text-gray-800 fill-gray-800'
                                                            : 'text-gray-200'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">({product.reviews})</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xl font-bold">₹{product.price?.toLocaleString()}</span>
                                        {product.discount > 0 && (
                                            <span className="text-xs text-gray-400 line-through">
                                                ₹{product.originalPrice}
                                            </span>
                                        )}
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

export default Categories;
