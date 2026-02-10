import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const Header = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link to="/" className="font-display text-xl italic text-display hover:scale-105 transition-transform">
                    Second Brain
                </Link>
                <div className="flex items-center gap-3 sm:gap-6">
                    <Link to="/docs" className="hidden sm:block text-sm text-body hover:text-display transition-colors">
                        Docs
                    </Link>
                    <Link to="/query" className="hidden sm:block text-sm text-body hover:text-display transition-colors">
                        API
                    </Link>
                    <ModeToggle />
                    <Link to="/dashboard">
                        <MagneticButton
                            className="rounded-full px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg"
                            strength={0.3}
                        >
                            Open App <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </MagneticButton>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
