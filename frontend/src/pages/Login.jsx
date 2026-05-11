import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import axios from 'axios';

import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // =========================
    // REDIRECT IF LOGGED IN
    // =========================
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    // =========================
    // LOGIN - CUSTOMER ONLY
    // =========================
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            setLoading(true);

            // ✅ UPDATED: Use customer login endpoint (NOT admin endpoint)
            const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
                username: username,
                password: password,
            });

            // ✅ Store customer tokens (NOT admin tokens)
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            toast.success('Login successful ✅');
            navigate('/');
        } catch (err) {
            console.log(err);

            // Handle different error responses
            if (err.response?.status === 401) {
                toast.error('Invalid username or password ❌');
            } else if (err.response?.status === 403) {
                toast.error('Admin users cannot login as customers. Please use admin portal.');
            } else if (err.response?.data?.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-black text-white">
            {/* LEFT */}
            <div className="hidden lg:flex w-1/2 relative">
                <img src="/login.png" alt="login" className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-black/60"></div>

                <div className="absolute bottom-20 left-10">
                    <h1 className="text-5xl font-black">RAPIDO</h1>
                    <p className="text-gray-300 mt-2">Move Fast. Stay Ahead.</p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                    <h2 className="text-4xl font-black mb-2">Welcome Back</h2>
                    <p className="text-gray-400 mb-8">Login to your customer account</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* USERNAME */}
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
                        />

                        {/* PASSWORD */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 outline-none focus:border-white/30"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                            {loading ? 'Logging in...' : 'LOGIN'}
                        </button>
                    </form>

                    {/* REGISTER */}
                    <p className="text-gray-400 text-sm text-center mt-6">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-white font-semibold hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
