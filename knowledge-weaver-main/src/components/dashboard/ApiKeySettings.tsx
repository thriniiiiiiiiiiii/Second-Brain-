import { useState, useEffect } from "react";
import { Settings, Cpu, Cloud, Zap, Check, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import * as aiApi from "@/lib/aiApi";
import { toast } from "sonner";

const AISettings = () => {
    const [open, setOpen] = useState(false);
    const [provider, setProvider] = useState<string>("auto");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setProvider(localStorage.getItem("knowledge-weaver-ai-provider") || "auto");
        }
    }, [open]);

    const save = (val: string) => {
        setProvider(val);
        localStorage.setItem("knowledge-weaver-ai-provider", val);
        toast.success(`AI Provider set to ${val.charAt(0).toUpperCase() + val.slice(1)}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-9 h-9 p-0 text-muted-foreground hover:text-display"
                    title="AI Settings & Provider"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="glass border-black/10 dark:border-white/10 max-w-md backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl gradient-text flex items-center gap-2">
                        <Server className="w-5 h-5" /> AI Configuration
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-2">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Select AI Provider</label>
                        <div className="grid grid-cols-1 gap-3">
                            <div
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${provider === "auto"
                                    ? "bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/50"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                onClick={() => save("auto")}
                            >
                                <div className={`p-2 rounded-lg ${provider === "auto" ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-muted-foreground"}`}>
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">Auto (Recommended)</h4>
                                        {provider === "auto" && <Check className="w-4 h-4 text-purple-400" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">Tries Gemini first, falls back to Ollama</p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${provider === "gemini"
                                    ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                onClick={() => save("gemini")}
                            >
                                <div className={`p-2 rounded-lg ${provider === "gemini" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-muted-foreground"}`}>
                                    <Cloud className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">Google Gemini</h4>
                                        {provider === "gemini" && <Check className="w-4 h-4 text-blue-400" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">Fast, high quality (Cloud)</p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${provider === "ollama"
                                    ? "bg-orange-500/10 border-orange-500/50 ring-1 ring-orange-500/50"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                onClick={() => save("ollama")}
                            >
                                <div className={`p-2 rounded-lg ${provider === "ollama" ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-muted-foreground"}`}>
                                    <Cpu className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">Ollama (Local)</h4>
                                        {provider === "ollama" && <Check className="w-4 h-4 text-orange-400" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">Private, runs on your machine</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-xs leading-relaxed">
                        Ensure the backend server is running on port 3000. For Ollama, make sure the Ollama app is running locally.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AISettings;
