import { useState } from "react";
import { Twitter, Copy, Check, RefreshCw, Sparkles, AtSign, Hash } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type TweetType = "promotional" | "engaging" | "informative" | "funny" | "question";

const tweetTemplates: Record<TweetType, string[]> = {
    promotional: [
        "🚀 Excited to announce {topic}! This is going to be a game-changer. Stay tuned for more updates! #launch",
        "We just launched {topic}! Check it out and let us know what you think 👇",
        "NEW: {topic} is here! We've been working hard on this and can't wait for you to try it.",
        "Big news! {topic} - Link in bio 🔗 #newrelease",
    ],
    engaging: [
        "What's your take on {topic}? Drop your thoughts below 👇",
        "Hot take: {topic}. Agree or disagree? Let's discuss!",
        "The best thing about {topic} is... (finish this sentence)",
        "Let's settle this once and for all. {topic} - yes or no?",
    ],
    informative: [
        "Did you know? {topic}. Here's what you need to know 🧵",
        "Quick tip about {topic}: This will save you hours of work.",
        "{topic} - A thread explaining everything you need to know ⬇️",
        "The truth about {topic} that nobody tells you:",
    ],
    funny: [
        "Me trying to explain {topic} to my friends: 🤡",
        "POV: You just discovered {topic} for the first time",
        "Nobody: Absolutely nobody: Me: *obsessing over {topic}*",
        "Thinking about {topic} at 3am hits different 😂",
    ],
    question: [
        "What's your experience with {topic}? I'm curious to hear your stories!",
        "Quick poll: How do you feel about {topic}? 🤔",
        "Question for my followers: {topic} - what am I missing?",
        "Help me understand: Why is {topic} such a big deal?",
    ],
};

export default function TweetGenerator() {
    const [topic, setTopic] = useState("");
    const [tweetType, setTweetType] = useState<TweetType>("engaging");
    const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
    const [customTweet, setCustomTweet] = useState("");
    const [copied, setCopied] = useState<number | null>(null);
    const { toast } = useToast();

    const generateTweets = () => {
        if (!topic.trim()) {
            toast({ title: "Enter a topic", description: "Please enter a topic for your tweets", variant: "destructive" });
            return;
        }

        const templates = tweetTemplates[tweetType];
        const tweets = templates.map((template) =>
            template.replace(/{topic}/g, topic.trim())
        );

        // Shuffle and add variety
        const shuffled = tweets.sort(() => Math.random() - 0.5);
        setGeneratedTweets(shuffled);
        toast({ title: "Generated!", description: `${shuffled.length} tweets created` });
    };

    const copyTweet = async (tweet: string, index: number) => {
        try {
            await navigator.clipboard.writeText(tweet);
            setCopied(index);
            toast({ title: "Copied!", description: "Tweet copied to clipboard" });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const tweetOnTwitter = (tweet: string) => {
        const encoded = encodeURIComponent(tweet);
        window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
    };

    const getCharacterCount = (text: string) => {
        const count = text.length;
        const color = count > 280 ? "text-destructive" : count > 260 ? "text-yellow-500" : "text-muted-foreground";
        return <span className={`text-xs ${color}`}>{count}/280</span>;
    };

    return (
        <ToolPageLayout
            title="Tweet Generator"
            description="Generate engaging tweets for any topic or announcement"
            icon={Twitter}
            category="Social Media"
        >
            <div className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Topic</label>
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., our new product, AI technology, morning coffee"
                        className="bg-background/50"
                    />
                </div>

                {/* Tweet Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Tweet Style</label>
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(tweetTemplates) as TweetType[]).map((type) => (
                            <Button
                                key={type}
                                variant={tweetType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTweetType(type)}
                                className="capitalize"
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateTweets} className="w-full gap-2" size="lg">
                    <Sparkles className="w-4 h-4" />
                    Generate Tweets
                </Button>

                {/* Generated Tweets */}
                {generatedTweets.length > 0 && (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Generated Tweets</label>
                        {generatedTweets.map((tweet, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <p className="text-sm">{tweet}</p>
                                <div className="flex items-center justify-between">
                                    {getCharacterCount(tweet)}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => copyTweet(tweet, index)}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            {copied === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            Copy
                                        </Button>
                                        <Button
                                            onClick={() => tweetOnTwitter(tweet)}
                                            variant="outline"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            <Twitter className="w-3 h-3" />
                                            Tweet
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custom Tweet Editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Edit or Write Your Own</label>
                        {getCharacterCount(customTweet)}
                    </div>
                    <Textarea
                        value={customTweet}
                        onChange={(e) => setCustomTweet(e.target.value)}
                        placeholder="Write your own tweet or edit a generated one..."
                        className="min-h-[100px] bg-background/50"
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={() => copyTweet(customTweet, -1)}
                            variant="outline"
                            disabled={!customTweet}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                        </Button>
                        <Button
                            onClick={() => tweetOnTwitter(customTweet)}
                            disabled={!customTweet || customTweet.length > 280}
                        >
                            <Twitter className="w-4 h-4 mr-2" />
                            Tweet Now
                        </Button>
                    </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Tweet Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Keep under <strong>280 characters</strong></li>
                        <li>• Use 1-2 hashtags max for better engagement</li>
                        <li>• Ask questions to boost replies</li>
                        <li>• Post during peak hours (9am-12pm, 7pm-9pm)</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
