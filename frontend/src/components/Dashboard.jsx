import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dietAPI } from '../services/api';
import ProfileSetup from './ProfileSetup';
import MealPlanner from './MealPlanner';
import FoodSearch from './FoodSearch';
import ProgressTracker from './ProgressTracker';
import ContactPage from './ContactPage';
import GroceryList from './GroceryList';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { FiSun, FiMoon, FiGrid, FiSearch, FiTrendingUp, FiUser, FiSettings, FiMail, FiShoppingCart, FiArrowRight, FiZap } from 'react-icons/fi';
import { MdRestaurantMenu, MdOutlineFreeBreakfast, MdOutlineLunchDining, MdOutlineDinnerDining, MdOutlineRestaurant } from 'react-icons/md';
import { FaFire, FaWeight, FaBullseye, FaHamburger, FaTrophy } from 'react-icons/fa';
import { GiAvocado, GiChickenLeg, GiSteak } from 'react-icons/gi';
import { BiBowlRice } from 'react-icons/bi';

/* ─── tiny hook: animated counter ─── */
const useCounter = (target, duration = 900) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(Math.round(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return val;
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

    useEffect(() => { loadDashboardData(); }, []);

    const loadDashboardData = async () => {
        try {
            const result = await dietAPI.getDashboard();
            if (result.success) setDashboardData(result.stats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const renderSection = () => {
        const Wrapper = ({ children }) => <div className="animate-enter">{children}</div>;
        switch (activeSection) {
            case 'overview':   return <Wrapper><DashboardOverview data={dashboardData} onRefresh={loadDashboardData} setActiveSection={setActiveSection} darkMode={darkMode} /></Wrapper>;
            case 'profile':    return <Wrapper><ProfileSetup onProfileUpdate={loadDashboardData} /></Wrapper>;
            case 'meal-plan':  return <Wrapper><MealPlanner darkMode={darkMode} onPlanUpdate={loadDashboardData} onNavigate={setActiveSection} /></Wrapper>;
            case 'grocery':    return <Wrapper><GroceryList darkMode={darkMode} /></Wrapper>;
            case 'food-search':return <Wrapper><FoodSearch /></Wrapper>;
            case 'progress':   return <Wrapper><ProgressTracker /></Wrapper>;
            case 'contact':    return <Wrapper><ContactPage /></Wrapper>;
            default:           return <Wrapper><DashboardOverview data={dashboardData} onRefresh={loadDashboardData} setActiveSection={setActiveSection} darkMode={darkMode} /></Wrapper>;
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center flex-col ${darkMode ? 'dark-theme' : ''} app-bg`}>
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 text-2xl">
                        <BiBowlRice />
                    </div>
                </div>
                <p className="text-secondary font-semibold tracking-wide">Preparing your plan…</p>
            </div>
        );
    }

    const navItems = [
        { id: 'overview',    name: 'Overview',      icon: <FiGrid size={16} /> },
        { id: 'meal-plan',   name: 'Meal Plan',     icon: <MdRestaurantMenu size={16} /> },
        { id: 'grocery',     name: 'Grocery List',  icon: <FiShoppingCart size={16} /> },
        { id: 'progress',    name: 'Progress',      icon: <FiTrendingUp size={16} /> },
        { id: 'profile',     name: 'Profile',       icon: <FiUser size={16} /> },
        { id: 'contact',     name: 'Contact',       icon: <FiMail size={16} /> },
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark-theme' : ''} app-bg`}>
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl card-bg border-b border-slate-100 dark:border-slate-800/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3.5">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl shadow-md shadow-emerald-500/30">
                                <BiBowlRice />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-primary">
                                Diet<span className="text-emerald-500">Planner</span>
                            </span>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Toggle theme"
                            >
                                {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
                            </button>
                            <div className="hidden md:flex flex-col items-end leading-tight">
                                <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">Welcome back</span>
                                <span className="text-sm font-bold text-primary">{user.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Nav Tabs ── */}
            <div className="card-bg sticky top-[65px] z-40 border-b border-slate-100 dark:border-slate-800/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                    activeSection === item.id
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                                        : 'text-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span className="flex items-center">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {renderSection()}
            </main>
        </div>
    );
};

/* ════════════════════════════════════════════
   DashboardOverview
════════════════════════════════════════════ */
const DashboardOverview = ({ data, onRefresh, setActiveSection, darkMode }) => {

    if (!data) {
        return (
            <div className="card-bg rounded-3xl p-16 text-center flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-4xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                    <GiAvocado />
                </div>
                <h3 className="text-2xl font-bold text-primary">Let's get started!</h3>
                <p className="text-secondary max-w-xs">Set up your profile to unlock personalized tracking and AI meal planning.</p>
                <button onClick={onRefresh} className="mt-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95">
                    Refresh Dashboard
                </button>
            </div>
        );
    }

    const { profile, todayMealPlan, recentWeight } = data;

    /* ── Macro Calculation ── */
    let protein = 0, carbs = 0, fat = 0, totalCal = 0;
    if (todayMealPlan?.meals) {
        todayMealPlan.meals.forEach(meal => {
            meal.items?.forEach(item => {
                if (item.food) {
                    const factor = (parseFloat(item.servingSize?.amount) || 0) / (parseFloat(item.food.servingSize?.amount) || 100);
                    const n = item.food.nutrition || {};
                    protein += (n.protein || 0) * factor;
                    carbs   += (n.carbs   || 0) * factor;
                    fat     += (n.fat     || 0) * factor;
                    totalCal+= (n.calories|| 0) * factor;
                }
            });
        });
    }
    const consumed  = { protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat), calories: Math.round(totalCal) };
    const totalMacros = consumed.protein + consumed.carbs + consumed.fat;
    const calTarget = profile?.dailyCalories || 2000;
    const calPct    = Math.min(100, Math.round((consumed.calories / calTarget) * 100));

    const macroData = [
        { name: 'Protein', value: consumed.protein, color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-500/10 text-emerald-500' },
        { name: 'Carbs',   value: consumed.carbs,   color: '#f59e0b', bg: 'bg-amber-400',   light: 'bg-amber-400/10 text-amber-500' },
        { name: 'Fat',     value: consumed.fat,      color: '#ef4444', bg: 'bg-rose-500',    light: 'bg-rose-500/10 text-rose-500' },
    ];
    const pieData = totalMacros > 0 ? macroData : [{ name: 'No Data', value: 1, color: 'var(--border)' }];

    /* ── Animated counter for calories ── */
    const animatedCal = useCounter(consumed.calories);

    /* ── Quick Action config ── */
    const quickActions = [
        { id: 'meal-plan',   label: 'Plan Meals',    emoji: '🍽️', gradient: 'from-orange-400 to-amber-400',   shadow: 'shadow-orange-400/25' },
        { id: 'food-search', label: 'Find Food',     emoji: '🔍', gradient: 'from-emerald-400 to-teal-400',   shadow: 'shadow-emerald-400/25' },
        { id: 'progress',    label: 'Log Weight',    emoji: '⚖️', gradient: 'from-blue-400 to-indigo-500',    shadow: 'shadow-blue-400/25' },
        { id: 'grocery',     label: 'Grocery List',  emoji: '🛒', gradient: 'from-violet-400 to-purple-500',  shadow: 'shadow-violet-400/25' },
    ];

    return (
        <div className="space-y-8">

            {/* ── Hero Overview Banner ── */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/40 p-7 shadow-sm dark:shadow-xl">
                {/* Thin top accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

                <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Left — title + progress */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mb-2">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Daily Overview
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                            {calPct >= 80
                                ? 'Near your calorie target — excellent consistency.'
                                : calPct >= 50
                                    ? 'Halfway through your nutrition goals for today.'
                                    : 'Start logging meals to build your daily picture.'}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-5">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Calorie Progress</span>
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{animatedCal} / {calTarget} kcal</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
                                    style={{ width: `${calPct}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 text-right tabular-nums">{calPct}% of daily goal</p>
                        </div>
                    </div>

                    {/* Right — macro pills */}
                    <div className="flex md:flex-col gap-3 md:gap-4 flex-shrink-0">
                        {[
                            { label: 'Protein', value: `${consumed.protein}g`, color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
                            { label: 'Carbs',   value: `${consumed.carbs}g`,   color: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-400' },
                            { label: 'Fat',     value: `${consumed.fat}g`,     color: 'text-rose-600 dark:text-rose-400',     dot: 'bg-rose-500' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                                <div className="leading-none">
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-0.5">{s.label}</p>
                                    <p className={`text-base font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Top Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Daily Target',
                        value: profile?.dailyCalories || 2000,
                        unit: 'kcal',
                        icon: '🔥',
                        gradient: 'from-orange-400 to-amber-500',
                        shadow: 'shadow-orange-400/20',
                    },
                    {
                        label: 'Protein Goal',
                        value: profile?.proteinTarget || 50,
                        unit: 'g',
                        icon: '🥩',
                        gradient: 'from-emerald-400 to-teal-500',
                        shadow: 'shadow-emerald-400/20',
                    },
                    {
                        label: 'Current Weight',
                        value: recentWeight || profile?.weight || '--',
                        unit: 'kg',
                        icon: '⚖️',
                        gradient: 'from-blue-400 to-indigo-500',
                        shadow: 'shadow-blue-400/20',
                    },
                    {
                        label: 'Your Goal',
                        value: profile?.goal ? profile.goal.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('\u00A0') : 'Set goal',
                        unit: '',
                        icon: '🎯',
                        gradient: 'from-violet-400 to-purple-600',
                        shadow: 'shadow-violet-400/20',
                    },
                ].map((card, i) => (
                    <div
                        key={i}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} text-white p-5 shadow-lg ${card.shadow} group cursor-default`}
                    >
                        {/* Glow blob */}
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xl transition-all duration-500 group-hover:scale-150" />
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl mb-3 backdrop-blur-sm">
                                {card.icon}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{card.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold leading-none">{card.value}</span>
                                {card.unit && <span className="text-sm font-medium text-white/80">{card.unit}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main 2-col grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Quick Actions */}
                    <div className="card-bg rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg"><FiZap size={16} /></span>
                            <h2 className="text-base font-bold text-primary">Quick Actions</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {quickActions.map(a => (
                                <button
                                    key={a.id}
                                    onClick={() => setActiveSection && setActiveSection(a.id)}
                                    className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {/* Gradient fill on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${a.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                    <span className="relative z-10 text-2xl transition-transform duration-300 group-hover:scale-110">{a.emoji}</span>
                                    <span className="relative z-10 text-xs font-bold text-secondary group-hover:text-white transition-colors duration-300">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Today's Menu */}
                    <div className="card-bg rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg"><MdRestaurantMenu size={16} /></span>
                                <h2 className="text-base font-bold text-primary">Today's Menu</h2>
                            </div>
                            <button
                                onClick={() => setActiveSection('meal-plan')}
                                className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:gap-2 transition-all"
                            >
                                Full Plan <FiArrowRight size={12} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {todayMealPlan?.meals?.filter(m => m.items?.length > 0).length > 0 ? (
                                todayMealPlan.meals
                                    .filter(m => m.items?.length > 0)
                                    .sort((a, b) => ['breakfast', 'lunch', 'snack-1', 'dinner'].indexOf(a.name) - ['breakfast', 'lunch', 'snack-1', 'dinner'].indexOf(b.name))
                                    .map((meal, i) => {
                                        const cfg = {
                                            breakfast: { time: '9:00 AM', icon: <MdOutlineFreeBreakfast />, border: 'border-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-500' },
                                            lunch:     { time: '1:00 PM', icon: <MdOutlineLunchDining />,  border: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-500' },
                                            'snack-1': { time: '5:00 PM', icon: <MdOutlineRestaurant />,   border: 'border-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-500' },
                                            dinner:    { time: '8:00 PM', icon: <MdOutlineDinnerDining />, border: 'border-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-500' },
                                        };
                                        const c = cfg[meal.name] || cfg.dinner;
                                        const mealName = meal.name === 'snack-1' ? 'Snacks' : meal.name.charAt(0).toUpperCase() + meal.name.slice(1);

                                        // Calorie sum for this meal
                                        let mealCal = 0;
                                        meal.items?.forEach(item => {
                                            if (item.food) {
                                                const factor = (parseFloat(item.servingSize?.amount) || 0) / (parseFloat(item.food.servingSize?.amount) || 100);
                                                mealCal += ((item.food.nutrition?.calories) || 0) * factor;
                                            }
                                        });

                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-4 p-3.5 rounded-xl border-l-4 ${c.border} ${c.bg} transition-all hover:pl-4 cursor-default`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center text-xl flex-shrink-0`}>
                                                    {c.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-primary text-sm">{mealName}</h4>
                                                    <p className="text-xs text-secondary">{c.time} — {meal.items?.length} item{meal.items?.length !== 1 ? 's' : ''}</p>
                                                </div>
                                                <span className={`text-sm font-extrabold ${c.text}`}>
                                                    {Math.round(mealCal)} kcal
                                                </span>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                    <p className="text-3xl mb-2">🍽️</p>
                                    <p className="text-secondary font-medium text-sm">No meals logged yet.</p>
                                    <button
                                        onClick={() => setActiveSection('meal-plan')}
                                        className="mt-3 text-xs font-bold text-emerald-500 hover:underline"
                                    >Plan your meals →</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">

                    {/* Macro Chart */}
                    <div className="card-bg p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><GiSteak size={16} /></span>
                            <h3 className="font-bold text-primary text-base">Macro Split</h3>
                        </div>

                        <div className="h-44 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        innerRadius={52} outerRadius={72}
                                        paddingAngle={4} dataKey="value" stroke="none"
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(v, n) => [n === 'No Data' ? '0g' : `${v}g`, n]}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--bg-card)',
                                            color: 'var(--text-main)',
                                            boxShadow: '0 4px 24px rgba(0,0,0,.12)',
                                        }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-extrabold text-primary">{totalMacros}g</span>
                                <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">Total</span>
                            </div>
                        </div>

                        {/* Macro bars */}
                        <div className="mt-4 space-y-3">
                            {macroData.map(m => {
                                const pct = totalMacros > 0 ? Math.round((m.value / totalMacros) * 100) : 0;
                                return (
                                    <div key={m.name}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                                                <span className="text-xs font-semibold text-secondary">{m.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary">{m.value}g <span className="text-secondary font-normal">({pct}%)</span></span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${pct}%`, backgroundColor: m.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Profile Prompt */}
                    {!profile?.age && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg shadow-orange-400/20">
                            <div className="absolute -right-4 -bottom-4 text-[80px] opacity-10 pointer-events-none"><FiSettings /></div>
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-lg mb-1 flex items-center gap-2">Complete Setup <FiSettings size={16} /></h3>
                                <p className="text-sm text-white/85 mb-4 leading-relaxed">Add your stats so we can personalize your calorie targets and meal suggestions.</p>
                                <button
                                    onClick={() => setActiveSection('profile')}
                                    className="flex items-center gap-2 bg-white text-orange-600 px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-orange-50 transition-colors"
                                >
                                    Go to Profile <FiArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Water reminder card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-5 text-white shadow-lg shadow-sky-400/20">
                        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="text-4xl">💧</div>
                            <div>
                                <p className="font-extrabold text-sm">Stay Hydrated!</p>
                                <p className="text-xs text-white/80 mt-0.5 leading-relaxed">Aim for 8 glasses of water throughout the day.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;