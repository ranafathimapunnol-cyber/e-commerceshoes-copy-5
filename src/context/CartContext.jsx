// context/CartContext.jsx - Buy Now items counted until order confirmed
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [cartCount, setCartCount] = useState(0);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
                // ✅ Count ALL items (including Buy Now) because they stay in cart until order confirms
                const totalItems = parsedCart.items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            } catch {
                setCart({ items: [] });
                setCartCount(0);
            }
        }
    }, []);

    // Save cart to localStorage and update count
    const updateCartAndCount = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        // ✅ Count ALL items (including Buy Now)
        const totalItems = newCart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
    };

    // Regular Add to Cart
    const addToCart = (productId, quantity = 1, productData = {}) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.items.findIndex(
                (item) => (item.product_id || item.id) === productId && !item.is_buy_now,
            );

            let newItems;
            if (existingIndex !== -1) {
                const updated = [...prevCart.items];
                updated[existingIndex].quantity = Math.min(10, updated[existingIndex].quantity + quantity);
                newItems = updated;
            } else {
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
                newItems = [...prevCart.items, newItem];
            }

            const newCart = { ...prevCart, items: newItems };
            // ✅ Count ALL items
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    // Buy Now - Remove existing Buy Now items first, then add new one
    const buyNow = (productId, quantity = 1, productData = {}) => {
        setCart((prevCart) => {
            // First, remove ALL existing Buy Now items
            const itemsWithoutBuyNow = prevCart.items.filter((item) => item.is_buy_now !== true);

            // Then add the new Buy Now item
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

            const newCart = {
                ...prevCart,
                items: [...itemsWithoutBuyNow, newBuyNowItem],
            };

            // ✅ Count ALL items (including Buy Now - they stay in cart until order confirms)
            const totalItems = [...itemsWithoutBuyNow, newBuyNowItem].reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
            localStorage.setItem('cart', JSON.stringify(newCart));

            return newCart;
        });
    };

    // Get ONLY Buy Now items (for checkout)
    const getBuyNowItems = () => {
        return cart.items.filter((item) => item.is_buy_now === true);
    };

    // Get regular cart items (non-buy-now)
    const getRegularItems = () => {
        return cart.items.filter((item) => item.is_buy_now !== true);
    };

    // Check if there are any Buy Now items
    const hasBuyNowItems = () => {
        return cart.items.some((item) => item.is_buy_now === true);
    };

    // Clear ONLY Buy Now items (after order confirmation)
    const clearBuyNowItems = () => {
        setCart((prevCart) => {
            const newCart = {
                items: prevCart.items.filter((item) => item.is_buy_now !== true),
            };
            // ✅ Update count after removing Buy Now items (order confirmed)
            const totalItems = newCart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return newCart;
        });
    };

    // Update cart quantity
    const updateCart = (itemId, newQuantity) => {
        setCart((prevCart) => {
            const updatedItems = prevCart.items.map((item) => {
                const uniqueId = item.cart_item_id || item.id;
                if (uniqueId === itemId) {
                    return { ...item, quantity: Math.max(1, Math.min(99, newQuantity)) };
                }
                return item;
            });
            const newCart = { ...prevCart, items: updatedItems };

            // ✅ Count ALL items
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
            localStorage.setItem('cart', JSON.stringify(newCart));

            return newCart;
        });
    };

    // Remove item from cart
    const removeItem = (itemId) => {
        setCart((prevCart) => {
            const updatedItems = prevCart.items.filter((item) => {
                const uniqueId = item.cart_item_id || item.id;
                return uniqueId !== itemId;
            });
            const newCart = { ...prevCart, items: updatedItems };

            // ✅ Count ALL items
            const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
            localStorage.setItem('cart', JSON.stringify(newCart));

            return newCart;
        });
    };

    // Clear entire cart
    const clearCart = () => {
        setCart({ items: [] });
        setCartCount(0);
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
    };

    // Get cart count (ALL items including Buy Now)
    const getCartCount = () => cartCount;

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
            }}>
            {children}
        </CartContext.Provider>
    );
};
