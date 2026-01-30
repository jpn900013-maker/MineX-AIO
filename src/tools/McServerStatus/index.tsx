import { useState } from "react";
import { Server, Search, Users, Wifi, WifiOff, Copy, Check, RefreshCw, MapPin, Clock, Globe } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ServerLocation {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    isp: string;
    lat: number;
    lon: number;
}

interface ServerStatus {
    online: boolean;
    ip: string;
    port: number;
    hostname?: string;
    version?: string;
    protocol?: number;
    players?: {
        online: number;
        max: number;
        list?: string[];
    };
    motd?: {
        clean: string[];
        html: string[];
    };
    icon?: string;
    software?: string;
    ping?: number;
    location?: ServerLocation;
}

export default function McServerStatus() {
    const [address, setAddress] = useState("");
    const [result, setResult] = useState<ServerStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const measurePing = async (ip: string): Promise<number> => {
        // Measure ping by timing a small request
        const startTime = performance.now();
        try {
            // Use the mcsrvstat API as a proxy ping measurement
            await fetch(`https://api.mcsrvstat.us/ping/${ip}`, { mode: 'no-cors' });
        } catch {
            // Even on error, we get the time
        }
        const endTime = performance.now();
        return Math.round(endTime - startTime);
    };

    const getServerLocation = async (ip: string): Promise<ServerLocation | null> => {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();

            if (!data.error) {
                return {
                    country: data.country_name || "Unknown",
                    countryCode: data.country_code || "Unknown",
                    region: data.region || "Unknown",
                    city: data.city || "Unknown",
                    isp: data.org || "Unknown",
                    lat: data.latitude || 0,
                    lon: data.longitude || 0,
                };
            }
        } catch {
            // Location lookup failed
        }
        return null;
    };

    const checkServer = async () => {
        if (!address.trim()) {
            toast({ title: "Enter address", description: "Please enter a server address", variant: "destructive" });
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const cleanAddress = address.trim().replace(/^https?:\/\//, "");

            // Start ping measurement
            const pingStart = performance.now();

            // Fetch server status
            const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(cleanAddress)}`);
            const data = await response.json();

            // Calculate actual response time as ping approximation
            const pingTime = Math.round(performance.now() - pingStart);

            if (!data.online) {
                setResult({
                    online: false,
                    ip: data.ip || cleanAddress,
                    port: data.port || 25565,
                    ping: pingTime
                });
            } else {
                // Get server location
                const location = await getServerLocation(data.ip);

                setResult({
                    online: true,
                    ip: data.ip,
                    port: data.port,
                    hostname: data.hostname,
                    version: data.version,
                    protocol: data.protocol?.version,
                    players: data.players,
                    motd: data.motd,
                    icon: data.icon,
                    software: data.software,
                    ping: pingTime,
                    location,
                });
            }

            toast({ title: data.online ? "Server Online!" : "Server Offline", description: cleanAddress });
        } catch (e) {
            setError("Failed to check server status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            toast({ title: "Copied!", description: "Server address copied" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const loadExamples = (server: string) => {
        setAddress(server);
    };

    const getPingColor = (ping: number): string => {
        if (ping < 100) return "text-green-500";
        if (ping < 200) return "text-yellow-500";
        return "text-red-500";
    };

    const getPingLabel = (ping: number): string => {
        if (ping < 100) return "Excellent";
        if (ping < 200) return "Good";
        if (ping < 300) return "Fair";
        return "Poor";
    };

    return (
        <ToolPageLayout
            title="MC Server Status"
            description="Check Minecraft server status, players, version, ping, and server location"
            icon={Server}
            category="Minecraft"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter server address (e.g., hypixel.net)"
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === "Enter" && checkServer()}
                    />
                    <Button onClick={checkServer} disabled={loading} className="gap-2">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Check
                    </Button>
                </div>

                {/* Quick Examples */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Try:</span>
                    {["hypixel.net", "mc.hypixel.net", "play.cubecraft.net", "mineplex.com"].map((server) => (
                        <Button
                            key={server}
                            variant="outline"
                            size="sm"
                            onClick={() => loadExamples(server)}
                            className="text-xs"
                        >
                            {server}
                        </Button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-lg flex items-center gap-4 ${result.online
                            ? "bg-green-500/10 border border-green-500/30"
                            : "bg-destructive/10 border border-destructive/30"
                            }`}>
                            {result.online ? (
                                <Wifi className="w-8 h-8 text-green-500" />
                            ) : (
                                <WifiOff className="w-8 h-8 text-destructive" />
                            )}
                            <div className="flex-1">
                                <p className={`font-bold text-lg ${result.online ? "text-green-500" : "text-destructive"}`}>
                                    {result.online ? "Server Online" : "Server Offline"}
                                </p>
                                <p className="text-sm text-muted-foreground">{result.ip}:{result.port}</p>
                            </div>
                            <Button onClick={copyAddress} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                            </Button>
                        </div>

                        {/* Ping & Location Section */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Ping Card */}
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                    <h4 className="font-medium">Latency from Your Location</h4>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-bold ${getPingColor(result.ping || 0)}`}>
                                        {result.ping || "N/A"}
                                    </span>
                                    <span className="text-muted-foreground">ms</span>
                                    <span className={`ml-2 text-sm ${getPingColor(result.ping || 0)}`}>
                                        ({getPingLabel(result.ping || 999)})
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Response time from your connection
                                </p>
                            </div>

                            {/* Server Location Card */}
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <h4 className="font-medium">Server Location</h4>
                                </div>
                                {result.location ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{getCountryFlag(result.location.countryCode)}</span>
                                            <span className="font-medium">
                                                {result.location.city}, {result.location.region}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {result.location.country}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {result.location.isp}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Location data unavailable
                                    </p>
                                )}
                            </div>
                        </div>

                        {result.online && (
                            <>
                                {/* Server Icon & MOTD */}
                                <div className="flex gap-4">
                                    {result.icon && (
                                        <img
                                            src={result.icon}
                                            alt="Server Icon"
                                            className="w-16 h-16 rounded-lg border"
                                        />
                                    )}
                                    <div className="flex-1">
                                        {result.motd && (
                                            <div
                                                className="font-mono text-sm"
                                                dangerouslySetInnerHTML={{ __html: result.motd.html?.join("<br>") || result.motd.clean?.join("\n") || "" }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                                        <p className="text-2xl font-bold">
                                            {result.players?.online || 0}/{result.players?.max || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Players Online</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                                        <Server className="w-6 h-6 mx-auto mb-2 text-primary" />
                                        <p className="text-lg font-bold truncate">{result.version || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground">Version</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                                        <Wifi className="w-6 h-6 mx-auto mb-2 text-primary" />
                                        <p className="text-lg font-bold">{result.software || "Vanilla"}</p>
                                        <p className="text-sm text-muted-foreground">Software</p>
                                    </div>
                                </div>

                                {/* Player List */}
                                {result.players?.list && result.players.list.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-foreground">Online Players ({result.players.list.length})</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.players.list.slice(0, 20).map((player, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-muted rounded text-sm font-mono"
                                                >
                                                    {player}
                                                </span>
                                            ))}
                                            {result.players.list.length > 20 && (
                                                <span className="px-2 py-1 text-muted-foreground text-sm">
                                                    +{result.players.list.length - 20} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
