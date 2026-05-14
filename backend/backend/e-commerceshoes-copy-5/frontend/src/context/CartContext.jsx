// context/CartContext.jsx - FIXED: Cart items persist on refresh
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [cartCount, setCartCount] = useState(0);
    const [buyNowItemId, setBuyNowItemId] = useState(null);
    const [lastUser, setLastUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false); // ✅ Track initialization

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const currentUser = localStorage.getItem('access');

        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
                const totalItems = parsedCart.items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            } catch {
                setCart({ items: [] });
                setCartCount(0);
                localStorage.setItem('cart', JSON.stringify({ items: [] }));
            }
        } else {
            // Initialize empty cart in localStorage
            localStorage.setItem('cart', JSON.stringify({ items: [] }));
        }

        setLastUser(currentUser);
        setIsInitialized(true);
    }, []);

    // ✅ FIX: Detect user change and clear cart for new users (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const currentUser = localStorage.getItem('access');

        if (lastUser !== currentUser) {
            if (!lastUser && currentUser) {
                // New user logged in - start with empty cart
                setCart({ items: [] });
                setCartCount(0);
                localStorage.setItem('cart', JSON.stringify({ items: [] }));
            }
            setLastUser(currentUser);
        }
    }, [lastUser, isInitialized]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
        }
    }, [cart, isInitialized]);

    // Regular Add to Cart
    const addToCart = (productId, quantity = 1, productData = {}) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.items.findIndex(
                (item) => (item.product_id || item.id) === productId && !item.is_buy_now,
            );

            if (existingIndex !== -1) {
                const updated = [...prevCart.items];
                updated[existingIndex].quantity = Math.min(10, updated[existingIndex].quantity + quantity);
                return { ...prevCart, items: updated };
            }

            const newItem = {
                cart_item_id: Date.now(),
                id: productId,
                product_id: productId,
                quantity,
                product_name: productData.product_name || 'Product',
                product_price: productData.product_price || 0,
                product_image: productData.product_image || '',
                brand: productData.brand || '',
                is_buy_now: false,
                added_at: new Date().toISOString(),
            };

            return {
                ...prevCart,
                items: [...prevCart.items, newItem],
            };
        });
    };

    // Buy Now - Adds item with is_buy_now flag, but KEEPS existing cart items
    const buyNow = (productId, quantity = 1, productData = {}) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.items.findIndex(
                (item) => (item.product_id || item.id) === productId && item.is_buy_now === true,
            );

            if (existingIndex !== -1) {
                const updated = [...prevCart.items];
                updated[existingIndex].quantity = Math.min(10, updated[existingIndex].quantity + quantity);
                setBuyNowItemId(updated[existingIndex].cart_item_id);
                return { ...prevCart, items: updated };
            }

            const newBuyNowItem = {
                cart_item_id: Date.now(),
                id: productId,
                product_id: productId,
                quantity,
                product_name: productData.product_name || 'Product',
                product_price: productData.product_price || 0,
                product_image: productData.product_image || '',
                brand: productData.brand || '',
                is_buy_now: true,
                added_at: new Date().toISOString(),
            };

            setBuyNowItemId(newBuyNowItem.cart_item_id);

            return {
                ...prevCart,
                items: [...prevCart.items, newBuyNowItem],
            };
        });
    };

    // Get Buy Now items
    const getBuyNowItems = () => {
        return cart.items.filter((item) => item.is_buy_now === true);
    };

    // Get regular items (for cart display and regular checkout)
    const getRegularItems = () => {
        return cart.items.filter((item) => item.is_buy_now !== true);
    };

    // Check if has Buy Now items
    const hasBuyNowItems = () => {
        return cart.items.some((item) => item.is_buy_now === true);
    };

    // Clear ONLY Buy Now items after order (keep regular cart items)
    const clearBuyNowItems = () => {
        setCart((prevCart) => ({
            items: prevCart.items.filter((item) => item.is_buy_now !== true),
        }));
        setBuyNowItemId(null);
    };

    // Update quantity
    const updateCart = (itemId, newQuantity) => {
        setCart((prevCart) => {
            const updatedItems = prevCart.items.map((item) => {
                const uniqueId = item.cart_item_id || item.id;
                if (uniqueId === itemId) {
                    return { ...item, quantity: Math.max(1, Math.min(99, newQuantity)) };
                }
                return item;
            });
            return { ...prevCart, items: updatedItems };
        });
    };

    // Remove item
    const removeItem = (itemId) => {
        setCart((prevCart) => ({
            ...prevCart,
            items: prevCart.items.filter((item) => {
                const uniqueId = item.cart_item_id || item.id;
                return uniqueId !== itemId;
            }),
        }));
    };

    // Clear entire cart
    const clearCart = () => {
        setCart({ items: [] });
        setBuyNowItemId(null);
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
    };

    // Get cart count (only regular items, not buy now)
    const getCartCount = () => {
        const regularItems = cart.items.filter((item) => item.is_buy_now !== true);
        return regularItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                addToCart,
                buyNow,
                updateCart,
                removeItem,
                clearCart,
                clearBuyNowItems,
                getBuyNowItems,
                getRegularItems,
                hasBuyNowItems,
                getCartCount,
                buyNowItemId,
            }}>
            {children}
        </CartContext.Provider>
    );
};
