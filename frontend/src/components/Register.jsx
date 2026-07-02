import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Register = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const result = await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                login(result.user, result.token);
            } else {
                setError(result.message || 'Registration failed. Try again.');
            }
        } catch (error) {
            setError('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Premium Styling & Custom Keyframes ---
    const customStyles = `
        @keyframes float-orb-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-orb-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 40px) scale(1.15); }
        }
        .animate-float-1 {
            animation: float-orb-1 12s infinite ease-in-out;
        }
        .animate-float-2 {
            animation: float-orb-2 16s infinite ease-in-out;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass-panel {
            background: rgba(15, 23, 42, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glow-input:focus-within {
            border-color: #10b981;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
        }
        .text-glow {
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }
    `;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
            <style>{customStyles}</style>

            {/* Background Decorative Animated Blobs/Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 blur-[120px] animate-float-1 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] animate-float-2 pointer-events-none"></div>
            <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

            {/* Main Interactive Register Card Container */}
            <div className="max-w-5xl w-full glass-panel rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row-reverse z-10 transition-all duration-300">

                {/* Right Side: Dynamic Showcase (Reversed for register page) */}
                <div className="md:w-1/2 relative hidden md:block">
                    {/* Animated grid pattern overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                    {/* Background image component with cover blend */}
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>

                    {/* Logo/Brand Header */}
                    <div className="absolute top-12 left-12 z-10 flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-emerald-500/30">
                            <span className="text-xl">🥗</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-wide">
                            DietPlanner
                        </span>
                    </div>

                    {/* Promotional Content */}
                    <div className="absolute bottom-12 left-12 right-12 z-10 text-left">
                        <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                            Start Your Journey, <br />
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-glow">Unlock Your Potential</span>
                        </h2>
                        <p className="text-slate-300 text-sm max-w-sm leading-relaxed mb-6">
                            Create your account and let our advanced meal plan engine construct the perfect health strategy custom-tailored for you.
                        </p>

                        {/* Interactive health indicator */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit">
                            <div className="text-center px-2">
                                <span className="block text-xs text-slate-400">Goals Gated</span>
                                <span className="text-lg font-bold text-emerald-400">Protein, Cal, Fat</span>
                            </div>
                            <div className="w-[1px] bg-white/10"></div>
                            <div className="text-center px-2">
                                <span className="block text-xs text-slate-400">AI Support</span>
                                <span className="text-lg font-bold text-teal-400">24/7 Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Side: Authentication Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white/40 dark:bg-slate-950/20 backdrop-blur-md">

                    {/* Welcome Header */}
                    <div className="mb-6">
                        <div className="md:hidden flex items-center gap-2 mb-4 justify-center">
                            <span className="text-3xl">🥗</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">DietPlanner</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                            Create Account
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Join us today and discover a healthier path.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {/* Error Notification Alert */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 transition-all duration-300">
                                <span>⚠️</span>
                                <p className="leading-tight">{error}</p>
                            </div>
                        )}

                        {/* Username Input group */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Username
                            </label>
                            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 bg-slate-50/50 dark:bg-slate-900/30 glow-input flex items-center">
                                <div className="pl-4 text-slate-400 pointer-events-none">
                                    <FiUser className="text-lg" />
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-3 pr-4 py-3 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
                                    placeholder="yourusername"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Input group */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Email Address
                            </label>
                            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 bg-slate-50/50 dark:bg-slate-900/30 glow-input flex items-center">
                                <div className="pl-4 text-slate-400 pointer-events-none">
                                    <FiMail className="text-lg" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-3 pr-4 py-3 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
                                    placeholder="name@domain.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Input group */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 bg-slate-50/50 dark:bg-slate-900/30 glow-input flex items-center">
                                <div className="pl-4 text-slate-400 pointer-events-none">
                                    <FiLock className="text-lg" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-3 pr-10 py-3 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input group */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Confirm Password
                            </label>
                            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 bg-slate-50/50 dark:bg-slate-900/30 glow-input flex items-center">
                                <div className="pl-4 text-slate-400 pointer-events-none">
                                    <FiLock className="text-lg" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-3 pr-10 py-3 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                <span className="px-3 bg-white dark:bg-slate-950/20 text-slate-400 font-bold backdrop-blur-md rounded-full">
                                    Already a member?
                                </span>
                            </div>
                        </div>

                        {/* Redirect to Login */}
                        <button
                            type="button"
                            onClick={switchToLogin}
                            className="w-full flex justify-center py-3.5 px-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all duration-200 cursor-pointer"
                        >
                            Sign in instead
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;