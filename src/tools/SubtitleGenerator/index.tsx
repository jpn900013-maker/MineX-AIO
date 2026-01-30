import { useEffect } from "react";
import { Subtitles, ExternalLink, Type } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function SubtitleGenerator() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://www.veed.io/tools/auto-subtitle-generator-online";
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Subtitle Generator"
            description="Automatically generate subtitles for your videos using AI"
            icon={Subtitles}
            category="Video"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <Type className="w-8 h-8 text-primary" />
                </div>

                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Redirecting to Veed.io...</h2>
                    <p className="text-muted-foreground">
                        Opening Veed.io's Auto Subtitle Generator.
                        The best free tool for adding captions to videos automatically.
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = "https://www.veed.io/tools/auto-subtitle-generator-online"}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Go to Generator
                </Button>
            </div>
        </ToolPageLayout>
    );
}
