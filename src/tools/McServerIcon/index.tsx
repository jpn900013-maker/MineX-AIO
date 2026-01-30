import { useState } from "react";
import { Image, Search, Download, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function McServerIcon() {
    const [address, setAddress] = useState("");
    const [iconUrl, setIconUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const getIcon = async () => {
        if (!address.trim()) {
            toast({ title: "Enter address", description: "Please enter a server address", variant: "destructive" });
            return;
        }

        setLoading(true);
        setIconUrl(null);

        try {
            const cleanAddress = address.trim().replace(/^https?:\/\//, "");
            // mcsrvstat provides the icon in base64 or URL
            const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(cleanAddress)}`);
            const data = await response.json();

            if (data.icon) {
                setIconUrl(data.icon);
                toast({ title: "Icon found!", description: "Server icon loaded successfully" });
            } else {
                toast({ title: "No icon found", description: "This server doesn't have a custom icon", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to fetch server info", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadIcon = async () => {
        if (!iconUrl) return;

        try {
            const link = document.createElement("a");
            link.href = iconUrl;
            link.download = `${address.replace(/\./g, "_")}_icon.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Downloaded", description: "Icon saved to device" });
        } catch {
            // Fallback for base64
            window.open(iconUrl, "_blank");
        }
    };

    return (
        <ToolPageLayout
            title="MC Server Icon"
            description="View and download Minecraft server icons"
            icon={Image}
            category="Minecraft"
        >
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter server address (e.g. hypixel.net)"
                        onKeyDown={(e) => e.key === "Enter" && getIcon()}
                        className="bg-background/50"
                    />
                    <Button onClick={getIcon} disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Get Icon
                    </Button>
                </div>

                {iconUrl && (
                    <div className="flex flex-col items-center gap-6 p-8 bg-muted/30 rounded-xl border border-white/5 animate-fade-in">
                        <div className="relative group">
                            <img
                                src={iconUrl}
                                alt="Server Icon"
                                className="w-32 h-32 rounded-lg shadow-lg pixelated"
                                style={{ imageRendering: "pixelated" }}
                            />
                            <div className="absolute inset-0 ring-1 ring-white/10 rounded-lg pointer-events-none" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Found icon for <span className="text-foreground font-bold">{address}</span>
                            </p>
                            <Button onClick={downloadIcon} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download Icon (64x64)
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
