"use client";
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { Droplets, Plus, Clock, Save, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function InventoryPage() {
    const { t, language } = useLanguage();
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddStock, setShowAddStock] = useState(false);
    const [selectedFuel, setSelectedFuel] = useState('Petrol');
    const [addAmount, setAddAmount] = useState('');

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventory(res.data);
        } catch (err) {
            console.error("Failed to fetch inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAddStock = async () => {
        try {
            await api.post('/inventory/update', {
                fuelType: selectedFuel,
                quantity: parseFloat(addAmount)
            });
            alert(isAr ? 'تمت إضافة المخزون بنجاح' : 'Stock added successfully');
            setShowAddStock(false);
            setAddAmount('');
            fetchInventory();
        } catch (err) {
            alert("Failed to add stock");
        }
    };

    const isAr = language === 'ar';

    return (
        <ProtectedLayout>
            <div className="max-w-4xl mx-auto font-Cairo">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
                            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                            {isAr ? 'العودة للمدير' : 'Back to Admin'}
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900">{t('inventory')}</h1>
                        <p className="text-slate-500 font-medium">{isAr ? 'مراقبة وتعبئة مخزون الوقود بالمحطة' : 'Monitor and refill your station fuel stock.'}</p>
                    </div>
                    <button
                        onClick={() => setShowAddStock(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        {t('add_stock')}
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {inventory.map((item) => (
                        <div key={item.fuel_type} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                                    <Droplets className={`h-8 w-8 ${item.fuel_type === 'Petrol' ? 'text-blue-500' : 'text-amber-500'}`} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.fuel_type === 'Petrol' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {t(item.fuel_type.toLowerCase())}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('stock_available')}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900 leading-none">
                                        {parseFloat(item.current_quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400 uppercase">Gal</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2 text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    {t('date')}: {new Date(item.last_updated).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {showAddStock && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">{t('add_stock')}</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">{t('fuel_type')}</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold bg-slate-50"
                                        value={selectedFuel}
                                        onChange={(e) => setSelectedFuel(e.target.value)}
                                    >
                                        <option value="Petrol">{t('petrol')}</option>
                                        <option value="Diesel">{t('diesel')}</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block px-1">{t('quantity')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-5 py-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-black text-2xl text-blue-600 pr-16"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-5 top-6 text-xs font-black text-slate-300">GAL</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowAddStock(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        {t('close')}
                                    </button>
                                    <button
                                        onClick={handleAddStock}
                                        className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-5 w-5" />
                                        {t('convert')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    );
}
