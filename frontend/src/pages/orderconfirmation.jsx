import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Package, CreditCard, MapPin } from 'lucide-react';

function OrderConfirmation({ orderDetails, items, onClose, onGoToOrders }) {
    const navigate = useNavigate();

    const closeAndContinue = () => {
        if (onClose) onClose();
        else navigate('/products');
    };

    const closeAndGoOrders = () => {
        if (onGoToOrders) onGoToOrders();
        else navigate('/my-orders');
    };

    useEffect(() => {
        // Confetti
        const layer = document.getElementById('oc-confetti');
        if (!layer) return;
        const colors = [
            '#e2001a',
            '#000000',
            '#ff6b00',
            '#8b00ff',
            '#00a86b',
            '#0066ff',
            '#ff0077',
            '#ffcc00',
            '#00ccff',
            '#ff4400',
        ];
        for (let i = 0; i < 90; i++) {
            const el = document.createElement('div');
            const shapes = ['oc-cp', 'oc-cp oc-circle', 'oc-cp oc-stripe'];
            el.className = shapes[Math.floor(Math.random() * shapes.length)];
            el.style.cssText = `
                left:${Math.random() * 100}%;
                top:${100 + Math.random() * 20}%;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                --r:${Math.random() * 360}deg;
                --dur:${2.5 + Math.random() * 3}s;
                --delay:${Math.random() * 2}s;
                width:${6 + Math.random() * 10}px;
                height:${6 + Math.random() * 10}px;
            `;
            layer.appendChild(el);
        }

        // Color bursts
        const burstData = [
            { x: '0', y: '10vh', w: '40vw', h: '40vw', c: '#ffe0e0', d: '1.2s', delay: '0.4s' },
            { x: '60vw', y: '5vh', w: '45vw', h: '45vw', c: '#e0f0ff', d: '1.5s', delay: '0.6s' },
            { x: '10vw', y: '50vh', w: '30vw', h: '30vw', c: '#f0e0ff', d: '1.1s', delay: '0.9s' },
            { x: '55vw', y: '45vh', w: '38vw', h: '38vw', c: '#e0fff0', d: '1.3s', delay: '1.1s' },
            { x: '20vw', y: '70vh', w: '25vw', h: '25vw', c: '#fffbe0', d: '1.4s', delay: '1.4s' },
            { x: '62vw', y: '70vh', w: '32vw', h: '32vw', c: '#ffe8e0', d: '1.2s', delay: '0.7s' },
        ];
        const burstEls = burstData.map((b) => {
            const el = document.createElement('div');
            el.className = 'oc-burst oc-burst-active';
            el.style.cssText = `left:${b.x};top:${b.y};width:${b.w};height:${b.h};background:${b.c};--bd:${b.d};animation-delay:${b.delay};`;
            document.body.appendChild(el);
            return el;
        });

        // Side tags
        const tagData = [
            { text: 'ORDER PLACED', side: 'left', top: '18%', bg: '#000', delay: '0.5s' },
            { text: 'PAYMENT DONE', side: 'right', top: '22%', bg: '#000', delay: '0.8s' },
            { text: 'DISPATCHING SOON', side: 'left', top: '45%', bg: '#e2001a', delay: '1.2s' },
            { text: 'THANK YOU', side: 'right', top: '50%', bg: '#000', delay: '1.0s' },
            { text: 'FREE SHIPPING', side: 'left', top: '72%', bg: '#000', delay: '1.5s' },
            { text: 'EST. 5 DAYS', side: 'right', top: '75%', bg: '#555', delay: '1.7s' },
            { text: 'SECURE', side: 'left', top: '88%', bg: '#8b00ff', delay: '2.0s' },
            { text: 'CONFIRMED', side: 'right', top: '12%', bg: '#00a86b', delay: '0.3s' },
        ];
        const tagEls = tagData.map((t) => {
            const el = document.createElement('div');
            el.className = 'oc-side-tag';
            el.textContent = t.text;
            el.style.cssText = `
                top:${t.top};
                left:${t.side === 'left' ? '0' : 'auto'};
                right:${t.side === 'right' ? '0' : 'auto'};
                background:${t.bg};
                border-radius:${t.side === 'left' ? '0 100px 100px 0' : '100px 0 0 100px'};
                animation: ${t.side === 'left' ? 'oc-tagLeft' : 'oc-tagRight'} 3.8s ease-in-out ${t.delay} both;
            `;
            document.body.appendChild(el);
            return el;
        });

        return () => {
            burstEls.forEach((el) => el.remove());
            tagEls.forEach((el) => el.remove());
        };
    }, []);

    if (!orderDetails) return null;

    return (
        <>
            <style>{`
                @keyframes oc-floatUp {
                    0%  { opacity:1; transform:translateY(0) scale(1) rotate(var(--r)); }
                    100%{ opacity:0; transform:translateY(-120vh) scale(0.4) rotate(calc(var(--r) + 360deg)); }
                }
                @keyframes oc-popIn {
                    0%  { opacity:0; transform:scale(0.3) translateY(20px); }
                    60% { transform:scale(1.08) translateY(-4px); }
                    100%{ opacity:1; transform:scale(1) translateY(0); }
                }
                @keyframes oc-slideLeft  { 0%{opacity:0;transform:translateX(-80px)} 100%{opacity:1;transform:translateX(0)} }
                @keyframes oc-slideRight { 0%{opacity:0;transform:translateX(80px)}  100%{opacity:1;transform:translateX(0)} }
                @keyframes oc-slideDown  { 0%{opacity:0;transform:translateY(-60px)} 100%{opacity:1;transform:translateY(0)} }
                @keyframes oc-slideUp    { 0%{opacity:0;transform:translateY(60px)}  100%{opacity:1;transform:translateY(0)} }
                @keyframes oc-pulseRing  { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.18);opacity:0.15} }
                @keyframes oc-tickIn     { 0%{stroke-dashoffset:60} 100%{stroke-dashoffset:0} }
                @keyframes oc-shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes oc-burst      { 0%{opacity:0.7;transform:scale(0)} 80%{opacity:0.12} 100%{opacity:0;transform:scale(1)} }
                @keyframes oc-tagLeft    { 0%{opacity:0;transform:translateX(-120%)} 15%{opacity:1} 85%{opacity:1} 100%{opacity:0;transform:translateX(-120%)} }
                @keyframes oc-tagRight   { 0%{opacity:0;transform:translateX(120%)}  15%{opacity:1} 85%{opacity:1} 100%{opacity:0;transform:translateX(120%)} }

                .oc-overlay {
                    position:fixed; inset:0; z-index:9999;
                    background:#fff;
                    display:flex; align-items:flex-start; justify-content:center;
                    overflow-y:auto; padding:0 12px 80px;
                    font-family:system-ui, -apple-system, sans-serif;
                }
                .oc-confetti-layer {
                    position:fixed; inset:0; pointer-events:none; z-index:10000;
                }
                .oc-cp {
                    position:absolute; width:10px; height:10px; border-radius:2px;
                    opacity:0;
                    animation:oc-floatUp var(--dur) ease-in var(--delay) forwards;
                }
                .oc-circle { border-radius:50%; }
                .oc-stripe { width:4px !important; height:18px !important; border-radius:2px; }

                .oc-burst {
                    position:fixed; pointer-events:none; z-index:9998; border-radius:50%; opacity:0;
                }
                .oc-burst-active { animation:oc-burst var(--bd) ease-out forwards; }

                .oc-side-tag {
                    position:fixed; z-index:10001; pointer-events:none;
                    font-size:11px; font-weight:600; letter-spacing:0.8px;
                    padding:6px 14px; color:#fff;
                }

                .oc-card {
                    position:relative; z-index:10000;
                    width:100%; max-width:520px;
                    margin-top:40px;
                }

                .oc-hero {
                    text-align:center; margin-bottom:28px;
                    animation:oc-slideDown 0.6s ease-out 0.1s both;
                }
                .oc-ring-wrap {
                    position:relative; display:inline-flex;
                    align-items:center; justify-content:center;
                    width:96px; height:96px; margin-bottom:16px;
                }
                .oc-ring1 {
                    position:absolute; inset:-8px; border-radius:50%;
                    border:2px solid #000;
                    animation:oc-pulseRing 2.2s ease-in-out infinite;
                }
                .oc-ring2 {
                    position:absolute; inset:-18px; border-radius:50%;
                    border:1px solid #000;
                    animation:oc-pulseRing 2.2s ease-in-out 0.5s infinite;
                }
                .oc-check-circle {
                    width:96px; height:96px; border-radius:50%; background:#000;
                    display:flex; align-items:center; justify-content:center;
                    animation:oc-popIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
                }
                .oc-tick {
                    stroke:#fff; stroke-width:4; stroke-linecap:round; stroke-linejoin:round;
                    fill:none; stroke-dasharray:60; stroke-dashoffset:60;
                    animation:oc-tickIn 0.5s ease-out 0.9s forwards;
                }
                .oc-title {
                    font-size:clamp(28px,7vw,48px); font-weight:500;
                    letter-spacing:-1.5px; color:#000; line-height:1.1;
                    animation:oc-popIn 0.5s ease-out 0.5s both;
                }
                .oc-sub {
                    font-size:14px; color:#666; margin-top:6px;
                    animation:oc-popIn 0.5s ease-out 0.7s both;
                }
                .oc-badge {
                    display:inline-block; margin-top:12px;
                    padding:6px 18px; border:1.5px solid #000;
                    border-radius:100px; font-size:13px; font-weight:500;
                    letter-spacing:1px; background:#000; color:#fff;
                    animation:oc-popIn 0.5s ease-out 0.85s both;
                }

                .oc-shimmer {
                    height:2px; border-radius:2px;
                    background:linear-gradient(90deg,#000 0%,#fff 50%,#000 100%);
                    background-size:200% 100%;
                    animation:oc-shimmer 2.5s linear infinite;
                    margin:4px 0 14px;
                }

                .oc-pop-row {
                    display:grid; grid-template-columns:1fr 1fr 1fr;
                    gap:10px; margin-bottom:16px;
                }
                .oc-pop {
                    background:#fff; border:1px solid #e5e5e5;
                    border-radius:14px; padding:14px 10px; text-align:center;
                }
                .oc-pop.l { animation:oc-slideLeft  0.5s ease-out 0.5s  both; }
                .oc-pop.c { animation:oc-slideDown  0.5s ease-out 0.65s both; }
                .oc-pop.r { animation:oc-slideRight 0.5s ease-out 0.8s  both; }
                .oc-pop-icon {
                    width:32px; height:32px; border-radius:50%;
                    background:#f5f5f5; display:flex;
                    align-items:center; justify-content:center;
                    margin:0 auto 8px;
                }
                .oc-pop-label {
                    font-size:10px; color:#888;
                    text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px;
                }
                .oc-pop-val { font-size:13px; font-weight:500; color:#000; line-height:1.3; }

                .oc-detail {
                    background:#fff; border:1px solid #e5e5e5;
                    border-radius:18px; overflow:hidden; margin-bottom:16px;
                }
                .oc-detail.dl { animation:oc-slideLeft  0.5s ease-out 0.7s  both; }
                .oc-detail.dr { animation:oc-slideRight 0.5s ease-out 0.85s both; }
                .oc-dh {
                    display:flex; align-items:center; gap:10px;
                    padding:14px 16px; border-bottom:1px solid #f0f0f0;
                    background:#fafafa;
                }
                .oc-dh-icon {
                    width:28px; height:28px; border-radius:50%; background:#000;
                    display:flex; align-items:center; justify-content:center; flex-shrink:0;
                }
                .oc-dh-title { font-size:13px; font-weight:500; color:#000; letter-spacing:0.3px; }
                .oc-db { padding:14px 16px; }
                .oc-row {
                    display:flex; justify-content:space-between; align-items:center;
                    padding:5px 0; font-size:13px;
                }
                .oc-rl { color:#888; }
                .oc-rv { color:#000; font-weight:500; text-align:right; max-width:60%; }
                .oc-item-row {
                    display:flex; justify-content:space-between;
                    font-size:13px; padding:5px 0; color:#000;
                }
                .oc-item-name { color:#666; max-width:70%; }
                .oc-divider { border-top:1px solid #f0f0f0; margin-top:8px; padding-top:10px; }
                .oc-total-row {
                    display:flex; justify-content:space-between; align-items:baseline;
                    border-top:1px solid #f0f0f0; margin-top:6px; padding-top:10px;
                }
                .oc-total-label { font-size:15px; font-weight:500; color:#000; }
                .oc-total-val   { font-size:22px; font-weight:500; color:#000; }

                .oc-actions {
                    display:grid; grid-template-columns:1fr 1fr;
                    gap:10px; margin-bottom:16px;
                    animation:oc-slideUp 0.5s ease-out 1.1s both;
                }
                .oc-btn-primary {
                    padding:13px; border-radius:12px; background:#000; color:#fff;
                    border:none; font-size:14px; font-weight:500; cursor:pointer;
                    transition:transform 0.15s, background 0.15s;
                }
                .oc-btn-primary:hover { background:#222; transform:scale(0.98); }
                .oc-btn-secondary {
                    padding:13px; border-radius:12px; background:#fff; color:#000;
                    border:1.5px solid #e0e0e0; font-size:14px; font-weight:500;
                    cursor:pointer; transition:transform 0.15s, border-color 0.15s;
                }
                .oc-btn-secondary:hover { border-color:#000; transform:scale(0.98); }

                .oc-trust {
                    display:flex; justify-content:center; gap:20px; padding:16px;
                    animation:oc-slideUp 0.5s ease-out 1.2s both;
                }
                .oc-trust-item {
                    display:flex; align-items:center; gap:6px;
                    font-size:11px; color:#888; letter-spacing:0.3px;
                }
                .oc-dot { width:4px; height:4px; border-radius:50%; background:#ccc; }
            `}</style>

            <div className="oc-overlay">
                <div className="oc-confetti-layer" id="oc-confetti" />

                <div className="oc-card">
                    <div className="oc-hero">
                        <div className="oc-ring-wrap">
                            <div className="oc-ring1" />
                            <div className="oc-ring2" />
                            <div className="oc-check-circle">
                                <svg width="44" height="44" viewBox="0 0 44 44" style={{ overflow: 'visible' }}>
                                    <path className="oc-tick" d="M10 22 L19 31 L34 14" />
                                </svg>
                            </div>
                        </div>
                        <div className="oc-title">Order Confirmed</div>
                        <div className="oc-sub">Your items are on their way</div>
                        <div className="oc-badge">ORDER #{orderDetails.orderId}</div>
                    </div>

                    <div className="oc-shimmer" />

                    <div className="oc-pop-row">
                        <div className="oc-pop l">
                            <div className="oc-pop-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5" />
                                    <path d="M1 7h14" stroke="#000" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="oc-pop-label">Payment</div>
                            <div className="oc-pop-val">
                                {orderDetails.paymentMethod === 'cod'
                                    ? 'Cash on Delivery'
                                    : orderDetails.paymentMethod === 'upi'
                                      ? 'UPI'
                                      : 'Card'}
                            </div>
                        </div>
                        <div className="oc-pop c">
                            <div className="oc-pop-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M2 14L5 5H11L14 14H2Z"
                                        stroke="#000"
                                        strokeWidth="1.3"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M5 5L8 2L11 5"
                                        stroke="#000"
                                        strokeWidth="1.3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div className="oc-pop-label">Total</div>
                            <div className="oc-pop-val" style={{ fontSize: 17 }}>
                                ₹{orderDetails.total.toLocaleString()}
                            </div>
                        </div>
                        <div className="oc-pop r">
                            <div className="oc-pop-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M1 11L4 4H12L15 11H1Z"
                                        stroke="#000"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                    <path d="M4 13h1M11 13h1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="oc-pop-label">Delivery</div>
                            <div className="oc-pop-val">{orderDetails.estimatedDelivery}</div>
                        </div>
                    </div>

                    <div className="oc-detail dl">
                        <div className="oc-dh">
                            <div className="oc-dh-icon">
                                <MapPin size={14} color="#fff" />
                            </div>
                            <span className="oc-dh-title">Delivery Address</span>
                        </div>
                        <div className="oc-db">
                            <div className="oc-row">
                                <span className="oc-rl">Name</span>
                                <span className="oc-rv">{orderDetails.fullName}</span>
                            </div>
                            <div className="oc-row">
                                <span className="oc-rl">Address</span>
                                <span className="oc-rv">{orderDetails.address}</span>
                            </div>
                            <div className="oc-row">
                                <span className="oc-rl">Phone</span>
                                <span className="oc-rv">{orderDetails.phone}</span>
                            </div>
                            <div className="oc-row">
                                <span className="oc-rl">Email</span>
                                <span className="oc-rv">{orderDetails.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="oc-detail dr">
                        <div className="oc-dh">
                            <div className="oc-dh-icon">
                                <Package size={14} color="#fff" />
                            </div>
                            <span className="oc-dh-title">Order Summary</span>
                        </div>
                        <div className="oc-db">
                            {items.map((item) => (
                                <div key={item.id} className="oc-item-row">
                                    <span className="oc-item-name">
                                        {item.product_name} x {item.quantity}
                                    </span>
                                    <span>₹{(item.product_price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="oc-divider">
                                <div className="oc-row">
                                    <span className="oc-rl">Subtotal</span>
                                    <span className="oc-rv">₹{orderDetails.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="oc-row">
                                    <span className="oc-rl">Shipping</span>
                                    <span className="oc-rv">
                                        {orderDetails.shipping === 0 ? 'FREE' : `₹${orderDetails.shipping}`}
                                    </span>
                                </div>
                                <div className="oc-row">
                                    <span className="oc-rl">Tax</span>
                                    <span className="oc-rv">₹{orderDetails.tax}</span>
                                </div>
                                {orderDetails.discount > 0 && (
                                    <div className="oc-row">
                                        <span className="oc-rl">Discount</span>
                                        <span className="oc-rv">-₹{orderDetails.discount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="oc-total-row">
                                <span className="oc-total-label">Total Paid</span>
                                <span className="oc-total-val">₹{orderDetails.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="oc-actions">
                        <button className="oc-btn-primary" onClick={closeAndGoOrders}>
                            View My Orders
                        </button>
                        <button className="oc-btn-secondary" onClick={closeAndContinue}>
                            Continue Shopping
                        </button>
                    </div>

                    <div className="oc-trust">
                        <div className="oc-trust-item">
                            <ShieldCheck size={12} /> Secure Checkout
                        </div>
                        <div className="oc-dot" />
                        <div className="oc-trust-item">
                            <Truck size={12} /> Fast Delivery
                        </div>
                        <div className="oc-dot" />
                        <div className="oc-trust-item">
                            <Package size={12} /> Easy Returns
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrderConfirmation;
