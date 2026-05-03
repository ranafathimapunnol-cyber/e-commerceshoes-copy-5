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

        if (!formData.username || !formData.email || !formData.password) {
            alert('Please fill all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);

            await axios.post('http://127.0.0.1:8000/api/users/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            alert('Registration successful ✅');

            navigate('/login');
        } catch (error) {
            console.log(error);

            alert('Registration failed ❌');
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
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3"
                    />

                    <button type="submit" className="w-full bg-white text-black py-3 rounded-lg font-bold">
                        {loading ? 'Creating Account...' : 'REGISTER'}
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
