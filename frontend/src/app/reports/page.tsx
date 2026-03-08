"use client";
import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { Calendar, Database, Printer, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type TabType = 'sales' | 'inventory';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const { t, language } = useLanguage();
    const isAr = language === 'ar';
    const [isMounted, setIsMounted] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('sales');

    // Filters
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Data
    const [tickets, setTickets] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [salesStats, setSalesStats] = useState({ totalRevenue: 0, totalLiters: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'sales') {
                const queryParams = new URLSearchParams();
                if (startDate) queryParams.append('startDate', new Date(startDate).toISOString());
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    queryParams.append('endDate', end.toISOString());
                }

                const response = await api.get(`/tickets?${queryParams.toString()}`);
                const fetchedTickets = response.data;
                setTickets(fetchedTickets);

                // Calculate stats
                let revenue = 0;
                let liters = 0;
                fetchedTickets.forEach((t: any) => {
                    revenue += Number(t.totalPrice);
                    liters += Number(t.quantity);
                });
                setSalesStats({ totalRevenue: revenue, totalLiters: liters });
            } else if (activeTab === 'inventory') {
                const response = await api.get('/inventory');
                setInventory(response.data);
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            alert(isAr ? 'فشل جلب البيانات' : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when tab or dates change
    useEffect(() => {
        setIsMounted(true);
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, startDate, endDate]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <ProtectedLayout>
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-report, #printable-report * {
                        visibility: visible;
                    }
                    #printable-report {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Ensure table borders show in print */
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd !important; padding: 8px; text-align: ${isAr ? 'right' : 'left'}; }
                }
            `}</style>

            <div className="max-w-6xl mx-auto pb-12">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isAr ? 'التقارير الشاملة' : 'Comprehensive Reports'}</h1>
                        <p className="text-slate-500 mt-1">{isAr ? 'عرض بيانات المبيعات والمخزون' : 'View sales and inventory data'}</p>
                    </div>

                    <button
                        onClick={handlePrint}
                        disabled={loading || (activeTab === 'sales' && tickets.length === 0) || (activeTab === 'inventory' && inventory.length === 0)}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
                    >
                        <Printer className="h-5 w-5" />
                        {isAr ? 'طباعة التقرير' : 'Print Report'}
                    </button>
                </header>

                {/* Filters - No Print */}
                {activeTab === 'sales' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8 no-print flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                {isAr ? 'من تاريخ' : 'Start Date'}
                            </label>
                            <div className="relative">
                                <Calendar className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5`} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full p-3 ${isAr ? 'pr-10' : 'pl-10'} bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                {isAr ? 'إلى تاريخ' : 'End Date'}
                            </label>
                            <div className="relative">
                                <Calendar className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5`} />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full p-3 ${isAr ? 'pr-10' : 'pl-10'} bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="w-full md:w-auto px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-all"
                            >
                                {isAr ? 'مسح التواريخ' : 'Clear Dates'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Area (Printable) */}
                <div id="printable-report" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">

                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-100 no-print">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`flex-1 py-4 px-6 text-center font-bold text-sm transition-all ${activeTab === 'sales' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {isAr ? 'تقرير المبيعات' : 'Sales Report'}
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex-1 py-4 px-6 text-center font-bold text-sm transition-all ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {isAr ? 'تقرير المخزون' : 'Inventory Report'}
                        </button>
                    </div>

                    {/* Print Header (Only visible in print) */}
                    <div className="hidden print:block p-8 border-b border-slate-200 mb-6">
                        <h1 className="text-3xl font-black mb-2">
                            {activeTab === 'sales' ? (isAr ? 'تقرير المبيعات' : 'Sales Report') : (isAr ? 'تقرير المخزون' : 'Inventory Report')}
                        </h1>
                        {isMounted && (
                            <p className="text-slate-600">
                                {isAr ? 'تاريخ الطباعة:' : 'Printed on:'} {new Date().toLocaleString()}
                            </p>
                        )}
                        {activeTab === 'sales' && (startDate || endDate) && (
                            <p className="text-slate-600 mt-2">
                                {isAr ? 'الفترة:' : 'Period:'} {startDate || (isAr ? 'البداية' : 'Start')} - {endDate || (isAr ? 'النهاية' : 'End')}
                            </p>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                                <p className="text-slate-500 font-medium">{t('processing')}</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'sales' && (
                                    <div>
                                        {/* Sales Summaries */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <p className="text-sm font-bold text-slate-500 uppercase mb-1">{isAr ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                                                <p className="text-3xl font-black text-slate-900">
                                                    {salesStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isAr ? 'ج.س' : 'SDG'}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <p className="text-sm font-bold text-slate-500 uppercase mb-1">{isAr ? 'إجمالي اللترات المباعة' : 'Total Liters Sold'}</p>
                                                <p className="text-3xl font-black text-slate-900">
                                                    {salesStats.totalLiters.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isAr ? 'لتر' : 'L'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sales Table */}
                                        {tickets.length > 0 ? (
                                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                                                            <th className={`p-4 font-bold ${isAr ? 'text-right' : 'text-left'}`}>{t('ticket_id')}</th>
                                                            <th className={`p-4 font-bold ${isAr ? 'text-right' : 'text-left'}`}>{t('date')}</th>
                                                            <th className={`p-4 font-bold ${isAr ? 'text-right' : 'text-left'}`}>{t('fuel_type')}</th>
                                                            <th className={`p-4 font-bold ${isAr ? 'text-right' : 'text-left'}`}>{t('quantity')}</th>
                                                            <th className={`p-4 font-bold ${isAr ? 'text-right' : 'text-left'}`}>{t('total_price')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {tickets.map((ticket, index) => (
                                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className={`p-4 font-medium text-slate-900 ${isAr ? 'text-right' : 'text-left'}`}>{ticket.ticketId}</td>
                                                                <td className={`p-4 text-slate-600 ${isAr ? 'text-right' : 'text-left'}`}>{new Date(ticket.createdAt).toLocaleString()}</td>
                                                                <td className={`p-4 text-slate-600 ${isAr ? 'text-right' : 'text-left'}`}>
                                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${ticket.fuelType?.toLowerCase() === 'gasoline' || ticket.fuelType?.toLowerCase() === 'petrol' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                                        {ticket.fuelType}
                                                                    </span>
                                                                </td>
                                                                <td className={`p-4 text-slate-600 font-medium ${isAr ? 'text-right' : 'text-left'}`}>
                                                                    {Number(ticket.quantity).toFixed(2)} {isAr ? 'لتر' : 'L'}
                                                                </td>
                                                                <td className={`p-4 font-bold text-slate-900 ${isAr ? 'text-right' : 'text-left'}`}>
                                                                    {Number(ticket.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isAr ? 'ج.س' : 'SDG'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <Database className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500">{isAr ? 'لا توجد مبيعات في هذه الفترة' : 'No sales found for this period'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'inventory' && (
                                    <div>
                                        {/* Inventory Table */}
                                        {inventory.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {inventory.map((item, index) => (
                                                    <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                                        <div className={`p-4 border-b ${item.fuel_type?.toLowerCase() === 'petrol' || item.fuel_type?.toLowerCase() === 'gasoline'
                                                            ? 'bg-orange-50 border-orange-100'
                                                            : 'bg-green-50 border-green-100'
                                                            }`}>
                                                            <h3 className="font-bold text-lg text-slate-900">{item.fuel_type}</h3>
                                                        </div>
                                                        <div className="p-6">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <span className="text-slate-500 font-medium">{isAr ? 'الكمية المتوفرة:' : 'Current Quantity:'}</span>
                                                                <span className="text-2xl font-black text-slate-900">
                                                                    {Number(item.current_quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isAr ? 'لتر' : 'L'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {isAr ? 'آخر تحديث:' : 'Last Updated:'} {new Date(item.last_updated).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <Database className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500">{isAr ? 'لا توجد بيانات مخزون' : 'No inventory data found'}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
