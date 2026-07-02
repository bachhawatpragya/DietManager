import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { authAPI } from '../services/api';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(true);
    
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = await authAPI.resetPassword(resetToken, formData.password);

            if (result.success) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.message || 'Something went wrong.');
            }
        } catch (error) {
            setError('Invalid or expired reset token');
            setValidToken(false);
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
    `;

    // --- Invalid Token View ---
    if (!validToken) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
                <style>{customStyles}</style>
                {/* Background Decorative Animated Blobs/Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] animate-float-1 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 blur-[120px] animate-float-2 pointer-events-none"></div>

                <div className="max-w-md w-full glass-panel rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 text-center z-10 relative">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-sm">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Link Expired</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                        This password reset link is invalid or has expired. Please request a new link.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all duration-200 cursor-pointer"
                    >
                        <FiArrowLeft className="text-lg" />
                        <span>Back to Login</span>
                    </button>
                </div>
            </div>
        );
    }

    // --- Main Reset Form View ---
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
            <style>{customStyles}</style>
            
            {/* Background Decorative Animated Blobs/Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] animate-float-1 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-500/10 blur-[120px] animate-float-2 pointer-events-none"></div>

            <div className="max-w-md w-full glass-panel rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-10 z-10 relative">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-sm">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Please enter your new password to secure your account.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    
                    {/* Error Notification Alert */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 transition-all duration-300">
                            <span>⚠️</span>
                            <p className="leading-tight">{error}</p>
                        </div>
                    )}

                    {/* Success Notification Alert */}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 transition-all duration-300">
                            <FiCheckCircle className="text-lg" />
                            <p className="leading-tight">{success}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {/* Password Input group */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">
                                New Password
                            </label>
                            <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 bg-slate-50/50 dark:bg-slate-900/30 glow-input flex items-center">
                                <div className="pl-4 text-slate-400 pointer-events-none">
                                    <FiLock className="text-lg" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-3 pr-10 py-3.5 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
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
                        <div className="space-y-1.5">
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
                                    className="block w-full pl-3 pr-10 py-3.5 bg-transparent text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none text-sm rounded-2xl"
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
                                <span>Resetting...</span>
                            </div>
                        ) : (
                            <span>Reset Password</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;