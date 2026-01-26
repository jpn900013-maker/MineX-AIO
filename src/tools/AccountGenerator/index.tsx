import { useState, useEffect } from "react";
import { Tv, Play, Copy, Check, RotateCcw, ShieldCheck, Plus, Gamepad2, Music, Clapperboard, Monitor, ArrowLeft, LayoutDashboard, Database, Users as UsersIcon, LogOut } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedAccount {
    email: string;
    password: string;
    full: string;
}

interface StockAccount {
    data: string;
    addedAt: number;
}

const SERVICES = [
    { id: "minecraft", name: "Minecraft", icon: Gamepad2, desc: "You can generate premium Minecraft accounts.", url: "https://linkpays.in/mc" },
    { id: "netflix", name: "Netflix", icon: Tv, desc: "Netflix, the ultimate streaming service for movie and TV lovers!", url: "https://linkpays.in/netfliz" },
    { id: "spotify", name: "Spotify", icon: Music, desc: "Stream millions of songs and podcasts with Premium Spotify accounts.", url: "https://linkpays.in/spoti" },
    { id: "hbomax", name: "HBO Max", icon: Tv, desc: "Access premium content from HBO, Warner Bros, and more.", url: "https://linkpays.in/hbo" },
    { id: "disney", name: "Disney+", icon: Tv, desc: "Disney, Pixar, Marvel, Star Wars, and Nat Geo in one place.", url: "https://linkpays.in/dis" },
    { id: "crunchyroll", name: "Crunchyroll", icon: Clapperboard, desc: "Watch anime an hour after it is broadcast in Japan, ad-free.", url: "https://linkpays.in/crunch" },
    { id: "xbox", name: "Xbox Game Pass", icon: Gamepad2, desc: "Access hundreds of Xbox games with a Game Pass account.", url: "https://linkpays.in/xboz" },
    { id: "xboxultimate", name: "Xbox Ultimate", icon: Gamepad2, desc: "Get Xbox Game Pass Ultimate accounts including Xbox Live Gold.", url: "https://linkpays.in/xbozultimatez" },
    { id: "roblox", name: "Roblox", icon: Gamepad2, desc: "Get Roblox accounts and start exploring right away.", url: "https://linkpays.in/robox" },
    { id: "steam", name: "Steam", icon: Monitor, desc: "Access a wide variety of PC games on Steam.", url: "https://linkpays.in/stem" },
];

