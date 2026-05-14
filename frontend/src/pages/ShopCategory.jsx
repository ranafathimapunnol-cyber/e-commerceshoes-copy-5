import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/layout/ProductCard';

function ShopCategory() {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/api/products/';
                
                // Map category to API filter
                if (category === 'men') {
                    url += '?category=MENS';
                    setCategoryName("Men's Collection");
                } else if (category === 'women') {
                    url += '?category=WOMENS';
                    setCategoryName("Women's Collection");
                } else if (category === 'kids') {
                    url += '?category=KIDS';
                    setCategoryName("Kids' Collection");
                } else if (category === 'new') {
                    url += '?gender=UNISEX';
                    setCategoryName('New Arrivals');
                } else {
                    setCategoryName('Products');
                }
                
                const response = await axios.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [category]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    const getCategoryImage = () => {
        if (category === 'men') return '/static/categories/men.jpg';
        if (category === 'women') return '/static/categories/women/w1.jpg';
        if (category === 'kids') return '/static/categories/kids.jpg';
        return '/static/categories/new.jpg';
    };

    return (
        <div className="bg-white min-h-screen pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Banner */}
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-12">
                    <img 
                        src={getCategoryImage()} 
                        alt={categoryName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider">
                            {categoryName}
                        </h1>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No products found in this category.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-gray-600">{products.length} products found</p>
                            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                                <option>Sort by: Default</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ShopCategory;
