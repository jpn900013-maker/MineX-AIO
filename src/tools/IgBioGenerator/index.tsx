import { useState } from "react";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const BIOS = [
    "✨ Living life one pixel at a time\n📍 Earth\n👇 Check my links",
    "🚀 Building the future\n💻 Developer | Creator\n🌐 Portfolio below",
    "📸 Capturing moments\n🎨 Artist\n✉️ DM for collabs",
    "🌟 Dream big, work hard\n💪 Fitness addict\n🥑 Healthy lifestyle",
    "✈️ Travel enthusiast\n🌍 Exploring the world\n📍 Currently in: [City]",
    "🎵 Music is my life\n🎧 Spotify playlist below\n🎹 Pianist",
    "🎮 Leveling up IRL\n🕹️ Gamer for life\n🔴 Live on Twitch",
];

export default function IgBioGenerator() {
    const [bio, setBio] = useState("");
    const { toast } = useToast();

    const generateBio = () => {
        const random = BIOS[Math.floor(Math.random() * BIOS.length)];
        setBio(random);
    };

    const copyBio = () => {
        navigator.clipboard.writeText(bio);
        toast({ title: "Copied!", description: "Bio copied to clipboard" });
    };

    return (
        <ToolPageLayout
            title="IG Bio Generator"
            description="Generate aesthetic and engaging Instagram bios"
            icon={Sparkles}
            category="Instagram"
        >
            <div className="max-w-md mx-auto space-y-6">
                <div className="p-6 bg-muted/30 rounded-xl border border-white/5 min-h-[150px] flex items-center justify-center text-center whitespace-pre-line relative group">
                    {bio ? (
                        <p className="text-lg font-medium">{bio}</p>
                    ) : (
                        <p className="text-muted-foreground">Click generate to get a bio!</p>
                    )}

                    {bio && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={copyBio}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <Button onClick={generateBio} className="w-full gap-2" size="lg">
                    <RefreshCw className="w-4 h-4" />
                    Generate Bio
                </Button>
            </div>
        </ToolPageLayout>
    );
}
