// components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, Plus, Menu, X, LogOut, Settings, BarChart3 } from 'lucide-react';

function Sidebar() {
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
        { name: 'Products', path: '/admin/products', icon: <Package size={18} /> },
        { name: 'Add Product', path: '/admin/add-product', icon: <Plus size={18} /> },
        { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={18} /> },
        { name: 'Reports', path: '/admin/reports', icon: <BarChart3 size={18} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_access');
        localStorage.removeItem('admin_refresh');
        localStorage.removeItem('isAdmin');
        window.location.href = '/admin/login';
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {isMobile && (
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="fixed top-4 left-4 z-50 bg-black/40 backdrop-blur-lg text-white p-2.5 rounded-xl border border-white/20">
                    <Menu size={20} />
                </button>
            )}

            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />
            )}

            <div
                className={`
                    fixed left-0 top-0 h-full transition-all duration-300 ease-out z-50
                    w-64
                    bg-black/30 backdrop-blur-xl
                    border-r border-white/10
                    ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
                `}
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: '500' }}>
                {/* Logo Section */}
                <div className="px-5 py-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span
                                className="text-3xl md:text-4xl font-bold tracking-tight text-white"
                                style={{ fontFamily: "'Playfair Display', serif", fontWeight: '700' }}>
                                ADMIN
                            </span>
                            <span
                                className="text-[12px] md:text-xs font-normal text-white/40 tracking-[0.2em] ml-1 uppercase"
                                style={{ fontFamily: "'Playfair Display', serif", fontWeight: '400' }}>
                                Dashboard
                            </span>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsMobileOpen(false)} className="text-white/50 hover:text-white">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col justify-between h-[calc(100%-85px)]">
                    <div className="px-3 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => isMobile && setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${
                                        isActive(item.path)
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                                    }
                                `}
                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="text-[13px] font-medium tracking-tight">{item.name}</span>
                                {isActive(item.path) && <span className="ml-auto w-1 h-5 bg-white/40 rounded-full" />}
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="px-3 py-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            <LogOut size={18} />
                            <span className="text-[13px] font-medium tracking-tight">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${!isMobile ? 'ml-64' : ''}`} />
        </>
    );
}

export default Sidebar;