export default function AccountGenerator() {
    // ... state ... (keep as is)

    // ... fetchStocks ... (keep as is)

    const handleGenerate = async (service: typeof SERVICES[0]) => {
        const token = localStorage.getItem('minex-token') || '';
        if (!token) {
            toast({ title: "Login Required", description: "You must be logged in to generate accounts.", variant: "destructive" });
            // Redirect to login logic here if needed
            window.location.href = "/login";
            return;
        }

        if (stocks[service.id] === 0) {
            toast({ title: "Out of Stock", description: "Please check back later.", variant: "destructive" });
            // Admin override?
            // return;
        }

        // Redirect to LinkPays
        window.open(service.url, '_blank');

        // Optional: Show "Did it work?" modal or simulate logic if specific requirement?
        // For now, simple redirect as requested.
    };

    // ... rest of component ...
    // Updated button in map:
    // onClick={() => handleGenerate(s)}


    export default function AccountGenerator() {
        const [view, setView] = useState<"LIST" | "RESULT" | "DASHBOARD" | "ADMIN" | "ADMIN_VIEW_STOCK">("LIST");
        const [selectedService, setSelectedService] = useState("");
        const [account, setAccount] = useState<GeneratedAccount | null>(null);
        const [loading, setLoading] = useState(false);
        const [copied, setCopied] = useState(false);

        // Stocks
        const [stocks, setStocks] = useState<Record<string, number>>({});

        // Admin
        const [restockData, setRestockData] = useState("");
        const [adminService, setAdminService] = useState(SERVICES[0].id);
        const [stockList, setStockList] = useState<StockAccount[]>([]);

        // Dashboard (History - mock for now or use local)
        const [history, setHistory] = useState<any[]>([]);

        const { toast } = useToast();
        const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
        const token = localStorage.getItem('minex-token') || '';

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

        const fetchStockList = async (serviceId: string) => {
            try {
                const res = await fetch(`${API_URL}/api/generator/${serviceId}/check`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStockList(data.accounts);
                }
            } catch {
                toast({ title: "Error", description: "Failed to fetch stock list", variant: "destructive" });
            }
        };

        useEffect(() => {
            fetchStocks();
            // Load history from local storage for demo
            const savedHistory = localStorage.getItem('minex-gen-history');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        }, []);

        const handleGenerate = async (serviceId: string) => {
            if (stocks[serviceId] === 0) {
                toast({ title: "Out of Stock", description: "Please check back later.", variant: "destructive" });
                return;
            }

            setSelectedService(serviceId);
            setLoading(true);
            try {
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

                    // Save to history
                    const newHistory = [{
                        service: serviceId,
                        data: data.data,
                        date: new Date().toISOString()
                    }, ...history].slice(0, 10);
                    setHistory(newHistory);
                    localStorage.setItem('minex-gen-history', JSON.stringify(newHistory));

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
                const res = await fetch(`${API_URL}/api/generator/${adminService}/add`, {
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
                } else {
                    toast({ title: "Restock Failed", description: data.error, variant: "destructive" });
                }
            } catch {
                toast({ title: "Error", description: "Failed to restock", variant: "destructive" });
            }
        };

        // UI Renderers
        const styles = {
            bg: "bg-[#0B0B0F]",
            cardBg: "bg-[#141418]",
            cardBorder: "border border-white/10",
            purpleText: "text-[#C084FC]",
            purpleBtn: "bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all duration-300 transform hover:scale-105",
            textSecondary: "text-[#b3b3b3]",
        };

        if (view === "RESULT" && account) {
            return (
                <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${styles.bg}`}>
                    <div className={`${styles.cardBg} ${styles.cardBorder} p-10 rounded-xl text-center w-[420px] shadow-2xl`}>
                        <h1 className={`${styles.purpleText} text-2xl font-bold mb-6`}>Your Generated Account</h1>
                        <div className="bg-[#1C1C20] p-4 rounded-lg text-white mb-6 border border-white/10 break-all shadow-inner font-mono">
                            {account.full}
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => { navigator.clipboard.writeText(account.full); toast({ title: "Copied" }); }} className={`${styles.purpleBtn} w-full text-white font-bold py-6`}>
                                📋 Copy
                            </Button>
                            <Button onClick={() => setView("LIST")} variant="ghost" className="bg-transparent border border-white/10 text-white hover:bg-white/5 hover:text-[#8B5CF6] w-full py-6">
                                ⬅ Back to Generator
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (view === "DASHBOARD") {
            return (
                <div className={`min-h-screen ${styles.bg} p-8 text-white font-sans max-w-5xl mx-auto`}>
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <h1 className={`${styles.purpleText} text-2xl font-bold`}>Dashboard</h1>
                        <Button onClick={() => setView("LIST")} variant="outline" className="border-white/20 text-white hover:text-[#8B5CF6]">Back to Home</Button>
                    </div>

                    <div className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-6 mb-8`}>
                        <h2 className={`${styles.purpleText} text-xl font-bold mb-4`}>Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div onClick={() => setView("LIST")} className="bg-[#1C1C20] p-4 rounded-lg border border-white/5 hover:-translate-y-1 transition-transform cursor-pointer">
                                <h3 className="text-[#8B5CF6] font-bold mb-1">Generate Accounts</h3>
                                <p className="text-gray-400 text-sm">Browse available services</p>
                            </div>
                            <div className="bg-[#1C1C20] p-4 rounded-lg border border-white/5 hover:-translate-y-1 transition-transform cursor-pointer">
                                <h3 className="text-[#8B5CF6] font-bold mb-1">Tutorial</h3>
                                <p className="text-gray-400 text-sm">Learn how to use</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-6`}>
                        <h2 className={`${styles.purpleText} text-xl font-bold mb-4`}>Recent History</h2>
                        {history.length > 0 ? (
                            <div className="space-y-3">
                                {history.map((item, i) => (
                                    <div key={i} className="bg-[#1C1C20] p-4 rounded-lg flex justify-between items-center border border-white/5 hover:bg-[#23232b]">
                                        <div>
                                            <div className="text-[#8B5CF6] font-bold">{SERVICES.find(s => s.id === item.service)?.name || item.service}</div>
                                            <div className="font-mono text-sm text-gray-300">{item.data}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No history yet.</div>
                        )}
                    </div>
                </div>
            )
        }

        if (view === "ADMIN") {
            return (
                <div className={`min-h-screen ${styles.bg} p-8 text-white max-w-4xl mx-auto`}>
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <h1 className={`${styles.purpleText} text-2xl font-bold`}>Admin Panel</h1>
                        <Button onClick={() => setView("LIST")} variant="outline">Back to Home</Button>
                    </div>

                    <div className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-6 mb-8`}>
                        <h2 className="text-xl font-bold mb-4">Stock Management</h2>
                        <div className="flex gap-4 mb-4">
                            <select
                                className="bg-[#1C1C20] border border-white/10 rounded p-2 text-white flex-1"
                                value={adminService}
                                onChange={(e) => setAdminService(e.target.value)}
                            >
                                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name} ({stocks[s.id] || 0})</option>)}
                            </select>
                            <Button
                                onClick={() => { fetchStockList(adminService); setView("ADMIN_VIEW_STOCK"); }}
                                className={`${styles.purpleBtn} text-white`}
                            >
                                View All Accounts
                            </Button>
                        </div>

                        <Textarea
                            placeholder="email:password&#10;user:pass"
                            value={restockData}
                            onChange={(e) => setRestockData(e.target.value)}
                            className="font-mono text-xs bg-[#1C1C20] border-white/10 min-h-[150px] mb-4"
                        />
                        <Button onClick={handleRestock} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Add Accounts
                        </Button>
                    </div>
                </div>
            )
        }

        if (view === "ADMIN_VIEW_STOCK") {
            return (
                <div className={`min-h-screen ${styles.bg} p-8 text-white max-w-4xl mx-auto`}>
                    <div className="flex justify-between items-center mb-8">
                        <Button onClick={() => setView("ADMIN")} variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] bg-transparent hover:bg-[#8B5CF6]/10">← Back</Button>
                        <h1 className={`${styles.purpleText} text-2xl font-bold`}>View Accounts - {SERVICES.find(s => s.id === adminService)?.name}</h1>
                    </div>

                    <div className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-6`}>
                        <div className="flex justify-between items-center bg-[#1C1C20] p-4 rounded-lg mb-4">
                            <span className="text-gray-400">Total: <span className="text-[#8B5CF6] font-bold">{stockList.length}</span></span>
                            <Button
                                onClick={() => {
                                    const text = stockList.map(a => a.data).join('\n');
                                    navigator.clipboard.writeText(text);
                                    toast({ title: "Copied all accounts!" });
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                            >
                                📋 Copy All
                            </Button>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                            {stockList.map((acc, i) => (
                                <div key={i} className="bg-[#23232b] p-3 rounded flex justify-between items-center hover:bg-[#2a2a32] group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-gray-500 text-xs w-8">#{i + 1}</span>
                                        <span className="font-mono text-sm break-all">{acc.data}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => { navigator.clipboard.writeText(acc.data); toast({ title: "Copied" }); }}
                                        className="bg-[#8B5CF6] hover:bg-[#7C3AED] h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Copy
                                    </Button>
                                </div>
                            ))}
                            {stockList.length === 0 && <div className="text-center py-10 text-gray-500">No accounts found.</div>}
                        </div>
                    </div>
                </div>
            )
        }

        // LIST VIEW (Main)
        return (
            <div className={`min-h-screen ${styles.bg} p-8 font-sans`}>
                {/* Header / Hero */}
                <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-transparent p-12 rounded-2xl mb-12 text-center border border-white/5">
                    <h1 className={`${styles.purpleText} text-5xl font-bold mb-4`}>Mine Alts</h1>
                    <p className={`${styles.textSecondary} text-lg max-w-2xl mx-auto mb-8`}>
                        Generate premium Minecraft, Netflix, Crunchyroll, Spotify, DisneyPlus, HBO MAX, Roblox, and Xbox accounts at no cost.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button className={`${styles.purpleBtn} text-white px-8`}>Get Started</Button>
                        <Button onClick={() => setView("DASHBOARD")} variant="outline" className="bg-transparent border border-white/20 text-white hover:text-[#8B5CF6] hover:border-[#8B5CF6] px-8">Dashboard</Button>
                        <Button onClick={() => setView("ADMIN")} variant="ghost" className="text-white/20 hover:text-white">Admin</Button>
                    </div>
                </div>

                {/* Services Grid */}
                <h2 className="text-3xl font-bold text-center text-white mb-2">Available Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto mt-10">
                    {SERVICES.map((s) => (
                        <div key={s.id} className={`${styles.cardBg} ${styles.cardBorder} rounded-xl p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(139,92,246,0.3)] transition-all duration-300 group text-center`}>
                            <div className="bg-[#1F1F23] rounded-xl w-[140px] h-[140px] mx-auto mb-6 flex items-center justify-center p-4">
                                <s.icon className="w-16 h-16 text-[#8B5CF6] group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{s.name}</h3>
                                <p className={`${styles.textSecondary} text-sm mb-6 min-h-[40px]`}>{s.desc}</p>
                                <Button
                                    onClick={() => handleGenerate(s.id)}
                                    disabled={loading || stocks[s.id] === 0}
                                    className={`${styles.purpleBtn} w-full text-white font-semibold py-6`}
                                >
                                    {loading && selectedService === s.id ? "Generating..." : "Generate"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
