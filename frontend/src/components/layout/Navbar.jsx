


import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, ChevronDown } from 'lucide-react';

import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';

function PremiumBlackWhiteNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [navTextColor, setNavTextColor] = useState('white');
    const [itemCount, setItemCount] = useState(0);

    const cartContext = useContext(CartContext);
    const wishlistContext = useContext(WishlistContext);

    const cart = cartContext?.cart || [];
    const wishlist = wishlistContext?.wishlist || [];

    // ================= LOGIN CHECK =================
    useEffect(() => {
        const token = localStorage.getItem('access');
        setIsLoggedIn(!!token);
    }, [location.pathname]);

    // ================= CART COUNT =================
    useEffect(() => {
        const token = localStorage.getItem('access');

        if (!token) {
            setItemCount(0);
            return;
        }

        const items = Array.isArray(cart) ? cart : cart?.items || [];

        const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

        setItemCount(totalItems);
    }, [cart]);

    // ================= NAV COLOR =================
    useEffect(() => {
        const isHomePage = location.pathname === '/';

        if (!isHomePage) {
            setNavTextColor('black');
            return;
        }

        const updateColor = () => {
            const scrollY = window.scrollY;

            if (scrollY < 745) setNavTextColor('white');
            else if (scrollY < 2120) setNavTextColor('black');
            else if (scrollY < 3685) setNavTextColor('white');
            else setNavTextColor('black');
        };

        window.addEventListener('scroll', updateColor);
        updateColor();

        return () => window.removeEventListener('scroll', updateColor);
    }, [location.pathname]);

    // ================= ACTIONS =================
    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        setIsLoggedIn(false);
        navigate('/login');
    };

    const openCartPage = () => navigate('/cart');

    const textColorClass = navTextColor === 'white' ? 'text-white' : 'text-black';

    const hoverColorClass = navTextColor === 'white' ? 'hover:text-gray-300' : 'hover:text-gray-700';

    // ================= NAV ITEMS =================
    const navItems = [
        { name: 'NEW ARRIVALS', route: '/new-arrivals' },
        { name: 'MEN', route: '/shop/men' },
        { name: 'WOMEN', route: '/shop/women' },
        { name: 'KIDS', route: '/shop/kids' },
        { name: 'SALE', route: '/products?sale=true' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-transparent py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative">
                {/* LOGO */}
                <div className="flex-shrink-0 z-10">
                    <img
                        src={navTextColor === 'white' ? '/static/logo.png' : '/static/logo2.png'}
                        className="h-24 object-contain cursor-pointer"
                        alt="logo"
                        onClick={() => navigate('/')}
                    />
                </div>

                {/* CENTER NAV ITEMS */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 hidden lg:flex gap-10 xl:gap-12 text-xs font-bold tracking-[0.2em] ${textColorClass}`}>
                    {navItems.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(item.route)}
                            className={`flex items-center gap-1 transition-all duration-200 ${hoverColorClass}`}>
                            {item.name}
                            <ChevronDown size={14} />
                        </button>
                    ))}
                </div>

                {/* RIGHT SIDE */}
                <div className={`flex items-center gap-4 z-10 ${textColorClass}`}>
                    {/* WISHLIST */}
                    {isLoggedIn && (
                        <Link to="/wishlist" className="relative">
                            <Heart size={18} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* CART */}
                    {isLoggedIn && (
                        <button onClick={openCartPage} className="relative">
                            <ShoppingBag size={18} />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* USER */}
                    {!isLoggedIn ? (
                        <Link to="/login">
                            <User size={18} />
                        </Link>
                    ) : (
                        <>
                            <Link to="/profile">
                                <User size={18} />
                            </Link>

                            <button onClick={handleLogout} className="text-xs font-bold hover:text-red-500 transition">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default PremiumBlackWhiteNavbar;
