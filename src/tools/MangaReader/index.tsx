import { useEffect } from "react";
import { BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function MangaReader() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://comick.io/";
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Manga Reader"
            description="Read unlimited manga for free in high quality"
            icon={BookOpen}
            category="Entertainment"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Redirecting to Comick...</h2>
                    <p className="text-muted-foreground">
                        The best place to read free manga online
                    </p>
                </div>
                <Button
                    onClick={() => window.location.href = "https://comick.io/"}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Go to Reader Now
                </Button>
            </div>
        </ToolPageLayout>
    );
}
