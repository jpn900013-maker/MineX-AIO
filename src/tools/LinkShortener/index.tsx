import { useState } from "react";
import { Link, Copy, Check, ExternalLink, Trash2, BarChart2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { InlineAd } from "@/components/AdBanner";

interface ShortenedLink {
    id: string;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    createdAt: Date;
    clicks: number;
}

export default function LinkShortener() {
    const [url, setUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [links, setLinks] = useState<ShortenedLink[]>(() => {
        try {
            const saved = localStorage.getItem("minex-short-links");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [copied, setCopied] = useState<string | null>(null);
    const { toast } = useToast();

    const generateShortCode = (): string => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const isValidUrl = (urlString: string): boolean => {
        try {
            const url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    const shortenUrl = () => {
        let urlToShorten = url.trim();

        // Add https:// if no protocol
        if (urlToShorten && !urlToShorten.match(/^https?:\/\//)) {
            urlToShorten = `https://${urlToShorten}`;
        }

        if (!isValidUrl(urlToShorten)) {
            toast({ title: "Invalid URL", description: "Please enter a valid URL", variant: "destructive" });
            return;
        }

        // Check if custom alias is already taken
        const code = customAlias.trim() || generateShortCode();
        if (links.some((l) => l.shortCode === code)) {
            toast({ title: "Alias taken", description: "This custom alias is already in use", variant: "destructive" });
            return;
        }

        const newLink: ShortenedLink = {
            id: Date.now().toString(),
            originalUrl: urlToShorten,
            shortCode: code,
            shortUrl: `${window.location.host}/s/${code}`, // Dynamic short URL
            createdAt: new Date(),
            clicks: 0,
        };

        const updatedLinks = [newLink, ...links];
        setLinks(updatedLinks);
        localStorage.setItem("minex-short-links", JSON.stringify(updatedLinks));

        setUrl("");
        setCustomAlias("");
        toast({ title: "Shortened!", description: `Created: ${newLink.shortUrl}` });
    };

    const copyLink = async (link: ShortenedLink) => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/s/${link.shortCode}`);
            setCopied(link.id);
            toast({ title: "Copied!", description: "Short URL copied to clipboard" });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const deleteLink = (id: string) => {
        const updatedLinks = links.filter((l) => l.id !== id);
        setLinks(updatedLinks);
        localStorage.setItem("minex-short-links", JSON.stringify(updatedLinks));
        toast({ title: "Deleted", description: "Link removed" });
    };

    const openOriginal = (url: string) => {
        window.open(url, "_blank");
    };

    const simulateClick = (id: string) => {
        const updatedLinks = links.map((l) =>
            l.id === id ? { ...l, clicks: l.clicks + 1 } : l
        );
        setLinks(updatedLinks);
        localStorage.setItem("minex-short-links", JSON.stringify(updatedLinks));
    };

    return (
        <ToolPageLayout
            title="Link Shortener"
            description="Create short, memorable links with custom aliases"
            icon={Link}
            category="Link"
        >
            <div className="space-y-6">
                {/* Ad placement */}
                <InlineAd />

                {/* URL Input */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Long URL</label>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/very/long/url/path"
                            className="bg-background/50"
                            onKeyDown={(e) => e.key === "Enter" && shortenUrl()}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Custom Alias (optional)</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{window.location.host}/</span>
                            <Input
                                value={customAlias}
                                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                                placeholder="my-link"
                                className="bg-background/50"
                            />
                        </div>
                    </div>

                    <Button onClick={shortenUrl} className="w-full">
                        Shorten URL
                    </Button>
                </div>

                {/* Links List */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">
                        Your Links ({links.length})
                    </label>

                    {links.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No shortened links yet. Create your first one above!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {links.map((link) => (
                                <div key={link.id} className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-primary font-medium">
                                                    {link.shortUrl}
                                                </span>
                                                <Button
                                                    onClick={() => copyLink(link)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                >
                                                    {copied === link.id ? (
                                                        <Check className="w-3 h-3" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <BarChart2 className="w-4 h-4" />
                                                <span>{link.clicks} clicks</span>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    simulateClick(link.id);
                                                    openOriginal(link.originalUrl);
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => deleteLink(link.id)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Created: {new Date(link.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">About This Tool</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Links are stored locally in your browser</li>
                        <li>• Custom aliases help create memorable URLs</li>
                        <li>• Click tracking is simulated for demo purposes</li>
                        <li>• In production, this would connect to a backend service</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
