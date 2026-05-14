// pages/Profile.jsx - Fixed API Endpoints
import { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import {
    User,
    Mail,
    Calendar,
    Package,
    Heart,
    ShoppingBag,
    LogOut,
    Settings,
    Edit2,
    MapPin,
    Phone,
    Award,
    TrendingUp,
    Shield,
    Clock,
    ChevronRight,
    Camera,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Eye,
    Truck,
    CreditCard,
    XCircle,
    Trash2,
    Plus,
    AlertTriangle,
} from 'lucide-react';

function Profile() {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [hasPendingOrders, setHasPendingOrders] = useState(false);
    const fileInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '',
    });

    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
    });

    useEffect(() => {
        fetchUserData();
        fetchWishlist();
        fetchAddresses();
    }, []);

    // Check for pending orders
    useEffect(() => {
        if (orders.length > 0) {
            const pendingStatuses = ['pending', 'processing', 'shipped', 'confirmed', 'out_for_delivery'];
            const hasUnconfirmed = orders.some((order) => pendingStatuses.includes(order.status?.toLowerCase()));
            setHasPendingOrders(hasUnconfirmed);
        } else {
            setHasPendingOrders(false);
        }
    }, [orders]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }

            // Get user profile from token - use the users/me/ endpoint
            const profileRes = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(profileRes.data);

            setEditForm({
                username: profileRes.data.username || '',
                email: profileRes.data.email || '',
                phone: profileRes.data.phone || '',
                bio: profileRes.data.bio || '',
            });

            // Get orders
            const ordersRes = await axios.get('http://127.0.0.1:8000/api/orders/my-orders/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(ordersRes.data || []);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;

            // Get wishlist from localStorage first
            const localWishlist = localStorage.getItem('wishlist');
            if (localWishlist) {
                const parsed = JSON.parse(localWishlist);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setWishlistItems(parsed);
                    return;
                }
            }
            setWishlistItems([]);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistItems([]);
        }
    };

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;

            const addressRes = await axios.get('http://127.0.0.1:8000/api/users/addresses/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(addressRes.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setAddresses([]);
        }
    };

    const addNewAddress = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login');
            navigate('/login');
            return;
        }

        if (
            !newAddress.full_name ||
            !newAddress.phone ||
            !newAddress.address ||
            !newAddress.city ||
            !newAddress.state ||
            !newAddress.pincode
        ) {
            setErrorMessage('Please fill all address fields');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/addresses/', newAddress, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAddresses([...addresses, response.data]);
            setShowAddressForm(false);
            setNewAddress({
                full_name: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                is_default: false,
            });
            setSuccessMessage('Address added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding address:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to add address');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const deleteAddress = async (addressId) => {
        const token = localStorage.getItem('access');
        if (!token) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/addresses/${addressId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(addresses.filter((addr) => addr.id !== addressId));
            setSuccessMessage('Address deleted');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting address:', error);
            setErrorMessage('Failed to delete address');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const setDefaultAddress = async (addressId) => {
        const token = localStorage.getItem('access');
        if (!token) return;

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/users/addresses/${addressId}/set-default/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setAddresses(
                addresses.map((addr) => ({
                    ...addr,
                    is_default: addr.id === addressId,
                })),
            );
            setSuccessMessage('Default address updated');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error setting default address:', error);
            setErrorMessage('Failed to set default address');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const removeFromWishlist = async (productId) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
        const localWishlist = localStorage.getItem('wishlist');
        if (localWishlist) {
            const parsed = JSON.parse(localWishlist);
            const updated = parsed.filter((p) => p.id !== productId);
            localStorage.setItem('wishlist', JSON.stringify(updated));
        }
        toggleWishlist(productId);
        setSuccessMessage('Removed from wishlist');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleAddToCart = async (product, e) => {
        e.stopPropagation();
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login to add items to cart');
            navigate('/login');
            return;
        }
        setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
        try {
            await addToCart(product.id, 1);
            removeFromWishlist(product.id);
            setSuccessMessage(`${product.name} added to cart!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Add to cart error:', error);
            setErrorMessage('Failed to add to cart');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setTimeout(() => {
                setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
            }, 500);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('profile_picture', file);
        setUploading(true);
        setErrorMessage('');
        try {
            const token = localStorage.getItem('access');
            const response = await axios.put('http://127.0.0.1:8000/api/users/profile/', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setUser((prev) => ({ ...prev, profile_picture: response.data.profile_picture }));
            setSuccessMessage('Profile picture updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage('Failed to upload image');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
        setUploading(true);
        setErrorMessage('');
        try {
            const token = localStorage.getItem('access');
            await axios.put(
                'http://127.0.0.1:8000/api/users/profile/',
                { profile_picture: null },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
            );
            setUser((prev) => ({ ...prev, profile_picture: null }));
            setSuccessMessage('Profile picture removed successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setShowImageModal(false);
        } catch (error) {
            console.error('Delete error:', error);
            setErrorMessage('Failed to remove profile picture');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaveLoading(true);
        setErrorMessage('');
        try {
            const token = localStorage.getItem('access');
            const response = await axios.put('http://127.0.0.1:8000/api/users/profile/', editForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser((prev) => ({ ...prev, ...response.data }));
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setErrorMessage('Failed to save profile');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setSaveLoading(false);
        }
    };
    // Profile.jsx - Update the handleDeleteAccount function

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            setErrorMessage('Please login first');
            return;
        }

        if (hasPendingOrders) {
            setErrorMessage(
                '❌ Cannot delete account: You have pending/processing orders. Please complete or cancel them first.',
            );
            setTimeout(() => setErrorMessage(''), 5000);
            setShowDeleteConfirm(false);
            return;
        }

        setSaveLoading(true);
        try {
            // ✅ USE CORRECT ENDPOINT - 'delete-account/'
            const response = await axios.delete('http://127.0.0.1:8000/api/users/delete-account/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success || response.status === 200) {
                // Clear all local storage
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                localStorage.removeItem('cart');
                localStorage.removeItem('wishlist');
                localStorage.removeItem('admin_access');
                localStorage.removeItem('admin_refresh');
                localStorage.removeItem('isAdmin');

                setSuccessMessage('Account deleted successfully');
                setTimeout(() => {
                    navigate('/register');
                }, 2000);
            } else {
                throw new Error(response.data.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete account error:', error);

            if (error.response?.status === 400) {
                setErrorMessage(error.response.data?.error || 'Cannot delete account with pending orders');
            } else if (error.response?.status === 401) {
                setErrorMessage('Session expired. Please login again.');
            } else {
                setErrorMessage('Failed to delete account. Please try again later.');
            }
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setSaveLoading(false);
            setShowDeleteConfirm(false);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');
    const getProfileImageUrl = () => {
        if (user?.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `http://127.0.0.1:8000${user.profile_picture}`;
        }
        return null;
    };

    const getTotalSpent = () => orders.reduce((total, order) => total + (parseFloat(order.total_price) || 0), 0);
    const getOrderStats = () => ({
        total: orders.length,
        delivered: orders.filter((o) => o.status === 'delivered').length,
        pending: orders.filter((o) => o.status === 'pending').length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
    });
    const getItemPrice = (item) => item.price || item.product?.price || item.item_price || 0;
    const getItemTotal = (item) => getItemPrice(item) * item.quantity;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const orderStats = getOrderStats();
    const totalSpent = getTotalSpent();
    const profileImage = getProfileImageUrl();

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Messages */}
                {successMessage && (
                    <div className="fixed top-24 right-4 z-50 animate-slide-down">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                            <CheckCircle size={16} /> {successMessage}
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="fixed top-24 right-4 z-50 animate-slide-down">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                            <AlertCircle size={16} /> {errorMessage}
                        </div>
                    </div>
                )}

                {/* Centered "My Account" title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black">My Account</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your profile and track your orders</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-28">
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="relative inline-block group">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={user?.username}
                                            onClick={() => setShowImageModal(true)}
                                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-90 transition"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                            {getInitials(user?.username)}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition disabled:opacity-50">
                                        {uploading ? (
                                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Camera size={12} className="text-gray-600" />
                                        )}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleProfilePictureUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-black mt-4">{user?.username}</h2>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-600 font-medium">Active</span>
                                </div>
                            </div>

                            {/* ✅ FIXED: My Orders button now navigates to /my-orders */}
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <User size={18} />
                                        <span className="text-sm font-medium">Overview</span>
                                    </div>
                                </button>

                                {/* ✅ My Orders - Navigates to separate page */}
                                <button
                                    onClick={() => navigate('/my-orders')}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition text-gray-600 hover:bg-gray-100">
                                    <div className="flex items-center gap-3">
                                        <Package size={18} />
                                        <span className="text-sm font-medium">My Orders</span>
                                    </div>
                                    {orders.length > 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                            {orders.length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${activeTab === 'addresses' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} />
                                        <span className="text-sm font-medium">Addresses</span>
                                    </div>
                                    {addresses.length > 0 && (
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {addresses.length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${activeTab === 'settings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <Settings size={18} />
                                        <span className="text-sm font-medium">Settings</span>
                                    </div>
                                </button>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="lg:col-span-3">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Total Orders',
                                            value: orderStats.total,
                                            icon: ShoppingBag,
                                            color: 'bg-blue-50 text-blue-600',
                                        },
                                        {
                                            label: 'Total Spent',
                                            value: `₹${totalSpent.toLocaleString()}`,
                                            icon: Award,
                                            color: 'bg-green-50 text-green-600',
                                        },
                                        {
                                            label: 'Wishlist',
                                            value: wishlistItems.length,
                                            icon: Heart,
                                            color: 'bg-red-50 text-red-600',
                                        },
                                        {
                                            label: 'Addresses',
                                            value: addresses.length,
                                            icon: MapPin,
                                            color: 'bg-purple-50 text-purple-600',
                                        },
                                    ].map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                            <div
                                                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                                                <stat.icon size={18} />
                                            </div>
                                            <p className="text-2xl font-bold text-black">{stat.value}</p>
                                            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-black mb-4">Welcome back, {user?.username}!</h3>
                                    <p className="text-gray-600">
                                        You have {orders.length} orders and {wishlistItems.length} items in your wishlist.
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-black">Account Information</h3>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-black transition">
                                                <Edit2 size={14} /> Edit Profile
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="text-sm text-gray-400 hover:text-black transition">
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={saveLoading}
                                                    className="flex items-center gap-1 text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition">
                                                    {saveLoading ? (
                                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Save size={12} />
                                                    )}{' '}
                                                    Save
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <User size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Username</p>
                                                    <p className="text-sm font-medium text-black">{user?.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Mail size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Email Address</p>
                                                    <p className="text-sm font-medium text-black">{user?.email}</p>
                                                </div>
                                            </div>
                                            {user?.phone && (
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <Phone size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Phone</p>
                                                        <p className="text-sm font-medium text-black">{user?.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                placeholder="Username"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                placeholder="Email"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                placeholder="Phone Number"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                placeholder="Bio"
                                                rows="3"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-black">Saved Addresses</h3>
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="flex items-center gap-1 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                        <Plus size={14} /> Add New Address
                                    </button>
                                </div>

                                {showAddressForm && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <h4 className="font-semibold mb-3">New Address</h4>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={newAddress.full_name}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, full_name: e.target.value })
                                                }
                                                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Address"
                                                value={newAddress.address}
                                                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                                className="md:col-span-2 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Pincode"
                                                value={newAddress.pincode}
                                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={newAddress.is_default}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, is_default: e.target.checked })
                                                    }
                                                    className="rounded"
                                                />
                                                <span className="text-sm">Set as default address</span>
                                            </label>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={addNewAddress}
                                                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
                                                Save Address
                                            </button>
                                            <button
                                                onClick={() => setShowAddressForm(false)}
                                                className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MapPin size={40} className="mx-auto text-gray-300 mb-2" />
                                            <p className="text-gray-500">No saved addresses</p>
                                        </div>
                                    ) : (
                                        addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        {address.is_default && (
                                                            <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2">
                                                                Default
                                                            </span>
                                                        )}
                                                        <p className="font-semibold text-black">
                                                            {address.full_name || user?.username}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            📞 {address.phone || user?.phone}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!address.is_default && (
                                                            <button
                                                                onClick={() => setDefaultAddress(address.id)}
                                                                className="text-xs text-blue-600 hover:text-blue-700">
                                                                Set Default
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteAddress(address.id)}
                                                            className="text-red-500 hover:text-red-600">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab - WITH DELETE ACCOUNT BUTTON */}
                    {activeTab === 'settings' && (
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-black">Account Settings</h3>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-black transition">
                                            <Edit2 size={14} /> Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="text-sm text-gray-400 hover:text-black transition">
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saveLoading}
                                                className="flex items-center gap-1 text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 transition">
                                                {saveLoading ? (
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save size={12} />
                                                )}{' '}
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!isEditing ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <User size={18} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Username</p>
                                                <p className="text-sm font-medium text-black">{user?.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <Mail size={18} className="text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Email Address</p>
                                                <p className="text-sm font-medium text-black">{user?.email}</p>
                                            </div>
                                        </div>
                                        {user?.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Phone size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Phone</p>
                                                    <p className="text-sm font-medium text-black">{user?.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                            placeholder="Username"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            placeholder="Email"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            placeholder="Phone Number"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                        <textarea
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            placeholder="Bio"
                                            rows="3"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                        />
                                    </div>
                                )}

                                {/* Danger Zone - Delete Account */}
                                <div className="mt-8 pt-6 border-t border-red-200">
                                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-red-800">Delete Account</p>
                                                <p className="text-sm text-red-600">
                                                    {hasPendingOrders
                                                        ? '❌ You have pending orders. Complete them before deleting your account.'
                                                        : 'Permanently delete your account and all data. This action cannot be undone.'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                disabled={hasPendingOrders}
                                                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                                                    hasPendingOrders
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}>
                                                <Trash2 size={16} /> Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {showImageModal && profileImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowImageModal(false)}>
                    <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                            <div className="relative bg-black">
                                <img
                                    src={profileImage}
                                    alt={user?.username}
                                    className="w-full h-auto max-h-[60vh] object-contain"
                                />
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full hover:bg-white transition">
                                    <X size={18} className="text-gray-800" />
                                </button>
                            </div>
                            <div className="p-5 text-center">
                                <h3 className="text-lg font-semibold text-black mb-2">Profile Picture</h3>
                                <p className="text-sm text-gray-500 mb-4">Click below to remove your profile picture</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleDeleteProfilePicture}
                                        disabled={uploading}
                                        className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50">
                                        {uploading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}{' '}
                                        Remove Picture
                                    </button>
                                    <button
                                        onClick={() => setShowImageModal(false)}
                                        className="px-5 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowDeleteConfirm(false)}>
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 text-center"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">Delete Account?</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            This action <span className="font-bold text-red-600">cannot be undone</span>. All your data
                            including orders, wishlist, and addresses will be permanently deleted.
                        </p>
                        {hasPendingOrders && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-4">
                                ⚠️ You have pending orders. Please complete them before deleting your account.
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={hasPendingOrders}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50">
                                Yes, Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    getItemPrice={getItemPrice}
                    getItemTotal={getItemTotal}
                />
            )}
        </div>
    );
}
/// Order Details Modal
const OrderDetailsModal = ({ order, onClose, getItemPrice, getItemTotal }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Define order steps based on status
    const getOrderSteps = () => {
        return [
            { key: 'pending', label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
            { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Your order has been confirmed' },
            { key: 'processing', label: 'Processing', icon: Package, description: 'Your order is being processed' },
            { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order has been shipped' },
            {
                key: 'out_for_delivery',
                label: 'Out for Delivery',
                icon: Truck,
                description: 'Your order is out for delivery',
            },
            { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered' },
        ];
    };

    const getCurrentStepIndex = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
        const index = steps.indexOf(status?.toLowerCase());

        // If status is cancelled, return -1
        if (status?.toLowerCase() === 'cancelled') return -1;

        return index >= 0 ? index : 0;
    };

    const isStepCompleted = (stepIndex, currentIndex) => {
        return stepIndex <= currentIndex;
    };

    const getStatusDisplay = (status) => {
        switch (status?.toLowerCase()) {
            case 'out_for_delivery':
                return 'Out for Delivery';
            default:
                return status?.toUpperCase() || 'PENDING';
        }
    };

    const currentStepIndex = getCurrentStepIndex(order.status);
    const steps = getOrderSteps();

    // If order is cancelled, show cancelled message
    if (order.status?.toLowerCase() === 'cancelled') {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}>
                <div
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center rounded-t-2xl z-20 relative">
                        <div>
                            <h2 className="text-xl font-bold text-black">Order Details</h2>
                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Cancelled Status */}
                        <div className="flex items-center justify-center p-6 bg-red-50 rounded-xl border border-red-200">
                            <XCircle size={48} className="text-red-500 mr-3" />
                            <div>
                                <h3 className="text-lg font-bold text-red-700">Order Cancelled</h3>
                                <p className="text-sm text-red-600">This order has been cancelled</p>
                            </div>
                        </div>

                        {/* Order Date */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500">Order Date</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Payment Status</p>
                                <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.is_paid ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                                <Package size={16} /> Order Items
                            </h3>
                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                                        <img
                                            src={
                                                item.product?.image
                                                    ? `http://127.0.0.1:8000${item.product.image}`
                                                    : 'https://placehold.co/60x60?text=Product'
                                            }
                                            alt={item.product?.name}
                                            className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                                            onError={(e) => (e.target.src = 'https://placehold.co/60x60?text=Product')}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-black">{item.product?.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-xs text-gray-400">
                                                ₹{getItemPrice(item).toLocaleString()} each
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-black">
                                                ₹{getItemTotal(item).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-700">₹{parseFloat(order.total_price).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="text-green-600">FREE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax (5%)</span>
                                    <span className="text-gray-700">
                                        ₹{Math.round(parseFloat(order.total_price) * 0.05).toLocaleString()}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-black">Total</span>
                                        <span className="text-black text-lg">
                                            ₹{parseFloat(order.total_price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="font-medium text-black mb-2 flex items-center gap-2">
                                    <MapPin size={14} /> Shipping Address
                                </p>
                                <p className="text-sm text-gray-600">{order.shipping_address}</p>
                            </div>
                        )}

                        {/* Payment Information */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-black mb-2 flex items-center gap-2">
                                <CreditCard size={14} /> Payment Information
                            </p>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500">Payment Method</p>
                                    <p className="text-sm text-gray-700">
                                        {order.payment_method === 'cod'
                                            ? 'Cash on Delivery'
                                            : order.payment_method?.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 rounded-b-2xl z-20 relative">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                            Close
                        </button>
                        <Link
                            to={`/order/${order.id}`}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition text-center">
                            View Full Details
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center rounded-t-2xl z-20 relative">
                    <div>
                        <h2 className="text-xl font-bold text-black">Order Details</h2>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info - Date and Order ID */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="text-xs text-gray-500">Order Date</p>
                            <p className="text-sm font-medium text-gray-800">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Current Status</p>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                {getStatusDisplay(order.status)}
                            </span>
                        </div>
                    </div>

                    {/* Order Tracker/Timeline */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                        <h3 className="font-semibold text-black mb-6 flex items-center gap-2">
                            <Clock size={16} /> Order Timeline
                        </h3>
                        <div className="relative">
                            {/* Steps */}
                            <div className="space-y-0">
                                {steps.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = isStepCompleted(index, currentStepIndex);
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                                            {/* Icon Circle */}
                                            <div className="relative z-10">
                                                <div
                                                    className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center
                                                    transition-all duration-300
                                                    ${
                                                        isCompleted
                                                            ? 'bg-green-500 shadow-lg shadow-green-200'
                                                            : isCurrent
                                                              ? 'bg-blue-500 shadow-lg shadow-blue-200 ring-4 ring-blue-100'
                                                              : 'bg-gray-300'
                                                    }
                                                `}>
                                                    <StepIcon size={18} className="text-white" />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4
                                                        className={`
                                                        font-semibold
                                                        ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                                                    `}>
                                                        {step.label}
                                                    </h4>
                                                    {isCurrent && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                    {isCompleted && !isCurrent && (
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    )}
                                                </div>
                                                <p
                                                    className={`text-sm mt-1 ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {step.description}
                                                </p>
                                                {isCurrent && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 rounded-full animate-pulse"
                                                                    style={{ width: '100%' }}></div>
                                                            </div>
                                                            <span className="text-xs text-blue-600 font-medium">
                                                                In Progress
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                            <Package size={16} /> Order Items
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                                    <img
                                        src={
                                            item.product?.image
                                                ? `http://127.0.0.1:8000${item.product.image}`
                                                : 'https://placehold.co/60x60?text=Product'
                                        }
                                        alt={item.product?.name}
                                        className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                                        onError={(e) => (e.target.src = 'https://placehold.co/60x60?text=Product')}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-black">{item.product?.name}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        <p className="text-xs text-gray-400">₹{getItemPrice(item).toLocaleString()} each</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black">₹{getItemTotal(item).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-700">₹{parseFloat(order.total_price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax (5%)</span>
                                <span className="text-gray-700">
                                    ₹{Math.round(parseFloat(order.total_price) * 0.05).toLocaleString()}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span className="text-black">Total</span>
                                    <span className="text-black text-lg">
                                        ₹{parseFloat(order.total_price).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="font-medium text-black mb-2 flex items-center gap-2">
                                <MapPin size={14} /> Shipping Address
                            </p>
                            <p className="text-sm text-gray-600">{order.shipping_address}</p>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="font-medium text-black mb-2 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Information
                        </p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500">Payment Method</p>
                                <p className="text-sm text-gray-700">
                                    {order.payment_method === 'cod'
                                        ? 'Cash on Delivery'
                                        : order.payment_method?.toUpperCase()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Payment Status</p>
                                <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${order.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.is_paid ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 rounded-b-2xl z-20 relative">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border bg-black text-white border-gray-300 rounded-lg text-sm font-medium hover:bg-black/80 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Profile;
