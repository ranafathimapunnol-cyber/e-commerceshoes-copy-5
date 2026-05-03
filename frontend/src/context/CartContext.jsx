import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // =========================
    // FETCH CART
    // =========================
    const fetchCart = async () => {
        // CHECK LOGIN FIRST
        const token = localStorage.getItem('access');

        // IF NO LOGIN -> STOP
        if (!token) {
            setCart([]);
            return;
        }

        try {
            setLoading(true);

            const res = await api.get('/cart/');

            setCart(res.data || []);
        } catch (err) {
            console.error('Cart fetch error:', err.response?.data || err.message);

            // TOKEN EXPIRED
            if (err.response?.data?.code === 'token_not_valid') {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');

                setCart([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD CART ONLY IF LOGGED IN
    // =========================
    useEffect(() => {
        const token = localStorage.getItem('access');

        if (token) {
            fetchCart();
        }
    }, []);

    // =========================
    // ADD TO CART
    // =========================
    const addToCart = async (product_id, quantity = 1) => {
        const token = localStorage.getItem('access');

        // LOGIN REQUIRED
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

            return true;
        } catch (err) {
            console.error('Add to cart error:', err.response?.data || err.message);

            return false;
        }
    };

    // =========================
    // UPDATE CART
    // =========================
    const updateCart = async (item_id, quantity) => {
        try {
            await api.put('/cart/update/', {
                item_id,
                quantity,
            });

            await fetchCart();
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    // =========================
    // REMOVE ITEM
    // =========================
    const removeItem = async (item_id) => {
        try {
            await api.delete(`/cart/remove/${item_id}/`);

            await fetchCart();
        } catch (err) {
            console.error(err.response?.data || err.message);
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
