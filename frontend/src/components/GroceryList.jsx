import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';
import { FiShoppingCart, FiCalendar, FiPrinter, FiCheck } from 'react-icons/fi';

const GroceryList = ({ darkMode }) => {
    const [loading, setLoading] = useState(false);
    const [groceryData, setGroceryData] = useState({});
    const [dateRange, setDateRange] = useState('7'); // days
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        loadGroceryList();
    }, [dateRange]);

    const loadGroceryList = async () => {
        setLoading(true);
        try {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(start);
            end.setDate(start.getDate() + parseInt(dateRange));
            
            const formatDate = (d) => {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const startDateStr = formatDate(start);
            const endDateStr = formatDate(end);

            const result = await dietAPI.getGroceryList(startDateStr, endDateStr);
            if (result.success) {
                setGroceryData(result.groceryList || {});
                setCheckedItems({});
            }
        } catch (error) {
            console.error('Error fetching grocery list:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = (foodId, unit) => {
        const key = `${foodId}_${unit}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getCategoryIcon = (cat) => {
        const map = {
            fruits: '🍎', vegetables: '🥦', grains: '🍞', protein: '🥩',
            dairy: '🥛', fats: '🥑', beverages: '🥤', snacks: '🍪',
            condiments: '🧂', other: '🍽️'
        };
        return map[cat.toLowerCase()] || '🍽️';
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Styles moved to index.css --

    const totalCategories = Object.keys(groceryData).length;
    let totalItemsCount = 0;
    let checkedCount = 0;

    Object.values(groceryData).forEach(items => {
        items.forEach(item => {
            totalItemsCount++;
            if (checkedItems[`${item.foodId}_${item.unit}`]) checkedCount++;
        });
    });

    const progress = totalItemsCount === 0 ? 0 : Math.round((checkedCount / totalItemsCount) * 100);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-enter print-area">
            
            <div className="print-only">My Grocery List</div>

            {/* Header */}
            <div className="card-bg rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden no-print">
                <div className="absolute -right-10 -top-10 text-9xl text-emerald-500 opacity-5">
                    <FiShoppingCart />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                                <FiShoppingCart />
                            </span>
                            Smart Grocery List
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md text-sm">
                            Automatically generated from your meal plans. Check off items as you shop!
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select 
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                                <option value="3">Next 3 Days</option>
                                <option value="7">Next 7 Days</option>
                                <option value="14">Next 14 Days</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={handlePrint}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl font-medium transition-colors"
                        >
                            <FiPrinter /> Print List
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                {totalItemsCount > 0 && (
                    <div className="mt-8">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            <span>Shopping Progress</span>
                            <span className="text-emerald-500">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* List Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20 no-print">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            ) : totalCategories === 0 ? (
                <div className="text-center py-20 card-bg rounded-3xl border-dashed border-2 px-4 no-print">
                    <div className="text-6xl mb-4 opacity-50">🛒</div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Your list is empty</h3>
                    <p className="text-gray-500 text-sm">Add some meals to your Meal Planner for the selected dates to generate a grocery list.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(groceryData).map(([category, items]) => (
                        <div key={category} className="list-card p-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3 mb-3 print-item">
                                <span className="text-xl">{getCategoryIcon(category)}</span>
                                <h3 className="font-bold text-lg capitalize text-gray-800 dark:text-gray-200">
                                    {category}
                                </h3>
                                <span className="ml-auto bg-gray-100 dark:bg-slate-800 text-gray-500 text-xs font-bold px-2 py-1 rounded-full no-print">
                                    {items.length} items
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                {items.map((item) => {
                                    const key = `${item.foodId}_${item.unit}`;
                                    const isChecked = checkedItems[key];
                                    
                                    return (
                                        <div 
                                            key={key} 
                                            className={`item-row flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer print-item ${isChecked ? 'checked-row' : ''}`}
                                            onClick={() => toggleCheck(item.foodId, item.unit)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`checkbox-custom no-print ${isChecked ? 'checked' : ''}`}>
                                                    {isChecked && <FiCheck size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{item.name}</p>
                                                    {item.brand && item.brand !== 'Generic' && (
                                                        <p className="text-[10px] text-gray-400 no-print">{item.brand}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right whitespace-nowrap overflow-hidden">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {item.totalAmount}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">
                                                    {item.unit}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroceryList;
