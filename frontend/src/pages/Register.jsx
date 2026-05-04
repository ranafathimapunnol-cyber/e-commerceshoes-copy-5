import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            alert('Please fill all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);

            // 1️⃣ REGISTER
            await axios.post('http://127.0.0.1:8000/api/users/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            // 2️⃣ LOGIN (✅ FIXED ENDPOINT)
            const loginRes = await axios.post('http://127.0.0.1:8000/api/users/login/', {
                username: formData.username,
                password: formData.password,
            });

            // 3️⃣ SAVE TOKEN
            localStorage.setItem('access', loginRes.data.access);
            localStorage.setItem('refresh', loginRes.data.refresh);

            alert('Account created successfully 🎉');

            // 4️⃣ REDIRECT TO LOGGED-IN PAGE
            navigate('/');
        } catch (error) {
            console.log('REGISTER ERROR:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
                <h1 className="text-4xl font-black mb-2">Create Account</h1>
                <p className="text-gray-400 mb-8">Join RAPIDO today</p>

                <form onSubmit={handleRegister} className="space-y-5">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3 rounded-lg font-bold">
                        {loading ? 'Creating...' : 'REGISTER'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
