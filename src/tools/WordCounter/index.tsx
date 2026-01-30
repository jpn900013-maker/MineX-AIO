import { useState, useMemo } from "react";
import { Type, Copy, Check, Trash2, Clock, BarChart3 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface WordStats {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
    readingTime: string;
    speakingTime: string;
}

export default function WordCounter() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const stats = useMemo((): WordStats => {
        if (!text) {
            return {
                characters: 0,
                charactersNoSpaces: 0,
                words: 0,
                sentences: 0,
                paragraphs: 0,
                lines: 0,
                readingTime: "0 sec",
                speakingTime: "0 sec",
            };
        }

        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, "").length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
        const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;
        const lines = text.split(/\n/).length;

        // Average reading speed: 200-250 words per minute
        const readingMinutes = words / 225;
        const readingTime = readingMinutes < 1
            ? `${Math.ceil(readingMinutes * 60)} sec`
            : `${Math.ceil(readingMinutes)} min`;

        // Average speaking speed: 125-150 words per minute
        const speakingMinutes = words / 137;
        const speakingTime = speakingMinutes < 1
            ? `${Math.ceil(speakingMinutes * 60)} sec`
            : `${Math.ceil(speakingMinutes)} min`;

        return {
            characters,
            charactersNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTime,
            speakingTime,
        };
    }, [text]);

    const keywordDensity = useMemo(() => {
        if (!text.trim()) return [];

        const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const frequency: Record<string, number> = {};

        words.forEach((word) => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({
                word,
                count,
                percentage: ((count / words.length) * 100).toFixed(1),
            }));
    }, [text]);

    const copyStats = async () => {
        const statsText = `
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading Time: ${stats.readingTime}
Speaking Time: ${stats.speakingTime}
    `.trim();

        try {
            await navigator.clipboard.writeText(statsText);
            setCopied(true);
            toast({ title: "Copied!", description: "Stats copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const clearText = () => {
        setText("");
    };

    return (
        <ToolPageLayout
            title="Word Counter"
            description="Count words, characters, sentences, paragraphs, and estimate reading time"
            icon={Type}
            category="Text"
        >
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                        <p className="text-3xl font-bold text-primary">{stats.words}</p>
                        <p className="text-sm text-muted-foreground">Words</p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg text-center">
                        <p className="text-3xl font-bold text-accent">{stats.characters}</p>
                        <p className="text-sm text-muted-foreground">Characters</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-3xl font-bold text-foreground">{stats.sentences}</p>
                        <p className="text-sm text-muted-foreground">Sentences</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-3xl font-bold text-foreground">{stats.paragraphs}</p>
                        <p className="text-sm text-muted-foreground">Paragraphs</p>
                    </div>
                </div>

                {/* Time Estimates */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                            <span className="text-muted-foreground">Reading: </span>
                            <span className="font-medium">{stats.readingTime}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                            <span className="text-muted-foreground">Speaking: </span>
                            <span className="font-medium">{stats.speakingTime}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                        <span className="text-sm">
                            <span className="text-muted-foreground">Lines: </span>
                            <span className="font-medium">{stats.lines}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                        <span className="text-sm">
                            <span className="text-muted-foreground">Chars (no spaces): </span>
                            <span className="font-medium">{stats.charactersNoSpaces}</span>
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button onClick={copyStats} variant="outline" className="gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy Stats
                    </Button>
                    <Button onClick={clearText} variant="ghost" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </Button>
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Enter your text</label>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your text here..."
                        className="min-h-[250px] bg-background/50"
                    />
                </div>

                {/* Keyword Density */}
                {keywordDensity.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-medium text-foreground">Top Keywords</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {keywordDensity.map((kw) => (
                                <div
                                    key={kw.word}
                                    className="p-2 bg-muted/50 rounded text-sm flex justify-between"
                                >
                                    <span className="font-mono truncate">{kw.word}</span>
                                    <span className="text-muted-foreground ml-2">{kw.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
