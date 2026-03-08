"use client";
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { Users, Droplets, Banknote, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>({
        totalSales: 0,
        totalRevenue: 0,
        totalLiters: 0,
        byMethod: {},
        recentTickets: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/tickets/stats');
                // Use functional update to merge properties safely
                setStats((prev: any) => ({
                    ...prev,
                    ...response.data,
                    recentTickets: response.data.recentTickets || []
                }));
            } catch (error) {
                console.error("Dashboard Stats Fetch Error:", error);
                // Simple error state if needed, here just console logging
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const isAr = language === 'ar';

    const statCards = [
        {
            title: t('today_sales'),
            value: stats.totalSales,
            icon: Calendar,
            color: "bg-blue-500"
        },
        {
            title: t('today_liters'),
            value: `${stats.totalLiters.toFixed(2)} ${t('liters')}`,
            icon: Droplets,
            color: "bg-teal-500"
        },
        {
            title: t('today_revenue'),
            value: `${isAr ? 'SDG ' : '$'}${stats.totalRevenue.toLocaleString()}`,
            icon: Banknote,
            color: "bg-amber-500"
        },
    ];

    const getPaymentTitle = (method: string) => {
        switch (method) {
            case 'Cash': return t('cash');
            case 'Bank': return t('bank_khartoum');
            case 'Fawry': return t('bank_faisal');
            case 'Omdurman': return t('bank_omdurman');
            case 'Account': return t('account');
            default: return method;
        }
    };

    return (
        <ProtectedLayout>
            <div className="max-w-6xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard')}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{t('welcome_back')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${stat.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className={isAr ? 'mr-1' : ''}>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-blue-600" />
                            {isAr ? 'ملخص التعاملات' : 'Transaction Summary'}
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(stats.byMethod || {}).map(([method, amount]: [any, any]) => (
                                <div key={method} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">{getPaymentTitle(method)}</span>
                                    <span className="font-black text-slate-900 dark:text-white text-lg">
                                        {isAr ? 'SDG' : '$'}{amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            {isAr ? 'النشاط الأخير' : 'Recent Activity'}
                        </h2>
                        <div className="space-y-3">
                            {(stats.recentTickets && stats.recentTickets.length > 0) ? (
                                stats.recentTickets.map((ticket: any) => (
                                    <div key={ticket.ticket_id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-white text-sm">#{ticket.ticket_id}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-blue-600">{ticket.total_price.toLocaleString()} SDG</p>
                                            <p className={`text-[10px] font-black uppercase ${ticket.fuel_type?.toLowerCase() === 'petrol' ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                {t(ticket.fuel_type?.toLowerCase() || 'petrol')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-300">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">{isAr ? 'لا يوجد نشاط مسجل' : 'No recent activity'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
