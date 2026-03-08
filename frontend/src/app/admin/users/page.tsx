"use client";
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import { UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function UserApprovalsPage() {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: string, isApproved: boolean) => {
        try {
            await api.patch(`/users/${id}/approve`, { isApproved });
            fetchUsers();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleUpdateRole = async (id: string, role: string) => {
        try {
            await api.patch(`/users/${id}/role`, { role });
            fetchUsers();
        } catch (err) {
            alert("Failed to update role");
        }
    };

    const isAr = language === 'ar';

    return (
        <ProtectedLayout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">{t('user_approvals')}</h1>
                    <p className="text-slate-500">{t('manage_tickets', 'Authorize station workers and managers.')}</p>
                </header>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className={`w-full ${isAr ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('full_name')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('role')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u: any) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {t(u.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.isApproved ? (
                                            <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                                                <ShieldCheck className="h-4 w-4" />
                                                {t('approved', 'Approved')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                                                <Clock className="h-4 w-4" />
                                                {t('pending_approval')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {!u.isApproved ? (
                                                <button
                                                    onClick={() => handleApprove(u.id, true)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                                                >
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    {t('approve')}
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleUpdateRole(u.id, 'admin')}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                                                        >
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                            {t('promote_to_admin')}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleApprove(u.id, false)}
                                                        className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                                    >
                                                        <UserX className="h-3.5 w-3.5" />
                                                        {t('suspend', 'Suspend')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <div className="p-12 text-center text-slate-400 italic">No users found.</div>
                    )}
                </div>
            </div>
        </ProtectedLayout>
    );
}
