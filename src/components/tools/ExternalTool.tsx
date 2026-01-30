import { useEffect } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

interface ExternalToolProps {
    title: string;
    description: string;
    icon: any;
    category: string;
    targetUrl: string;
    serviceName: string;
    buttonText?: string;
}

export function ExternalTool({
    title,
    description,
    icon: Icon,
    category,
    targetUrl,
    serviceName,
    buttonText = "Open Tool"
}: ExternalToolProps) {
    useEffect(() => {
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
            window.location.href = targetUrl;
        }, 2500);

        return () => clearTimeout(timer);
    }, [targetUrl]);

    return (
        <ToolPageLayout
            title={title}
            description={description}
            icon={Icon}
            category={category}
        >
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    {Icon && <Icon className="w-8 h-8 text-primary" />}
                </div>

                <div className="text-center space-y-4 max-w-lg">
                    <h2 className="text-2xl font-bold">Redirecting...</h2>
                    <p className="text-muted-foreground">
                        Opening <strong>{serviceName}</strong> - the best free tool for this task.
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = targetUrl}
                    size="lg"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    {buttonText}
                </Button>
            </div>
        </ToolPageLayout>
    );
}
