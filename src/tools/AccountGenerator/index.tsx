import { useState, useEffect } from "react";
import { Tv, Play, Copy, Check, RotateCcw, ShieldCheck, Plus, Gamepad2, Music, Clapperboard, Monitor, ArrowLeft } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedAccount {
    email: string;
    password: string;
    full: string;
}

const SERVICES = [
    { id: "minecraft", name: "Minecraft", icon: Gamepad2, desc: "You can generate premium Minecraft accounts." },
    { id: "netflix", name: "Netflix", icon: Tv, desc: "Netflix, the ultimate streaming service for movie and TV lovers!" },
    { id: "spotify", name: "Spotify", icon: Music, desc: "Stream millions of songs and podcasts with Premium Spotify accounts." },
    { id: "hbomax", name: "HBO Max", icon: Tv, desc: "Access premium content from HBO, Warner Bros, and more." },
    { id: "disney", name: "Disney+", icon: Tv, desc: "Disney, Pixar, Marvel, Star Wars, and Nat Geo in one place." },
    { id: "crunchyroll", name: "Crunchyroll", icon: Clapperboard, desc: "Watch anime an hour after it is broadcast in Japan, ad-free." },
    { id: "xbox", name: "Xbox Game Pass", icon: Gamepad2, desc: "Access hundreds of Xbox games with a Game Pass account." },
    { id: "xboxultimate", name: "Xbox Ultimate", icon: Gamepad2, desc: "Get Xbox Game Pass Ultimate accounts including Xbox Live Gold." },
    { id: "roblox", name: "Roblox", icon: Gamepad2, desc: "Get Roblox accounts and start exploring right away." },
    { id: "steam", name: "Steam", icon: Monitor, desc: "Access a wide variety of PC games on Steam." },
];

