"use client";
import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Fuel, Droplet, CreditCard, Hash, Printer, CheckCircle2, X } from 'lucide-react';

export default function CreateTicketPage() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [formData, setFormData] = useState({
        fuelType: 'Petrol',
        totalAmount: '',
        paymentMethod: 'Cash',
        notificationDigits: '',
        companyId: '',
        stationName: user?.stationName || '',
        managerName: user?.name || ''
    });
    const [companies, setCompanies] = useState<any[]>([]);
    const [prices, setPrices] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastTicket, setLastTicket] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [compRes, priceRes, invRes] = await Promise.all([
                api.get('/companies'),
                api.get('/prices'),
                api.get('/inventory')
            ]);
            if (compRes.data) setCompanies(compRes.data);
            if (priceRes.data) setPrices(priceRes.data);
            if (invRes.data) setInventory(invRes.data);
        } catch (err) {
            console.error("Failed to fetch initial data", err);
        }
    };

    const parseArabicNumber = (str: string) => {
        const eastern = "٠١٢٣٤٥٦٧٨٩";
        return str.split('').map(c => {
            const idx = eastern.indexOf(c);
            return idx > -1 ? idx.toString() : c;
        }).join('').replace(/[^0-9.]/g, '');
    };

    useEffect(() => {
        const cleanedAmount = parseArabicNumber(formData.totalAmount);
        const amount = parseFloat(cleanedAmount) || 0;
        const selectedPrice = prices.find(p => p.fuel_type === formData.fuelType);

        if (selectedPrice && amount > 0) {
            const price = parseFloat(selectedPrice.price_per_gallon as any) || 0;
            if (price > 0) {
                setQuantity(amount / price);
            } else {
                setQuantity(0);
            }
        } else {
            setQuantity(0);
        }
    }, [formData.totalAmount, formData.fuelType, prices]);

    const handleQuickAmount = (amount: number) => {
        setFormData({ ...formData, totalAmount: amount.toString() });
    };

    /**
     * [FIX] Robust Digit Validation
     * Converts Arabic numerals and ensures only 4 unique digits are accepted.
     */
    const validateDigits = (digits: string) => {
        const eastern = "٠١٢٣٤٥٦٧٨٩";
        const cleaned = digits.split('').map(c => {
            const idx = eastern.indexOf(c);
            return idx > -1 ? idx.toString() : c;
        }).join('').replace(/\D/g, '');

        if (cleaned.length !== 4) return t('invalid_digits');

        return { valid: true, value: cleaned };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        let finalDigits = '';

        // Validate digits for bank payments
        if (['Bank', 'Fawry', 'Omdurman'].includes(formData.paymentMethod)) {
            const validation = validateDigits(formData.notificationDigits);
            if (typeof validation === 'string') {
                setMessage(`Error: ${validation}`);
                return;
            }
            finalDigits = validation.value;
        }

        setLoading(true);
        try {
            const priceObj = prices.find(p => p.fuel_type === formData.fuelType);
            const submissionData = {
                fuelType: formData.fuelType,
                totalAmount: formData.totalAmount,
                paymentMethod: formData.paymentMethod,
                notificationNumber: finalDigits,
                companyId: formData.companyId,
                stationName: formData.stationName,
                pricePerGallon: priceObj?.price_per_gallon || 0,
                quantity: quantity > 0 ? quantity.toFixed(3) : "0.000"
            };

            const res = await api.post('/tickets', submissionData);

            if (res.data) {
                setLastTicket(res.data);
                setMessage(t('success_message'));
                setShowReceipt(true);
                // Refresh inventory after successful ticket
                fetchInitialData();
                // Reset form
                setFormData(prev => ({
                    ...prev,
                    totalAmount: '',
                    notificationDigits: '',
                    companyId: ''
                }));
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            const errorMsg = error.response?.data?.error || error.message || t('failed_to_create');
            setMessage(`Error: ${errorMsg}`);
        } finally {
            // [FIX] Ensure loading is always stopped
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isAr = language === 'ar';

    return (
        <ProtectedLayout>
            <div className="max-w-2xl mx-auto print:hidden">
                <header className="mb-8 font-Cairo">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{t('issue_new_ticket')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{t('enter_details')}</p>
                </header>

                <div className="mb-6 flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-2xl border border-blue-100 dark:border-slate-700 shadow-sm font-Cairo">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('quick_amounts')}</span>
                    <div className="flex items-center gap-3">
                        {[5000, 10000, 20000].map(amt => (
                            <button key={amt} type="button" onClick={() => handleQuickAmount(amt)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-black text-sm transition-all shadow-sm active:scale-95">
                                {amt.toLocaleString()}
                            </button>
                        ))}
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-Cairo flex items-center gap-3 animate-in slide-in-from-top-2 ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {message.includes('Error') ? <X className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        <span className="font-bold">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 font-Cairo">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">{t('fuel_type')}</label>
                            <div className="relative group">
                                <Droplet className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors`} />
                                <select className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all`}
                                    value={formData.fuelType} onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                                    <option value="Petrol">{t('petrol')}</option>
                                    <option value="Diesel">{t('diesel')}</option>
                                </select>
                            </div>
                            {/* Inventory Badge */}
                            <div className="mt-2 flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('current_stock')}: <span className="text-blue-600">{Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0).toFixed(2)} Gal</span>
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">{t('manager_name')}</label>
                            <div className="relative group">
                                <Hash className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors`} />
                                <input readOnly disabled className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-300 cursor-not-allowed focus:outline-none bg-slate-100 dark:bg-slate-700 font-bold transition-all`}
                                    value={formData.managerName} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">{t('payment_method')}</label>
                        <div className="relative group">
                            <CreditCard className={`absolute ${isAr ? 'right-4' : 'left-4'} top-4 h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors`} />
                            <select className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all`}
                                value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                <option value="Cash">{t('cash')}</option>
                                <option value="Bank">{t('bank_khartoum')}</option>
                                <option value="Fawry">{t('bank_faisal')}</option>
                                <option value="Omdurman">{t('bank_omdurman')}</option>
                                <option value="Account">{t('account')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider px-1">{t('total_price')}</label>
                        <div className="relative group">
                            <span className={`absolute ${isAr ? 'right-5' : 'left-5'} top-5 text-xl font-black text-slate-300 group-focus-within:text-blue-500`}>SDG</span>
                            <input type="number" required className={`w-full ${isAr ? 'pr-20 pl-6' : 'pl-20 pr-6'} py-6 rounded-3xl border-2 border-slate-100 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-3xl text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-700 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-500`}
                                value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} placeholder="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quantity')}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{quantity.toFixed(3)}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">Gal</span>
                            </div>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('price_per_liter')}</span>
                            <div className="flex items-baseline gap-2 justify-end">
                                <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{prices.find(p => p.fuel_type === formData.fuelType)?.price_per_gallon?.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">SDG/Gal</span>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Fields for Bank */}
                    {['Bank', 'Fawry', 'Omdurman'].includes(formData.paymentMethod) && (
                        <div className="p-8 rounded-[2rem] bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 flex flex-col items-center">
                            <div className="space-y-3 w-full max-w-[280px]">
                                <label className="text-sm font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest block text-center mb-2">{t('notification_digits')}</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-4 h-6 w-6 text-blue-400" />
                                    <input required maxLength={4} className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-blue-200 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-2xl tracking-[0.5em] text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all uppercase"
                                        value={formData.notificationDigits} onChange={e => setFormData({ ...formData, notificationDigits: e.target.value })} placeholder="0000" />
                                </div>
                                <p className="text-[10px] text-blue-400 text-center font-bold tracking-tighter mt-2">{t('notification_uniqueness_hint') || 'Ensuring ticket hasn\'t been duplicated'}</p>
                            </div>
                        </div>
                    )}

                    {formData.paymentMethod === 'Account' && (
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">{t('company_name')}</label>
                            <select required className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                value={formData.companyId} onChange={e => setFormData({ ...formData, companyId: e.target.value })}>
                                <option value="">{t('select_company')}</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Out of Fuel Warning */}
                    {quantity > Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0) && quantity > 0 && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-pulse">
                            <X className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-black text-red-700 uppercase tracking-tight">
                                {Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0) <= 0
                                    ? t('out_of_fuel')
                                    : t('insufficient_fuel')}
                            </span>
                        </div>
                    )}

                    <button
                        disabled={loading || quantity > Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0) || quantity <= 0}
                        type="submit"
                        className={`w-full font-black py-6 rounded-[1.75rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-lg ${(loading || quantity > Number(inventory.find(i => i.fuel_type === formData.fuelType)?.current_quantity || 0) || quantity <= 0)
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white shadow-slate-300 dark:shadow-slate-900/50'
                            }`}
                    >
                        {loading ? <div className="animate-spin h-6 w-6 border-4 border-white/20 border-t-white rounded-full" /> : <CheckCircle2 className="h-6 w-6" />}
                        {loading ? t('processing') : t('generate_ticket')}
                    </button>
                </form>
            </div>

            {/* Receipt Modal */}
            {showReceipt && lastTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 print:p-4 font-Cairo text-center">
                            <div className="flex flex-col items-center mb-8">
                                {user?.logoUrl ? (
                                    <div className="h-20 w-20 mb-4 overflow-hidden rounded-2xl border border-slate-100 p-1 bg-white">
                                        <img src={user.logoUrl} alt="Station Logo" className="h-full w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                                        <Fuel className="h-8 w-8 text-white" />
                                    </div>
                                )}
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fuel Receipt</h2>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{lastTicket.stationName}</p>
                            </div>

                            <div className="space-y-4 border-t-2 border-dashed border-slate-100 dark:border-slate-700 pt-6">
                                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <span className="text-xs font-black text-slate-400 uppercase">Ticket ID</span>
                                    <span className="font-mono font-black text-blue-600">#{lastTicket.ticketId}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`space-y-1 ${isAr ? 'text-right' : 'text-left'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fuel_type')}</span>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{t(lastTicket.fuelType?.toLowerCase() || 'petrol')}</p>
                                    </div>
                                    <div className={`space-y-1 ${isAr ? 'text-left' : 'text-right'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('date')}</span>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(lastTicket.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <div className={`space-y-1 ${isAr ? 'text-right' : 'text-left'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('quantity')}</span>
                                        <p className="font-black text-slate-900 dark:text-white text-lg">{parseFloat(lastTicket.quantity || 0).toFixed(3)} Gal</p>
                                    </div>
                                    <div className={`space-y-1 ${isAr ? 'text-left' : 'text-right'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('price_per_liter')}</span>
                                        <p className="font-bold text-slate-600 dark:text-slate-300">{lastTicket.pricePerGallon || 0} SDG/Gal</p>
                                    </div>
                                </div>

                                <div className="mt-8 bg-slate-900 dark:bg-slate-950 p-6 rounded-3xl text-center shadow-xl">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Amount Paid</span>
                                    <span className="text-4xl font-black text-white">
                                        <span className="text-sm opacity-50 mr-2">SDG</span>
                                        {parseFloat(lastTicket.totalPrice || 0).toLocaleString()}
                                    </span>
                                </div>

                                <div className="pt-4 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('payment_method')}: {t(lastTicket.paymentMethod?.toLowerCase() || 'cash')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-3 print:hidden">
                            <button onClick={() => setShowReceipt(false)} className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <X className="h-5 w-5" />
                                {t('close')}
                            </button>
                            <button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Printer className="h-5 w-5" />
                                {t('print_receipt')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: 80mm 200mm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .fixed, .fixed * {
                        visibility: visible !important;
                    }
                    .fixed {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        padding: 0 !important;
                    }
                    .fixed > div {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                    }
                    .print\\:hidden, button, header, nav, .print\\:hidden * {
                        display: none !important;
                    }
                }
            `}</style>
        </ProtectedLayout>
    );
}
