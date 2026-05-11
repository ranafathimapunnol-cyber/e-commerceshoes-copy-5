// admin/pages/AdminSettings.jsx - SMART 2-ROW LAYOUT (3 + 2)
import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Palette, Gem, Flame, Sparkles, Anchor, Moon } from 'lucide-react';

const GlassCard = ({ children }) => (
    <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {children}
    </div>
);

function AdminSettings() {
    const [settings, setSettings] = useState({
        theme: 'black-shade',
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // Load saved theme on mount
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('admin_theme') || 'black-shade';
            setSettings({ theme: savedTheme });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }, []);

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 2000);
    };

    const handleThemeChange = (theme) => {
        setSettings({ theme });
        localStorage.setItem('admin_theme', theme);
        showMessage(`✓ Theme changed to ${theme}!`);

        const bodyClasses = {
            'premium-dark': 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
            'premium-navy': 'bg-gradient-to-br from-blue-900 via-gray-900 to-black',
            'black-shade': 'bg-gradient-to-br from-gray-950 via-gray-900 to-black',
            emerald: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900',
            amber: 'bg-gradient-to-br from-amber-900 via-orange-800 to-red-900',
        };
        document.body.className = bodyClasses[theme] + ' min-h-screen';
    };

    const handleReset = () => {
        setSettings({ theme: 'black-shade' });
        localStorage.setItem('admin_theme', 'black-shade');
        document.body.className = 'bg-gradient-to-br from-gray-950 via-gray-900 to-black min-h-screen';
        showMessage('✓ Theme reset to Black Shade!', 'success');
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1
                            className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Theme Settings
                        </h1>
                        <p className="text-sm text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Choose your preferred admin dashboard theme
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl text-white/70 rounded-xl hover:bg-white/20 transition border border-white/20"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        Reset
                    </button>
                </div>

                {/* Message Toast */}
                {message && (
                    <div
                        className={`mb-4 p-3 rounded-xl text-sm text-center ${
                            messageType === 'success'
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Theme Settings */}
                <GlassCard>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="p-2 rounded-xl bg-white/10">
                                <Palette size={24} className="text-white/60" />
                            </div>
                            <div>
                                <h2
                                    className="text-lg font-semibold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Appearance
                                </h2>
                                <p className="text-sm text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Customize the look and feel of your dashboard
                                </p>
                            </div>
                        </div>

                        {/* Row 1 - 3 Themes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {/* Black Shade */}
                            <button
                                onClick={() => handleThemeChange('black-shade')}
                                className={`p-4 rounded-xl border-2 transition-all group ${
                                    settings.theme === 'black-shade'
                                        ? 'border-gray-400 bg-gray-500/20 shadow-lg ring-2 ring-gray-500/50'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-gray-500/30'
                                }`}>
                                <div className="relative">
                                    <div
                                        className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${
                                            settings.theme === 'black-shade' ? 'bg-green-400 animate-pulse' : 'hidden'
                                        }`}
                                    />
                                    <Moon
                                        size={36}
                                        className={`mx-auto mb-2 transition-transform group-hover:scale-110 ${
                                            settings.theme === 'black-shade' ? 'text-gray-300' : 'text-gray-400'
                                        }`}
                                    />
                                </div>
                                <p className="font-medium text-white">Black Shade</p>
                                <p className="text-xs text-white/40 mb-2">Pure Black to Dark Gray</p>
                                {settings.theme === 'black-shade' && (
                                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-500/30 text-gray-300 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>

                            {/* Premium Dark */}
                            <button
                                onClick={() => handleThemeChange('premium-dark')}
                                className={`p-4 rounded-xl border-2 transition-all group ${
                                    settings.theme === 'premium-dark'
                                        ? 'border-purple-500 bg-purple-500/20 shadow-lg ring-2 ring-purple-500/50'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/30'
                                }`}>
                                <Sparkles
                                    size={36}
                                    className={`mx-auto mb-2 transition-transform group-hover:scale-110 ${
                                        settings.theme === 'premium-dark' ? 'text-purple-400' : 'text-purple-500/60'
                                    }`}
                                />
                                <p className="font-medium text-white">Premium Dark</p>
                                <p className="text-xs text-white/40 mb-2">Purple to Black Gradient</p>
                                {settings.theme === 'premium-dark' && (
                                    <span className="inline-block px-2 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>

                            {/* Premium Navy */}
                            <button
                                onClick={() => handleThemeChange('premium-navy')}
                                className={`p-4 rounded-xl border-2 transition-all group ${
                                    settings.theme === 'premium-navy'
                                        ? 'border-blue-500 bg-blue-500/20 shadow-lg ring-2 ring-blue-500/50'
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30'
                                }`}>
                                <Anchor
                                    size={36}
                                    className={`mx-auto mb-2 transition-transform group-hover:scale-110 ${
                                        settings.theme === 'premium-navy' ? 'text-blue-400' : 'text-blue-500/60'
                                    }`}
                                />
                                <p className="font-medium text-white">Premium Navy</p>
                                <p className="text-xs text-white/40 mb-2">Navy Blue to Black Gradient</p>
                                {settings.theme === 'premium-navy' && (
                                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Row 2 - 2 Themes (Centered) */}
                        <div className="flex justify-center">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                                {/* Emerald */}
                                <button
                                    onClick={() => handleThemeChange('emerald')}
                                    className={`p-4 rounded-xl border-2 transition-all group ${
                                        settings.theme === 'emerald'
                                            ? 'border-emerald-500 bg-emerald-500/20 shadow-lg ring-2 ring-emerald-500/50'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30'
                                    }`}>
                                    <Gem
                                        size={36}
                                        className={`mx-auto mb-2 transition-transform group-hover:scale-110 ${
                                            settings.theme === 'emerald' ? 'text-emerald-400' : 'text-emerald-500/60'
                                        }`}
                                    />
                                    <p className="font-medium text-white">Emerald</p>
                                    <p className="text-xs text-white/40 mb-2">Green to Teal Gradient</p>
                                    {settings.theme === 'emerald' && (
                                        <span className="inline-block px-2 py-0.5 text-xs bg-emerald-500/30 text-emerald-300 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </button>

                                {/* Amber */}
                                <button
                                    onClick={() => handleThemeChange('amber')}
                                    className={`p-4 rounded-xl border-2 transition-all group ${
                                        settings.theme === 'amber'
                                            ? 'border-amber-500 bg-amber-500/20 shadow-lg ring-2 ring-amber-500/50'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/30'
                                    }`}>
                                    <Flame
                                        size={36}
                                        className={`mx-auto mb-2 transition-transform group-hover:scale-110 ${
                                            settings.theme === 'amber' ? 'text-amber-400' : 'text-amber-500/60'
                                        }`}
                                    />
                                    <p className="font-medium text-white">Amber</p>
                                    <p className="text-xs text-white/40 mb-2">Amber to Red Gradient</p>
                                    {settings.theme === 'amber' && (
                                        <span className="inline-block px-2 py-0.5 text-xs bg-amber-500/30 text-amber-300 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </AdminLayout>
    );
}

export default AdminSettings;
