// Checkout.jsx - FIXED for regular cart checkout (without breaking Buy Now)
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrderConfirmation from './OrderConfirmation';
import {
    CreditCard,
    ShieldCheck,
    Truck,
    ArrowRight,
    Lock,
    AlertCircle,
    Wallet,
    Smartphone,
    Clock,
    Home,
    CheckCircle,
    Zap,
    ShoppingBag,
} from 'lucide-react';

import { CartContext } from '../context/CartContext';
import { showSuccess, showError, showWarning } from '../utils/toast';

function Checkout() {
    const navigate = useNavigate();
    const {
        cart,
        clearBuyNowItems,
        hasBuyNowItems,
        getBuyNowItems,
        getRegularItems,
        clearCart, // ✅ Add this for regular cart checkout
    } = useContext(CartContext);

    // ✅ IMPORTANT: Determine which checkout mode we're in
    const isBuyNow = hasBuyNowItems ? hasBuyNowItems() : false;

    // ✅ For Buy Now: ONLY buyNowItems
    // ✅ For Regular Checkout: ONLY regular items (non-buy-now)
    const buyNowItems = getBuyNowItems ? getBuyNowItems() : [];
    const regularItems = getRegularItems ? getRegularItems() : [];

    // ✅ SELECT correct items based on checkout mode
    const items = isBuyNow ? buyNowItems : regularItems;

    // Debug logging
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Is Buy Now mode:', isBuyNow);
    console.log('Buy Now items:', buyNowItems);
    console.log('Regular items (for cart checkout):', regularItems);
    console.log('Items being checked out:', items);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'cod',
    });

    const [errors, setErrors] = useState({});

    // Fetch user profile and addresses
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access');
            if (!token) {
                setLoadingAddress(false);
                if (items.length === 0) {
                    showWarning('Please login to continue');
                    navigate('/login');
                }
                return;
            }

            setLoadingAddress(true);
            try {
                const profileRes = await axios.get('http://127.0.0.1:8000/api/users/profile/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userProfile = profileRes.data;

                setFormData((prev) => ({
                    ...prev,
                    fullName: userProfile.full_name || userProfile.username || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                }));

                const addressRes = await axios.get('http://127.0.0.1:8000/api/users/addresses/', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const addresses = addressRes.data || [];
                setSavedAddresses(addresses);

                const defaultAddress = addresses.find((addr) => addr.is_default === true);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                    setFormData((prev) => ({
                        ...prev,
                        fullName: defaultAddress.full_name || prev.fullName,
                        phone: defaultAddress.phone || prev.phone,
                        address: defaultAddress.address || '',
                        city: defaultAddress.city || '',
                        state: defaultAddress.state || '',
                        pincode: defaultAddress.pincode || '',
                    }));
                } else if (addresses.length > 0) {
                    const firstAddress = addresses[0];
                    setSelectedAddressId(firstAddress.id);
                    setFormData((prev) => ({
                        ...prev,
                        fullName: firstAddress.full_name || prev.fullName,
                        phone: firstAddress.phone || prev.phone,
                        address: firstAddress.address || '',
                        city: firstAddress.city || '',
                        state: firstAddress.state || '',
                        pincode: firstAddress.pincode || '',
                    }));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                showError('Could not load user data');
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchUserData();
    }, [navigate, items.length]);

    // Redirect if no items
    useEffect(() => {
        if (!orderPlaced && !loadingAddress && items.length === 0) {
            if (isBuyNow) {
                showWarning('No Buy Now item found');
                navigate('/cart');
            } else {
                showWarning('Your cart is empty');
                navigate('/cart');
            }
        }
    }, [items, navigate, orderPlaced, loadingAddress, isBuyNow]);

    // Calculate totals
    const subtotal = items.reduce((acc, item) => {
        return acc + (Number(item.product_price) || 0) * (item.quantity || 1);
    }, 0);

    const shipping = subtotal > 5000 ? 0 : 199;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal > 10000 ? 1000 : subtotal > 5000 ? 500 : 0;
    const total = subtotal + shipping + tax - discount;

    // Validation
    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                return !value ? 'Full name required' : value.length < 3 ? 'Enter valid name' : '';
            case 'email':
                return !/\S+@\S+\.\S+/.test(value) ? 'Enter valid email' : '';
            case 'phone':
                return !/^\d{10}$/.test(value) ? 'Enter valid phone number' : '';
            case 'address':
                return value.length < 5 ? 'Enter full address' : '';
            case 'city':
                return !value ? 'City required' : '';
            case 'state':
                return !value ? 'State required' : '';
            case 'pincode':
                return !/^\d{6}$/.test(value) ? 'Invalid pincode (6 digits)' : '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));

        if (name === 'address' || name === 'city' || name === 'state' || name === 'pincode') {
            setSelectedAddressId(null);
        }
    };

    const handleAddressSelect = (addressId) => {
        const selected = savedAddresses.find((addr) => addr.id === parseInt(addressId));
        if (selected) {
            setSelectedAddressId(selected.id);
            setFormData((prev) => ({
                ...prev,
                fullName: selected.full_name || prev.fullName,
                phone: selected.phone || prev.phone,
                address: selected.address || '',
                city: selected.city || '',
                state: selected.state || '',
                pincode: selected.pincode || '',
            }));
            showSuccess('Address loaded');
        }
    };

    const validateStep = () => {
        const fields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
        const newErrors = {};
        fields.forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showError('Please fix the errors before continuing');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ Clear items after order based on checkout type
    const clearAfterOrder = () => {
        if (isBuyNow) {
            // Buy Now: Clear ONLY Buy Now items (keep regular cart)
            if (clearBuyNowItems) {
                clearBuyNowItems();
                console.log('Cleared Buy Now items only');
            }
        } else {
            // Regular cart checkout: Clear ALL items (user bought everything)
            if (clearCart) {
                clearCart();
                console.log('Cleared entire cart for regular checkout');
            }
        }
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!validateStep()) {
            setStep(1);
            return;
        }

        const token = localStorage.getItem('access');
        if (!token) {
            showError('Please login to continue');
            navigate('/login');
            return;
        }

        if (items.length === 0) {
            showError('No items to order');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const orderItems = items.map((item) => ({
                product: item.product_id || item.id,
                quantity: item.quantity || 1,
                price: item.product_price,
                name: item.product_name,
            }));

            const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

            const orderData = {
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                total_price: total,
                shipping_address: fullAddress,
                payment_method: formData.paymentMethod,
                is_buy_now: isBuyNow,
                customer_details: {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                },
            };

            console.log('Placing order - Items:', orderItems);
            console.log('Is Buy Now mode:', isBuyNow);

            const response = await axios.post('http://127.0.0.1:8000/api/orders/create/', orderData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setOrderDetails({
                orderId: response.data.order_id || `ORD${Math.floor(Math.random() * 1000000)}`,
                total: total,
                items: items.length,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: fullAddress,
                paymentMethod: formData.paymentMethod === 'cod' ? 'Cash on Delivery' : formData.paymentMethod.toUpperCase(),
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }),
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
                isBuyNow: isBuyNow,
            });

            // ✅ Clear appropriate items after order
            clearAfterOrder();

            if (isBuyNow) {
                showSuccess('Order placed! Your Buy Now item purchased. Other cart items saved.');
            } else {
                showSuccess('Order placed successfully!');
            }

            setOrderPlaced(true);
        } catch (error) {
            console.error('Order error:', error);
            const errorMsg =
                error.response?.data?.message || error.response?.data?.error || 'Order failed. Please try again.';
            setErrorMessage(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setOrderPlaced(false);
        navigate('/products');
    };

    if (orderPlaced && orderDetails) {
        return <OrderConfirmation orderDetails={orderDetails} items={items} onClose={handleClosePopup} />;
    }

    const InputField = ({ label, name, type = 'text', placeholder, value }) => (
        <div>
            <label className="block text-sm font-medium mb-1">{label} *</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl border ${
                    errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'
                } focus:outline-none focus:ring-2 focus:ring-black transition`}
            />
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    if (loadingAddress) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your information...</p>
                </div>
            </div>
        );
    }

    // No items message
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-28">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Items to Checkout</h2>
                    <p className="text-gray-500 mb-6">{isBuyNow ? 'No Buy Now items found.' : 'Your cart is empty.'}</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800">
                        Go to Cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        {isBuyNow ? <Zap size={14} className="text-yellow-500" /> : <Lock size={14} />}
                        <span className="text-xs font-medium">{isBuyNow ? 'BUY NOW CHECKOUT' : 'SECURE CHECKOUT'}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">CHECKOUT</h1>
                    {isBuyNow ? (
                        <p className="text-blue-500 mt-2 flex items-center justify-center gap-1">
                            <Zap size={14} /> You are purchasing {items.length} Buy Now item(s). Your other cart items are
                            saved.
                        </p>
                    ) : (
                        <p className="text-gray-500 mt-2">You are purchasing {items.length} item(s) from your cart.</p>
                    )}
                    <p className="text-gray-400 mt-1">Complete your order securely</p>
                </div>

                <div className="flex justify-center gap-8 mb-10">
                    {['Shipping', 'Payment', 'Review'].map((label, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step === index + 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {index + 1}
                            </div>
                            <span className={`text-sm ${step === index + 1 ? 'font-medium text-black' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {errorMessage && (
                    <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle size={18} />
                            <p>{errorMessage}</p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {step === 1 && (
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold mb-5">Shipping Information</h2>

                                {savedAddresses.length > 0 && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Home size={16} /> Use Saved Address
                                        </label>
                                        <select
                                            onChange={(e) => handleAddressSelect(e.target.value)}
                                            value={selectedAddressId || ''}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black">
                                            <option value="">Select a saved address</option>
                                            {savedAddresses.map((addr) => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.is_default ? '⭐ ' : ''}
                                                    {addr.address}, {addr.city} - {addr.pincode}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedAddressId && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                <CheckCircle size={12} /> Using selected address
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Full Name"
                                        name="fullName"
                                        value={formData.fullName}
                                        placeholder="John Doe"
                                    />
                                    <InputField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        placeholder="john@example.com"
                                    />
                                    <InputField
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        placeholder="9876543210"
                                    />
                                    <InputField label="City" name="city" value={formData.city} placeholder="Mumbai" />
                                    <InputField label="State" name="state" value={formData.state} placeholder="Kerala" />
                                    <InputField
                                        label="Pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        placeholder="670101"
                                    />
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Address *</label>
                                        <textarea
                                            rows="3"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House number, street..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                        />
                                        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold mb-5">Payment Method</h2>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'cod', label: 'Cash on Delivery', icon: Wallet },
                                        { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                                        { id: 'upi', label: 'UPI', icon: Smartphone },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: option.id }))}
                                            className={`p-4 rounded-xl border-2 transition ${
                                                formData.paymentMethod === option.id
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <option.icon size={24} className="mx-auto mb-2" />
                                            <p className="text-sm font-medium">{option.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold mb-5">Review Your Order</h2>
                                <div className="space-y-4">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b pb-4">
                                            <div className="flex gap-3">
                                                <img
                                                    src={
                                                        item.product_image
                                                            ? item.product_image.startsWith('http')
                                                                ? item.product_image
                                                                : `http://127.0.0.1:8000${item.product_image}`
                                                            : 'https://via.placeholder.com/60x60?text=Product'
                                                    }
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold">
                                                ₹{((item.product_price || 0) * (item.quantity || 1)).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                    <p className="font-medium mb-2">Shipping to:</p>
                                    <p className="text-sm text-gray-600">{formData.fullName}</p>
                                    <p className="text-sm text-gray-600">{formData.address}</p>
                                    <p className="text-sm text-gray-600">
                                        {formData.city}, {formData.state} - {formData.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600">📞 {formData.phone}</p>
                                    <p className="text-sm text-gray-600">📧 {formData.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800">
                                    Continue <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} /> Place Order
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 bg-gray-50">
                            <h3 className="text-xl font-bold mb-5">ORDER SUMMARY</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (5%)</span>
                                    <span>₹{tax}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t my-4"></div>
                            <div className="flex justify-between items-center mb-5">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={12} /> Secure Checkout
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={12} /> Free Delivery on orders above ₹5000
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={12} /> 30 Days Easy Returns
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
