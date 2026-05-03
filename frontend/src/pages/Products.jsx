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
    } from 'lucide-react';

    import { WishlistContext } from '../context/WishlistContext';
    import { CartContext } from '../context/CartContext';

    // ✅ GLOBAL CARD IMPORT
    import ProductCard from '../components/layout/ProductCard';

    function Products() {
        const [products, setProducts] = useState([]);
        const [filteredProducts, setFilteredProducts] = useState([]);
        const [loading, setLoading] = useState(true);

        const [sortBy, setSortBy] = useState('default');
        const [priceRange, setPriceRange] = useState('all');
        const [showFilters, setShowFilters] = useState(false);
        const [viewMode, setViewMode] = useState('grid');

        const [selectedCategories, setSelectedCategories] = useState([]);
        const [selectedBrands, setSelectedBrands] = useState([]);

        const [addingToCart, setAddingToCart] = useState({});

        const location = useLocation();
        const navigate = useNavigate();

        const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
        const { addToCart } = useContext(CartContext);

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

        if (loading) {
            return (
                <div className="pt-28 text-center">
                    <p>Loading products...</p>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-white pb-12 pt-28 px-6 md:px-12">
                {/* HEADER */}
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Sparkles /> Products
                        </h1>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={viewMode === 'grid' ? 'bg-black text-white p-2 rounded' : 'p-2'}>
                                <Grid3x3 size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={viewMode === 'list' ? 'bg-black text-white p-2 rounded' : 'p-2'}>
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                {viewMode === 'grid' ? (
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
                )}
            </div>
        );
    }

    export default Products;
