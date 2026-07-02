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

import { 
    FiSun, FiMoon, FiGrid, FiTrendingUp, FiUser, 
    FiSettings, FiMail, FiShoppingCart, FiArrowRight, 
    FiZap, FiDroplet, FiHome, FiCalendar, FiMenu, FiX, FiPlus, FiChevronRight 
} from 'react-icons/fi';
import { MdRestaurantMenu, MdOutlineFreeBreakfast, MdOutlineLunchDining, MdOutlineDinnerDining, MdOutlineRestaurant } from 'react-icons/md';
import { GiAvocado, GiSteak } from 'react-icons/gi';
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

// Symmetrical Leaf Icon matching the brand
const LeafIcon = () => (
    <svg className="w-6 h-6 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 3H12C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12V7C21 4.79 19.21 3 17 3ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5H17C18.1 5 19 5.9 19 7V12C19 15.87 15.87 19 12 19Z"/>
        <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10C17 8.35 15.65 7 14 7H12ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9H14C14.55 9 15 9.45 15 10V12C15 13.65 13.65 15 12 15Z"/>
    </svg>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Collapsible sidebar state

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
            <div className="min-h-screen flex items-center justify-center flex-col bg-slate-50 dark:bg-[#080a0f] transition-colors duration-300">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500 text-2xl">
                        <BiBowlRice />
                    </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide">Preparing your plan…</p>
            </div>
        );
    }

    const navItems = [
        { id: 'overview',    name: 'Dashboard',     icon: <FiHome size={18} /> },
        { id: 'meal-plan',   name: 'Meal Planner',  icon: <FiCalendar size={18} /> },
        { id: 'grocery',     name: 'Grocery List',  icon: <FiShoppingCart size={18} /> },
        { id: 'progress',    name: 'Progress',      icon: <FiTrendingUp size={18} /> },
        { id: 'profile',     name: 'Profile',       icon: <FiUser size={18} /> },
        { id: 'contact',     name: 'Contact',       icon: <FiMail size={18} /> },
    ];

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#080a0f] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0c0f16] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <FiMenu size={24} />
                    </button>
                    <div 
                        onClick={() => setActiveSection('overview')}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                        title="Go to Dashboard"
                    >
                        <LeafIcon />
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Diet<span className="text-emerald-500">Planner</span>
                        </span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
                >
                    Logout
                </button>
            </div>

            <div className="flex flex-1 relative overflow-hidden">
                {/* Sidebar Overlay on mobile */}
                {isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    />
                )}

                {/* Redesigned Sidebar (Positioned absolutely inside container, below header) */}
                <aside className={`absolute inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0c0f16] border-r border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out transition-colors duration-300`}>
                    
                    <div className="space-y-4">

                        {/* Navigation Items */}
                        <nav className="flex flex-col gap-1.5">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        if (window.innerWidth < 768) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                        activeSection === item.id
                                            ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500 pl-3'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/30 border-l-4 border-transparent pl-3'
                                    }`}
                                >
                                    <span className={activeSection === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100'}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Bottom Footer Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                        {/* User Profile Info */}
                        <div className="flex items-center gap-3 p-2">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center font-bold border border-emerald-500/20 dark:border-emerald-500/30">
                                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0c0f16] rounded-full"></span>
                            </div>
                            <div className="leading-tight">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Hello, {user.username || 'User'} 👋</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Stay consistent!</p>
                            </div>
                        </div>

                        {/* Dark Mode Switch */}
                        <div className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/60 mt-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                {darkMode ? <FiMoon className="text-emerald-500 dark:text-emerald-400" /> : <FiSun className="text-amber-500" />}
                                <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${
                                    darkMode ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-350 border-slate-400/25'
                                }`}
                                type="button"
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-205 ease-in-out ${
                                        darkMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Logout Trigger */}
                        <button
                            onClick={logout}
                            className="w-full text-center py-2 text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={`flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-[#080a0f] p-6 md:p-10 transition-all duration-300 ${
                    isSidebarOpen ? 'md:pl-64' : 'pl-0'
                }`}>
                    <div className="max-w-6xl mx-auto w-full">
                        {renderSection()}
                    </div>
                </main>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════
   DashboardOverview Redesign
   Provides symmetry, clear daily goals, macro splitting, water, and meal logs
════════════════════════════════════════════ */
const DashboardOverview = ({ data, onRefresh, setActiveSection, darkMode }) => {

    if (!data) {
        return (
            <div className="bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center gap-4 shadow-xl transition-colors duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-4xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                    <GiAvocado />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Let's get started!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs">Set up your profile to unlock personalized tracking and AI meal planning.</p>
                <button onClick={onRefresh} className="mt-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95 cursor-pointer">
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
        { name: 'Protein', value: consumed.protein, color: '#10b981', bg: 'bg-emerald-500' },
        { name: 'Carbs',   value: consumed.carbs,   color: '#f59e0b', bg: 'bg-amber-400' },
        { name: 'Fat',     value: consumed.fat,      color: '#ef4444', bg: 'bg-rose-500' },
    ];
    const pieData = totalMacros > 0 ? macroData : [{ name: 'No Data', value: 1, color: '#1e293b' }];

    /* ── Animated counter for calories ── */
    const animatedCal = useCounter(consumed.calories);

    /* ── Quick Actions ── */
    const quickActions = [
        { id: 'meal-plan',   label: 'Plan Meals',    emoji: '🍽️', gradient: 'from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/10' },
        { id: 'food-search', label: 'Find Food',     emoji: '🔍', gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10' },
        { id: 'progress',    label: 'Log Weight',    emoji: '⚖️', gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/10' },
        { id: 'grocery',     label: 'Grocery List',  emoji: '🛒', gradient: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 dark:border-violet-500/10' },
    ];

    /* ── Meal Slots mapping ── */
    const mealSlots = ['breakfast', 'lunch', 'snack-1', 'dinner'];
    const mealMap = {};
    if (todayMealPlan?.meals) {
        todayMealPlan.meals.forEach(m => {
            mealMap[m.name] = m;
        });
    }

    const mealConfig = {
        breakfast: { title: 'Breakfast', time: '8:30 AM', icon: <MdOutlineFreeBreakfast />, border: 'border-orange-500', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
        lunch:     { title: 'Lunch',     time: '1:00 PM', icon: <MdOutlineLunchDining />,  border: 'border-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        'snack-1': { title: 'Snacks',    time: '4:30 PM', icon: <MdOutlineRestaurant />,   border: 'border-pink-500', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
        dinner:    { title: 'Dinner',    time: '7:30 PM', icon: <MdOutlineDinnerDining />, border: 'border-indigo-500', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    };

    return (
        <div className="space-y-6">
            
            {/* Header / Meta Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Overview</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(recentWeight || profile?.weight) && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
                            ⚖️ {recentWeight || profile?.weight} kg
                        </span>
                    )}
                    {profile?.goal && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-600 dark:text-violet-400">
                            🎯 {profile.goal.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('\u00A0')}
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map(a => (
                    <button
                        key={a.id}
                        onClick={() => setActiveSection(a.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br ${a.gradient} border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm`}
                    >
                        <span className="text-sm font-bold">{a.label}</span>
                        <span className="text-lg">{a.emoji}</span>
                    </button>
                ))}
            </div>

            {/* Main Stats Grid (Calorie, Macros, Water) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Daily Calorie Goal Ring */}
                <div className="bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[260px] transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Calorie Intake</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{calPct}%</span>
                    </div>

                    <div className="flex items-center justify-center py-4">
                        <div className="relative w-36 h-36">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                <circle
                                    cx="60" cy="60" r="50"
                                    fill="none"
                                    stroke={darkMode ? '#1e293b' : '#f1f5f9'}
                                    strokeWidth="9"
                                />
                                <circle
                                    cx="60" cy="60" r="50"
                                    fill="none"
                                    stroke="url(#calorieGrad)"
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                    strokeDasharray={`${calPct * 3.14} ${314 - calPct * 3.14}`}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#14b8a6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{animatedCal}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">/ {calTarget}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-600 font-bold mt-0.5">kcal</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-center text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                        <div>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-600">Consumed</span>
                            <span className="text-xs text-slate-800 dark:text-white font-black">{consumed.calories}</span>
                        </div>
                        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>
                        <div>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-600">Target</span>
                            <span className="text-xs text-slate-800 dark:text-white font-black">{calTarget}</span>
                        </div>
                        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>
                        <div>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-600">Remaining</span>
                            <span className={`text-xs font-black ${calTarget - consumed.calories < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {Math.max(0, calTarget - consumed.calories)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Macro Split Donut */}
                <div className="bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[260px] transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Macro Balance</span>
                        <span className="text-xs font-bold text-slate-500">{totalMacros}g total</span>
                    </div>

                    <div className="flex gap-4 items-center justify-between py-2">
                        {/* Donut graphic */}
                        <div className="relative w-28 h-28 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        innerRadius={36} outerRadius={48}
                                        paddingAngle={3} dataKey="value" stroke="none"
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(v, n) => [n === 'No Data' ? '0g' : `${v}g`, n]}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                            backgroundColor: darkMode ? '#0c0f16' : '#ffffff',
                                            color: darkMode ? '#f8fafc' : '#0f172a',
                                            fontSize: '11px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{totalMacros}g</span>
                                <span className="text-[7px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Macros</span>
                            </div>
                        </div>

                        {/* Side mini-legend */}
                        <div className="flex-1 space-y-1">
                            {macroData.map(m => {
                                const pct = totalMacros > 0 ? Math.round((m.value / totalMacros) * 100) : 0;
                                return (
                                    <div key={m.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                                            <span className="text-slate-500 dark:text-slate-400 font-semibold">{m.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white">{m.value}g ({pct}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Macro slider bars */}
                    <div className="space-y-2.5">
                        {macroData.map(m => {
                            const pct = totalMacros > 0 ? Math.min(100, Math.round((m.value / totalMacros) * 100)) : 0;
                            return (
                                <div key={m.name}>
                                    <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

                {/* 3. Water Tracker Card */}
                <div className="bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-lg min-h-[260px] flex flex-col justify-between transition-colors duration-300">
                    <WaterTracker />
                </div>
            </div>

            {/* Symmetrical Today's Meal Section (Symmetrical 4-Column Grid) */}
            <div className="bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-lg transition-colors duration-300">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                        <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <MdRestaurantMenu size={18} />
                        </span>
                        <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Today's Logged Menu</h2>
                    </div>
                    <button
                        onClick={() => setActiveSection('meal-plan')}
                        className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                        <span>Add Meal</span>
                        <FiChevronRight size={14} />
                    </button>
                </div>

                {/* Grid of 4 columns representing Breakfast, Lunch, Snacks, Dinner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mealSlots.map((slot) => {
                        const c = mealConfig[slot];
                        const meal = mealMap[slot];
                        const items = meal?.items || [];
                        
                        let mealCal = 0;
                        items.forEach(item => {
                            if (item.food) {
                                const factor = (parseFloat(item.servingSize?.amount) || 0) / (parseFloat(item.food.servingSize?.amount) || 100);
                                mealCal += ((item.food.nutrition?.calories) || 0) * factor;
                            }
                        });

                        return (
                            <div 
                                key={slot}
                                className="border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0e121b]/40 rounded-2xl p-4 flex flex-col justify-between h-[180px] transition-all hover:border-slate-300 dark:hover:border-slate-700/60"
                            >
                                <div className="space-y-3">
                                    {/* Slot Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center text-lg`}>
                                                {c.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{c.title}</h4>
                                                <p className="text-[9px] text-slate-400 dark:text-slate-500">{c.time}</p>
                                            </div>
                                        </div>
                                        {items.length > 0 && (
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                {Math.round(mealCal)} kcal
                                            </span>
                                        )}
                                    </div>

                                    {/* Slot Items List */}
                                    <div className="space-y-1.5 max-h-[80px] overflow-y-auto no-scrollbar">
                                        {items.length > 0 ? (
                                            items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400">
                                                    <span className="truncate max-w-[100px]">{item.food?.name}</span>
                                                    <span className="font-semibold text-slate-400 dark:text-slate-500">{item.servingSize?.amount}g</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-tight italic pt-2">No meals logged for this slot.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Slot Bottom Action */}
                                {items.length === 0 ? (
                                    <button
                                        onClick={() => setActiveSection('meal-plan')}
                                        className="w-full py-1.5 flex items-center justify-center gap-1 border border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500/40 rounded-xl text-[10px] font-bold text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 bg-transparent hover:bg-emerald-500/5 transition-all duration-200 cursor-pointer"
                                    >
                                        <FiPlus size={10} />
                                        <span>Log {c.title}</span>
                                    </button>
                                ) : (
                                    <div className="h-2"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Profile Setup Callout Banner */}
            {!profile?.age && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-500/20 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="font-extrabold text-sm text-amber-600 dark:text-amber-400 mb-0.5 flex items-center gap-2">Complete Setup Required</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">Add your physical stats (age, height, weight) so we can personalize your calorie targets and AI meal suggestions.</p>
                    </div>
                    <button
                        onClick={() => setActiveSection('profile')}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                        <span>Configure Profile</span>
                        <FiArrowRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════
   WaterTracker Donut/Progress Widget
════════════════════════════════════════════ */
const WaterTracker = () => {
    const todayKey = `water_${new Date().toISOString().slice(0, 10)}`;
    const [glasses, setGlasses] = useState(() => parseInt(localStorage.getItem(todayKey) || '0', 10));

    const setAndPersist = (n) => {
        const clamped = Math.max(0, Math.min(8, n));
        setGlasses(clamped);
        localStorage.setItem(todayKey, String(clamped));
    };

    const pct = Math.round((glasses / 8) * 100);

    return (
        <div className="flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                    <FiDroplet size={14} className="text-sky-500 dark:text-sky-400" />
                    <span>Hydration Log</span>
                </div>
                <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">{glasses}/8 glasses</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setAndPersist(i < glasses ? i : i + 1)}
                            className={`flex-1 h-8 rounded-lg transition-all duration-300 cursor-pointer ${
                                i < glasses 
                                    ? 'bg-gradient-to-t from-sky-500 to-sky-400 shadow-md shadow-sky-500/20 scale-y-110' 
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                            title={`${i + 1} glass${i > 0 ? 'es' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                    {glasses === 0 
                        ? 'Tap a bar to log a glass of water 💧' 
                        : glasses >= 8 
                            ? 'Goal reached! Excellent hydration today. 🎉' 
                            : `${8 - glasses} more glasses to reach daily target.`
                    }
                </p>
            </div>
        </div>
    );
};

export default Dashboard;