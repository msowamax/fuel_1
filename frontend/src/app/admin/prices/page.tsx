"use client";
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { Fuel, Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function PriceSettingsPage() {
    const { t, language } = useLanguage();
    const [prices, setPrices] = useState<any>({ Petrol: '', Diesel: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const isAr = language === 'ar';

    const fetchPrices = async () => {
        try {
            const res = await api.get('/prices');
            const priceMap: any = { Petrol: '', Diesel: '' };
            res.data.forEach((p: any) => {
                priceMap[p.fuel_type] = p.price_per_gallon;
            });
            setPrices(priceMap);
        } catch (err) {
            console.error("Failed to fetch prices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const handleUpdate = async (fuelType: string) => {
        const val = prices[fuelType];
        if (!val) return;

        setUpdating(fuelType);
        try {
            await api.post('/prices', { fuelType, pricePerGallon: parseFloat(val) });
            alert(isAr ? 'تم تحديث السعر بنجاح' : 'Price updated successfully');
        } catch (err) {
            alert("Failed to update price");
        } finally {
            setUpdating(null);
        }
    };

    const handlePriceChange = (type: string, val: string) => {
        setPrices({ ...prices, [type]: val });
    };

    if (loading) return <div className="p-8 text-center font-Cairo font-bold text-slate-400">Loading Prices...</div>;

    return (
        <ProtectedLayout>
            <div className="max-w-4xl mx-auto font-Cairo">
                <header className="mb-10">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
                        <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                        {isAr ? 'العودة للمدير' : 'Back to Admin'}
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">{isAr ? 'إعدادات الأسعار' : 'Fuel Price Settings'}</h1>
                    <p className="text-slate-500 font-medium">{isAr ? 'تحديد سعر الجالون لكل نوع وقود' : 'Set the price per Gallon for each fuel type'}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {['Petrol', 'Diesel'].map(type => (
                        <div key={type} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${type === 'Petrol' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <Fuel className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{isAr ? (type === 'Petrol' ? 'بنزين' : 'جازولين') : type}</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isAr ? 'سعر البيع الحالي' : 'Current Market Price'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {isAr ? 'السعر للجالون (SDG)' : 'Price per Gallon (SDG)'}
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        className="flex-1 px-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-black text-2xl transition-all"
                                        value={prices[type]}
                                        onChange={e => handlePriceChange(type, e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <button
                                        disabled={updating === type}
                                        onClick={() => handleUpdate(type)}
                                        className="bg-slate-900 hover:bg-black text-white px-8 rounded-2xl font-black shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {updating === type ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ProtectedLayout>
    );
}
