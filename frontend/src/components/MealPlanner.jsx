import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const MealPlanner = ({ darkMode, onPlanUpdate, onNavigate }) => {
    // --- Existing State & Logic (Unchanged) ---
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealPlan, setMealPlan] = useState({ meals: [] });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableFoods, setAvailableFoods] = useState([]);
    const [foodSearchQuery, setFoodSearchQuery] = useState('');
    const [generating, setGenerating] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);

    // Custom Food State
    const [showAddForm, setShowAddForm] = useState(false);
    const [customFood, setCustomFood] = useState({
        name: '', brand: 'Generic', servingSize: { amount: 100, unit: 'g' },
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
        category: 'other'
    });

    const categories = ['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'beverages', 'snacks', 'condiments', 'other'];

    const handleAddCustomFood = async (e) => {
        e.preventDefault();
        try {
            const result = await dietAPI.addFood(customFood);
            if (result.success) {
                setShowAddForm(false);
                setCustomFood({
                    name: '', brand: 'Generic', servingSize: { amount: 100, unit: 'g' },
                    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
                    category: 'other'
                });
                loadAvailableFoods();
                setMessage({ type: 'success', text: 'Custom food added to library!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error adding custom food' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const mealTypes = [
        { id: 'breakfast', name: 'Breakfast', icon: '🍳', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
        { id: 'lunch', name: 'Lunch', icon: '🍲', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { id: 'dinner', name: 'Dinner', icon: '🍛', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
        { id: 'snack-1', name: 'Snacks', icon: '🍪', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/10' }
    ];

    useEffect(() => {
        loadMealPlan();
        loadAvailableFoods();
    }, [selectedDate]);

    const loadMealPlan = async () => {
        setLoading(true);
        try {
            const result = await dietAPI.getMealPlan(selectedDate);
            if (result.success) {
                const meals = mealTypes.map(mealType => {
                    const existingMeal = result.mealPlan.meals?.find(meal => meal.name === mealType.id);
                    return existingMeal || { name: mealType.id, items: [] };
                });
                setMealPlan({ ...result.mealPlan, meals });
            }
        } catch (error) {
            console.error('Error loading meal plan:', error);
            setMessage({ type: 'error', text: 'Error loading meal plan' });
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableFoods = async () => {
        try {
            const result = await dietAPI.getFoods();
            if (result.success) {
                setAvailableFoods(result.foods);
            }
        } catch (error) {
            console.error('Error loading foods:', error);
        }
    };

    const searchFoods = async () => {
        if (!foodSearchQuery.trim()) {
            loadAvailableFoods();
            return;
        }
        try {
            const result = await dietAPI.searchFoods(foodSearchQuery);
            if (result.success) {
                setAvailableFoods(result.results);
            }
        } catch (error) {
            console.error('Error searching foods:', error);
        }
    };

    const saveMealPlan = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const cleanedMeals = mealPlan.meals.map(meal => ({
                ...meal,
                items: meal.items.filter(item => item.food && item.food._id)
            }));

            const result = await dietAPI.saveMealPlan(selectedDate, {
                meals: cleanedMeals,
                notes: mealPlan.notes || ''
            });
            if (result.success) {
                setMessage({ type: 'success', text: 'Meal plan saved successfully!' });
                if (onPlanUpdate) {
                    onPlanUpdate();
                }
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving meal plan' });
        } finally {
            setSaving(false);
        }
    };

    const saveNotes = async () => {
        setSavingNotes(true);
        try {
            const cleanedMeals = mealPlan.meals.map(meal => ({
                ...meal,
                items: meal.items.filter(item => item.food && item.food._id)
            }));
            const result = await dietAPI.saveMealPlan(selectedDate, {
                meals: cleanedMeals,
                notes: mealPlan.notes || ''
            });
            if (result.success) {
                setMessage({ type: 'success', text: '📝 Note saved!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 2500);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save note.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving note.' });
        } finally {
            setSavingNotes(false);
        }
    };

    const clearNotes = async () => {
        setMealPlan(prev => ({ ...prev, notes: '' }));
        setSavingNotes(true);
        try {
            const cleanedMeals = mealPlan.meals.map(meal => ({
                ...meal,
                items: meal.items.filter(item => item.food && item.food._id)
            }));
            await dietAPI.saveMealPlan(selectedDate, { meals: cleanedMeals, notes: '' });
            setMessage({ type: 'success', text: '🗑️ Note cleared.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2500);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error clearing note.' });
        } finally {
            setSavingNotes(false);
        }
    };

    const handleAIGenerate = async () => {
        setGenerating(true);
        setMessage({ type: 'info', text: '🤖 Your perfect menu is being crafted...' });
        try {
            const result = await dietAPI.generateMealPlan();
            if (result.success) {
                // Map the results into the mealTypes structure
                const meals = mealTypes.map(mealType => {
                    const aiMeal = result.meals.find(m => m.name === mealType.id);
                    return aiMeal || { name: mealType.id, items: [] };
                });
                setMealPlan(prev => ({ ...prev, meals }));
                setMessage({ type: 'success', text: 'Your automated Menu is generated! Don\'t forget to save.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Sorry, failed to generate menu.' });
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to generate AI menu.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setGenerating(false);
        }
    };

    // In your MealPlanner.jsx file
    const addFoodToMeal = async (mealName, foodItem = null) => {
        if (foodItem) {
            try {
                let foodToAdd = foodItem;

                // Check if food is from API (has externalId or source 'usda') and doesn't have _id
                const isExternalFood = (foodItem.externalId || foodItem.source === 'usda' || foodItem.source === 'edamam') && !foodItem._id;

                if (isExternalFood) {
                    console.log('🌐 Food from API, saving to database first...');

                    // Save external food to database first
                    const saveResult = await dietAPI.saveExternalFood(foodItem);

                    if (saveResult.success) {
                        foodToAdd = saveResult.food; // Now has a valid MongoDB _id
                        console.log(`✅ Food saved with ID: ${foodToAdd._id}`);
                    } else {
                        throw new Error('Failed to save food to database');
                    }
                }

                // Now add to meal plan
                setMealPlan(prev => ({
                    ...prev,
                    meals: prev.meals.map(meal =>
                        meal.name === mealName
                            ? {
                                ...meal,
                                items: [...meal.items, {
                                    food: foodToAdd,
                                    servingSize: { amount: 100, unit: 'g' },
                                    customName: foodToAdd.name
                                }]
                            }
                            : meal
                    )
                }));

                // Optional: Show success message
                setMessage({ type: 'success', text: `Added ${foodItem.name} to ${mealName}` });
                setTimeout(() => setMessage({ type: '', text: '' }), 2000);

            } catch (error) {
                console.error('Error adding food:', error);
                setMessage({
                    type: 'error',
                    text: `Failed to add ${foodItem.name}: ${error.message}`
                });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } else {
            setMessage({ type: 'info', text: 'Please select a food from the list below' });
        }
    };

    const removeFoodFromMeal = (mealName, itemIndex) => {
        setMealPlan(prev => ({
            ...prev,
            meals: prev.meals.map(meal =>
                meal.name === mealName
                    ? { ...meal, items: meal.items.filter((_, index) => index !== itemIndex) }
                    : meal
            )
        }));
    };

    const updateFoodServing = (mealName, itemIndex, field, value) => {
        setMealPlan(prev => ({
            ...prev,
            meals: prev.meals.map(meal =>
                meal.name === mealName
                    ? {
                        ...meal,
                        items: meal.items.map((item, index) =>
                            index === itemIndex
                                ? field === 'servingSize'
                                    ? { ...item, servingSize: { ...item.servingSize, ...value } }
                                    : { ...item, [field]: value }
                                : item
                        )
                    }
                    : meal
            )
        }));
    };

    const calculateFoodNutrition = (food, servingSize) => {
        if (!food || !food.nutrition) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const ratio = servingSize.amount / food.servingSize.amount;
        return {
            calories: Math.round(food.nutrition.calories * ratio),
            protein: Math.round(food.nutrition.protein * ratio * 10) / 10,
            carbs: Math.round(food.nutrition.carbs * ratio * 10) / 10,
            fat: Math.round(food.nutrition.fat * ratio * 10) / 10
        };
    };

    const calculateMealNutrition = (meal) => {
        return meal.items.reduce((total, item) => {
            if (!item.food) return total;
            const nutrition = calculateFoodNutrition(item.food, item.servingSize);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                carbs: total.carbs + nutrition.carbs,
                fat: total.fat + nutrition.fat
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const calculateDailyTotal = () => {
        return mealPlan.meals.reduce((total, meal) => {
            const nutrition = calculateMealNutrition(meal);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                carbs: total.carbs + nutrition.carbs,
                fat: total.fat + nutrition.fat
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const dailyTotal = calculateDailyTotal();

    return (
        <>
            <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark-theme' : ''}`}>

                <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-enter">

                    {/* Zen-Modern Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 pb-10 border-b border-slate-800/50">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-500/20">
                                🍱
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Daily Meal Planner</h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Coordinate your nutrition and optimize your daily fuel.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 w-full lg:w-auto">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="input-style-pro px-6 py-3 font-bold text-slate-900 dark:text-white outline-none cursor-pointer bg-white dark:bg-slate-900"
                            />
                            <button
                                onClick={handleAIGenerate}
                                disabled={generating || saving}
                                className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl font-bold hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                            >
                                {generating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : "✨ AI Assistance"}
                            </button>
                            <button
                                onClick={saveMealPlan}
                                disabled={saving || generating}
                                className="px-8 py-3 accent-gradient text-slate-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : "💾 Save Plan"}
                            </button>
                        </div>
                    </div>

                    {/* Notification Message */}
                    {message.text && (
                        <div className={`p-4 rounded-xl text-center font-semibold animate-enter transition-all ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                            message.type === 'error' ? 'bg-rose-500/10 text-rose-600' :
                                'bg-blue-500/10 text-blue-600'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* --- Left Column: Summary & Pantry --- */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">

                            {/* Nutrition Summary */}
                            <div className="card-bg p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Daily Nutrition</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Calories', val: dailyTotal.calories, unit: 'kcal', color: 'text-slate-900 dark:text-white', icon: '🔥' },
                                        { label: 'Protein', val: dailyTotal.protein, unit: 'g', color: 'text-emerald-600 dark:text-emerald-400', icon: '🥩' },
                                        { label: 'Carbs', val: dailyTotal.carbs, unit: 'g', color: 'text-amber-600 dark:text-amber-400', icon: '🍞' },
                                        { label: 'Fats', val: dailyTotal.fat, unit: 'g', color: 'text-rose-600 dark:text-rose-400', icon: '🥑' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</span>
                                            <span className={`text-xl font-bold ${stat.color}`}>{Math.round(stat.val)}{stat.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pantry Search */}
                            <div className="card-bg p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>🛒</span> Find Foods
                                    </h3>
                                    {onNavigate && (
                                        <button onClick={() => onNavigate('food-search')} className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-bold tracking-tight bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors">
                                            Manage Library &rarr;
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={foodSearchQuery}
                                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
                                        placeholder="Search database..."
                                        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm flex-1 outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        onClick={searchFoods}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                    >
                                        Go
                                    </button>
                                </div>
                                <button onClick={() => setShowAddForm(true)} className="w-full mb-6 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 font-bold text-sm py-2 rounded-xl transition-all">
                                    + Add Custom Food
                                </button>

                                <div className="overflow-y-auto max-h-[400px] space-y-3 custom-scroll pr-1">
                                    {availableFoods.map((food, index) => (
                                        <div key={food._id || index} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/50 group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{food.name}</h4>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">{food.category}</span>
                                            </div>
                                            <div className="flex gap-2 text-[10px] font-bold text-slate-500 mb-3">
                                                <span className="text-emerald-500">{food.nutrition.calories} kcal</span>
                                                <span>P: {food.nutrition.protein}g</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {mealTypes.map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => addFoodToMeal(m.id, food)}
                                                        className="flex items-center justify-center gap-1 py-1 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
                                                        title={`Add to ${m.name}`}
                                                    >
                                                        <span>{m.icon}</span>
                                                        <span>{m.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="card-bg p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 block">Daily Notes</label>
                                <textarea
                                    value={mealPlan.notes || ''}
                                    onChange={(e) => setMealPlan(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Log your observations..."
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm italic resize-none focus:outline-none focus:border-emerald-500 transition-colors"
                                    rows="3"
                                />
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={saveNotes}
                                        disabled={savingNotes || !mealPlan.notes}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {savingNotes
                                            ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            : '💾'}
                                        Save Note
                                    </button>
                                    <button
                                        onClick={clearNotes}
                                        disabled={savingNotes || !mealPlan.notes}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 disabled:opacity-40"
                                    >
                                        🗑️ Clear Note
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- Right Column: Meal Slots --- */}
                        <div className="lg:col-span-8 space-y-6">
                            {mealPlan.meals.map((meal) => {
                                const mealType = mealTypes.find(m => m.id === meal.name) || mealTypes[3];
                                const nutrition = calculateMealNutrition(meal);

                                const bannerGradient = mealType.id === 'breakfast' ? 'from-orange-400 to-amber-500' :
                                    mealType.id === 'lunch' ? 'from-emerald-400 to-teal-500' :
                                        mealType.id === 'dinner' ? 'from-indigo-500 to-blue-600' :
                                            'from-rose-400 to-pink-500';

                                return (
                                    <div key={meal.name} className="bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                                        <div className={`px-6 py-4 bg-gradient-to-r ${bannerGradient} text-white flex justify-between items-center`}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{mealType.icon}</span>
                                                <h3 className="text-xl font-bold capitalize">{mealType.name}</h3>
                                            </div>
                                            <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 truncate max-w-[200px]">
                                                {nutrition.calories} kcal • {nutrition.protein}g P
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-6 space-y-4">
                                            {meal.items.length === 0 ? (
                                                <div className="text-center py-6 text-slate-400 text-sm italic">
                                                    No food added to {mealType.name.toLowerCase()}.
                                                </div>
                                            ) : (
                                                meal.items.map((item, itemIndex) => {
                                                    if (!item.food) return null;
                                                    const foodNutrition = calculateFoodNutrition(item.food, item.servingSize);

                                                    return (
                                                        <div key={itemIndex} className="flex justify-between items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.food.name}</h4>
                                                                <div className="text-[10px] font-bold text-slate-500 flex gap-2">
                                                                    <span className="text-emerald-600">{foodNutrition.calories} kcal</span>
                                                                    <span>P: {foodNutrition.protein}g</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-9">
                                                                    <input
                                                                        type="number"
                                                                        value={item.servingSize.amount}
                                                                        onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { amount: e.target.value })}
                                                                        className="w-12 text-center bg-transparent font-bold text-slate-900 dark:text-white outline-none text-xs"
                                                                    />
                                                                    <select
                                                                        value={item.servingSize.unit}
                                                                        onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { unit: e.target.value })}
                                                                        className="bg-slate-100 dark:bg-slate-800 text-[9px] font-bold px-1 outline-none appearance-none"
                                                                    >
                                                                        <option value="g">g</option>
                                                                        <option value="ml">ml</option>
                                                                        <option value="pc">pc</option>
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFoodFromMeal(meal.name, itemIndex)}
                                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Add Custom Food Modal --- */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="card-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll rounded-2xl shadow-2xl relative animate-enter my-8">

                        {/* Header */}
                        <div className="sticky top-0 z-10 card-bg border-b border-slate-100 dark:border-slate-800/50 p-5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>📝</span> Add Custom Food
                            </h3>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddCustomFood} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Food Name</label>
                                        <input
                                            type="text"
                                            value={customFood.name}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="search-input bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 w-full px-4 py-3 rounded-xl font-medium outline-none focus:border-emerald-500"
                                            placeholder="e.g. Mom's Lasagna"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand / Source</label>
                                        <input
                                            type="text"
                                            value={customFood.brand}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                                            className="search-input bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 w-full px-4 py-3 rounded-xl outline-none focus:border-emerald-500"
                                            placeholder="e.g. Homemade"
                                        />
                                    </div>
                                </div>

                                {/* Serving Info */}
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Serving Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                value={customFood.servingSize.amount}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, amount: e.target.value } }))}
                                                required
                                                className="search-input bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Unit</label>
                                            <select
                                                value={customFood.servingSize.unit}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, unit: e.target.value } }))}
                                                className="search-input bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                                            >
                                                {['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Category</label>
                                            <select
                                                value={customFood.category}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, category: e.target.value }))}
                                                className="search-input bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
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
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                        <span>📊</span> Nutrition Facts <span className="text-slate-400 font-normal text-xs">(per serving)</span>
                                    </h4>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {[
                                            { key: 'calories', label: 'Calories', color: 'text-slate-500' },
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
                                                    className="search-input bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 w-full px-3 py-2.5 rounded-xl text-center font-bold text-lg outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['fiber', 'sugar', 'sodium', 'cholesterol'].map((nut) => (
                                            <div key={nut}>
                                                <label className="block text-xs text-slate-400 capitalize mb-1">{nut}</label>
                                                <input
                                                    type="number"
                                                    value={customFood.nutrition[nut]}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [nut]: e.target.value }
                                                    }))}
                                                    className="search-input bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 w-full px-3 py-1.5 rounded-lg text-sm outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 dark:shadow-none transition-transform active:scale-95"
                                    >
                                        Save Food
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MealPlanner;