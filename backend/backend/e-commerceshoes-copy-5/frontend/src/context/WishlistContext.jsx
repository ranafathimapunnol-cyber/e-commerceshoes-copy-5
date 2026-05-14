// context/WishlistContext.jsx - COMPLETE FIXED
import React, { createContext, useState, useEffect } from 'react';
import { showSuccess, showWarning, showError } from '../utils/toast';
import axios from 'axios';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch wishlist from backend when user logs in
    const fetchWishlistFromBackend = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            setWishlist([]);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/products/wishlist/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data && Array.isArray(response.data)) {
                setWishlist(response.data);
                // Also save to localStorage for offline access
                localStorage.setItem('wishlist', JSON.stringify(response.data));
            } else {
                setWishlist([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            // Fallback to localStorage
            const savedWishlist = localStorage.getItem('wishlist');
            if (savedWishlist) {
                try {
                    setWishlist(JSON.parse(savedWishlist));
                } catch {
                    setWishlist([]);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Load wishlist when component mounts or user logs in
    useEffect(() => {
        fetchWishlistFromBackend();
    }, []);

    // Listen for login events (storage change)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('access');
            if (token) {
                fetchWishlistFromBackend();
            } else {
                setWishlist([]);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Save to localStorage whenever wishlist changes (for offline access)
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token && wishlist.length > 0) {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist]);

    // ✅ Toggle wishlist - requires login
    const toggleWishlist = async (product) => {
        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to add items to wishlist');
            return false;
        }

        const productId = product.id || product.product_id;
        const isCurrentlyInWishlist = wishlist.some((item) => (item.id || item.product_id) === productId);

        try {
            if (isCurrentlyInWishlist) {
                // Remove from wishlist via API
                await axios.delete(`http://127.0.0.1:8000/api/products/wishlist/remove/${productId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Update local state
                setWishlist((prev) => prev.filter((item) => (item.id || item.product_id) !== productId));
                showSuccess(`${product.name || product.product_name} removed from wishlist`);
            } else {
                // Add to wishlist via API
                await axios.post(
                    'http://127.0.0.1:8000/api/products/wishlist/add/',
                    { product: productId },
                    { headers: { Authorization: `Bearer ${token}` } },
                );

                // Add to local state
                const wishlistItem = {
                    id: productId,
                    product_id: productId,
                    name: product.name || product.product_name,
                    price: product.price || product.product_price,
                    image: product.image || product.product_image,
                    brand: product.brand,
                };
                setWishlist((prev) => [...prev, wishlistItem]);
                showSuccess(`${product.name || product.product_name} added to wishlist`);
            }
            return true;
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showError('Failed to update wishlist');
            return false;
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to manage wishlist');
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:8000/api/products/wishlist/remove/${productId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setWishlist((prev) => prev.filter((item) => (item.id || item.product_id) !== productId));
            showSuccess('Item removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            showError('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some((item) => (item.id || item.product_id) === productId);
    };

    const clearWishlist = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            showWarning('Please login to clear wishlist');
            return;
        }

        try {
            // Remove all items one by one
            for (const item of wishlist) {
                await axios.delete(`http://127.0.0.1:8000/api/products/wishlist/remove/${item.id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setWishlist([]);
            showSuccess('Wishlist cleared');
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            showError('Failed to clear wishlist');
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                toggleWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
            }}>
            {children}
        </WishlistContext.Provider>
    );
};
