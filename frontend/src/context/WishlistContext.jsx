import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);

    // ================= LOAD =================
    useEffect(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            setWishlist(saved ? JSON.parse(saved) : []);
        } catch {
            setWishlist([]);
        }
    }, []);

    // ================= SYNC =================
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // ================= TOGGLE =================
    const toggleWishlist = (product) => {
        if (!product?.id) return;

        setWishlist((prev) => {
            const exists = prev.some((item) => item.id === product.id);

            const updated = exists ? prev.filter((item) => item.id !== product.id) : [...prev, product];

            return updated;
        });
    };

    // ================= REMOVE (IMPORTANT) =================
    const removeFromWishlist = (id) => {
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
