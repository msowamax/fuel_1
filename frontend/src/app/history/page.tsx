"use client";
import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { Search, Filter, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function HistoryPage() {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [tickets, setTickets] = useState([]);
    const [filters, setFilters] = useState({ ticketId: '', vehicleNumber: '', fuelType: '' });
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams(filters as any).toString();
            const response = await api.get(`/tickets?${q}`);
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const handleDelete = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await api.delete(`/tickets/${id}`);
            setTickets(tickets.filter((t: any) => t.id !== id));
        } catch (error) {
            alert('Failed to delete ticket');
        }
    };

    const isAr = language === 'ar';

    return (
        <ProtectedLayout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('ticket_history')}</h1>
                        <p className="text-slate-500">{t('manage_tickets')}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-slate-400`} />
                            <input className={`${isAr ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'} py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500 text-sm w-48`}
                                placeholder={t('search_placeholder')} value={filters.ticketId} onChange={e => setFilters({ ...filters, ticketId: e.target.value })} />
                        </div>
                        <div className="relative">
                            <Filter className={`absolute ${isAr ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-slate-400`} />
                            <select className={`${isAr ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white`}
                                value={filters.fuelType} onChange={e => setFilters({ ...filters, fuelType: e.target.value })}>
                                <option value="">{t('all_fuel')}</option>
                                <option value="Petrol">{t('petrol')}</option>
                                <option value="Diesel">{t('diesel')}</option>
                            </select>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isAr ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${isAr ? 'text-right' : 'text-left'}`}>{t('ticket_id')}</th>
                                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${isAr ? 'text-right' : 'text-left'}`}>{t('fuel_prices')}</th>
                                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${isAr ? 'text-right' : 'text-left'}`}>{t('total_price')}</th>
                                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${isAr ? 'text-right' : 'text-left'}`}>{t('date')}</th>
                                    <th className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase ${isAr ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tickets.map((ticket: any) => (
                                    <tr key={ticket.ticketId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">{ticket.ticketId}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{t(ticket.fuelType.toLowerCase())}</div>
                                            <div className="text-[10px] text-slate-400">{isAr ? 'SDG' : '$'}{ticket.pricePerGallon?.toLocaleString()} / Gal</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-blue-700">{isAr ? 'SDG' : '$'}{ticket.totalPrice?.toLocaleString()}</div>
                                            <div className="text-[10px] text-slate-400">{ticket.quantity} Gal</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(ticket.createdAt).toLocaleDateString(language)}</td>
                                        <td className={`px-6 py-4 ${isAr ? 'text-left' : 'text-right'}`}>
                                            <div className={`flex ${isAr ? 'justify-start' : 'justify-end'} gap-2`}>
                                                <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white border border-transparent hover:border-blue-100"><Edit className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(ticket.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white border border-transparent hover:border-red-100"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {tickets.length === 0 && !loading && (
                        <div className="p-12 text-center text-slate-400">{t('no_tickets_found')}</div>
                    )}
                    {loading && (
                        <div className="p-12 text-center text-slate-400">{t('loading_tickets')}</div>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
