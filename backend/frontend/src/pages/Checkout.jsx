// Checkout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrderConfirmation from './OrderConfirmation';
import { CreditCard, ShieldCheck, Truck, ArrowRight, Lock, AlertCircle, Wallet, Smartphone, Clock } from 'lucide-react';

import { CartContext } from '../context/CartContext';

function Checkout() {
    const navigate = useNavigate();
    const { cart, clearCart, removeItem } = useContext(CartContext) || {};
    const items = cart?.items || [];

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);

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

    // =========================
    // REDIRECT IF CART EMPTY
    // =========================
    useEffect(() => {
        if (!orderPlaced && items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate, orderPlaced]);

    // =========================
    // TOTALS
    // =========================
    const subtotal = items.reduce((acc, item) => {
        return acc + (item.product_price || 0) * item.quantity;
    }, 0);

    const shipping = subtotal > 5000 ? 0 : 199;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal > 10000 ? 1000 : subtotal > 5000 ? 500 : 0;
    const total = subtotal + shipping + tax - discount;

    // =========================
    // VALIDATION
    // =========================
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
                return !/^\d{6}$/.test(value) ? 'Invalid pincode' : '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const validateStep = () => {
        const fields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
        const newErrors = {};
        fields.forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const clearCartItems = () => {
        if (clearCart) clearCart();
        else if (removeItem) items.forEach((item) => removeItem(item.id));
        else localStorage.removeItem('cart');
    };

    // =========================
    // PLACE ORDER
    // =========================
    const handlePlaceOrder = async () => {
        if (!validateStep()) {
            setStep(1);
            return;
        }

        const token = localStorage.getItem('access');
        if (!token) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const orderItems = items.map((item) => ({
                product: item.product || item.product_id,
                quantity: item.quantity,
            }));

            const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

            const orderData = {
                items: orderItems,
                total_price: total,
                shipping_address: fullAddress,
                payment_method: formData.paymentMethod,
            };

            const response = await axios.post('http://127.0.0.1:8000/api/orders/create/', orderData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setOrderDetails({
                orderId: response.data.order_id || Math.floor(Math.random() * 1000000),
                total: total,
                items: items.length,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: fullAddress,
                paymentMethod: formData.paymentMethod,
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }),
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                discount: discount,
            });

            clearCartItems();
            setOrderPlaced(true);
        } catch (error) {
            console.log(error);
            setErrorMessage(error.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CLOSE HANDLERS
    // =========================
    const handleClosePopup = () => {
        setOrderPlaced(false);
        navigate('/products');
    };

    // =========================
    // SHOW ORDER CONFIRMATION
    // =========================
    if (orderPlaced && orderDetails) {
        return <OrderConfirmation orderDetails={orderDetails} items={items} onClose={handleClosePopup} />;
    }

    // =========================
    // INPUT FIELD COMPONENT
    // =========================
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
                    errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-black`}
            />
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    // =========================
    // CHECKOUT FORM
    // =========================
    return (
        <div className="min-h-screen bg-white pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
                        <Lock size={14} />
                        <span className="text-xs font-medium">SECURE CHECKOUT</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight">CHECKOUT</h1>
                    <p className="text-gray-400 mt-2">Complete your order securely</p>
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
                            <span className={`text-sm ${step === index + 1 ? 'font-medium' : 'text-gray-400'}`}>
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
                                            placeholder="House no, street..."
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
                                        { id: 'cod', label: 'COD', icon: Wallet },
                                        { id: 'card', label: 'Card', icon: CreditCard },
                                        { id: 'upi', label: 'UPI', icon: Smartphone },
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: option.id }))}
                                            className={`p-4 rounded-xl border-2 ${formData.paymentMethod === option.id ? 'border-black' : 'border-gray-200'}`}>
                                            <option.icon size={22} className="mx-auto mb-2" />
                                            <p className="text-sm font-medium">{option.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold mb-5">Review Order</h2>
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b pb-4">
                                            <div className="flex gap-3">
                                                <img
                                                    src={
                                                        item.product_image
                                                            ? `http://127.0.0.1:8000${item.product_image}`
                                                            : '/placeholder.jpg'
                                                    }
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold">
                                                ₹{(item.product_price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {step > 1 && (
                                <button onClick={handleBack} className="px-8 py-3 border border-gray-300 rounded-xl">
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2">
                                    Continue <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2">
                                    {loading ? (
                                        'Processing...'
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
                                    <span>Tax</span>
                                    <span>₹{tax}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t my-4"></div>
                            <div className="flex justify-between items-center mb-5">
                                <span className="font-bold">Total</span>
                                <span className="text-2xl font-bold text-red-600">₹{total.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2 text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={12} /> Secure Checkout
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={12} /> Fast Delivery
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={12} /> Easy Returns
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
