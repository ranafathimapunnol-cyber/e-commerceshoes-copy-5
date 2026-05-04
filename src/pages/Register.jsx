import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);

    // =========================
    // HANDLE INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // =========================
    // REGISTER
    // =========================
    const handleRegister = async (e) => {
        e.preventDefault();

        const { username, email, password, confirmPassword } = formData;

        if (!username || !email || !password || !confirmPassword) {
            toast.error('Please fill all fields ⚠️');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match ❌');
            return;
        }

        try {
            setLoading(true);

            // 1️⃣ REGISTER USER
            await axios.post('http://127.0.0.1:8000/api/users/register/', {
                username,
                email,
                password,
            });

            // 2️⃣ AUTO LOGIN AFTER REGISTER
            const loginRes = await axios.post('http://127.0.0.1:8000/api/users/login/', {
                username,
                password,
            });

            // 3️⃣ SAVE TOKENS
            localStorage.setItem('access', loginRes.data.access);
            localStorage.setItem('refresh', loginRes.data.refresh);

            toast.success('Account created successfully 🎉');

            // 4️⃣ REDIRECT
            navigate('/');
        } catch (error) {
            console.log('REGISTER ERROR:', error.response?.data || error.message);

            toast.error(error.response?.data?.error || 'Registration failed. Try again ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
                {/* TITLE */}
                <h1 className="text-4xl font-black mb-2">Create Account</h1>
                <p className="text-gray-400 mb-8">Join RAPIDO today 🚀</p>

                {/* FORM */}
                <form onSubmit={handleRegister} className="space-y-5">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-white/30"
                    />

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-60">
                        {loading ? 'Creating Account...' : 'REGISTER'}
                    </button>
                </form>

                {/* LOGIN LINK */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
