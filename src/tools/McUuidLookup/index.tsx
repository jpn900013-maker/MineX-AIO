import { useState } from "react";
import { Pickaxe, Search, Copy, Check, ArrowRight, User } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface UuidResult {
    name: string;
    uuid: string;
    uuidDashed: string;
    nameHistory?: { name: string; changedToAt?: number }[];
}

export default function McUuidLookup() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<"username" | "uuid">("username");
    const [result, setResult] = useState<UuidResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const { toast } = useToast();

    const formatUuid = (uuid: string): string => {
        // Remove dashes if present and format
        const clean = uuid.replace(/-/g, "");
        if (clean.length !== 32) return uuid;
        return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
    };

    const lookup = async () => {
        if (!input.trim()) {
            toast({ title: "Enter value", description: `Please enter a ${mode}`, variant: "destructive" });
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let name: string;
            let uuid: string;

            if (mode === "username") {
                // Username to UUID
                const response = await fetch(`https://api.mcsrvstat.us/3/uuid/${encodeURIComponent(input.trim())}`);
                const data = await response.json();

                if (!data.uuid) {
                    setError("Player not found. Check the username and try again.");
                    return;
                }

                name = data.name || input;
                uuid = data.uuid;
            } else {
                // UUID to Username
                const cleanUuid = input.trim().replace(/-/g, "");
                if (cleanUuid.length !== 32) {
                    setError("Invalid UUID format. Must be 32 characters (with or without dashes).");
                    return;
                }

                // Use a proxy/alternative API since Mojang's direct API has CORS issues
                const response = await fetch(`https://playerdb.co/api/player/minecraft/${cleanUuid}`);
                const data = await response.json();

                if (!data.success || !data.data?.player) {
                    setError("Player not found for this UUID.");
                    return;
                }

                name = data.data.player.username;
                uuid = cleanUuid;
            }

            setResult({
                name,
                uuid: uuid.replace(/-/g, ""),
                uuidDashed: formatUuid(uuid),
            });

            toast({ title: "Found!", description: `${name}` });
        } catch (e) {
            setError("Failed to lookup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyValue = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(label);
            toast({ title: "Copied!", description: `${label} copied to clipboard` });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    return (
        <ToolPageLayout
            title="MC UUID Lookup"
            description="Convert Minecraft usernames to UUIDs and vice versa"
            icon={Pickaxe}
            category="Minecraft"
        >
            <div className="space-y-6">
                {/* Mode Toggle */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                    <TabsList className="grid grid-cols-2 w-full max-w-md">
                        <TabsTrigger value="username">Username → UUID</TabsTrigger>
                        <TabsTrigger value="uuid">UUID → Username</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === "username" ? "Enter Minecraft username" : "Enter UUID"}
                        className="bg-background/50 font-mono"
                        onKeyDown={(e) => e.key === "Enter" && lookup()}
                    />
                    <Button onClick={lookup} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        {loading ? "Looking up..." : "Lookup"}
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
                        {/* Player Card */}
                        <div className="p-6 bg-muted/50 rounded-xl flex items-center gap-4">
                            <img
                                src={`https://crafatar.com/avatars/${result.uuid}?size=64&overlay`}
                                alt="Player head"
                                className="w-16 h-16 rounded-lg"
                                style={{ imageRendering: "pixelated" }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-bold text-xl">{result.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* UUID Display */}
                        <div className="space-y-3">
                            <div className="p-4 bg-background/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">UUID (No Dashes)</span>
                                    <Button
                                        onClick={() => copyValue(result.uuid, "UUID")}
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                    >
                                        {copied === "UUID" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                </div>
                                <p className="font-mono text-sm break-all">{result.uuid}</p>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">UUID (With Dashes)</span>
                                    <Button
                                        onClick={() => copyValue(result.uuidDashed, "UUID Dashed")}
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                    >
                                        {copied === "UUID Dashed" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                </div>
                                <p className="font-mono text-sm">{result.uuidDashed}</p>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted-foreground">Username</span>
                                    <Button
                                        onClick={() => copyValue(result.name, "Username")}
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                    >
                                        {copied === "Username" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    </Button>
                                </div>
                                <p className="font-mono text-sm">{result.name}</p>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={`https://namemc.com/profile/${result.uuid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                NameMC Profile <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">About Minecraft UUIDs</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• UUIDs are unique identifiers for Minecraft accounts</li>
                        <li>• They remain the same even if the username changes</li>
                        <li>• Useful for server bans, whitelists, and plugins</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
