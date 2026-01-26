import { useEffect } from "react";
import { Download, ExternalLink, Video } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function YtDownloader() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://cobalt.tools/";
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Universal Video Downloader"
            description="Download high-quality videos from YouTube, Twitter/X, TikTok, Instagram, and more (No Ads)"
            icon={Video}
            category="YouTube"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <Download className="w-8 h-8 text-primary" />
                </div>

                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Opening Cobalt.tools...</h2>
                    <p className="text-muted-foreground">
                        We are redirecting you to Cobalt - the best open-source, ad-free video downloader.
                        It supports YouTube, Twitch, TikTok, Twitter, Instagram, and more.
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = "https://cobalt.tools/"}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Go to Downloader
                </Button>

                <p className="text-xs text-muted-foreground">
                    Redirecting automatically...
                </p>
            </div>
        </ToolPageLayout>
    );
}
