import { useState } from "react";
import { Gamepad2, Search, Download, Copy, Check } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface SkinResult {
    username: string;
    uuid: string;
    skinUrl: string;
}

export default function McSkinViewer() {
    const [username, setUsername] = useState("");
    const [result, setResult] = useState<SkinResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [viewType, setViewType] = useState<"full" | "head" | "face">("full");
    const { toast } = useToast();

    const lookupSkin = async () => {
        if (!username.trim()) {
            toast({ title: "Enter username", description: "Please enter a Minecraft username", variant: "destructive" });
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Use PlayerDB API for reliable lookup
            const response = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(username.trim())}`);
            const data = await response.json();

            if (!data.success || !data.data?.player) {
                setError("Player not found. Check the username and try again.");
                return;
            }

            const player = data.data.player;
            // Visage prefers UUID without dashes
            const cleanUuid = player.id.replace(/-/g, "");

            setResult({
                username: player.username,
                uuid: player.id, // Keep original UUID with dashes for display
                skinUrl: `https://visage.surgeplay.com/skin/${cleanUuid}`,
            });

            toast({ title: "Found!", description: `Loaded skin for ${player.username}` });
        } catch (e) {
            setError("Failed to lookup player. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getRenderUrl = (uuid: string, type: string): string => {
        const cleanUuid = uuid.replace(/-/g, "");
        switch (type) {
            case "face":
                return `https://visage.surgeplay.com/face/512/${cleanUuid}`;
            case "head":
                return `https://visage.surgeplay.com/head/512/${cleanUuid}`;
            case "bust":
                return `https://visage.surgeplay.com/bust/512/${cleanUuid}`;
            case "full":
            default:
                return `https://visage.surgeplay.com/full/512/${cleanUuid}`;
        }
    };

    const downloadSkin = async () => {
        if (!result) return;

        try {
            // Fetch blob and download to avoid cross-origin issues if possible
            const response = await fetch(result.skinUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${result.username}-skin.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Downloaded!", description: "Skin saved to your device" });
        } catch {
            // Fallback
            window.open(result.skinUrl, "_blank");
            toast({ title: "Opened in new tab", description: "Right-click to save" });
        }
    };

    const copyUuid = async () => {
        if (!result) return;

        try {
            await navigator.clipboard.writeText(result.uuid);
            setCopied(true);
            toast({ title: "Copied!", description: "UUID copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const loadExample = (name: string) => {
        setUsername(name);
    };

    return (
        <ToolPageLayout
            title="MC Skin Viewer"
            description="View and download Minecraft player skins in 2D and 3D"
            icon={Gamepad2}
            category="Minecraft"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter Minecraft username"
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === "Enter" && lookupSkin()}
                    />
                    <Button onClick={lookupSkin} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        {loading ? "Loading..." : "View Skin"}
                    </Button>
                </div>

                {/* Quick Examples */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Try:</span>
                    {["Notch", "Dream", "Technoblade", "MumboJumbo"].map((name) => (
                        <Button
                            key={name}
                            variant="outline"
                            size="sm"
                            onClick={() => loadExample(name)}
                            className="text-xs"
                        >
                            {name}
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
                    <div className="space-y-6">
                        {/* Player Info */}
                        <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-bold text-lg text-primary">{result.username}</p>
                                <p className="font-mono text-xs text-muted-foreground">{result.uuid}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={copyUuid} variant="ghost" size="sm" className="gap-1">
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    UUID
                                </Button>
                                <Button onClick={downloadSkin} variant="outline" size="sm" className="gap-1">
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        {/* View Type Selector */}
                        <Tabs value={viewType} onValueChange={(v) => setViewType(v as typeof viewType)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="full">Full Body</TabsTrigger>
                                <TabsTrigger value="head">3D Head</TabsTrigger>
                                <TabsTrigger value="face">2D Face</TabsTrigger>
                            </TabsList>

                            <TabsContent value="full" className="flex justify-center py-8 min-h-[400px]">
                                <img
                                    src={getRenderUrl(result.uuid, "full")}
                                    alt="Full body render"
                                    className="h-80 drop-shadow-xl animate-fade-in"
                                />
                            </TabsContent>

                            <TabsContent value="head" className="flex justify-center py-8 min-h-[400px]">
                                <img
                                    src={getRenderUrl(result.uuid, "head")}
                                    alt="3D Head render"
                                    className="h-64 drop-shadow-xl animate-fade-in"
                                />
                            </TabsContent>

                            <TabsContent value="face" className="flex justify-center py-8 min-h-[400px]">
                                <img
                                    src={getRenderUrl(result.uuid, "face")}
                                    alt="2D Face"
                                    className="w-48 h-48 drop-shadow-xl rounded-lg animate-fade-in"
                                    style={{ imageRendering: "pixelated" }}
                                />
                            </TabsContent>
                        </Tabs>

                        {/* Raw Skin */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-foreground">Raw Skin Texture</h3>
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl">
                                <img
                                    src={result.skinUrl}
                                    alt="Raw skin texture"
                                    className="w-24 h-24 border rounded bg-white/5"
                                    style={{ imageRendering: "pixelated" }}
                                />
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Original 64x64 skin texture file
                                    </p>
                                    <Button onClick={downloadSkin} size="sm" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Skin File
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
