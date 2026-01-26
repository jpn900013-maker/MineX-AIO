import { useState } from "react";
import { MessageSquare, Copy, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CAPTIONS = [
    "Vibes only. ✨",
    "Chasing sunsets. 🌅",
    "Life is better when you're laughing. 😂",
    "Coffee first, schemes later. ☕",
    "Not all those who wander are lost. 🌍",
    "Do more things that make you forget to check your phone. 📵",
    "Sunday Funday! ☀️",
    "Selfie game strong. 📸",
    "Just me being me. 🤷‍♂️",
    "Making memories. 💭",
];

export default function IgCaptionGenerator() {
    const [caption, setCaption] = useState("");
    const { toast } = useToast();

    const generateCaption = () => {
        const random = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
        setCaption(random);
    };

    const copyCaption = () => {
        navigator.clipboard.writeText(caption);
        toast({ title: "Copied!", description: "Caption copied to clipboard" });
    };

    return (
        <ToolPageLayout
            title="IG Caption Generator"
            description="Generate catchy captions for your posts"
            icon={MessageSquare}
            category="Instagram"
        >
            <div className="max-w-md mx-auto space-y-6">
                <div className="p-6 bg-muted/30 rounded-xl border border-white/5 min-h-[100px] flex items-center justify-center text-center relative group">
                    {caption ? (
                        <p className="text-lg font-medium">{caption}</p>
                    ) : (
                        <p className="text-muted-foreground">Click generate to get a caption!</p>
                    )}

                    {caption && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={copyCaption}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <Button onClick={generateCaption} className="w-full gap-2" size="lg">
                    <RefreshCw className="w-4 h-4" />
                    Generate Caption
                </Button>
            </div>
        </ToolPageLayout>
    );
}
