// context/WishlistContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { showToast, showInfo, showSuccess, showError } from '../utils/toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (error) {
                console.error('Error loading wishlist:', error);
                setWishlist([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        const productId = product.id || product.product_id;

        setWishlist((prev) => {
            const exists = prev.some((item) => (item.id || item.product_id) === productId);

            if (exists) {
                // Remove from wishlist
                showInfo(`${product.name || product.product_name} removed from wishlist`);
                return prev.filter((item) => (item.id || item.product_id) !== productId);
            } else {
                // Add to wishlist
                showSuccess(`${product.name || product.product_name} added to wishlist`);
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (productId) => {
        return wishlist.some((item) => (item.id || item.product_id) === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
        showInfo('Wishlist cleared');
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
            }}>
            {children}
        </WishlistContext.Provider>
    );
};
