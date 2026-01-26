import { useState, useRef, useEffect } from "react";
import { Bot, Send, Play, Square, Settings, MessageSquare, Gamepad2, Zap } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
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
        autoChat: false,
        randomMovement: false,
    });
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [botStatus, setBotStatus] = useState<string>("Idle");
    const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
    const [socketConnected, setSocketConnected] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const { toast } = useToast();

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Setup WebSocket
    useEffect(() => {
        socketRef.current = io(API_URL);

        socketRef.current.on("connect", () => {
            setSocketConnected(true);
            socketRef.current?.emit("join:session", sessionId);
            // Only show message if we weren't already connected (reconnect)
            if (!socketConnected) addSystemMessage("Connected to backend server");
        });

        socketRef.current.on("disconnect", () => {
            setSocketConnected(false);
        });

        socketRef.current.on("bot:spawned", (data) => {
            setConnected(true);
            setConnecting(false);
            setBotStatus("In Game");
            addSystemMessage(`Bot spawned at ${Math.round(data.position.x)}, ${Math.round(data.position.y)}, ${Math.round(data.position.z)}`);
        });

        socketRef.current.on("bot:chat", (data) => {
            addChatMessage(data.username, data.message);
        });

        socketRef.current.on("bot:message", (data) => {
            addSystemMessage(data.message);
        });

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
            addSystemMessage("Bot disconnected from server");
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [sessionId]);

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

    const connectBot = async () => {
        if (!config.serverAddress) {
            toast({ title: "Enter server", description: "Please enter a server address", variant: "destructive" });
            return;
        }

        setConnecting(true);
        addSystemMessage(`Connecting to ${config.serverAddress}:${config.port}...`);

        try {
            const response = await fetch(`${API_URL}/api/bot/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    host: config.serverAddress,
                    port: config.port,
                    username: config.username,
                    version: config.version || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({ title: "Connecting...", description: "Bot is joining the server" });
            } else {
                setConnecting(false);
                addSystemMessage(`Failed: ${data.error}`);
                toast({ title: "Failed", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            setConnecting(false);
            addSystemMessage("Failed to connect to backend server. Make sure it's running!");
            toast({
                title: "Backend not running",
                description: "Start the server with: cd server && npm start",
                variant: "destructive"
            });
        }
    };

    const disconnectBot = async () => {
        try {
            await fetch(`${API_URL}/api/bot/disconnect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });
            setConnected(false);
            setBotStatus("Disconnected");
        } catch (error) {
            toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
        }
    };

    const sendChat = async () => {
        if (!chatInput.trim() || !connected) return;

        try {
            await fetch(`${API_URL}/api/bot/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message: chatInput }),
            });

            setChatMessages((prev) => [...prev, {
                id: Date.now().toString(),
                timestamp: new Date(),
                type: "bot",
                username: config.username,
                message: chatInput,
            }]);

            setChatInput("");
        } catch (error) {
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
        }
    };

    const executeAction = async (action: string) => {
        if (!connected) return;

        try {
            const response = await fetch(`${API_URL}/api/bot/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, action }),
            });

            const data = await response.json();
            if (data.success) {
                setBotStatus(action.charAt(0).toUpperCase() + action.slice(1));
                addSystemMessage(`Action: ${action}`);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to execute action", variant: "destructive" });
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <ToolPageLayout
            title="MC Bot Sender"
            description="Control a real Minecraft bot - join servers, chat, and perform actions"
            icon={Bot}
            category="Minecraft"
        >
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Config & Controls */}
                <div className="space-y-4">
                    <Tabs defaultValue="connect">
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="connect">Connect</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="connect" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                    Server Address <span className="text-xs text-red-400">(Java Edition Only)</span>
                                </label>
                                <Input
                                    value={config.serverAddress}
                                    onChange={(e) => setConfig({ ...config, serverAddress: e.target.value })}
                                    placeholder="play.example.com"
                                    disabled={connected || connecting}
                                    className="bg-background/50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Note: Works best on cracked/offline servers. Premium servers (Hypixel) block bots.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Port</label>
                                    <Input
                                        type="number"
                                        value={config.port}
                                        onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 25565 })}
                                        disabled={connected || connecting}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Version</label>
                                    <Input
                                        value={config.version}
                                        onChange={(e) => setConfig({ ...config, version: e.target.value })}
                                        placeholder="auto"
                                        disabled={connected || connecting}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Bot Username</label>
                                <Input
                                    value={config.username}
                                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                    placeholder="MineXBot"
                                    disabled={connected || connecting}
                                    className="bg-background/50"
                                />
                            </div>

                            {!connected ? (
                                <Button
                                    onClick={connectBot}
                                    className="w-full gap-2"
                                    disabled={connecting}
                                >
                                    <Play className="w-4 h-4" />
                                    {connecting ? "Connecting..." : "Connect Bot"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={disconnectBot}
                                    variant="destructive"
                                    className="w-full gap-2"
                                >
                                    <Square className="w-4 h-4" />
                                    Disconnect
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto Reconnect</p>
                                    <p className="text-xs text-muted-foreground">Reconnect if kicked</p>
                                </div>
                                <Switch
                                    checked={config.autoReconnect}
                                    onCheckedChange={(v) => setConfig({ ...config, autoReconnect: v })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto Chat</p>
                                    <p className="text-xs text-muted-foreground">Send random messages</p>
                                </div>
                                <Switch
                                    checked={config.autoChat}
                                    onCheckedChange={(v) => setConfig({ ...config, autoChat: v })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Random Movement</p>
                                    <p className="text-xs text-muted-foreground">Walk around randomly</p>
                                </div>
                                <Switch
                                    checked={config.randomMovement}
                                    onCheckedChange={(v) => setConfig({ ...config, randomMovement: v })}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Status */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : connecting ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-sm font-medium">{botStatus}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    {connected && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Bot Controls</label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button variant="outline" size="sm" onClick={() => executeAction("jump")}>
                                    Jump
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => executeAction("sprint")}>
                                    Sprint
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => executeAction("sneak")}>
                                    Sneak
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => executeAction("forward")}>
                                    Forward
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => executeAction("stop")}>
                                    Stop
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => executeAction("back")}>
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat */}
                <div className="lg:col-span-2 flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 pb-3 border-b">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Server Chat</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            Session: {sessionId.substring(0, 8)}
                        </span>
                    </div>

                    <div className="flex-1 overflow-auto py-2 space-y-1 font-mono text-sm">
                        {chatMessages.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Connect to a server to see chat
                            </p>
                        ) : (
                            chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${msg.type === "system"
                                        ? "text-yellow-500"
                                        : msg.type === "bot"
                                            ? "text-primary"
                                            : "text-foreground"
                                        }`}
                                >
                                    <span className="text-xs text-muted-foreground mr-2">
                                        [{formatTime(msg.timestamp)}]
                                    </span>
                                    {msg.username && (
                                        <span className="font-medium">
                                            {msg.type === "bot" ? `[BOT] ` : ""}&lt;{msg.username}&gt;
                                        </span>
                                    )}
                                    <span> {msg.message}</span>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                        <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={connected ? "Type a message..." : "Connect to chat"}
                            disabled={!connected}
                            className="bg-background/50 font-mono"
                            onKeyDown={(e) => e.key === "Enter" && sendChat()}
                        />
                        <Button onClick={sendChat} disabled={!connected}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Setup Instructions */}
            {/* Info & Instructions */}
            <div className="grid gap-6 md:grid-cols-2 mt-8">
                {/* How it works */}
                <div className="p-6 bg-muted/30 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <h4 className="font-bold text-lg">How it works</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This tool creates a <strong>real Minecraft client instance</strong> on our backend servers.
                        It connects to the server IP you provide, allowing you to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                        <li>Check if a server is online and allows bots.</li>
                        <li>Chat with players remotely.</li>
                        <li>AFK or load chunks.</li>
                        <li>Debug permissions and plugins.</li>
                    </ul>
                </div>

                {/* Usage Guide */}
                <div className="p-6 bg-muted/30 border border-white/5 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-green-400" />
                        <h4 className="font-bold text-lg">How to use</h4>
                    </div>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2 ml-2">
                        <li>Enter the <strong>Server Address</strong> (e.g. <code>hypixel.net</code>).</li>
                        <li>Choose a <strong>Bot Username</strong> (default: MineXBot).</li>
                        <li>Click <strong>Connect Bot</strong>.</li>
                        <li>Wait for the "In Game" status, then use the Chat or Controls panel!</li>
                    </ol>
                </div>
            </div>

            {/* Developer / Self-Host Info (Collapsible or small) */}
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <span>Backend Status:</span>
                    <span className={`flex items-center gap-1.5 ${socketConnected ? "text-green-400" : "text-red-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
                        {socketConnected ? "Online" : "Offline"}
                    </span>
                </p>
                <div className="mt-4">
                    <details className="text-left max-w-2xl mx-auto bg-black/20 rounded-lg border border-white/5 p-4 group">
                        <summary className="text-xs font-medium cursor-pointer flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                            <span>🛠️ Developer / Self-Host Instructions</span>
                        </summary>
                        <div className="mt-4 space-y-4 text-xs text-muted-foreground">
                            <p>If the status above is <strong>Offline</strong>, ensure your backend is running:</p>
                            <code className="block bg-black/40 p-2 rounded font-mono text-green-400">
                                cd server && npm install && npm start
                            </code>
                            <p>Then ensure the <strong>Settings</strong> tab is pointing to your backend URL (e.g. <code>http://localhost:3001</code>).</p>
                        </div>
                    </details>
                </div>
            </div>
        </ToolPageLayout>
    );
}
