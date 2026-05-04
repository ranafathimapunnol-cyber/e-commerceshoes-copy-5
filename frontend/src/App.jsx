import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import ShopByCategory from './pages/ShopByCategory';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import NewArrivals from './pages/NewArrivals';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
function AppLayout() {
    const location = useLocation();

    const hideNavbarRoutes = ['/login', '/register'];

    const hideNavbar = hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            {/* ✅ Navbar only when NOT login/register */}
            {!hideNavbar && <Navbar />}

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
                    <AppLayout />
                </BrowserRouter>
            </WishlistProvider>
        </CartProvider>
    );
}

export default App;
