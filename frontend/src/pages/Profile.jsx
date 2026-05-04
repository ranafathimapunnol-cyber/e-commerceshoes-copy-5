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
    Home,
    Building,
    Navigation,
    ZoomIn,
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
    const fileInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        phone: '',
        bio: '',
    });

    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    useEffect(() => {
        fetchUserData();
        fetchWishlist();
        fetchAddresses();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }

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

            const localWishlist = localStorage.getItem('wishlist');
            if (localWishlist) {
                const parsed = JSON.parse(localWishlist);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setWishlistItems(parsed);
                    return;
                }
            }

            try {
                const wishlistRes = await axios.get('http://127.0.0.1:8000/api/wishlist/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setWishlistItems(wishlistRes.data || []);
            } catch {
                setWishlistItems([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistItems([]);
        }
    };

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('access');
            if (!token) return;

            try {
                const addressRes = await axios.get('http://127.0.0.1:8000/api/users/addresses/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAddresses(addressRes.data || []);
            } catch {
                setAddresses([]);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const addNewAddress = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/addresses/', newAddress, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAddresses([...addresses, response.data]);
            setShowAddressForm(false);
            setNewAddress({
                fullName: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: false,
            });
            setSuccessMessage('Address added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding address:', error);
            const newAddr = { ...newAddress, id: Date.now() };
            setAddresses([...addresses, newAddr]);
            setShowAddressForm(false);
            setSuccessMessage('Address added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
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
            setAddresses(addresses.filter((addr) => addr.id !== addressId));
        }
    };

    const setDefaultAddress = async (addressId) => {
        const token = localStorage.getItem('access');
        if (!token) return;

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/users/addresses/${addressId}/set-default/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            setAddresses(
                addresses.map((addr) => ({
                    ...addr,
                    isDefault: addr.id === addressId,
                })),
            );
            setSuccessMessage('Default address updated');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error setting default address:', error);
            setAddresses(
                addresses.map((addr) => ({
                    ...addr,
                    isDefault: addr.id === addressId,
                })),
            );
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

            setSuccessMessage(`${product.name} added to cart and removed from wishlist!`);
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
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
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

    // Delete Profile Picture function
    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        setUploading(true);
        setErrorMessage('');

        try {
            const token = localStorage.getItem('access');
            const response = await axios.put(
                'http://127.0.0.1:8000/api/users/profile/',
                { profile_picture: null },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
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

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getProfileImageUrl = () => {
        if (user?.profile_picture) {
            if (user.profile_picture.startsWith('http')) {
                return user.profile_picture;
            }
            return `http://127.0.0.1:8000${user.profile_picture}`;
        }
        return null;
    };

    const getTotalSpent = () => {
        return orders.reduce((total, order) => total + (parseFloat(order.total_price) || 0), 0);
    };

    const getOrderStats = () => {
        return {
            total: orders.length,
            delivered: orders.filter((o) => o.status === 'delivered').length,
            pending: orders.filter((o) => o.status === 'pending').length,
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
        };
    };

    const getItemPrice = (item) => {
        return item.price || item.product?.price || item.item_price || 0;
    };

    const getItemTotal = (item) => {
        const price = getItemPrice(item);
        return price * item.quantity;
    };

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
                            <CheckCircle size={16} />
                            {successMessage}
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="fixed top-24 right-4 z-50 animate-slide-down">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                            <AlertCircle size={16} />
                            {errorMessage}
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
                            {/* Profile Summary with Picture Upload - Clean Design */}
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="relative inline-block group">
                                    {/* Profile Image or Initials - Clickable to zoom */}
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

                                    {/* Camera Button - Only for upload */}
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

                            {/* Navigation Tabs */}
                            <div className="p-2 space-y-1">
                                {[
                                    { id: 'overview', label: 'Overview', icon: User },
                                    { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
                                    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistItems.length },
                                    { id: 'addresses', label: 'Addresses', icon: MapPin, badge: addresses.length },
                                    { id: 'settings', label: 'Settings', icon: Settings },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${
                                            activeTab === tab.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <tab.icon size={18} />
                                            <span className="text-sm font-medium">{tab.label}</span>
                                        </div>
                                        {tab.badge > 0 && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
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
                                                    )}
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
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-black mb-4">My Orders</h3>
                                {orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package size={60} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                                <div className="flex flex-wrap justify-between items-start gap-4">
                                                    <div>
                                                        <p className="font-bold text-black">Order #{order.id}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {order.items?.length || 0} items
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-black">
                                                            ₹{parseFloat(order.total_price).toLocaleString()}
                                                        </p>
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {order.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="mt-3 text-sm text-gray-500 hover:text-black transition flex items-center gap-1">
                                                    <Eye size={14} /> View Details <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === 'wishlist' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-black mb-4">My Wishlist</h3>
                                {wishlistItems.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Heart size={60} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500">Your wishlist is empty</p>
                                        <Link
                                            to="/products"
                                            className="inline-flex items-center gap-2 text-black underline mt-2">
                                            Browse Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {wishlistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition">
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            item.image
                                                                ? `http://127.0.0.1:8000${item.image}`
                                                                : '/placeholder.jpg'
                                                        }
                                                        alt={item.name}
                                                        className="w-full h-40 object-cover rounded-lg mb-3"
                                                    />
                                                    <button
                                                        onClick={() => removeFromWishlist(item.id)}
                                                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:scale-110 transition">
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                                <h4 className="font-semibold text-black">{item.name}</h4>
                                                <p className="text-sm text-gray-500">₹{item.price?.toLocaleString()}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={(e) => handleAddToCart(item, e)}
                                                        disabled={addingToCart[item.id]}
                                                        className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
                                                        {addingToCart[item.id] ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ShoppingBag size={14} /> Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/product/${item.id}`)}
                                                        className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
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
                                                value={newAddress.fullName}
                                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
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
                                                    checked={newAddress.isDefault}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, isDefault: e.target.checked })
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
                                                        {address.isDefault && (
                                                            <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2">
                                                                Default
                                                            </span>
                                                        )}
                                                        <p className="font-semibold text-black">
                                                            {address.fullName || user?.username}
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
                                                        {!address.isDefault && (
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
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Zoom Modal with Remove Button */}
            {showImageModal && profileImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowImageModal(false)}>
                    <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                            {/* Image Header */}
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

                            {/* Modal Footer */}
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
                                        )}
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

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, getItemPrice, getItemTotal }) => {
    const statusConfig = {
        pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
        delivered: { icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
        cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    };
    const config = statusConfig[order.status] || statusConfig['pending'];
    const StatusIcon = config.icon;

    const getStatusDisplay = (status) => {
        const names = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };
        return names[status] || status;
    };

    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Order Details #{order.id}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        ✕
                    </button>
                </div>
                <div className="p-5 space-y-6">
                    <div className={`${config.bg} rounded-xl p-4 flex items-center gap-3`}>
                        <StatusIcon size={24} className={config.color} />
                        <div>
                            <p className="font-semibold">Order Status: {getStatusDisplay(order.status)}</p>
                            <p className="text-sm text-gray-500">
                                Order placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Order Timeline</h3>
                        <div className="space-y-3">
                            {statusOrder.map((status, idx) => {
                                const isCompleted = idx <= currentIndex;
                                const statusNames = {
                                    pending: 'Order Placed',
                                    confirmed: 'Order Confirmed',
                                    shipped: 'Order Shipped',
                                    delivered: 'Order Delivered',
                                };
                                return (
                                    <div key={status} className="flex items-center gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            {isCompleted && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {statusNames[status]}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin size={14} /> Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600">{order.shipping_address || 'Address not provided'}</p>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <CreditCard size={14} /> Payment Information
                        </h3>
                        <p className="text-sm text-gray-600">
                            Method: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                        <p className="text-sm text-gray-600">Status: {order.is_paid ? 'Paid' : 'Pending'}</p>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Order Items</h3>
                        <div className="space-y-3">
                            {order.items &&
                                order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                                        <img
                                            src={
                                                item.product?.image
                                                    ? `http://127.0.0.1:8000${item.product.image}`
                                                    : '/api/placeholder/60/60'
                                            }
                                            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                            alt={item.product?.name}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.product?.name || 'Product'}</h4>
                                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                            <p className="text-sm text-gray-400">Price: ₹{getItemPrice(item)} each</p>
                                        </div>
                                        <p className="font-semibold">₹{getItemTotal(item).toLocaleString()}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>₹{parseInt(order.total_price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>₹{parseInt(order.total_price).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
