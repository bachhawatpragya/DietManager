import React, { useState, useEffect, useMemo } from 'react';
import { dietAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    FaWeight, FaHistory, FaArrowUp, FaArrowDown, FaChartLine,
    FaBolt, FaCalendarCheck, FaTrophy, FaRegEdit,
    FaRunning
} from 'react-icons/fa';
import { GiChest, GiBelt, GiShorts, GiBiceps, GiLeg } from 'react-icons/gi';

const ProgressTracker = () => {
    // --- State ---
    const [progressData, setProgressData] = useState({
        weight: '',
        measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
        mood: 'good',
        energyLevel: 5,
        notes: ''
    });
    const [progressHistory, setProgressHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- Effects ---
    useEffect(() => {
        loadProgressHistory();
    }, []);

    const loadProgressHistory = async () => {
        try {
            const result = await dietAPI.getProgress(20);
            if (result.success) {
                setProgressHistory(result.progress);
            }
        } catch (error) {
            console.error('Error loading progress history:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('measurements.')) {
            const mType = name.split('.')[1];
            setProgressData(prev => ({ ...prev, measurements: { ...prev.measurements, [mType]: value } }));
        } else if (name === 'energyLevel') {
            // FIX: always submit energyLevel as a Number, not a String
            setProgressData(prev => ({ ...prev, energyLevel: parseInt(value, 10) }));
        } else {
            setProgressData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await dietAPI.recordProgress(progressData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Progress logged successfully!' });
                setProgressData({
                    weight: '',
                    measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
                    mood: 'good', energyLevel: 5, notes: ''
                });
                loadProgressHistory();
                setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // --- Computed Stats ---
    const stats = useMemo(() => {
        if (progressHistory.length < 2) return null;
        const current = progressHistory[0].weight;
        const first = progressHistory[progressHistory.length - 1].weight;
        const totalChange = (current - first).toFixed(1);
        const avgEnergy = (progressHistory.reduce((acc, h) => acc + h.energyLevel, 0) / progressHistory.length).toFixed(1);

        return [
            { label: 'Total Change', value: `${totalChange > 0 ? '+' : ''}${totalChange} kg`, icon: <FaWeight />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Avg Energy', value: `${avgEnergy}/10`, icon: <FaBolt />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Check-ins', value: progressHistory.length, icon: <FaCalendarCheck />, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Status', value: 'On Track', icon: <FaTrophy />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' }
        ];
    }, [progressHistory]);

    const moodOptions = [
        { value: 'excellent', label: '🔥', text: 'Excellent' },
        { value: 'good', label: '😁', text: 'Good' },
        { value: 'okay', label: '😐', text: 'Okay' },
        { value: 'poor', label: '🥴', text: 'Poor' },
        { value: 'terrible', label: '💀', text: 'Terrible' }
    ];

    const getWeightChange = (idx) => {
        if (idx === progressHistory.length - 1) return null;
        const change = progressHistory[idx].weight - progressHistory[idx + 1].weight;
        return { val: Math.abs(change).toFixed(1), dir: change < 0 ? 'down' : 'up' };
    };

    const measurements = [
        { key: 'chest', label: 'Chest', icon: <GiChest /> },
        { key: 'waist', label: 'Waist', icon: <GiBelt /> },
        { key: 'hips', label: 'Hips', icon: <GiShorts /> },
        { key: 'arms', label: 'Arms', icon: <GiBiceps /> },
        { key: 'thighs', label: 'Thighs', icon: <GiLeg /> }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-enter">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-2xl border border-rose-500/20">
                        📈
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">My Journey</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Track your progress and celebrate every milestone.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <FaRunning className="text-emerald-500 text-lg" />
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Eat Well</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Move More</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sleep Better</p>
                    </div>
                </div>
            </div>

            {/* ── Notification ── */}
            {message.text && (
                <div className={`p-4 rounded-xl text-center font-semibold text-sm transition-all ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* ── Stats Row ── */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="premium-card p-5 flex items-center gap-4">
                            <div className={`p-3 ${s.bg} rounded-xl ${s.color} text-xl flex-shrink-0`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{s.label}</p>
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left: Chart + Log Form */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Weight Chart */}
                    <div className="premium-card p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                    <FaChartLine className="text-lg" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Weight Over Time</h3>
                            </div>
                            <select className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl outline-none border border-slate-200 dark:border-slate-700">
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                            </select>
                        </div>

                        {progressHistory.length === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm italic">
                                No data yet — log your first check-in below.
                            </div>
                        ) : (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[...progressHistory].reverse()}>
                                        <defs>
                                            <linearGradient id="zenEmerald" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} strokeOpacity={0.06} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={12}
                                        />
                                        <YAxis
                                            domain={['dataMin - 1', 'dataMax + 1']}
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dx={-10}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="card-bg px-4 py-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                                                {new Date(payload[0].payload.date).toDateString()}
                                                            </p>
                                                            <p className="text-lg font-bold text-emerald-500">{payload[0].value} kg</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3}
                                            fillOpacity={1} fill="url(#zenEmerald)"
                                            activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Log Form */}
                    <form onSubmit={handleSubmit} className="premium-card p-8 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                <FaRegEdit className="text-lg" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today's Check-in</h3>
                        </div>

                        {/* Weight + Energy — matched height */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Weight Input */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Body Weight</label>
                                <div className="relative min-h-[120px] flex items-stretch">
                                    <input
                                        type="number" name="weight"
                                        value={progressData.weight}
                                        onChange={handleChange}
                                        step="0.1" required
                                        placeholder="0.0"
                                        className="input-style-pro w-full text-3xl font-bold pl-6 pr-14 text-slate-900 dark:text-white"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase text-sm">kg</span>
                                </div>
                            </div>

                            {/* Energy Slider — same min-height as weight */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Energy Level</label>
                                <div className="min-h-[120px] flex flex-col justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-3xl transition-all duration-300 ${progressData.energyLevel > 7 ? 'scale-125' : 'opacity-40 grayscale'}`}>⚡</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{progressData.energyLevel}</span>
                                            <span className="text-slate-400 text-sm ml-1">/10</span>
                                        </div>
                                    </div>
                                    <div>
                                        <input
                                            type="range" name="energyLevel"
                                            min="1" max="10"
                                            value={progressData.energyLevel}
                                            onChange={handleChange}
                                            className="w-full accent-emerald-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] font-bold text-slate-300 dark:text-slate-600 mt-1">
                                            <span>Low</span><span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Measurements */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Body Measurements (cm) — Optional</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {measurements.map((m) => (
                                    <div key={m.key} className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-emerald-400/40 transition-colors">
                                        <div className="text-xl text-emerald-500">{m.icon}</div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                                        <div className="relative w-full">
                                            <input
                                                type="number"
                                                name={`measurements.${m.key}`}
                                                value={progressData.measurements[m.key]}
                                                onChange={handleChange}
                                                placeholder="--"
                                                className="w-full bg-transparent text-center font-bold text-slate-900 dark:text-white outline-none text-sm pr-3"
                                            />
                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300">cm</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mood + Submit */}
                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div className="w-full md:flex-1 space-y-4">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">How are you feeling?</label>
                                <div className="flex flex-wrap gap-3">
                                    {moodOptions.map(m => (
                                        <button
                                            key={m.value} type="button"
                                            onClick={() => setProgressData(p => ({ ...p, mood: m.value }))}
                                            className={`mood-chip flex-1 min-w-[70px] ${progressData.mood === m.value ? 'active' : ''}`}
                                        >
                                            <span className="text-2xl">{m.label}</span>
                                            <span className={`text-[9px] font-bold uppercase ${progressData.mood === m.value ? 'text-white' : 'text-slate-500'}`}>{m.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-[220px]">
                                <button
                                    type="submit"
                                    disabled={saving || !progressData.weight}
                                    className="w-full py-4 accent-gradient text-slate-950 font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : '✅ Log Check-in'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right: Activity Stream */}
                <div className="lg:col-span-4 space-y-6 h-fit lg:sticky lg:top-10">

                    {/* Notes input with Save & Clear */}
                    <div className="premium-card p-6 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setProgressData(p => ({ ...p, notes: '' }))}
                                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <textarea
                            name="notes"
                            value={progressData.notes}
                            onChange={handleChange}
                            placeholder="How did today feel? Any observations..."
                            rows="3"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm italic text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (progressData.notes.trim()) {
                                    setMessage({ type: 'success', text: 'Note saved! It will be included with your next check-in.' });
                                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                                }
                            }}
                            className="w-full py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/10 transition-colors"
                        >
                            💾 Save Note
                        </button>
                    </div>

                    {/* History stream */}
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                                <FaHistory />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">History</h3>
                        </div>

                        <div className="space-y-5 relative">
                            {/* Vertical line */}
                            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100 dark:bg-slate-800 rounded-full"></div>

                            {progressHistory.length === 0 ? (
                                <p className="text-center py-10 text-slate-400 text-sm italic pl-6">No history yet. Start logging!</p>
                            ) : (
                                progressHistory.map((entry, idx) => {
                                    const change = getWeightChange(idx);
                                    return (
                                        <div key={entry._id} className="relative pl-10 group">
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full z-10 border-2 border-white dark:border-slate-900 ${idx === 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    {change && (
                                                        <div className={`flex items-center gap-1 text-[10px] font-bold ${change.dir === 'down' ? 'text-emerald-500' : 'text-rose-400'}`}>
                                                            {change.dir === 'down' ? <FaArrowDown /> : <FaArrowUp />} {change.val}kg
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {entry.weight}<span className="text-xs font-bold text-slate-400 ml-1">kg</span>
                                                    </span>
                                                    <span className="text-lg group-hover:scale-110 transition-transform">
                                                        {moodOptions.find(m => m.value === entry.mood)?.label}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-amber-500">⚡{entry.energyLevel}/10</span>
                                                </div>
                                                {entry.notes && (
                                                    <p className="text-[10px] text-slate-400 italic line-clamp-1 border-l-2 border-emerald-500/30 pl-2 mt-1">{entry.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
