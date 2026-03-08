"use client";
import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import api from '@/services/api';
import Link from 'next/link';
import {
    Users,
    Fuel,
    Droplets,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    AlertCircle,
    ClipboardList
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>({
        pendingUsers: 0,
        lowInventory: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Strict Admin Check
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchAdminStats = async () => {
            try {
                const [usersRes, inventoryRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/inventory')
                ]);

                const pending = usersRes.data.filter((u: any) => !u.isApproved).length;
                const low = inventoryRes.data.filter((i: any) => i.current_quantity < 500);

                setStats({
                    pendingUsers: pending,
                    lowInventory: low
                });
            } catch (err) {
                console.error("Failed to fetch admin stats");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, [user, router]);

    const isAr = language === 'ar';

    const menuItems = [
        {
            title: t('user_approvals'),
            desc: isAr ? 'إدارة الموظفين والترقيات' : 'Manage workers and promotions',
            icon: Users,
            href: '/admin/users',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            count: stats.pendingUsers > 0 ? stats.pendingUsers : null
        },
        {
            title: t('inventory'),
            desc: isAr ? 'مراقبة وتعبئة الوقود' : 'Monitor and refill fuel stock',
            icon: Droplets,
            href: '/admin/inventory',
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            count: stats.lowInventory.length > 0 ? stats.lowInventory.length : null
        },
        {
            title: t('price_settings'),
            desc: isAr ? 'تعديل أسعار الجالون' : 'Update fuel prices per gallon',
            icon: Fuel,
            href: '/admin/prices',
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    ];

    if (loading) return <div className="p-8 text-center font-Cairo font-bold text-slate-400">Loading Admin Panel...</div>;

    return (
        <ProtectedLayout>
            <div className="max-w-6xl mx-auto font-Cairo">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Security: Tier 1 Admin Access</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">
                        {isAr ? 'لوحة تحكم المدير' : 'Administrator Control Panel'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        {isAr ? 'إدارة المحطة، الأسعار، والموظفين' : 'Manage station operations, pricing, and personnel'}
                    </p>
                </header>

                {/* Critical Alerts Area */}
                {(stats.pendingUsers > 0 || stats.lowInventory.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {stats.pendingUsers > 0 && (
                            <Link href="/admin/users" className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 group transition-all hover:shadow-lg">
                                <AlertCircle className="h-6 w-6 text-amber-500" />
                                <div className="flex-1">
                                    <p className="font-black text-sm">{isAr ? 'موظفون بانتظار التفعيل' : 'Pending Approvals'}</p>
                                    <p className="text-xs font-bold opacity-70">{isAr ? `يوجد ${stats.pendingUsers} مستخدمين بانتظار موافقتك` : `You have ${stats.pendingUsers} users waiting for approval`}</p>
                                </div>
                                <ArrowRight className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-all ${isAr ? 'rotate-180' : ''}`} />
                            </Link>
                        )}
                        {stats.lowInventory.map((item: any) => (
                            <Link key={item.fuel_type} href="/admin/inventory" className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 border border-red-100 text-red-900 group transition-all hover:shadow-lg">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                                <div className="flex-1">
                                    <p className="font-black text-sm">{isAr ? `تنبيه: مخزون ال${t(item.fuel_type.toLowerCase())} منخفض` : `Warning: ${item.fuel_type} Stock Low`}</p>
                                    <p className="text-xs font-bold opacity-70">{item.current_quantity.toLocaleString()} Gal remaining</p>
                                </div>
                                <ArrowRight className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-all ${isAr ? 'rotate-180' : ''}`} />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Primary Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className="flex flex-col p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:scale-[1.02] transition-all group overflow-hidden relative">
                                <div className={`h-14 w-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                    <Icon className="h-7 w-7" />
                                </div>

                                {item.count && (
                                    <span className="absolute top-6 right-8 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {item.count}
                                    </span>
                                )}

                                <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed mb-6">{item.desc}</p>

                                <div className="mt-auto flex items-center gap-2 text-slate-900 font-bold text-xs group-hover:text-blue-600 transition-colors">
                                    <span>{isAr ? 'مشاهدة' : 'Manage'}</span>
                                    <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180' : ''}`} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </ProtectedLayout>
    );
}
