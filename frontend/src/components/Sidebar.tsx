import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, History, FilePieChart, LogOut, Fuel, Languages, Droplets, ShieldCheck, ClipboardList, LayoutDashboard, ChevronDown, ChevronUp, Lock, X, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/services/api';

const Sidebar = () => {
    const pathname = usePathname();
    const { logout, user, isAdminUnlocked, setIsAdminUnlocked } = useAuth();
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    // Sidebar Expansion State
    const [isManagerOpen, setIsManagerOpen] = useState(false);



    // Password Prompt State
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const isAr = language === 'ar';

    const mainMenuItems = [
        { name: t('dashboard'), href: '/dashboard', icon: Home },
        { name: t('new_ticket'), href: '/tickets/create', icon: PlusCircle },
    ];

    const managerMenuItems = [
        { name: t('history'), href: '/history', icon: History },
        { name: t('reports'), href: '/reports', icon: FilePieChart },
        { name: isAr ? 'إجراءات المدير' : 'Manager Settings', href: '/admin/settings', icon: ShieldCheck },
        { name: isAr ? 'لوحة التحكم للمدير' : 'Admin Panel', href: '/admin', icon: LayoutDashboard },
        { name: t('inventory'), href: '/admin/inventory', icon: Droplets }
    ];

    const handleManagerMenuToggle = () => {
        if (isAdminUnlocked) {
            // Keep it simple: toggle open/close if already unlocked
            setIsManagerOpen(!isManagerOpen);
        } else {
            // If locked, prompt for password
            setShowPasswordPrompt(true);
            setPassword('');
            setPasswordError('');
        }
    };

    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setIsVerifying(true);

        try {
            await api.post('/auth/verify-password', { password });
            setShowPasswordPrompt(false);
            setIsAdminUnlocked(true);
            setIsManagerOpen(true);
        } catch (error: any) {
            console.error('Password verification failed:', error);
            if (error.response?.status === 401) {
                setPasswordError(isAr ? 'كلمة السر غير صحيحة' : 'Incorrect password');
            } else {
                setPasswordError(isAr ? 'حدث خطأ أثناء التحقق' : 'Verification failed');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex relative h-full w-64 flex-col bg-slate-900 dark:bg-slate-950 text-white transition-colors">
            {/* Password Verification Modal Overlay */}
            {showPasswordPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                                <Lock className="h-4 w-4 text-blue-600" />
                                <h3>{isAr ? 'التحقق من الهوية' : 'Verify Identity'}</h3>
                            </div>
                            <button
                                onClick={() => setShowPasswordPrompt(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleVerifyPassword} className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {isAr ? 'يرجى إدخال كلمة السر لمرة واحدة لفتح قائمة المدير.' : 'Please enter your password to unlock the manager menu.'}
                            </p>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                                    {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full p-3 bg-slate-50 dark:bg-slate-700 border ${passwordError ? 'border-red-300 dark:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500'} rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                                    placeholder="••••••••"
                                    autoFocus
                                    required
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-xs font-bold mt-2">{passwordError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isVerifying || !password}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : (isAr ? 'تحقق و الدخول' : 'Verify & Unlock')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-6 py-8">
                <div className="flex items-center gap-3">
                    <Fuel className="h-8 w-8 text-blue-400" />
                    <span className="text-xl font-bold">FuelTickets</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="rounded-full p-2 hover:bg-slate-800 transition-colors text-slate-400"
                        title={theme === 'dark' ? (isAr ? 'الوضع المضيء' : 'Light Mode') : (isAr ? 'الوضع الليلي' : 'Dark Mode')}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={toggleLanguage}
                        className="rounded-full p-2 hover:bg-slate-800 transition-colors text-slate-400"
                        title={language === 'ar' ? 'English' : 'العربية'}
                    >
                        <Languages className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-4 overflow-y-auto overflow-x-hidden">
                {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <div className="pt-2 mt-2">
                    <button
                        onClick={handleManagerMenuToggle}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="font-bold">{isAr ? 'المدير' : 'Manager'}</span>
                        </div>
                        {isManagerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${isManagerOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {managerMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-2.5 text-sm transition-colors ${isActive ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <div className="border-t border-slate-800 p-4">
                <div className="mb-4 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {user?.name} ({t(user?.role)}) - {user?.stationName}
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors hover:bg-red-600/10 hover:text-red-500"
                >
                    <LogOut className="h-5 w-5" />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
