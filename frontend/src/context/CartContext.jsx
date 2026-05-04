import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

import { showSuccess, showError, showInfo } from '../utils/toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // ================= FETCH CART =================
    const fetchCart = async () => {
        const token = localStorage.getItem('access');

        if (!token) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);

            // ✅ CORRECT
            const res = await api.get('/cart/');

            setCart(res.data || []);
        } catch (err) {
            console.error(err);

            if (err.response?.data?.code === 'token_not_valid') {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');

                setCart([]);

                showError('Session expired. Please login again.');
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

    // ================= ADD TO CART =================
    const addToCart = async (product_id, quantity = 1) => {
        const token = localStorage.getItem('access');

        if (!token) {
            showError('Please login first');

            setTimeout(() => {
                window.location.href = '/login';
            }, 1200);

            return false;
        }

        try {
            // ✅ CORRECT
            await api.post('/cart/add/', {
                product: product_id,
                quantity,
            });

            await fetchCart();

            setOpen(true);

            showSuccess('Added to cart 🛒');

            return true;
        } catch (err) {
            console.error(err);

            showError('Failed to add item');

            return false;
        }
    };

    // ================= UPDATE CART =================
    const updateCart = async (item_id, quantity) => {
        try {
            // ✅ CORRECT
            await api.put('/cart/update/', {
                item_id,
                quantity,
            });

            await fetchCart();

            showInfo('Cart updated');
        } catch (err) {
            console.error(err);

            showError('Failed to update cart');
        }
    };

    // ================= REMOVE =================
    const removeItem = async (item_id) => {
        try {
            await api.delete(`/cart/remove/${item_id}/`);

            await fetchCart();
        } catch (err) {
            console.error(err);

            showError('Failed to remove item');
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
