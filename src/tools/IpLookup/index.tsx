import { useState } from "react";
import { Globe, Search, MapPin, Building, Wifi, Clock, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface IpInfo {
    ip: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
}

export default function IpLookup() {
    const [ip, setIp] = useState("");
    const [result, setResult] = useState<IpInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const lookupIp = async (targetIp?: string) => {
        setLoading(true);
        setError(null);

        try {
            const url = targetIp
                ? `http://ip-api.com/json/${targetIp}`
                : "http://ip-api.com/json/";

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "fail") {
                setError(data.message || "Failed to lookup IP address");
                setResult(null);
            } else {
                setResult(data);
                if (!targetIp) setIp(data.query);
            }
        } catch (e) {
            setError("Failed to fetch IP information. Please try again.");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const lookupMyIp = () => {
        lookupIp();
        toast({ title: "Looking up...", description: "Fetching your IP information" });
    };

    const lookupCustomIp = () => {
        if (!ip.trim()) {
            toast({ title: "Enter IP", description: "Please enter an IP address", variant: "destructive" });
            return;
        }
        lookupIp(ip.trim());
    };

    const copyResult = async () => {
        if (!result) return;

        const text = `
IP: ${result.ip}
Location: ${result.city}, ${result.regionName}, ${result.country}
Coordinates: ${result.lat}, ${result.lon}
Timezone: ${result.timezone}
ISP: ${result.isp}
Organization: ${result.org}
AS: ${result.as}
    `.trim();

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({ title: "Copied!", description: "IP info copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    return (
        <ToolPageLayout
            title="IP Lookup"
            description="Get geolocation, ISP, and organization info from any IP address"
            icon={Globe}
            category="Network"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        placeholder="Enter IP address (e.g., 8.8.8.8)"
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === "Enter" && lookupCustomIp()}
                    />
                    <Button onClick={lookupCustomIp} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        Lookup
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={lookupMyIp} variant="secondary" disabled={loading}>
                        {loading ? "Loading..." : "Lookup My IP"}
                    </Button>
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">Results</h3>
                            <Button onClick={copyResult} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                            </Button>
                        </div>

                        {/* IP Display */}
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                            <p className="text-3xl font-mono font-bold text-primary">{result.ip}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">Location</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{result.city}, {result.regionName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {result.country} ({result.countryCode})
                                    </p>
                                    <p className="text-sm text-muted-foreground">ZIP: {result.zip || "N/A"}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium">Coordinates</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-mono">{result.lat}, {result.lon}</p>
                                    <a
                                        href={`https://www.google.com/maps?q=${result.lat},${result.lon}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View on Google Maps →
                                    </a>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Wifi className="w-4 h-4" />
                                    <span className="text-sm font-medium">Network</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{result.isp}</p>
                                    <p className="text-sm text-muted-foreground">{result.org}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{result.as}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Timezone</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">{result.timezone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
