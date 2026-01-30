import { useEffect } from "react";
import { Scissors, ExternalLink, Film } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function VideoTrimmer() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://online-video-cutter.com/";
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Video Trimmer"
            description="Trim and cut video files online without installing software"
            icon={Scissors}
            category="Video"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <Film className="w-8 h-8 text-primary" />
                </div>

                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Redirecting to Trimmer...</h2>
                    <p className="text-muted-foreground">
                        Opening the trusted 123Apps Video Cutter.
                        Fast, secure, and easy to use in your browser.
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = "https://online-video-cutter.com/"}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Go to Trimmer
                </Button>
            </div>
        </ToolPageLayout>
    );
}
