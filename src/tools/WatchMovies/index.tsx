import { useEffect } from "react";
import { Tv, ExternalLink, Loader2, Film, Play } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function WatchMovies() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://aniflux.qzz.io/";
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Watch Movies & TV"
            description="Stream the latest movies and TV shows for free"
            icon={Film}
            category="Entertainment"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Redirecting to AniFlux...</h2>
                    <p className="text-muted-foreground">
                        Your destination for free HD movies & TV shows
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = "https://aniflux.qzz.io/"}
                    size="lg"
                    className="gap-2"
                >
                    <Play className="w-4 h-4" />
                    Watch Now
                </Button>

                <p className="text-xs text-muted-foreground">
                    You'll be redirected automatically in a few seconds
                </p>
            </div>
        </ToolPageLayout>
    );
}
