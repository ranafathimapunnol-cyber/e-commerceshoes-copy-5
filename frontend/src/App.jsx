import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import ShopByCategory from './pages/ShopByCategory';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import NewArrivals from './pages/NewArrivals';
import MyOrders from './pages/MyOrders';
import Register from './pages/Register';
import Profile from './pages/Profile';

// ✅ wrapper needed for useLocation
function AppWrapper() {
    const location = useLocation();

    return (
        <>
            {/* ✅ Navbar only if NOT login page */}
            {location.pathname !== '/login' && <Navbar />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/shop/:category" element={<ShopByCategory />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <CartProvider>
            <WishlistProvider>
                <BrowserRouter>
                    <AppWrapper />
                </BrowserRouter>
            </WishlistProvider>
        </CartProvider>
    );
}

export default App;
