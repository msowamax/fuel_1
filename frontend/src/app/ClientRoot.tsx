"use client";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    const isRtl = language === 'ar';

    return (
        <html lang={language} dir={isRtl ? 'rtl' : 'ltr'} className="h-full">
            <body className="h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
