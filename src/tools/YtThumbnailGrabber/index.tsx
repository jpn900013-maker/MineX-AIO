import { useState } from "react";
import { Youtube, Download, Copy, Check, Search, ExternalLink } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ThumbnailResult {
    videoId: string;
    title: string;
    thumbnails: {
        name: string;
        url: string;
        resolution: string;
    }[];
}

export default function YtThumbnailGrabber() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<ThumbnailResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const { toast } = useToast();

    const extractVideoId = (input: string): string | null => {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/,
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const getThumbnails = () => {
        if (!url.trim()) {
            toast({ title: "Enter URL", description: "Please enter a YouTube video URL", variant: "destructive" });
            return;
        }

        const videoId = extractVideoId(url.trim());
        if (!videoId) {
            setError("Invalid YouTube URL. Please enter a valid video URL.");
            return;
        }

        setLoading(true);
        setError(null);

        // YouTube thumbnail URLs are predictable based on video ID
        const thumbnails = [
            { name: "Max Resolution", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, resolution: "1280x720" },
            { name: "SD Quality", url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, resolution: "640x480" },
            { name: "High Quality", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, resolution: "480x360" },
            { name: "Medium Quality", url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, resolution: "320x180" },
            { name: "Default", url: `https://img.youtube.com/vi/${videoId}/default.jpg`, resolution: "120x90" },
        ];

        setResult({
            videoId,
            title: `Video ID: ${videoId}`,
            thumbnails,
        });

        setLoading(false);
        toast({ title: "Success!", description: "Thumbnails extracted successfully" });
    };

    const downloadImage = async (imageUrl: string, filename: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Downloaded!", description: "Thumbnail saved" });
        } catch {
            // Fallback: open in new tab
            window.open(imageUrl, "_blank");
            toast({ title: "Opened in new tab", description: "Right-click to save the image" });
        }
    };

    const copyUrl = async (imageUrl: string, name: string) => {
        try {
            await navigator.clipboard.writeText(imageUrl);
            setCopied(name);
            toast({ title: "Copied!", description: "Image URL copied to clipboard" });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    return (
        <ToolPageLayout
            title="YT Thumbnail Grabber"
            description="Download YouTube video thumbnails in all available resolutions"
            icon={Youtube}
            category="YouTube"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter YouTube video URL or Video ID"
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === "Enter" && getThumbnails()}
                    />
                    <Button onClick={getThumbnails} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        Get Thumbnails
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
                    <div className="space-y-6">
                        {/* Video Info */}
                        <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-mono text-primary">{result.videoId}</p>
                                <a
                                    href={`https://youtube.com/watch?v=${result.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    Open Video <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* Thumbnails Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {result.thumbnails.map((thumb) => (
                                <div key={thumb.name} className="space-y-2">
                                    <div className="relative group">
                                        <img
                                            src={thumb.url}
                                            alt={thumb.name}
                                            className="w-full rounded-lg border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <Button
                                                onClick={() => downloadImage(thumb.url, `${result.videoId}-${thumb.name.toLowerCase().replace(/\s+/g, "-")}.jpg`)}
                                                size="sm"
                                                className="gap-1"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </Button>
                                            <Button
                                                onClick={() => copyUrl(thumb.url, thumb.name)}
                                                size="sm"
                                                variant="secondary"
                                                className="gap-1"
                                            >
                                                {copied === thumb.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{thumb.name}</span>
                                        <span className="text-muted-foreground">{thumb.resolution}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Supported URL Formats</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                        <li>• https://youtu.be/VIDEO_ID</li>
                        <li>• https://youtube.com/shorts/VIDEO_ID</li>
                        <li>• Just the video ID (11 characters)</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
