import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
    children: ReactNode;
    className?: string;
    showFooter?: boolean;
}

export const Layout = ({ children, className = "", showFooter = true }: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
            <Header />
            <main className={`flex-1 pt-14 ${className}`}>
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};
