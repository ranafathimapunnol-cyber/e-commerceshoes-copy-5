import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

// ✅ ALWAYS USE ONLY id (your backend uses id)
const getId = (item) => item?.id;

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);

    // ================= LOAD =================
    useEffect(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                const parsed = JSON.parse(saved);

                // ✅ ensure only valid objects
                const clean = Array.isArray(parsed) ? parsed.filter((p) => p && p.id) : [];

                setWishlist(clean);
            }
        } catch (err) {
            console.log('Wishlist load error:', err);
            setWishlist([]);
        }
    }, []);

    // ================= SAVE =================
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // ================= TOGGLE =================
    const toggleWishlist = (product) => {
        if (!product?.id) return;

        const id = product.id;

        setWishlist((prev) => {
            const exists = prev.some((item) => item.id === id);

            if (exists) {
                return prev.filter((item) => item.id !== id);
            }

            return [...prev, product]; // store FULL product
        });
    };

    // ================= REMOVE =================
    const removeFromWishlist = (id) => {
        if (!id) return;

        setWishlist((prev) => prev.filter((item) => item.id !== id));
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
