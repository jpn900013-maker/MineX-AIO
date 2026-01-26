import { useEffect } from "react";
import { FileDown, ExternalLink, BookOpen } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

export default function ScribdDownloader() {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = "https://scribd.vpdfs.com/";
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <ToolPageLayout
            title="Scribd Downloader"
            description="Download documents from Scribd, Issuu, SlideShare, and more for free"
            icon={BookOpen}
            category="PDF"
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <FileDown className="w-8 h-8 text-primary" />
                </div>

                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Redirecting to VPDFs...</h2>
                    <p className="text-muted-foreground">
                        Opening the best reliable Scribd document downloader.
                        Please verify you are human if asked.
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = "https://scribd.vpdfs.com/"}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Go to Downloader
                </Button>
            </div>
        </ToolPageLayout>
    );
}
