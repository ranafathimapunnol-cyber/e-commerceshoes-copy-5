// components/AdminLayout.jsx - WITH BLACK SHADE THEME
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';

function AdminLayout({ children }) {
    const [theme, setTheme] = useState('premium-dark');

    useEffect(() => {
        const token = localStorage.getItem('admin_access');
        if (!token) {
            window.location.href = '/admin/login';
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('admin_theme') || 'premium-dark';
        setTheme(savedTheme);

        // Apply theme to body for global styling
        const bodyClasses = {
            'premium-dark': 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
            'premium-navy': 'bg-gradient-to-br from-blue-900 via-gray-900 to-black',
            'black-shade': 'bg-gradient-to-br from-gray-950 via-gray-900 to-black',
            emerald: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900',
            amber: 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900',
        };
        document.body.className = bodyClasses[savedTheme] + ' min-h-screen';
    }, []);

    // Theme backgrounds
    const getThemeClass = () => {
        switch (theme) {
            case 'premium-navy':
                return 'bg-gradient-to-br from-slate-900 via-blue-900 to-navy-900';
            case 'black-shade':
                return 'bg-gradient-to-br from-gray-950 via-gray-900 to-black';
            case 'emerald':
                return 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900';
            case 'amber':
                return 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900';
            case 'premium-dark':
            default:
                return 'bg-gradient-to-br from-gray-900 via-purple-900 to-black';
        }
    };

    return (
        <div className={`min-h-screen ${getThemeClass()}`}>
            {/* Subtle noise overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            <Sidebar />
            <div className="overflow-y-auto h-screen ml-0 lg:ml-64">
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Notification Bell */}
                        <div className="flex justify-end mb-6">
                            <NotificationBell />
                        </div>
                        <div className="space-y-6">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
