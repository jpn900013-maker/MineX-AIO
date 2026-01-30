import { useState } from "react";
import { Hash, Copy, Check, RefreshCw, Sparkles } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Hashtag database by category
const hashtagDatabase: Record<string, string[]> = {
    photography: ["photography", "photooftheday", "photographer", "photo", "instaphoto", "picoftheday", "instagood", "photographylovers", "photoshoot", "photographyislife", "portrait", "naturephotography", "streetphotography", "landscapephotography", "travelphotography"],
    fitness: ["fitness", "gym", "workout", "fitnessmotivation", "fit", "training", "health", "bodybuilding", "motivation", "fitfam", "lifestyle", "exercise", "muscle", "fitnessjourney", "gymlife"],
    food: ["food", "foodie", "foodporn", "instafood", "foodphotography", "foodstagram", "yummy", "delicious", "foodblogger", "cooking", "homemade", "recipe", "foodlover", "healthyfood", "dinner"],
    travel: ["travel", "travelgram", "traveling", "travelphotography", "instatravel", "wanderlust", "travelblogger", "traveltheworld", "vacation", "adventure", "explore", "trip", "tourism", "nature", "travelling"],
    fashion: ["fashion", "style", "ootd", "fashionblogger", "fashionista", "outfit", "fashionstyle", "streetstyle", "instafashion", "model", "beauty", "fashionable", "stylish", "dress", "shopping"],
    business: ["business", "entrepreneur", "success", "motivation", "marketing", "startup", "money", "entrepreneurship", "smallbusiness", "businessowner", "hustle", "mindset", "goals", "leadership", "work"],
    art: ["art", "artist", "artwork", "drawing", "painting", "illustration", "artistsoninstagram", "digitalart", "sketch", "creative", "design", "artoftheday", "instaart", "contemporaryart", "fanart"],
    lifestyle: ["lifestyle", "life", "happy", "love", "instagood", "motivation", "inspiration", "beautiful", "style", "instadaily", "photooftheday", "positivevibes", "happiness", "goals", "mindfulness"],
    tech: ["tech", "technology", "coding", "programming", "developer", "software", "code", "webdeveloper", "javascript", "python", "ai", "innovation", "startup", "gadgets", "computerscience"],
    gaming: ["gaming", "gamer", "videogames", "games", "twitch", "xbox", "playstation", "pc", "streamer", "esports", "gamers", "gamingcommunity", "ps5", "nintendo", "fortnite"],
};

const popularHashtags = ["love", "instagood", "photooftheday", "fashion", "beautiful", "happy", "cute", "tbt", "followme", "picoftheday", "follow", "nature", "style", "instadaily", "travel"];

export default function IgHashtagGenerator() {
    const [topic, setTopic] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    const generateHashtags = () => {
        const hashtags = new Set<string>();

        // Add from selected categories
        selectedCategories.forEach((category) => {
            const categoryTags = hashtagDatabase[category] || [];
            categoryTags.forEach((tag) => hashtags.add(tag));
        });

        // Add from topic keywords
        if (topic.trim()) {
            const keywords = topic.toLowerCase().split(/\s+/);
            keywords.forEach((keyword) => {
                if (keyword.length >= 3) {
                    hashtags.add(keyword);
                    // Check if keyword relates to a category
                    Object.entries(hashtagDatabase).forEach(([category, tags]) => {
                        if (category.includes(keyword) || keyword.includes(category)) {
                            tags.slice(0, 5).forEach((tag) => hashtags.add(tag));
                        }
                    });
                }
            });
        }

        // Add some popular general hashtags
        if (hashtags.size < 10) {
            popularHashtags.slice(0, 5).forEach((tag) => hashtags.add(tag));
        }

        // Shuffle and limit to 30
        const result = Array.from(hashtags)
            .sort(() => Math.random() - 0.5)
            .slice(0, 30);

        setGeneratedHashtags(result);
        toast({ title: "Generated!", description: `${result.length} hashtags created` });
    };

    const copyHashtags = async () => {
        const text = generatedHashtags.map((h) => `#${h}`).join(" ");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({ title: "Copied!", description: "Hashtags copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const removeHashtag = (tag: string) => {
        setGeneratedHashtags((prev) => prev.filter((h) => h !== tag));
    };

    return (
        <ToolPageLayout
            title="IG Hashtag Generator"
            description="Generate relevant Instagram hashtags to boost your reach"
            icon={Hash}
            category="Social Media"
        >
            <div className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Topic or Keywords</label>
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., sunset beach photography"
                        className="bg-background/50"
                    />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Select Categories</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(hashtagDatabase).map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategories.includes(category) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleCategory(category)}
                                className="capitalize"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateHashtags} className="w-full gap-2" size="lg">
                    <Sparkles className="w-4 h-4" />
                    Generate Hashtags
                </Button>

                {/* Results */}
                {generatedHashtags.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">
                                Generated Hashtags ({generatedHashtags.length}/30)
                            </label>
                            <Button onClick={copyHashtags} variant="outline" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy All
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {generatedHashtags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => removeHashtag(tag)}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                    #{tag} ×
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-mono break-all">
                                {generatedHashtags.map((h) => `#${h}`).join(" ")}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Hashtag Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use <strong>20-30 hashtags</strong> per post for maximum reach</li>
                        <li>• Mix popular and niche hashtags</li>
                        <li>• Avoid banned or spammy hashtags</li>
                        <li>• Change hashtags for each post</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
