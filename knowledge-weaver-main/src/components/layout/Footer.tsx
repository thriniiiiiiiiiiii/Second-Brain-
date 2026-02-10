import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 py-8 px-4 sm:px-6 relative z-10 glass mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-display italic text-sm text-muted-foreground">
                    Second Brain — Your mind, extended.
                </span>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link to="/dashboard" className="hover:text-display transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/patterns" className="hover:text-display transition-colors">
                        Patterns
                    </Link>
                    <Link to="/docs" className="hover:text-display transition-colors">
                        Docs
                    </Link>
                    <Link to="/query" className="hover:text-display transition-colors">
                        API
                    </Link>
                </div>
            </div>
        </footer>
    );
};
