import { useState, useEffect } from "react";
import { Tv, Play, Copy, Check, RotateCcw, ShieldCheck, Plus, Gamepad2, Music, Clapperboard, Monitor } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneratedAccount {
    email: string;
    password: string;
    full: string;
}

const SERVICES = [
    { id: "minecraft", name: "Minecraft", icon: Gamepad2 },
    { id: "netflix", name: "Netflix", icon: Tv },
    { id: "spotify", name: "Spotify", icon: Music },
    { id: "hbomax", name: "HBO Max", icon: Tv },
    { id: "disney", name: "Disney+", icon: Tv },
    { id: "crunchyroll", name: "Crunchyroll", icon: Clapperboard },
    { id: "xbox", name: "Xbox Game Pass", icon: Gamepad2 },
    { id: "xboxultimate", name: "Xbox Ultimate", icon: Gamepad2 },
    { id: "roblox", name: "Roblox", icon: Gamepad2 },
    { id: "steam", name: "Steam", icon: Monitor },
];

export default function AccountGenerator() {
    const [service, setService] = useState("disney");
    const [stock, setStock] = useState<number | null>(null);
    const [account, setAccount] = useState<GeneratedAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Admin/Restock State
    const [showRestock, setShowRestock] = useState(false);
    const [restockData, setRestockData] = useState("");

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    const fetchStock = async () => {
        try {
            const res = await fetch(`${API_URL}/api/generator/${service}/stock`);
            const data = await res.json();
            if (data.success) {
                setStock(data.count);
            }
        } catch {
            setStock(0);
        }
    };

    useEffect(() => {
        fetchStock();
        setAccount(null); // Reset generated account on service switch
    }, [service]);

    const handleGenerate = async () => {
        if (stock === 0) {
            toast({ title: "Out of Stock", description: "Please wait for a restock.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('minex-token') || '';
            const res = await fetch(`${API_URL}/api/generator/${service}/generate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                const parts = data.data.split(':');
                setAccount({
                    full: data.data,
                    email: parts[0] || 'Unknown',
                    password: parts[1] || 'Unknown'
                });
                fetchStock(); // Update stock
                toast({ title: "Account Generated!", description: `Enjoy your ${service} account.` });
            } else {
                toast({ title: "Error", description: data.error || "Failed to generate", variant: "destructive" });
                if (data.error === 'Out of stock') fetchStock();
            }
        } catch {
            toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRestock = async () => {
        if (!restockData.trim()) return;

        try {
            const token = localStorage.getItem('minex-token') || '';
            const res = await fetch(`${API_URL}/api/generator/${service}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accounts: restockData })
            });
            const data = await res.json();

            if (data.success) {
                toast({ title: "Restock Successful", description: `Added ${data.added} accounts to ${service}.` });
                setRestockData("");
                setShowRestock(false);
                fetchStock();
            } else {
                toast({ title: "Restock Failed", description: data.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to restock", variant: "destructive" });
        }
    };

    const copyToClipboard = () => {
        if (account) {
            navigator.clipboard.writeText(account.full);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({ title: "Copied!", description: "Account copied to clipboard" });
        }
    };

    const CurrentIcon = SERVICES.find(s => s.id === service)?.icon || Tv;

    return (
        <ToolPageLayout
            title="Account Generator"
            description="Generate premium accounts for various services"
            icon={CurrentIcon}
            category="Generator"
        >
            <div className="grid md:grid-cols-2 gap-8">
                {/* Generator Section */}
                <div className="space-y-6">
                    <div className="bg-muted/30 border rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">

                        {/* Service Selector */}
                        <div className="w-full max-w-[250px]">
                            <Select value={service} onValueChange={setService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SERVICES.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            <div className="flex items-center gap-2">
                                                <s.icon className="w-4 h-4" />
                                                {s.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Stock Counter */}
                        <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">
                                {SERVICES.find(s => s.id === service)?.name} Stock: {stock !== null ? stock : '...'}
                            </span>
                        </div>

                        {!account ? (
                            <div className="space-y-4 w-full flex flex-col items-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                    <CurrentIcon className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">Generate Account</h2>
                                <p className="text-muted-foreground w-full max-w-[300px]">
                                    Click below to generate a fresh premium account for {SERVICES.find(s => s.id === service)?.name}
                                </p>
                                <Button
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={loading || stock === 0}
                                    className="w-full max-w-[200px]"
                                >
                                    {loading ? "Generating..." : "Generate Now"}
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Email / Username</h3>
                                    <div className="p-3 bg-background rounded-lg border font-mono text-sm break-all select-all">
                                        {account.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Password</h3>
                                    <div className="p-3 bg-background rounded-lg border font-mono text-sm break-all select-all">
                                        {account.password}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={copyToClipboard} className="flex-1 gap-2">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        Copy Details
                                    </Button>
                                    <Button onClick={() => setAccount(null)} variant="outline">
                                        Generate Another
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info / Restock Section */}
                <div className="space-y-6">
                    <div className="p-6 border rounded-xl bg-card">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <CurrentIcon className="w-4 h-4" /> Service Info
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                Premium Subscription Guaranteed
                            </li>
                            <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                High Quality Accounts
                            </li>
                            <li className="flex gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                Instant Delivery
                            </li>
                        </ul>
                    </div>

                    {/* Admin Restock Area */}
                    <div className="p-6 border rounded-xl bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Restock {SERVICES.find(s => s.id === service)?.name}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowRestock(!showRestock)}>
                                {showRestock ? "Hide" : <Plus className="w-4 h-4" />}
                            </Button>
                        </div>

                        {showRestock && (
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="email:password&#10;user:pass"
                                    value={restockData}
                                    onChange={(e) => setRestockData(e.target.value)}
                                    className="font-mono text-xs"
                                    rows={5}
                                />
                                <Button onClick={handleRestock} className="w-full">
                                    Add Accounts
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Format: email:password (one per line)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
