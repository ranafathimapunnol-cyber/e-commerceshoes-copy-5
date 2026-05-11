import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import NotificationBell from './admin/components/NotificationBell';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/layout/Navbar';

// USER PAGES
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

// ADMIN PAGES
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import ProductsAdmin from './admin/pages/Products';
import AddProduct from './admin/pages/AddProduct';
import EditProduct from './admin/pages/EditProduct';
import Users from './admin/pages/Users';
import Orders from './admin/pages/Orders';
import AdminSettings from './admin/pages/AdminSettings';
import AdminReports from './admin/pages/AdminReports';

// ✅ Admin Protected Route Component
function AdminRoute({ children }) {
    const adminToken = localStorage.getItem('admin_access');
    const isAdmin = localStorage.getItem('isAdmin');

    if (!adminToken || !isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}

// User Protected Route Component
function UserRoute({ children }) {
    const token = localStorage.getItem('access');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppLayout() {
    const location = useLocation();

    // HIDE NAVBAR for admin routes and auth pages
    const hideNavbar = location.pathname.startsWith('/admin') || ['/login', '/register'].includes(location.pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}

            <Routes>
                {/* PUBLIC USER ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/shop/:category" element={<ShopByCategory />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />

                {/* PROTECTED USER ROUTES */}
                <Route
                    path="/profile"
                    element={
                        <UserRoute>
                            <Profile />
                        </UserRoute>
                    }
                />

                <Route
                    path="/my-orders"
                    element={
                        <UserRoute>
                            <MyOrders />
                        </UserRoute>
                    }
                />

                {/* ADMIN PUBLIC ROUTE - Separate Login */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* PROTECTED ADMIN ROUTES */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/products"
                    element={
                        <AdminRoute>
                            <ProductsAdmin />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/add-product"
                    element={
                        <AdminRoute>
                            <AddProduct />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/edit-product/:id"
                    element={
                        <AdminRoute>
                            <EditProduct />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <Users />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/orders"
                    element={
                        <AdminRoute>
                            <Orders />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/settings"
                    element={
                        <AdminRoute>
                            <AdminSettings />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/admin/reports"
                    element={
                        <AdminRoute>
                            <AdminReports />
                        </AdminRoute>
                    }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

// Simple socket service without complex dependencies
const simpleSocketService = {
    socket: null,
    listeners: {},

    connect(userId, userName, token, role) {
        console.log(`Socket connecting for ${role}: ${userName}`);
        // For now, just log - WebSocket implemented separately
        this.isConnected = true;
        return this;
    },

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return this;
    },

    emit(event, data) {
        console.log(`Emitting ${event}:`, data);
        return this;
    },

    disconnect() {
        console.log('Socket disconnected');
        return this;
    },
};

function App() {
    // ✅ Simple notification handler (without complex socket)
    useEffect(() => {
        // Request browser notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check for new orders via polling (simple fallback)
        const checkForNewOrders = async () => {
            try {
                const adminToken = localStorage.getItem('admin_access');
                if (adminToken) {
                    const response = await fetch('http://127.0.0.1:8000/api/orders/admin/', {
                        headers: {
                            Authorization: `Bearer ${adminToken}`,
                        },
                    });
                    // Handle response if needed
                }
            } catch (error) {
                // Silent fail
            }
        };

        // Poll every 30 seconds
        const interval = setInterval(checkForNewOrders, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <CartProvider>
            <WishlistProvider>
                <BrowserRouter>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#111',
                                color: '#fff',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                            },
                            success: {
                                icon: '✅',
                                style: {
                                    background: '#10B981',
                                },
                            },
                            error: {
                                icon: '❌',
                                style: {
                                    background: '#EF4444',
                                },
                            },
                        }}
                    />

                    <AppLayout />
                </BrowserRouter>
            </WishlistProvider>
        </CartProvider>
    );
}

export default App;
