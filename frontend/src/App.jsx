import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Category from './pages/Category';
import NewArrivals from './pages/NewArrivals';
import CategoryProducts from './pages/CategoryProducts';

import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import ProductsAdmin from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import EditProduct from './admin/pages/EditProduct';
import Users from './admin/pages/Users';
import Orders from './admin/pages/Orders';
import AdminSettings from './admin/pages/AdminSettings';
import AdminReports from './admin/pages/AdminReports';

function AdminRoute({ children }) {
    const adminToken = localStorage.getItem('admin_access');
    const isAdmin = localStorage.getItem('isAdmin');

    if (!adminToken || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

function AppContent() {
    const location = useLocation();
    const hideNavbar = location.pathname.startsWith('/admin');
    
    // Only show footer on Home page (/)
    const showFooter = location.pathname === '/';

    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ProductsAdmin /></AdminRoute>} />
                <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
                <Route path="/admin/edit-product/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/shop/:category" element={<CategoryProducts />} />
                <Route path="/sale" element={<CategoryProducts category="sale" />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {/* Footer only on Home page */}
            {showFooter && <Footer />}
        </>
    );
}

function App() {
    return (
        <Router>
            <CartProvider>
                <WishlistProvider>
                    <AppContent />
                    <ToastContainer position="bottom-right" autoClose={3000} />
                </WishlistProvider>
            </CartProvider>
        </Router>
    );
}

export default App;
