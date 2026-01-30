import { useState, useRef, useEffect } from "react";
import { Bot, Send, Play, Square, Settings, MessageSquare, Gamepad2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface ChatMessage {
    id: string;
    timestamp: Date;
    type: "chat" | "system" | "bot";
    username?: string;
    message: string;
}

interface BotConfig {
    serverAddress: string;
    port: number;
    username: string;
    version: string;
    autoReconnect: boolean;
    autoRespawn: boolean;
    autoChat: boolean;
    randomMovement: boolean;
}

export default function McBotSender() {
    const [config, setConfig] = useState<BotConfig>({
        serverAddress: "",
        port: 25565,
        username: "MineXBot",
        version: "1.20.4",
        autoReconnect: false,
        autoRespawn: true,
        autoChat: false,
        randomMovement: false,
    });

    // Persistent Bot State
    const [hasBot, setHasBot] = useState(false);
    const [myBot, setMyBot] = useState<any>(null);
    const [onlineBots, setOnlineBots] = useState(0);

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [botStatus, setBotStatus] = useState<string>("Idle");
    const [socketConnected, setSocketConnected] = useState(false);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const { toast } = useToast();
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Premium Modes State
    const [unlockedModes, setUnlockedModes] = useState<string[]>([]);
    const [activeModes, setActiveModes] = useState<Record<string, boolean>>({});

    const [targetPlayer, setTargetPlayer] = useState("");
    const [skinName, setSkinName] = useState("");

    // Subscription State
    const [isPremium, setIsPremium] = useState(false);
    const [premiumTier, setPremiumTier] = useState(0); // 0: Free, 1: Silver, 2: Gold
    const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);

    // Admin State
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminKey, setAdminKey] = useState("");
    const [adminTargetUser, setAdminTargetUser] = useState("");
    const [adminTier, setAdminTier] = useState("1");
    const [adminDays, setAdminDays] = useState("30");

    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    useEffect(() => {
        if (token) fetchUnlockedModes();
    }, [token]);

    const fetchUnlockedModes = async () => {
        try {
            const res = await fetch(`${API_URL}/api/bot/modes`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setUnlockedModes(data.unlockedModes);
                setIsPremium(data.isPremium || false);
                setPremiumTier(data.premiumTier || 0);
                setPremiumExpiry(data.premiumUntil || null);
            }
        } catch (e) { console.error(e); }
    };

    const unlockMode = async (mode: string) => {
        if (!isAuthenticated) return navigate("/login");
        if (isPremium) return; // Should be auto-unlocked

        let cost = 150; // Default for Attack, Mining, Butcher
        if (mode === 'follow') cost = 300;
        else if (mode === 'skin') cost = 100;
        else if (mode === 'drop_all') cost = 50;

        if (!confirm(`Unlock ${mode} mode for ${cost} credits?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/bot/modes/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ mode })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Mode Unlocked!", description: data.message });
                setUnlockedModes(data.unlockedModes);
            } else {
                toast({ title: "Unlock Failed", description: data.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const toggleMode = async (mode: string, enabled: boolean, options?: any) => {
        try {
            // Optimistic update
            setActiveModes(prev => ({ ...prev, [mode]: enabled }));

            const res = await fetch(`${API_URL}/api/bot/modes/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ mode, enabled, options })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: `Mode ${enabled ? 'Enabled' : 'Disabled'}`, description: `${mode} mode is now ${enabled ? 'active' : 'inactive'}` });
            } else {
                toast({ title: "Action Failed", description: data.error, variant: "destructive" });
                // Revert switch state on error
                setActiveModes(prev => ({ ...prev, [mode]: !enabled }));
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
            setActiveModes(prev => ({ ...prev, [mode]: !enabled }));
        }
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Initial Fetch: Status and Bot Data
    useEffect(() => {
        fetchStatus();
        fetchMyBot();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/stats`);
            const data = await res.json();
            if (data.success) {
                setOnlineBots(data.stats.onlineBots || 0);
                setIsBackendOnline(true);
            } else {
                setIsBackendOnline(false);
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
            setIsBackendOnline(false);
        }
    }


    const upgradeToPremium = (packageId: string) => {
        if (!isAuthenticated) return navigate("/login");
        setShowPaymentDialog(true);
    };

    const grantPremium = async () => {
        if (!adminKey || !adminTargetUser) return toast({ title: "Missing Info", description: "Username and Key required", variant: "destructive" });
        try {
            const res = await fetch(`${API_URL}/api/admin/grant-premium`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ targetUsername: adminTargetUser, tier: adminTier, durationDays: adminDays, adminKey })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Success", description: data.message });
                setAdminTargetUser("");
            } else {
                toast({ title: "Failed", description: data.error, variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const connectSocket = (sessionId: string) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.disconnect();
        }
        socketRef.current = io(API_URL);

        socketRef.current.on("connect", () => {
            setSocketConnected(true);
            socketRef.current?.emit("join:session", sessionId);
        });

        socketRef.current.on("disconnect", () => setSocketConnected(false));

        socketRef.current.on("bot:spawned", (data) => {
            setConnected(true);
            setConnecting(false);
            setBotStatus("In Game");
            addSystemMessage(`Bot spawned at ${Math.round(data.position.x)}, ${Math.round(data.position.y)}, ${Math.round(data.position.z)}`);
        });

        socketRef.current.on("bot:chat", (data) => addChatMessage(data.username, data.message));
        socketRef.current.on("bot:message", (data) => addSystemMessage(data.message));
        socketRef.current.on("bot:error", (data) => {
            addSystemMessage(`Error: ${data.error}`);
            toast({ title: "Bot Error", description: data.error, variant: "destructive" });
        });

        socketRef.current.on("bot:kicked", (data) => {
            setConnected(false);
            setBotStatus("Kicked");
            addSystemMessage(`Kicked: ${data.reason}`);
        });

        socketRef.current.on("bot:disconnected", () => {
            setConnected(false);
            setBotStatus("Disconnected");
            addSystemMessage("Bot connection terminated");
        });

    };

    const fetchMyBot = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/bot/my-bot`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                if (data.hasBot) {
                    setHasBot(true);
                    setMyBot(data.bot);
                    if (data.bot?.status === 'online') {
                        connectSocket(data.bot.sessionId);
                    }
                    // Sync config from server
                    if (data.bot.config) {
                        setConfig(prev => ({ ...prev, ...data.bot.config }));
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch my bot", e);
        }
    };

    const addSystemMessage = (message: string) => {
        setChatMessages((prev) => [...prev, {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: "system",
            message,
        }]);
    };

    const addChatMessage = (username: string, message: string) => {
        setChatMessages((prev) => [...prev, {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: "chat",
            username,
            message,
        }]);
    };

    const launchBot = async () => {
        if (!isAuthenticated) return navigate("/login");
        if (!config.serverAddress) return toast({ title: "Server Required", variant: "destructive" });
        setConnecting(true);
        try {
            const res = await fetch(`${API_URL}/api/bot/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    host: config.serverAddress,
                    port: config.port,
                    username: config.username,
                    version: config.version,
                    config: {
                        autoReconnect: config.autoReconnect,
                        autoRespawn: config.autoRespawn,
                        autoChat: config.autoChat,
                        randomMovement: config.randomMovement
                    }
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Launch Success" });
                // Connect socket immediately with the new session
                if (data.sessionId) {
                    connectSocket(data.sessionId);
                }
                fetchMyBot();
            } else {
                setConnecting(false);
                toast({ title: "Launch Failed", description: data.error, variant: "destructive" });
            }
        } catch (e) {
            setConnecting(false);
            toast({ title: "Network Error", variant: "destructive" });
        }
    };

    const toggleBot = async (action: 'start' | 'stop') => {
        if (!token || !myBot) return;
        setConnecting(true);
        try {
            const res = await fetch(`${API_URL}/api/bot/${action}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                toast({ title: `Bot ${action}ed` });
                if (action === 'start' && myBot.sessionId) {
                    connectSocket(myBot.sessionId);
                }
                fetchMyBot();
            }
            else toast({ title: "Action Failed", description: data.error, variant: "destructive" });
        } finally { setConnecting(false); }
    };

    const renewBot = async () => {
        if (!token || !myBot) return;
        if (!confirm("Renewing costs 30 credits for +7 days. Proceed?")) return;
        try {
            const res = await fetch(`${API_URL}/api/bot/renew`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Bot Renewed", description: `Expiry: ${new Date(data.expiresAt).toLocaleDateString()}` });
                fetchMyBot();
            } else toast({ title: "Renewal Failed", description: data.error, variant: "destructive" });
        } catch (e) { toast({ title: "Network Error", variant: "destructive" }); }
    };

    const sendChat = async () => {
        if (!chatInput.trim() || !connected || !myBot) return;
        try {
            await fetch(`${API_URL}/api/bot/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ sessionId: myBot.sessionId, message: chatInput }), });
            setChatMessages((prev) => [...prev, { id: Date.now().toString(), timestamp: new Date(), type: "bot", username: myBot.username, message: chatInput }]);
            setChatInput("");
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    const executeAction = async (action: string) => {
        if (!connected || !myBot) return;
        try {
            const response = await fetch(`${API_URL}/api/bot/action`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ sessionId: myBot.sessionId, action }), });
            const data = await response.json();
            if (data.success) { setBotStatus(action.charAt(0).toUpperCase() + action.slice(1)); addSystemMessage(`Command: ${action}`); }
        } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const updateBotConfig = async (newConfig: Partial<BotConfig>) => {
        // Optimistic update
        setConfig(prev => ({ ...prev, ...newConfig }));

        if (hasBot) {
            try {
                await fetch(`${API_URL}/api/bot/config/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ config: newConfig })
                });
            } catch (e) {
                console.error("Failed to update config", e);
                toast({ title: "Update Failed", variant: "destructive" });
            }
        }
    };

    return (
        <ToolPageLayout
            title="MC Bot Sender"
            description="Premium Minecraft bot management - persistent and stable"
            icon={Bot}
            category="Minecraft"
        >
            <div className="flex justify-between items-center mb-6 p-4 bg-muted/20 border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground">Global Online: <b>{onlineBots}</b> / 10</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    {!hasBot ? (
                        <div className="p-6 bg-muted/30 border border-purple-500/20 rounded-xl space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-purple-400"><Play className="w-4 h-4" /> Launch Bot</h3>
                            <div className="space-y-4">
                                <Input value={config.serverAddress} onChange={(e) => setConfig({ ...config, serverAddress: e.target.value })} placeholder="Server IP" className="bg-background/50" />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input type="number" value={config.port} onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 25565 })} className="bg-background/50" />
                                    <Input value={config.username} onChange={(e) => setConfig({ ...config, username: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-[11px] text-purple-200">🚀 20 Credits | 📅 7 Days</div>
                                <Button onClick={launchBot} className="w-full bg-purple-600" disabled={connecting}>{connecting ? "Deploying..." : "Launch"}</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-muted/30 border border-blue-500/20 rounded-xl space-y-4">
                            <h3 className="font-bold flex items-center gap-2 text-blue-400"><Settings className="w-4 h-4" /> Dashboard</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span>Status:</span><span className={connected ? "text-green-400" : "text-red-400"}>{botStatus}</span></div>
                                <div className="flex justify-between"><span>Server:</span><span className="text-white">{myBot.host}</span></div>
                                <div className="flex justify-between"><span>Expires:</span><span>{new Date(myBot.expiresAt).toLocaleDateString()}</span></div>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    {connected ? <Button onClick={() => toggleBot('stop')} variant="destructive" className="w-full" disabled={connecting}>Stop</Button> : <Button onClick={() => toggleBot('start')} variant="default" className="w-full bg-green-600" disabled={connecting}>Start</Button>}
                                    <Button onClick={renewBot} variant="outline" className="w-full">Renew (30c)</Button>
                                </div>
                                {connected && (
                                    <div className="grid grid-cols-3 gap-1 pt-4">
                                        {['jump', 'forward', 'sneak', 'left', 'back', 'right'].map(a => <Button key={a} variant="outline" size="sm" onClick={() => executeAction(a)} className="text-[10px] h-7">{a}</Button>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 flex flex-col h-[500px]">
                    <Tabs defaultValue="console" className="h-full flex flex-col">
                        <div className="flex items-center justify-between border-b px-2">
                            <TabsList className="bg-transparent h-9 p-0">
                                <TabsTrigger value="console" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none text-xs h-7 px-3"><MessageSquare className="w-3 h-3 mr-1" /> Console</TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none text-xs h-7 px-3"><Settings className="w-3 h-3 mr-1" /> Settings</TabsTrigger>
                                <TabsTrigger value="controls" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none text-xs h-7 px-3" disabled={!connected}><Gamepad2 className="w-3 h-3 mr-1" /> Controls</TabsTrigger>
                            </TabsList>
                            <span className="text-[10px] text-muted-foreground font-mono">{myBot?.sessionId ? `ID: ${myBot.sessionId.substring(0, 6)}` : "Standby"}</span>
                        </div>

                        <TabsContent value="console" className="flex-1 overflow-hidden flex flex-col m-0 data-[state=active]:flex">
                            <div className="flex-1 overflow-auto py-2 px-2 space-y-1 font-mono text-sm bg-black/20">
                                {chatMessages.length === 0 ? <p className="text-center opacity-20 py-20">No data</p> : chatMessages.map(msg => (
                                    <div key={msg.id} className={msg.type === "system" ? "text-yellow-500/80" : msg.type === "bot" ? "text-blue-400" : "text-gray-300"}>
                                        <span className="text-[10px] opacity-40 mr-2">[{formatTime(msg.timestamp)}]</span>
                                        {msg.username && <span className="font-medium text-pink-400/80">&lt;{msg.username}&gt;</span>}
                                        <span> {msg.message}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-2 border-t flex gap-2">
                                <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type..." disabled={!connected} className="bg-black/40 text-xs h-8" onKeyDown={(e) => e.key === "Enter" && sendChat()} />
                                <Button onClick={sendChat} disabled={!connected} size="sm" className="h-8 w-8 p-0"><Send className="w-4 h-4" /></Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="p-4 m-0 space-y-4 overflow-auto">
                            <div className="space-y-4">
                                {/* Subscription Status */}
                                {/* Subscription Status */}
                                <div className={`flex flex-col p-3 rounded-lg border ${isPremium ? (premiumTier >= 2 ? "bg-yellow-900/20 border-yellow-500/30" : "bg-slate-400/10 border-slate-400/30") : "bg-muted/20 border-white/5"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="space-y-0.5">
                                            <div className={`text-sm font-medium flex items-center gap-2 ${premiumTier >= 2 ? "text-yellow-200" : (premiumTier === 1 ? "text-slate-200" : "")}`}>
                                                <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">👑</div>
                                                {isPremium ? (premiumTier >= 2 ? "Gold Plan (All Access)" : "Silver Plan (Basic)") : "Free Plan"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {isPremium ? `Expires: ${new Date(premiumExpiry || 0).toLocaleDateString()}` : "Select a plan to unlock features"}
                                            </div>
                                        </div>
                                    </div>

                                    {!isPremium && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 border-slate-500/30 hover:bg-slate-500/10" onClick={() => upgradeToPremium('silver_credit')}>
                                                <span className="font-bold text-xs">Silver (14d)</span>
                                                <span className="text-[10px] opacity-70">250 Credits</span>
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-auto py-2 flex flex-col items-center gap-1 border-slate-500/30 hover:bg-slate-500/10" onClick={() => upgradeToPremium('silver_inr')}>
                                                <span className="font-bold text-xs">Silver (30d)</span>
                                                <span className="text-[10px] opacity-70">50 INR</span>
                                            </Button>
                                            <Button size="sm" className="h-auto py-2 flex flex-col items-center gap-1 bg-gradient-to-r from-yellow-600 to-amber-600 border-none hover:opacity-90 text-white" onClick={() => upgradeToPremium('gold_inr')}>
                                                <span className="font-bold text-xs">Gold (30d)</span>
                                                <span className="text-[10px] opacity-90">100 INR</span>
                                            </Button>
                                        </div>
                                    )}
                                    {isPremium && premiumTier < 2 && (
                                        <Button size="sm" className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-yellow-600 to-amber-600 border-none" onClick={() => upgradeToPremium('gold_inr')}>Upgrade to Gold (100 INR)</Button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-white/5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Auto Reconnect</div>
                                        <div className="text-xs text-muted-foreground">Reconnect if kicked</div>
                                    </div>
                                    <Switch
                                        checked={config.autoReconnect}
                                        onCheckedChange={(v) => updateBotConfig({ autoReconnect: v })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-white/5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Auto Respawn</div>
                                        <div className="text-xs text-muted-foreground">Respawn when killed or died</div>
                                    </div>
                                    <Switch
                                        checked={config.autoRespawn}
                                        onCheckedChange={(v) => updateBotConfig({ autoRespawn: v })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-white/5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Auto Chat</div>
                                        <div className="text-xs text-muted-foreground">Send random messages</div>
                                    </div>
                                    <Switch
                                        checked={config.autoChat}
                                        onCheckedChange={(v) => updateBotConfig({ autoChat: v })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-white/5">
                                    <div className="space-y-0.5">
                                        <div className="text-sm font-medium">Random Movement</div>
                                        <div className="text-xs text-muted-foreground">Walk around randomly</div>
                                    </div>
                                    <Switch
                                        checked={config.randomMovement}
                                        onCheckedChange={(v) => updateBotConfig({ randomMovement: v })}
                                    />
                                </div>

                                {/* Premium Modes */}
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Premium Modes (Unlockable)</h3>

                                    {/* Attack Mode */}
                                    <div className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-500/20 mb-2">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium flex items-center gap-2 text-red-200">
                                                <Zap className="w-4 h-4" /> Attack Mode
                                                {!unlockedModes.includes('attack') && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">150c</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Attack nearby players & mobs</div>
                                        </div>
                                        {unlockedModes.includes('attack') ? (
                                            <Switch
                                                checked={activeModes['attack'] || false}
                                                onCheckedChange={(v) => toggleMode('attack', v)}
                                            />
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 hover:bg-red-950" onClick={() => unlockMode('attack')}>Unlock</Button>
                                        )}
                                    </div>

                                    {/* Mining Mode */}
                                    <div className="flex items-center justify-between p-3 bg-blue-900/10 rounded-lg border border-blue-500/20 mb-2">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium flex items-center gap-2 text-blue-200">
                                                <Square className="w-4 h-4" /> Mining Mode
                                                {!unlockedModes.includes('mining') && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">150c</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Auto-mine ores nearby</div>
                                        </div>
                                        {unlockedModes.includes('mining') ? (
                                            <Switch
                                                checked={activeModes['mining'] || false}
                                                onCheckedChange={(v) => toggleMode('mining', v)}
                                            />
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500/30 hover:bg-blue-950" onClick={() => unlockMode('mining')}>Unlock</Button>
                                        )}
                                    </div>

                                    {/* Butcher Mode */}
                                    <div className="flex items-center justify-between p-3 bg-orange-900/10 rounded-lg border border-orange-500/20 mb-2">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium flex items-center gap-2 text-orange-200">
                                                <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">🥩</div> Animal Butcher
                                                {!unlockedModes.includes('butcher') && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">150c</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Hunt passive animals for food</div>
                                        </div>
                                        {unlockedModes.includes('butcher') ? (
                                            <Switch
                                                checked={activeModes['butcher'] || false}
                                                onCheckedChange={(v) => toggleMode('butcher', v)}
                                            />
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-orange-500/30 hover:bg-orange-950" onClick={() => unlockMode('butcher')}>Unlock</Button>
                                        )}
                                    </div>

                                    {/* Follow Mode */}
                                    <div className="p-3 bg-purple-900/10 rounded-lg border border-purple-500/20 mb-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium flex items-center gap-2 text-purple-200">
                                                    <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">👣</div> Follow Player
                                                    {!unlockedModes.includes('follow') && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">300c</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Follow a specific player</div>
                                            </div>
                                            {!unlockedModes.includes('follow') && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-purple-500/30 hover:bg-purple-950" onClick={() => unlockMode('follow')}>Unlock</Button>
                                            )}
                                        </div>
                                        {unlockedModes.includes('follow') && (
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    placeholder="Player Name"
                                                    className="h-7 text-xs bg-black/20 border-purple-500/20"
                                                    value={targetPlayer}
                                                    onChange={(e) => setTargetPlayer(e.target.value)}
                                                />
                                                <Switch
                                                    checked={activeModes['follow'] || false}
                                                    onCheckedChange={(v) => toggleMode('follow', v, { targetPlayer })}
                                                    disabled={!targetPlayer}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Skin Change Mode */}
                                    <div className="p-3 bg-cyan-900/10 rounded-lg border border-cyan-500/20 mb-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium flex items-center gap-2 text-cyan-200">
                                                    <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">🎨</div> Change Skin
                                                    {!unlockedModes.includes('skin') && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">100c</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Set custom skin via command</div>
                                            </div>
                                            {!unlockedModes.includes('skin') && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-cyan-500/30 hover:bg-cyan-950" onClick={() => unlockMode('skin')}>Unlock</Button>
                                            )}
                                        </div>
                                        {unlockedModes.includes('skin') && (
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    placeholder="Skin Name"
                                                    className="h-7 text-xs bg-black/20 border-cyan-500/20"
                                                    value={skinName}
                                                    onChange={(e) => setSkinName(e.target.value)}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
                                                    onClick={() => toggleMode('skin', true, { skinName })}
                                                    disabled={!skinName}
                                                >
                                                    Set Skin
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Drop Inventory Mode */}
                                    <div className="flex items-center justify-between p-3 bg-emerald-900/10 rounded-lg border border-emerald-500/20">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium flex items-center gap-2 text-emerald-200">
                                                <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">🗑️</div> Auto-Drop
                                                {!unlockedModes.includes('drop_all') && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">50c</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Simply dumps everything</div>
                                        </div>
                                        {unlockedModes.includes('drop_all') ? (
                                            <Switch
                                                checked={activeModes['drop_all'] || false}
                                                onCheckedChange={(v) => toggleMode('drop_all', v)}
                                            />
                                        ) : (
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 hover:bg-emerald-950" onClick={() => unlockMode('drop_all')}>Unlock</Button>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Panel Toggle */}
                                <div className="pt-4 border-t border-white/10 mt-4">
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white" onClick={() => setShowAdmin(!showAdmin)}>
                                        {showAdmin ? "Hide Admin Panel" : "Show Admin Panel"}
                                    </Button>

                                    {showAdmin && (
                                        <div className="mt-2 p-3 bg-red-950/20 rounded-lg border border-red-900/40 space-y-3">
                                            <div className="text-xs font-bold text-red-400 uppercase tracking-widest">Admin Control</div>
                                            <Input
                                                placeholder="Admin Secret Key"
                                                type="password"
                                                value={adminKey}
                                                onChange={(e) => setAdminKey(e.target.value)}
                                                className="h-7 text-xs bg-black/40 border-red-900/30"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="Target Username"
                                                    value={adminTargetUser}
                                                    onChange={(e) => setAdminTargetUser(e.target.value)}
                                                    className="h-7 text-xs bg-black/40 border-red-900/30"
                                                />
                                                <select
                                                    className="h-7 text-xs bg-black/40 border border-red-900/30 rounded px-2 text-white"
                                                    value={adminTier}
                                                    onChange={(e) => setAdminTier(e.target.value)}
                                                >
                                                    <option value="1">Silver (Basic)</option>
                                                    <option value="2">Gold (All)</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Days"
                                                    type="number"
                                                    value={adminDays}
                                                    onChange={(e) => setAdminDays(e.target.value)}
                                                    className="h-7 text-xs bg-black/40 border-red-900/30 w-20"
                                                />
                                                <Button size="sm" className="flex-1 h-7 text-xs bg-red-800 hover:bg-red-700" onClick={grantPremium}>
                                                    Grant Premium
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="controls" className="p-4 m-0 overflow-auto">
                            <div className="space-y-4">
                                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 mb-4">
                                    <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : connecting ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
                                    <span className="text-sm font-medium">{botStatus}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => executeAction("jump")}>Jump</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("sprint")}>Sprint</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("sneak")}>Sneak</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("forward")}>Forward</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("stop")}>Stop</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("back")}>Back</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("left")}>Left</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("right")}>Right</Button>
                                    <Button variant="outline" size="sm" onClick={() => executeAction("drop")}>Drop</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            {/* Instruction Panels */}
            <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="p-6 bg-muted/30 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /><h4 className="font-bold text-lg">Bot Economics</h4></div>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex justify-between"><span>Launch:</span> <b className="text-white">20 Credits</b></li>
                        <li className="flex justify-between"><span>Renew (+7d):</span> <b className="text-white">30 Credits</b></li>
                        <li className="flex justify-between"><span>Limit:</span> <b className="text-white">1 per user</b></li>
                    </ul>
                </div>
                <div className="p-6 bg-muted/30 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2"><Play className="w-5 h-5 text-green-400" /><h4 className="font-bold text-lg">System Info</h4></div>
                    <p className="text-xs text-muted-foreground leading-relaxed">Improved persistent backend ensures your bot stays registered for 7 days. Automatic deployment on start.</p>
                </div>
            </div>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-md border-yellow-500/20 bg-black/90">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-yellow-400 flex items-center gap-2">
                            👑 Upgrade to Premium
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Unlock all modes including Attack, Mining, and Follow.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-yellow-950/20 border border-yellow-500/20 space-y-2">
                            <h4 className="font-semibold text-yellow-200">How to Purchase</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Premium subscriptions are manually handled by our admin team on Discord.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Discord ID</label>
                            <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10 font-mono text-sm text-white">
                                941139424580890666
                            </div>
                        </div>

                        <div className="text-xs text-red-400 flex items-center gap-1 bg-red-950/20 p-2 rounded border border-red-900/40">
                            <span className="font-bold">NOTE:</span> Payments are NON-REFUNDABLE.
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="default"
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                            onClick={() => window.open("https://discord.com/users/941139424580890666", "_blank")}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Admin on Discord
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ToolPageLayout>
    );
}