export default function AccountGenerator() {
    const [view, setView] = useState<"LIST" | "RESULT" | "RESTOCK">("LIST");
    const [selectedService, setSelectedService] = useState("");
    const [account, setAccount] = useState<GeneratedAccount | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Stocks
    const [stocks, setStocks] = useState<Record<string, number>>({});

    // Admin Restock
    const [restockData, setRestockData] = useState("");
    const [restockService, setRestockService] = useState(SERVICES[0].id);

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    const fetchStocks = async () => {
        const newStocks: Record<string, number> = {};
        for (const s of SERVICES) {
            try {
                const res = await fetch(`${API_URL}/api/generator/${s.id}/stock`);
                const data = await res.json();
                newStocks[s.id] = data.success ? data.count : 0;
            } catch {
                newStocks[s.id] = 0;
            }
        }
        setStocks(newStocks);
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const handleGenerate = async (serviceId: string) => {
        if (stocks[serviceId] === 0) {
            toast({ title: "Out of Stock", description: "Please check back later.", variant: "destructive" });
            return;
        }

        setSelectedService(serviceId);
        setLoading(true);
        try {
            const token = localStorage.getItem('minex-token') || '';
            const res = await fetch(`${API_URL}/api/generator/${serviceId}/generate`, {
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
                fetchStocks();
                setView("RESULT");
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
                if (data.error === 'Out of stock') fetchStocks();
            }
        } catch {
            toast({ title: "Error", description: "Connection failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleRestock = async () => {
        if (!restockData.trim()) return;
        try {
            const token = localStorage.getItem('minex-token') || '';
            const res = await fetch(`${API_URL}/api/generator/${restockService}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accounts: restockData })
            });
            const data = await res.json();

            if (data.success) {
                toast({ title: "Restock Successful", description: `Added ${data.added} accounts.` });
                setRestockData("");
                fetchStocks();
                setView("LIST");
            } else {
                toast({ title: "Restock Failed", description: data.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to restock", variant: "destructive" });
        }
    };

    const copyAccount = () => {
        if (account) {
            navigator.clipboard.writeText(account.full);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({ title: "Copied!", description: "Details copied to clipboard" });
        }
    };

    // Custom Styles matching source
    const styles = {
        bg: "bg-[#0B0B0F]",
        cardBg: "bg-[#141418]",
        cardBorder: "border border-white/10",
        purpleText: "text-[#C084FC]",
        purpleBtn: "bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all duration-300 transform hover:scale-105",
        textSecondary: "text-[#b3b3b3]",
    };

    if (view === "RESULT" && account) {
        // Match show.html UI
        return (
            <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${styles.bg}`}>
                <div className={`${styles.cardBg} ${styles.cardBorder} p-10 rounded-xl text-center w-[420px] shadow-2xl`}>
                    <h1 className={`${styles.purpleText} text-2xl font-bold mb-6`}>Your Generated Account</h1>

                    <div className="bg-[#1C1C20] p-4 rounded-lg text-white mb-6 border border-white/10 break-all shadow-inner font-mono">
                        {account.full}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button onClick={copyAccount} className={`${styles.purpleBtn} w-full text-white font-bold py-6`}>
                            {copied ? "✅ Copied!" : "📋 Copy"}
                        </Button>
                        <Button
                            onClick={() => setView("LIST")}
                            variant="ghost"
                            className="bg-transparent border border-white/10 text-white hover:bg-white/5 hover:text-[#8B5CF6] w-full py-6"
                        >
                            ⬅ Back to Generator
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "RESTOCK") {
        return (
            <ToolPageLayout title="Admin Restock" description="Add accounts to database" icon={ShieldCheck}>
                <div className={`max-w-2xl mx-auto ${styles.cardBg} ${styles.cardBorder} p-8 rounded-xl`}>
                    <div className="space-y-4">
                        <select
                            className="w-full bg-[#1C1C20] border-white/10 rounded p-2 text-white"
                            value={restockService}
                            onChange={(e) => setRestockService(e.target.value)}
                        >
                            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <Textarea
                            placeholder="email:password&#10;user:pass"
                            value={restockData}
                            onChange={(e) => setRestockData(e.target.value)}
                            className="font-mono text-xs bg-[#1C1C20] border-white/10 min-h-[200px]"
                        />
                        <div className="flex gap-4">
                            <Button onClick={handleRestock} className={`${styles.purpleBtn} flex-1`}>Add Accounts</Button>
                            <Button onClick={() => setView("LIST")} variant="outline" className="flex-1 bg-transparent text-white border-white/10">Cancel</Button>
                        </div>
                    </div>
                </div>
            </ToolPageLayout>
        )
    }

    // Match index.html UI
    return (
        <div className={`min-h-screen ${styles.bg} p-8 font-sans`}>
            {/* Header / Hero */}
            <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-transparent p-12 rounded-2xl mb-12 text-center border border-white/5">
                <h1 className={`${styles.purpleText} text-5xl font-bold mb-4`}>Mine Alts</h1>
                <p className={`${styles.textSecondary} text-lg max-w-2xl mx-auto mb-8`}>
                    Generate premium Minecraft, Netflix, Crunchyroll, Spotify, DisneyPlus, HBO MAX, Roblox, and Xbox accounts at no cost.
                </p>

                <div className="flex justify-center gap-4">
                    <Button onClick={() => { }} className={`${styles.purpleBtn} text-white px-8`}>Get Started</Button>
                    <Button
                        onClick={() => setView("RESTOCK")}
                        variant="outline"
                        className="bg-transparent border border-white/20 text-white hover:text-[#8B5CF6] hover:border-[#8B5CF6] px-8"
                    >
                        Restock (Admin)
                    </Button>
                </div>
            </div>

            {/* Services Grid */}
            <h2 className="text-3xl font-bold text-center text-white mb-2">Available Services</h2>
            <p className="text-center text-[#b3b3b3] mb-12">Choose a generator below via our premium system.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                {SERVICES.map((s) => (
                    <div key={s.id} className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(139,92,246,0.3)] transition-all duration-300 group text-center`}>
                        <div className="bg-[#1F1F23] rounded-xl w-[140px] h-[140px] mx-auto mb-6 flex items-center justify-center p-4">
                            <s.icon className="w-16 h-16 text-[#8B5CF6] group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{s.name}</h3>
                            <p className={`${styles.textSecondary} text-sm mb-6 min-h-[40px]`}>{s.desc}</p>

                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => handleGenerate(s.id)}
                                    disabled={loading || stocks[s.id] === 0}
                                    className={`${styles.purpleBtn} w-full text-white font-semibold py-6`}
                                >
                                    {loading && selectedService === s.id ? "Generating..." : "Generate"}
                                </Button>
                                <span className={`text-xs ${stocks[s.id] > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {stocks[s.id] !== undefined ? `${stocks[s.id]} Stock` : 'Checking...'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-10 border-t border-white/5 text-center text-[#A3A3A3]">
                <h3 className={`${styles.purpleText} font-bold text-lg mb-2`}>Mine Alts</h3>
                <p className="text-sm">Generate premium accounts at no cost, a very nice interface.</p>
                <p className="text-xs mt-4">For educational purposes only.</p>
            </footer>
        </div>
    );
}

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
