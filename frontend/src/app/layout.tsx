import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ClientRoot from "./ClientRoot";

export const metadata: Metadata = {
    title: "Fuel Station Management",
    description: "Modern fuel ticket and inventory management system",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LanguageProvider>
            <ClientRoot>{children}</ClientRoot>
        </LanguageProvider>
    );
}
