import { useState } from "react";
import { ListChecks, Copy, Twitter } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ThreadMaker() {
    const [text, setText] = useState("");
    const [tweets, setTweets] = useState<string[]>([]);
    const { toast } = useToast();

    const generateThread = () => {
        if (!text.trim()) return;

        // Split by sentences roughly or fixed length
        // Twitter limit is 280. We'll aim for 270 to be safe with numbering.
        const words = text.split(" ");
        const chunks: string[] = [];
        let currentChunk = "";

        words.forEach((word) => {
            if ((currentChunk + word).length > 260) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            currentChunk += `${word} `;
        });
        if (currentChunk) chunks.push(currentChunk.trim());

        // Add numbering
        const threaded = chunks.map((chunk, i) => `${chunk} (${i + 1}/${chunks.length})`);
        setTweets(threaded);
    };

    const copyTweet = (tweet: string) => {
        navigator.clipboard.writeText(tweet);
        toast({ title: "Copied!", description: "Tweet copied to clipboard" });
    };

    return (
        <ToolPageLayout
            title="Thread Maker"
            description="Split long text into Twitter/X threads automatically"
            icon={ListChecks}
            category="Twitter"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-muted-foreground">Enter your long text:</label>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your long article or story here..."
                        className="h-48 bg-background/50"
                    />
                    <Button onClick={generateThread} disabled={!text.trim()} className="w-full gap-2">
                        <Twitter className="w-4 h-4" />
                        Generate Thread
                    </Button>
                </div>

                {tweets.length > 0 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Your Thread ({tweets.length} tweets)</h3>
                        </div>

                        <div className="space-y-4">
                            {tweets.map((tweet, i) => (
                                <div key={i} className="p-4 rounded-xl bg-muted/30 border border-white/5 hover:border-primary/30 transition-colors relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" onClick={() => copyTweet(tweet)}>
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <p className="whitespace-pre-wrap pr-8">{tweet}</p>
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                                        <span>{tweet.length} chars</span>
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {i + 1}/{tweets.length}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
