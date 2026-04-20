import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';
import { FiSearch, FiBook, FiPlus, FiBox } from 'react-icons/fi';
import { IoRestaurantOutline, IoFastFoodOutline, IoWaterOutline, IoNutritionOutline, IoCafeOutline } from 'react-icons/io5';

const FoodSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [localFoods, setLocalFoods] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [customFood, setCustomFood] = useState({
        name: '',
        brand: 'Generic',
        servingSize: { amount: 100, unit: 'g' },
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
        category: 'other'
    });

    const categories = [
        'fruits', 'vegetables', 'grains', 'protein', 'dairy',
        'fats', 'beverages', 'snacks', 'condiments', 'other'
    ];

    // Helper for category icons
    const getCategoryIcon = (cat) => {
        const map = {
            fruits: <IoNutritionOutline />, vegetables: <IoNutritionOutline />, grains: <IoRestaurantOutline />, protein: <IoRestaurantOutline />,
            dairy: <IoWaterOutline />, fats: <IoFastFoodOutline />, beverages: <IoCafeOutline />, snacks: <IoFastFoodOutline />,
            condiments: <IoRestaurantOutline />, other: '🍽️'
        };
        return map[cat] || <IoRestaurantOutline />;
    };

    useEffect(() => {
        loadLocalFoods();
    }, [selectedCategory]);

    const loadLocalFoods = async () => {
        try {
            const result = await dietAPI.getFoods('', selectedCategory);
            if (result.success) {
                setLocalFoods(result.foods);
            }
        } catch (error) {
            console.error('Error loading local foods:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const result = await dietAPI.searchFoods(searchQuery);
            if (result.success) {
                setSearchResults(result.results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching foods:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomFood = async (e) => {
        e.preventDefault();
        try {
            const result = await dietAPI.addFood(customFood);
            if (result.success) {
                setShowAddForm(false);
                setCustomFood({
                    name: '',
                    brand: 'Generic',
                    servingSize: { amount: 100, unit: 'g' },
                    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
                    category: 'other'
                });
                loadLocalFoods();
                alert('Food added successfully!');
            }
        } catch (error) {
            alert('Error adding food');
        }
    };

    // --- Custom CSS Styles ---
    const styles = `
        .search-input {
            background-color: var(--bg-main);
            color: var(--text-main);
            border: 1px solid var(--border);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
            outline: none;
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `;

    // --- Redesigned Food Item Card ---
    const FoodItem = ({ food }) => (
        <div className="card-bg p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-emerald-600/30 group relative overflow-hidden flex flex-col justify-between h-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md">

            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/30 text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                        {getCategoryIcon(food.category)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight tracking-tight">{food.name}</h3>
                        <p className="text-xs font-semibold text-slate-400 capitalize">{food.brand || 'Generic'}</p>
                    </div>
                </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                    { label: 'Cals', val: food.nutrition.calories, color: 'text-slate-800 dark:text-slate-200' },
                    { label: 'Pro', val: food.nutrition.protein + 'g', color: 'text-emerald-500' },
                    { label: 'Carb', val: food.nutrition.carbs + 'g', color: 'text-amber-500' },
                    { label: 'Fat', val: food.nutrition.fat + 'g', color: 'text-rose-500' }
                ].map((m, i) => (
                    <div key={i} className="flex flex-col items-center justify-center py-2 px-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">{m.label}</span>
                        <span className={`text-sm font-bold ${m.color}`}>{m.val}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <span className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {food.servingSize.amount}{food.servingSize.unit} serving
                    </span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 truncate max-w-[100px] text-center">
                    {food.category}
                </span>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-enter">
            <style>{styles}</style>

            {/* --- Hero Search Section --- */}
            <div className="card-bg rounded-3xl p-10 lg:p-14 shadow-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col items-center text-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>

                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl mb-6 shadow-sm border border-emerald-200/50 dark:border-emerald-800/30">
                    <FiSearch />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Global Food Database</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                    Instantly search thousands of foods, track your macros precisely, or add your own custom recipes to build your perfect diet.
                </p>

                <form onSubmit={handleSearch} className="w-full max-w-3xl relative flex items-center group">
                    <div className="absolute left-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors flex items-center justify-center">
                        <FiSearch size={24} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for 'Grilled Chicken', 'Avocado', or 'Oats'..."
                        className="w-full py-4.5 rounded-2xl text-lg shadow-sm font-medium bg-white dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all"
                        style={{ paddingLeft: '3.5rem', paddingRight: '8.5rem', paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !searchQuery.trim()}
                        className="absolute right-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                        {loading ? <span className="animate-pulse">Searching...</span> : 'Search'}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-12 text-left animate-enter w-full max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Search Results</h3>
                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">{searchResults.length} items</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((food, index) => (
                                <FoodItem key={index} food={food} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Library Section --- */}
            <div className="card-bg rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <FiBook />
                        </span>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Library</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Foods and recipes you've saved</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="search-input px-5 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 w-full md:w-48 cursor-pointer outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 dark:shadow-none transition-transform active:scale-95 whitespace-nowrap flex items-center gap-2"
                        >
                            <FiPlus /> Add Food
                        </button>
                    </div>
                </div>

                {localFoods.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-slate-400">
                            <FiBox />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your library is empty</h4>
                        <p className="text-slate-500 font-medium mb-6">Start building your personal diet foundation today.</p>
                        <button onClick={() => setShowAddForm(true)} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-2 mx-auto">
                            <FiPlus /> Add First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {localFoods.map((food) => (
                            <FoodItem key={food._id} food={food} isCustom={true} />
                        ))}
                    </div>
                )}
            </div>

            {/* --- Add Custom Food Modal --- */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="card-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll rounded-2xl shadow-2xl relative animate-enter m-4">

                        {/* Header */}
                        <div className="sticky top-0 z-10 card-bg border-b border-gray-100 dark:border-gray-700 p-5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>📝</span> Add Custom Food
                            </h3>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddCustomFood} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Food Name</label>
                                        <input
                                            type="text"
                                            value={customFood.name}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="search-input w-full px-4 py-3 rounded-xl font-medium"
                                            placeholder="e.g. Mom's Lasagna"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand / Source</label>
                                        <input
                                            type="text"
                                            value={customFood.brand}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                                            className="search-input w-full px-4 py-3 rounded-xl"
                                            placeholder="e.g. Homemade"
                                        />
                                    </div>
                                </div>

                                {/* Serving Info */}
                                <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Serving Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                value={customFood.servingSize.amount}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, amount: e.target.value } }))}
                                                required
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Unit</label>
                                            <select
                                                value={customFood.servingSize.unit}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, unit: e.target.value } }))}
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            >
                                                {['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                                            <select
                                                value={customFood.category}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, category: e.target.value }))}
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            >
                                                {categories.map(c => (
                                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Macros Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <span>📊</span> Nutrition Facts <span className="text-gray-400 font-normal text-xs">(per serving)</span>
                                    </h4>

                                    {/* Primary Macros */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {[
                                            { key: 'calories', label: 'Calories', color: 'text-gray-500' },
                                            { key: 'protein', label: 'Protein (g)', color: 'text-emerald-500' },
                                            { key: 'carbs', label: 'Carbs (g)', color: 'text-amber-500' },
                                            { key: 'fat', label: 'Fat (g)', color: 'text-rose-500' }
                                        ].map((macro) => (
                                            <div key={macro.key} className="relative">
                                                <label className={`block text-xs font-bold mb-1 ${macro.color}`}>{macro.label}</label>
                                                <input
                                                    type="number"
                                                    value={customFood.nutrition[macro.key]}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [macro.key]: e.target.value }
                                                    }))}
                                                    className="search-input w-full px-3 py-2.5 rounded-xl text-center font-bold text-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Secondary Macros */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['fiber', 'sugar', 'sodium', 'cholesterol'].map((nut) => (
                                            <div key={nut}>
                                                <label className="block text-xs text-gray-400 capitalize mb-1">{nut}</label>
                                                <input
                                                    type="number"
                                                    value={customFood.nutrition[nut]}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [nut]: e.target.value }
                                                    }))}
                                                    className="search-input w-full px-3 py-1.5 rounded-lg text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-transform active:scale-95"
                                    >
                                        Save Food
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodSearch;