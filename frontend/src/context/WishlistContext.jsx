import { createContext, useState, useEffect } from 'react';
import { showSuccess, showInfo } from '../utils/toast';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);

    // ================= GET USER KEY =================
    const getUserId = () => localStorage.getItem('userId');

    const getStorageKey = () => {
        const userId = getUserId();
        return userId ? `wishlist_${userId}` : 'wishlist_guest';
    };

    // ================= LOAD =================
    useEffect(() => {
        try {
            const saved = localStorage.getItem(getStorageKey());
            setWishlist(saved ? JSON.parse(saved) : []);
        } catch {
            setWishlist([]);
        }
    }, []);

    // ================= SYNC =================
    useEffect(() => {
        localStorage.setItem(getStorageKey(), JSON.stringify(wishlist));
    }, [wishlist]);

    // ================= RESET ON USER CHANGE =================
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem(getStorageKey());
            setWishlist(saved ? JSON.parse(saved) : []);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ================= TOGGLE =================
    const toggleWishlist = (product) => {
        if (!product?.id) return;

        setWishlist((prev) => {
            const exists = prev.some((item) => item.id === product.id);

            if (exists) {
                showInfo('Removed from wishlist');
                return prev.filter((item) => item.id !== product.id);
            } else {
                showSuccess('Added to wishlist ❤️');
                return [...prev, product];
            }
        });
    };

    // ================= REMOVE =================
    const removeFromWishlist = (id) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));

        showInfo('Removed from wishlist');
    };

    // ================= CHECK =================
    const isInWishlist = (id) => {
        return wishlist.some((item) => item.id === id);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                toggleWishlist,
                removeFromWishlist,
                isInWishlist,
            }}>
            {children}
        </WishlistContext.Provider>
    );
}
