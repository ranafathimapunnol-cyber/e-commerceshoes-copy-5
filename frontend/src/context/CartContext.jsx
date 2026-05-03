import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        const token = localStorage.getItem('access');

        if (!token) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get('/cart/');
            setCart(res.data || []);
        } catch (err) {
            console.error(err);

            if (err.response?.data?.code === 'token_not_valid') {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                setCart([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('access')) {
            fetchCart();
        }
    }, []);

    // ================= FIXED =================
    const addToCart = async (product_id, quantity = 1) => {
        const token = localStorage.getItem('access');

        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return false;
        }

        try {
            await api.post('/cart/add/', {
                product: product_id,
                quantity,
            });

            await fetchCart();

            setOpen(true);

            return true; // 🔥 IMPORTANT FOR WISHLIST SYNC
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const updateCart = async (item_id, quantity) => {
        try {
            await api.put('/cart/update/', {
                item_id,
                quantity,
            });

            await fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (item_id) => {
        try {
            await api.delete(`/cart/remove/${item_id}/`);
            await fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                updateCart,
                removeItem,
                open,
                setOpen,
                fetchCart,
            }}>
            {children}
        </CartContext.Provider>
    );
};
