"use client";
import { useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/services/api';
import { User, Image as ImageIcon, Save, ArrowLeft, Building2, Droplet, Fuel } from 'lucide-react';
import Link from 'next/link';

export default function ManagerSettingsPage() {
    const { user, setUser } = useAuth();
    const { t, language } = useLanguage();
    const [name, setName] = useState(user?.name || '');
    const [stationName, setStationName] = useState(user?.stationName || '');
    const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [sqlFix, setSqlFix] = useState('');
    const [petrolStock, setPetrolStock] = useState('0');
    const [dieselStock, setDieselStock] = useState('0');
    const [petrolPrice, setPetrolPrice] = useState('0');
    const [dieselPrice, setDieselPrice] = useState('0');

    // Fetch initial inventory
    useState(() => {
        const fetchInitialData = async () => {
            try {
                const [invRes, priceRes] = await Promise.all([
                    api.get('/inventory'),
                    api.get('/prices')
                ]);

                if (invRes.data) {
                    invRes.data.forEach((item: any) => {
                        if (item.fuel_type === 'Petrol') setPetrolStock(item.current_quantity?.toString() || '0');
                        if (item.fuel_type === 'Diesel') setDieselStock(item.current_quantity?.toString() || '0');
                    });
                }

                if (priceRes.data) {
                    priceRes.data.forEach((item: any) => {
                        if (item.fuel_type === 'Petrol') setPetrolPrice(item.price_per_gallon?.toString() || '0');
                        if (item.fuel_type === 'Diesel') setDieselPrice(item.price_per_gallon?.toString() || '0');
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings data", err);
            }
        };
        fetchInitialData();
    });

    const isAr = language === 'ar';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatusMessage('');
        setSqlFix('');
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await api.post('/users/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.logoUrl) {
                setLogoUrl(res.data.logoUrl);
                setStatusMessage(isAr ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            const errorData = err.response?.data;
            if (errorData?.sqlFix) {
                setSqlFix(errorData.sqlFix);
                setStatusMessage(isAr ? 'خطأ في النظام: يرجى تنفيذ الكود أدناه في Supabase ثم المحاولة مرة أخرى' : 'System Error: Please run the SQL below in Supabase then try again');
            } else {
                setStatusMessage(isAr ? 'فشل رفع الشعار' : 'Upload failed');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage('');

        try {
            // Update User Profile
            const res = await api.patch('/users/me', { name, logoUrl, stationName });

            // Update Inventory (Send the total quantity directly to override/update)
            const invRes = await api.get('/inventory');
            if (invRes.data) {
                const currentPetrol = invRes.data.find((i: any) => i.fuel_type === 'Petrol')?.current_quantity || 0;
                const currentDiesel = invRes.data.find((i: any) => i.fuel_type === 'Diesel')?.current_quantity || 0;

                const petrolDiff = Number(petrolStock) - Number(currentPetrol);
                const dieselDiff = Number(dieselStock) - Number(currentDiesel);

                if (petrolDiff !== 0) await api.post('/inventory/update', { fuelType: 'Petrol', quantity: petrolDiff });
                if (dieselDiff !== 0) await api.post('/inventory/update', { fuelType: 'Diesel', quantity: dieselDiff });
            }

            // Update Prices
            await Promise.all([
                api.post('/prices/update', { fuelType: 'Petrol', pricePerGallon: Number(petrolPrice) }),
                api.post('/prices/update', { fuelType: 'Diesel', pricePerGallon: Number(dieselPrice) })
            ]);

            if (res.data) {
                // Update local auth context
                setUser(res.data);
            }

            // If we get here, everything succeeded
            setStatusMessage(isAr ? 'تم تحديث البيانات بنجاح' : 'Settings updated successfully');

        } catch (err: any) {
            console.error('Update error:', err);
            const errorData = err.response?.data;
            if (errorData?.sqlFix) {
                setSqlFix(errorData.sqlFix);
                setStatusMessage(isAr ? 'خطأ في النظام: يرجى نسخ الكود وتمريره في Supabase' : 'System Error: Please run the SQL below in Supabase');
            } else {
                setStatusMessage(isAr ? 'فشل التحديث: ' + (errorData?.error || 'حاول مرة أخرى') : 'Failed to update: ' + (errorData?.error || 'Try again'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedLayout>
            <div className="max-w-2xl mx-auto font-Cairo">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 mb-2">
                            <ArrowLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                            {isAr ? 'الرجوع للوحة التحكم' : 'Back to Dashboard'}
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            {isAr ? 'إعدادات المدير' : 'Manager Settings'}
                        </h1>
                    </div>
                </header>

                <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                    {statusMessage && (
                        <div className={`p-6 rounded-2xl text-sm font-bold border ${statusMessage.includes('خطأ') || statusMessage.includes('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                            <p className="mb-2">{statusMessage}</p>
                            {sqlFix && (
                                <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] break-all border border-slate-700 select-all cursor-pointer" title="Copy SQL">
                                    {sqlFix}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Account Name */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-600 uppercase tracking-wider">{isAr ? 'اسم الحساب' : 'Account Name'}</label>
                            <div className="relative group">
                                <User className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500`} />
                                <input
                                    className={`w-full ${isAr ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-500 outline-none font-bold bg-slate-50`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Station Name */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-600 uppercase tracking-wider">{isAr ? 'اسم المحطة' : 'Station Name'}</label>
                            <div className="relative group">
                                <Building2 className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500`} />
                                <input
                                    className={`w-full ${isAr ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-500 outline-none font-bold bg-slate-50`}
                                    value={stationName}
                                    onChange={(e) => setStationName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-600 uppercase tracking-wider">{isAr ? 'شعار المحطة' : 'Station Logo'}</label>
                            <div className="flex flex-col gap-4">
                                <div className="relative group">
                                    <ImageIcon className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500`} />
                                    <input
                                        className={`w-full ${isAr ? 'pr-12' : 'pl-12'} py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-500 outline-none font-bold bg-slate-50`}
                                        placeholder={isAr ? 'رابط الشعار أو ارفع ملفاً' : 'Logo URL or upload a file'}
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center gap-2">
                                        {uploading ? <div className="animate-spin h-4 w-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full" /> : <ImageIcon className="h-4 w-4" />}
                                        {isAr ? 'اختيار صورة من الجهاز' : 'Choose local image'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                    {uploading && <span className="text-xs text-slate-400 animate-pulse">{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Logo Preview */}
                        {logoUrl && (
                            <div className="pt-4 flex flex-col items-center gap-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{isAr ? 'معاينة الشعار' : 'Logo Preview'}</span>
                                <div className="h-32 w-32 rounded-3xl border-2 border-dashed border-slate-200 p-2 overflow-hidden flex items-center justify-center bg-slate-50">
                                    <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" onError={() => setStatusMessage(isAr ? 'رابط الصورة غير صالح' : 'Invalid logo URL')} />
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Fuel className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{isAr ? 'إدارة مخزون الوقود' : 'Fuel Inventory Management'}</h3>
                                    <p className="text-xs font-bold text-slate-400">{isAr ? 'قم بتحديث كميات الوقود المتاحة حالياً في المحطة' : 'Update the current available fuel stocks at the station'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Petrol Stock */}
                                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex flex-col gap-3 transition-colors hover:bg-orange-50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-black text-orange-900 uppercase tracking-wider">{isAr ? 'البنزين' : 'Petrol'}</label>
                                        <Droplet className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="relative group">
                                        <span className={`absolute ${isAr ? 'left-5' : 'right-5'} top-4 text-sm font-black text-orange-300 group-focus-within:text-orange-500 uppercase`}>Gal</span>
                                        <input
                                            type="number"
                                            className={`w-full ${isAr ? 'pl-16 pr-5' : 'pr-16 pl-5'} py-4 rounded-xl border-2 border-orange-200 focus:border-orange-500 outline-none font-black text-xl text-orange-700 bg-white shadow-sm`}
                                            value={petrolStock}
                                            onChange={(e) => setPetrolStock(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className={`absolute ${isAr ? 'left-5' : 'right-5'} top-4 text-[10px] font-black text-orange-300 group-focus-within:text-orange-500 uppercase`}>SDG/Gal</span>
                                        <input
                                            type="number"
                                            className={`w-full ${isAr ? 'pl-16 pr-5' : 'pr-16 pl-5'} py-3 rounded-xl border-2 border-orange-50 focus:border-orange-300 outline-none font-bold text-sm text-orange-600 bg-white/50`}
                                            placeholder={isAr ? 'سعر الجالون' : 'Price per Gallon'}
                                            value={petrolPrice}
                                            onChange={(e) => setPetrolPrice(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Diesel Stock & Price */}
                                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200 flex flex-col gap-3 transition-colors hover:bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider">{isAr ? 'الديزل' : 'Diesel'}</label>
                                        <Droplet className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="relative group">
                                        <span className={`absolute ${isAr ? 'left-5' : 'right-5'} top-4 text-sm font-black text-slate-300 group-focus-within:text-slate-500 uppercase`}>Gal</span>
                                        <input
                                            type="number"
                                            className={`w-full ${isAr ? 'pl-16 pr-5' : 'pr-16 pl-5'} py-4 rounded-xl border-2 border-slate-200 focus:border-slate-500 outline-none font-black text-xl text-slate-700 bg-white shadow-sm`}
                                            value={dieselStock}
                                            onChange={(e) => setDieselStock(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <span className={`absolute ${isAr ? 'left-5' : 'right-5'} top-4 text-[10px] font-black text-slate-300 group-focus-within:text-slate-500 uppercase`}>SDG/Gal</span>
                                        <input
                                            type="number"
                                            className={`w-full ${isAr ? 'pl-16 pr-5' : 'pr-16 pl-5'} py-3 rounded-xl border-2 border-slate-50 focus:border-slate-300 outline-none font-bold text-sm text-slate-600 bg-white/50`}
                                            placeholder={isAr ? 'سعر الجالون' : 'Price per Gallon'}
                                            value={dieselPrice}
                                            onChange={(e) => setDieselPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.75rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="h-5 w-5" />}
                        {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </ProtectedLayout>
    );
}
