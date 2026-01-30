import { ArrowLeft, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";
// BannerAd removed per user request

interface ToolPageLayoutProps {
    title: string;
    description: string;
    icon: LucideIcon;
    category: string;
    children: React.ReactNode;
}

export function ToolPageLayout({
    title,
    description,
    icon: Icon,
    category,
    children
}: ToolPageLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className={cn(
                        "flex items-center gap-2 text-muted-foreground hover:text-foreground",
                        "transition-colors duration-200 mb-8"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Tools</span>
                </button>

                {/* Tool Header */}
                <div className="flex items-start gap-4 mb-8">
                    <div className={cn(
                        "p-3 rounded-xl",
                        "bg-gradient-to-br from-primary/20 to-accent/20",
                        "border border-primary/20"
                    )}>
                        <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
                            <span className="px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded-full">
                                {category}
                            </span>
                        </div>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                </div>

                {/* Tool Content */}
                <div className="glass rounded-xl p-6 md:p-8">
                    {children}
                </div>

                {/* Ad Banner Removed */}
            </main>
            <Footer />
        </div>
    );
}
