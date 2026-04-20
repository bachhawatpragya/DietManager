import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';
import {
    FaUser, FaPersonRunning, FaAppleWhole, FaFire, FaWheatAwn,
    FaDroplet, FaCheckDouble, FaShieldHalved, FaArrowsRotate
} from 'react-icons/fa6';
import { GiBodyHeight, GiWeightScale, GiMuscleUp } from 'react-icons/gi';

const ProfileSetup = ({ onProfileUpdate }) => {
    // --- State ---
    const [formData, setFormData] = useState({
        age: '', gender: '', height: '', weight: '',
        goal: 'maintenance', activityLevel: 'moderate',
        dietaryRestrictions: [], allergies: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculatedTargets, setCalculatedTargets] = useState(null);

    // --- Effects ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await dietAPI.getProfile();
                if (res.success && res.profile) {
                    const p = res.profile;
                    setFormData({
                        age: p.age || '',
                        gender: p.gender || '',
                        height: p.height || '',
                        weight: p.weight || '',
                        goal: p.goal || 'maintenance',
                        activityLevel: p.activityLevel || 'moderate',
                        dietaryRestrictions: p.dietaryRestrictions || [],
                        allergies: p.allergies || []
                    });
                    // Map model fields to calculatedTargets display format
                    if (p.dailyCalories) {
                        setCalculatedTargets({
                            calories: p.dailyCalories,
                            protein: p.proteinTarget || 0,
                            carbs: p.carbsTarget || 0,
                            fat: p.fatTarget || 0
                        });
                    }
                }
            } catch (err) {
                console.error('Profile fetch failed:', err);
            }
        };
        fetchProfile();
    }, []);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                dietaryRestrictions: checked
                    ? [...prev.dietaryRestrictions, value]
                    : prev.dietaryRestrictions.filter(r => r !== value)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAllergyChange = (e) => {
        const allergies = e.target.value.split(',').map(s => s.trim());
        setFormData(prev => ({ ...prev, allergies }));
    };

    const calculateTargets = () => {
        const { age, height, weight, gender, activityLevel, goal } = formData;
        if (!age || !height || !weight || !gender) {
            setMessage({ type: 'error', text: 'Please fill in Age, Gender, Height and Weight first.' });
            return;
        }

        // --- BMR (Mifflin-St Jeor Equation) ---
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = gender === 'male' ? bmr + 5 : bmr - 161;

        // --- TDEE ---
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        let calories = Math.round(bmr * multipliers[activityLevel]);

        if (goal === 'weight_loss') calories -= 500;
        if (goal === 'weight_gain') calories += 500;

        const protein = Math.round(weight * 2);
        const fat = Math.round((calories * 0.25) / 9);
        const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

        const targets = { calories, protein, carbs, fat };
        setCalculatedTargets(targets);
        setMessage({ type: 'success', text: 'Targets recalculated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return targets;
    };

    const handleAllergySubmit = async () => {
        try {
            await dietAPI.updateProfile({ ...formData });
            setMessage({ type: 'success', text: 'Allergies saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save allergies. Please try again.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const targets = calculateTargets();
            await dietAPI.updateProfile({ ...formData, dailyTargets: targets });
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const dietOptions = [
        { id: 'vegan', icon: '🌱' },
        { id: 'vegetarian', icon: '🥚' },
        { id: 'keto', icon: '🥩' },
        { id: 'paleo', icon: '🍖' },
        { id: 'gluten-free', icon: '🌾' },
        { id: 'dairy-free', icon: '🥛' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 animate-enter">

            {/* Zen-Modern Header */}
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 pb-10 border-b border-slate-800/50">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Personal Wellness Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Fine-tune your biometrics for a perfectly balanced lifestyle.</p>
                </div>
                <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase">Our Goal =<span className="text-slate-900 dark:text-white"> Your Wellness</span></span>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'} text-sm font-semibold text-center animate-enter`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Left Pane: Lifestyle & Biometrics */}
                <div className="lg:col-span-8 space-y-12">

                    {/* Section 01: Physical Data */}
                    <section className="premium-card p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <FaUser className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Physical Data</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[
                                { label: 'Current Age', name: 'age', val: formData.age },
                                { label: 'Your Gender', name: 'gender', val: formData.gender, type: 'select', options: ['male', 'female', 'other'] },
                                { label: 'Height (cm)', name: 'height', val: formData.height, icon: <GiBodyHeight /> },
                                { label: 'Weight (kg)', name: 'weight', val: formData.weight, icon: <GiWeightScale />, step: '0.1' }
                            ].map(field => (
                                <div key={field.name} className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{field.label}</label>
                                    <div className="relative">
                                        {field.type === 'select' ? (
                                            <select name={field.name} value={field.val} onChange={handleChange} className="input-style-pro w-full text-sm font-semibold">
                                                <option value="">Select ID</option>
                                                {field.options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type="number" name={field.name} value={field.val} onChange={handleChange} step={field.step} className="input-style-pro w-full text-lg font-bold" placeholder="00" />
                                        )}
                                        {field.icon && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{field.icon}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 02: Daily Rhythm & Goals */}
                    <section className="premium-card p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <FaPersonRunning className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Your Rhythm & Goals</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {[
                                {
                                    label: 'Wellness Objective', name: 'goal', options: [
                                        { v: 'weight_loss', l: 'Healthy Weight Loss' },
                                        { v: 'weight_gain', l: 'Healthy Weight Gain' },
                                        { v: 'muscle_gain', l: 'Build Muscle' },
                                        { v: 'maintenance', l: 'Maintain Balance' }
                                    ]
                                },
                                {
                                    label: 'Active Lifestyle Level', name: 'activityLevel', options: [
                                        { v: 'sedentary', l: 'Primarily Sedentary' },
                                        { v: 'light', l: 'Lightly Active (1-2 workouts)' },
                                        { v: 'moderate', l: 'Moderately Active (3-5 workouts)' },
                                        { v: 'active', l: 'Highly Active (6-7 workouts)' },
                                        { v: 'very_active', l: 'Intense / Athlete Level' }
                                    ]
                                }
                            ].map(select => (
                                <div key={select.name} className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{select.label}</label>
                                    <select name={select.name} value={formData[select.name]} onChange={handleChange} className="input-style-pro w-full text-base font-semibold bg-white dark:bg-slate-900">
                                        {select.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 03: Dietary Blueprint */}
                    <section className="premium-card p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                <FaAppleWhole className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Dietary Preferences</h3>
                        </div>

                        <div className="space-y-12">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {dietOptions.map(opt => (
                                    <button
                                        key={opt.id} type="button"
                                        onClick={() => handleChange({ target: { name: 'dietaryRestrictions', value: opt.id, type: 'checkbox', checked: !formData.dietaryRestrictions.includes(opt.id) } })}
                                        className={`border px-4 py-3 rounded-2xl flex flex-col items-center gap-2 group transition-all duration-300 ${formData.dietaryRestrictions.includes(opt.id)
                                            ? 'bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-500 dark:border-emerald-500 shadow-[0_8px_16px_-4px_rgba(16,185,129,0.4)]'
                                            : 'bg-slate-100 text-slate-600 dark:text-slate-300 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="text-2xl transition-transform group-hover:scale-110">{opt.icon}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{opt.id}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pl-1">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Known Allergies</label>
                                    <button
                                        type="button"
                                        onClick={handleAllergySubmit}
                                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 uppercase tracking-widest transition-colors border border-emerald-500/30 px-3 py-1 rounded-lg hover:bg-emerald-500/10"
                                    >
                                        💾 Save Allergies
                                    </button>
                                </div>
                                <input
                                    type="text" value={formData.allergies.join(', ')} onChange={handleAllergyChange}
                                    className="input-style-pro w-full font-semibold text-base" placeholder="e.g. Peanuts, Shellfish, Dairy..."
                                />
                                <p className="text-[10px] text-slate-400 pl-1">Separate multiple allergies with commas. Click Save Allergies to save independently.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Pane: Wellness Targets */}
                <div className="lg:col-span-4 space-y-10 h-fit lg:sticky lg:top-10">

                    <div className="premium-card p-10 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-emerald-500/10 overflow-hidden relative">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-center mb-12 relative z-10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Daily Targets</h3>
                            <button
                                type="button"
                                onClick={calculateTargets}
                                className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30 px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                            >
                                <FaArrowsRotate className="text-sm" />
                                Recalculate
                            </button>
                        </div>

                        {calculatedTargets ? (
                            <div className="space-y-12 relative z-10">
                                <div className="text-center md:text-left">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Energy Allowance</span>
                                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                        <span className="text-6xl font-black text-emerald-500 tracking-tighter">{calculatedTargets.calories}</span>
                                        <span className="text-slate-400 dark:text-slate-500 font-bold">kcal</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 w-full rounded-full mt-6 overflow-hidden">
                                        <div className="h-full accent-gradient shadow-[0_0_15px_rgba(16,185,129,0.4)] w-full"></div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {[
                                        { label: 'Protein', val: calculatedTargets.protein, max: 250, color: 'bg-rose-500/80', shadow: 'shadow-rose-500/20' },
                                        { label: 'Carbs', val: calculatedTargets.carbs, max: 400, color: 'bg-amber-500/80', shadow: 'shadow-amber-500/20' },
                                        { label: 'Fats', val: calculatedTargets.fat, max: 150, color: 'bg-indigo-500/80', shadow: 'shadow-indigo-500/20' }
                                    ].map(macro => (
                                        <div key={macro.label} className="space-y-3">
                                            <div className="flex justify-between items-end px-1">
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{macro.label}</span>
                                                <span className="text-xl font-bold text-slate-900 dark:text-white">{macro.val}g</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 w-full rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${macro.color} ${macro.shadow} shadow-lg transition-all duration-1000`}
                                                    style={{ width: `${Math.min((macro.val / macro.max) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl relative z-10">
                                <p className="text-slate-500 font-bold leading-relaxed px-6">Input your physical data to reveal your personalized wellness blueprint. ✨</p>
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="mt-12 w-full py-5 bg-emerald-500 text-slate-950 font-bold uppercase tracking-[0.1em] text-sm rounded-2xl hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)]"
                        >
                            {loading ? 'Saving Profile...' : 'Update Profile & Plan'}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default ProfileSetup;
