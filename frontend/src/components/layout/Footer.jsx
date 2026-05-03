function Footer() {
    return (
        <footer style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');

                .rapido-footer * { box-sizing: border-box; margin: 0; padding: 0; }

                .rapido-footer a, .rapido-footer .link {
                    color: #6b7280;
                    text-decoration: none;
                    cursor: pointer;
                    transition: color 0.2s;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .rapido-footer .link:hover { color: #111; }

                .rapido-footer .newsletter-wrap {
                    background: #f3f4f6;
                    border-radius: 24px;
                    padding: 56px 56px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                    flex-wrap: wrap;
                }

                .rapido-footer .newsletter-tagline {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 52px;
                    letter-spacing: 2px;
                    color: #111;
                    line-height: 1;
                }

                .rapido-footer .newsletter-sub {
                    color: #6b7280;
                    font-size: 15px;
                    margin-top: 10px;
                }

                .rapido-footer .newsletter-form {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .rapido-footer .newsletter-input {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    padding: 14px 20px;
                    border-radius: 12px;
                    outline: none;
                    width: 300px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #374151;
                }

                .rapido-footer .newsletter-btn {
                    background: #111;
                    color: #fff;
                    padding: 14px 28px;
                    border-radius: 12px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .rapido-footer .newsletter-btn:hover { background: #374151; }

                .rapido-footer .divider {
                    border: none;
                    border-top: 1px solid #f0f0f0;
                    margin: 48px 0;
                }

                .rapido-footer .brand-logo {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 60px;
                    letter-spacing: 4px;
                    color: #111;
                    line-height: 1;
                }

                .rapido-footer .brand-desc {
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.8;
                    margin-top: 16px;
                    max-width: 220px;
                }

                .rapido-footer .social-row {
                    display: flex;
                    gap: 10px;
                    margin-top: 24px;
                }

                .rapido-footer .social-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    color: #6b7280;
                }
                .rapido-footer .social-btn:hover { background: #111; color: #fff; }

                .rapido-footer .social-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .rapido-footer .col-title {
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    color: #111;
                    margin-bottom: 20px;
                }

                .rapido-footer .link-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .rapido-footer .badge {
                    display: inline-block;
                    background: #111;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    padding: 2px 7px;
                    border-radius: 4px;
                    margin-left: 8px;
                    vertical-align: middle;
                }

                .rapido-footer .contact-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .rapido-footer .contact-icon {
                    width: 36px;
                    height: 36px;
                    background: #f3f4f6;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .rapido-footer .contact-icon svg {
                    width: 16px;
                    height: 16px;
                    stroke: #6b7280;
                    fill: none;
                    stroke-width: 1.8;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .rapido-footer .apps-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                }

                .rapido-footer .app-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #111;
                    color: #fff;
                    border-radius: 10px;
                    padding: 8px 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                .rapido-footer .app-badge:hover { background: #374151; }

                .rapido-footer .app-badge svg {
                    width: 18px;
                    height: 18px;
                    fill: #fff;
                    flex-shrink: 0;
                }

                .rapido-footer .trust-strip {
                    background: #f9fafb;
                    border-top: 1px solid #f0f0f0;
                    border-bottom: 1px solid #f0f0f0;
                    padding: 24px 0;
                    overflow: hidden;
                    margin-bottom: 0;
                }

                .rapido-footer .trust-inner {
                    display: flex;
                    gap: 48px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .rapido-footer .trust-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #6b7280;
                    font-size: 13px;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .rapido-footer .trust-item svg {
                    width: 18px;
                    height: 18px;
                    stroke: #111;
                    fill: none;
                    stroke-width: 1.8;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .rapido-footer .bottom-bar {
                    border-top: 1px solid #f0f0f0;
                    padding: 20px 0;
                }

                .rapido-footer .bottom-inner {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .rapido-footer .bottom-links {
                    display: flex;
                    gap: 24px;
                }

                .rapido-footer .payment-icons {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .rapido-footer .payment-card {
                    background: #f3f4f6;
                    border-radius: 6px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #6b7280;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 900px) {
                    .rapido-footer .newsletter-wrap { padding: 36px 28px; flex-direction: column; align-items: flex-start; }
                    .rapido-footer .newsletter-tagline { font-size: 36px; }
                    .rapido-footer .newsletter-input { width: 100%; }
                    .rapido-footer .newsletter-form { width: 100%; }
                    .rapido-footer .main-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
                    .rapido-footer .bottom-inner { flex-direction: column; align-items: flex-start; }
                }

                @media (max-width: 540px) {
                    .rapido-footer .main-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="rapido-footer">
                {/* TRUST STRIP */}
                <div className="trust-strip">
                    <div className="trust-inner">
                        {[
                            {
                                icon: (
                                    <>
                                        <polyline points="5 12 10 17 20 7" />
                                    </>
                                ),
                                label: 'Free Shipping Over $75',
                            },
                            {
                                icon: (
                                    <>
                                        <polyline points="1 4 1 10 7 10" />
                                        <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                                    </>
                                ),
                                label: 'Easy 30-Day Returns',
                            },
                            {
                                icon: (
                                    <>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </>
                                ),
                                label: 'Secure Checkout',
                            },
                            {
                                icon: (
                                    <>
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </>
                                ),
                                label: '24/7 Support',
                            },
                            {
                                icon: (
                                    <>
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </>
                                ),
                                label: 'Authenticity Guaranteed',
                            },
                        ].map((t, i) => (
                            <div className="trust-item" key={i}>
                                <svg viewBox="0 0 24 24">{t.icon}</svg>
                                <span>{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 40px 0' }}>
                    {/* NEWSLETTER */}
                    <div className="newsletter-wrap">
                        <div>
                            <div className="newsletter-tagline">Join the Rapido Club</div>
                            <p className="newsletter-sub">
                                Exclusive drops, member-only discounts, and early access to new collections.
                            </p>
                        </div>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Enter your email address" className="newsletter-input" />
                            <button className="newsletter-btn">Subscribe →</button>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* MAIN GRID */}
                    <div
                        className="main-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
                            gap: '48px',
                            alignItems: 'flex-start',
                        }}>
                        {/* BRAND COL */}
                        <div>
                            <div className="brand-logo">RAPIDO</div>
                            <p className="brand-desc">
                                Premium sneakers and modern streetwear built for comfort, speed, and uncompromising style
                                since 2014.
                            </p>

                            {/* SOCIALS */}
                            <div className="social-row">
                                {/* Instagram */}
                                <div className="social-btn" title="Instagram">
                                    <svg viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path
                                            d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                                            style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }}
                                        />
                                        <line
                                            x1="17.5"
                                            y1="6.5"
                                            x2="17.51"
                                            y2="6.5"
                                            style={{ stroke: 'currentColor', strokeWidth: 2 }}
                                        />
                                    </svg>
                                </div>
                                {/* Facebook */}
                                <div className="social-btn" title="Facebook">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </div>
                                {/* Twitter/X */}
                                <div className="social-btn" title="X / Twitter">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                                {/* YouTube */}
                                <div className="social-btn" title="YouTube">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                                        <polygon
                                            points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                                            style={{ fill: '#fff' }}
                                        />
                                    </svg>
                                </div>
                                {/* TikTok */}
                                <div className="social-btn" title="TikTok">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z" />
                                    </svg>
                                </div>
                            </div>

                            {/* APP BADGES */}
                            <p
                                style={{
                                    fontSize: 12,
                                    color: '#9ca3af',
                                    marginTop: 28,
                                    marginBottom: 12,
                                    fontWeight: 600,
                                    letterSpacing: '0.8px',
                                    textTransform: 'uppercase',
                                }}>
                                Get the app
                            </p>
                            <div className="apps-row">
                                <div className="app-badge">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    App Store
                                </div>
                                <div className="app-badge">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M3.18 23.76c.3.17.64.22.99.12l11.82-6.78-2.6-2.6-10.21 9.26zM20.73 9.6L17.6 7.79l-2.93 2.93 2.93 2.93 3.15-1.83a1.75 1.75 0 0 0 0-3.22zM3.08.27C2.74.05 2.35-.04 1.97.01L13.38 11.4l-2.6 2.6L3.08.27zM1.79.8C1.47 1.09 1.27 1.54 1.27 2.13v19.75c0 .59.2 1.04.52 1.33l.07.06 11.07-11.06v-.26L1.86.74l-.07.06z" />
                                    </svg>
                                    Google Play
                                </div>
                            </div>
                        </div>

                        {/* SHOP */}
                        <div>
                            <div className="col-title">Shop</div>
                            <ul className="link-list">
                                <li>
                                    <span className="link">Men's Collection</span>
                                </li>
                                <li>
                                    <span className="link">Women's Collection</span>
                                </li>
                                <li>
                                    <span className="link">Kids' Collection</span>
                                </li>
                                <li>
                                    <span className="link">
                                        New Arrivals <span className="badge">New</span>
                                    </span>
                                </li>
                                <li>
                                    <span className="link">Best Sellers</span>
                                </li>
                                <li>
                                    <span className="link">
                                        Sale{' '}
                                        <span className="badge" style={{ background: '#dc2626' }}>
                                            Sale
                                        </span>
                                    </span>
                                </li>
                                <li>
                                    <span className="link">Collaborations</span>
                                </li>
                                <li>
                                    <span className="link">Gift Cards</span>
                                </li>
                            </ul>
                        </div>

                        {/* COMPANY */}
                        <div>
                            <div className="col-title">Company</div>
                            <ul className="link-list">
                                <li>
                                    <span className="link">About Rapido</span>
                                </li>
                                <li>
                                    <span className="link">Our Story</span>
                                </li>
                                <li>
                                    <span className="link">Sustainability</span>
                                </li>
                                <li>
                                    <span className="link">Careers</span>
                                </li>
                                <li>
                                    <span className="link">Press</span>
                                </li>
                                <li>
                                    <span className="link">Affiliates</span>
                                </li>
                                <li>
                                    <span className="link">Blog</span>
                                </li>
                            </ul>
                        </div>

                        {/* SUPPORT */}
                        <div>
                            <div className="col-title">Support</div>
                            <ul className="link-list">
                                <li>
                                    <span className="link">Help Center</span>
                                </li>
                                <li>
                                    <span className="link">Track My Order</span>
                                </li>
                                <li>
                                    <span className="link">Shipping Info</span>
                                </li>
                                <li>
                                    <span className="link">Returns & Exchanges</span>
                                </li>
                                <li>
                                    <span className="link">Size Guide</span>
                                </li>
                                <li>
                                    <span className="link">Care Instructions</span>
                                </li>
                                <li>
                                    <span className="link">Contact Us</span>
                                </li>
                            </ul>
                        </div>

                        {/* CONTACT */}
                        <div>
                            <div className="col-title">Contact</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                            Our Store
                                        </div>
                                        123 Fashion Avenue
                                        <br />
                                        New York, NY 10001
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                            Email
                                        </div>
                                        hello@rapido.com
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15.92v1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                            Phone
                                        </div>
                                        +1 (800) 123-4567
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon">
                                        <svg viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ color: '#111', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                                            Hours
                                        </div>
                                        Mon–Fri: 9AM – 7PM
                                        <br />
                                        Sat–Sun: 10AM – 5PM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* PAYMENT & LOCALE ROW */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 20,
                            paddingBottom: 48,
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span
                                style={{
                                    fontSize: 12,
                                    color: '#9ca3af',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.8px',
                                }}>
                                We accept
                            </span>
                            <div className="payment-icons">
                                {['VISA', 'MC', 'AMEX', 'PayPal', 'Apple Pay', 'GPay'].map((p) => (
                                    <div className="payment-card" key={p}>
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <select
                                style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    color: '#374151',
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: 'pointer',
                                    outline: 'none',
                                }}>
                                <option>🇺🇸 English (US)</option>
                                <option>🇬🇧 English (UK)</option>
                                <option>🇩🇪 Deutsch</option>
                                <option>🇫🇷 Français</option>
                            </select>
                            <select
                                style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    color: '#374151',
                                    fontFamily: "'DM Sans', sans-serif",
                                    cursor: 'pointer',
                                    outline: 'none',
                                }}>
                                <option>$ USD</option>
                                <option>€ EUR</option>
                                <option>£ GBP</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="bottom-bar">
                    <div className="bottom-inner">
                        <p style={{ fontSize: 13, color: '#9ca3af' }}>© 2026 RAPIDO Inc. All rights reserved.</p>
                        <div className="bottom-links">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Accessibility', 'Sitemap'].map(
                                (l) => (
                                    <span className="link" key={l}>
                                        {l}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
