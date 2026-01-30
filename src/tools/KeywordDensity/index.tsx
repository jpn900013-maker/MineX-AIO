import { useState, useMemo } from "react";
import { BarChart3, Copy, Check, Trash2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface KeywordData {
    word: string;
    count: number;
    density: number;
}

// Common stop words to filter out
const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "as", "is", "was", "are", "were", "been", "be",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "must", "shall", "can", "need", "it", "its", "this", "that",
    "these", "those", "i", "you", "he", "she", "we", "they", "what", "which",
    "who", "whom", "how", "when", "where", "why", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "just", "also", "now", "here"
]);

export default function KeywordDensity() {
    const [text, setText] = useState("");
    const [targetKeyword, setTargetKeyword] = useState("");
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const analysis = useMemo(() => {
        if (!text.trim()) {
            return {
                totalWords: 0,
                uniqueWords: 0,
                keywords: [] as KeywordData[],
                targetCount: 0,
                targetDensity: 0,
            };
        }

        // Extract words (3+ characters, letters only)
        const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const totalWords = words.length;

        // Count frequency
        const frequency: Record<string, number> = {};
        words.forEach((word) => {
            if (!STOP_WORDS.has(word)) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });

        // Convert to array and sort by count
        const keywords: KeywordData[] = Object.entries(frequency)
            .map(([word, count]) => ({
                word,
                count,
                density: totalWords > 0 ? (count / totalWords) * 100 : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30);

        // Target keyword analysis
        const targetWords = targetKeyword.toLowerCase().trim().split(/\s+/);
        let targetCount = 0;
        if (targetKeyword.trim()) {
            const textLower = text.toLowerCase();
            const regex = new RegExp(targetKeyword.toLowerCase().trim(), "gi");
            const matches = textLower.match(regex);
            targetCount = matches ? matches.length : 0;
        }
        const targetDensity = totalWords > 0 ? (targetCount / totalWords) * 100 : 0;

        return {
            totalWords,
            uniqueWords: Object.keys(frequency).length,
            keywords,
            targetCount,
            targetDensity,
        };
    }, [text, targetKeyword]);

    const copyResults = async () => {
        const results = analysis.keywords
            .map((k) => `${k.word}: ${k.count} (${k.density.toFixed(2)}%)`)
            .join("\n");

        try {
            await navigator.clipboard.writeText(results);
            setCopied(true);
            toast({ title: "Copied!", description: "Results copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const clearAll = () => {
        setText("");
        setTargetKeyword("");
    };

    const getDensityColor = (density: number): string => {
        if (density >= 3) return "text-destructive";
        if (density >= 2) return "text-yellow-500";
        if (density >= 1) return "text-green-500";
        return "text-muted-foreground";
    };

    const getDensityAdvice = (density: number): string => {
        if (density >= 3) return "⚠️ Too high - may appear as keyword stuffing";
        if (density >= 2) return "✓ Good density";
        if (density >= 1) return "✓ Acceptable";
        if (density > 0) return "↗ Could be higher";
        return "Add your target keyword";
    };

    return (
        <ToolPageLayout
            title="Keyword Density"
            description="Analyze keyword frequency and density in your content for SEO optimization"
            icon={BarChart3}
            category="SEO"
        >
            <div className="space-y-6">
                {/* Target Keyword */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Target Keyword</label>
                        <Input
                            value={targetKeyword}
                            onChange={(e) => setTargetKeyword(e.target.value)}
                            placeholder="Enter your target keyword or phrase..."
                            className="bg-background/50"
                        />
                    </div>

                    {targetKeyword && (
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm text-muted-foreground">Found: </span>
                                <span className="font-bold">{analysis.targetCount} times</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Density: </span>
                                <span className={`font-bold ${getDensityColor(analysis.targetDensity)}`}>
                                    {analysis.targetDensity.toFixed(2)}%
                                </span>
                            </div>
                            <span className="text-sm">
                                {getDensityAdvice(analysis.targetDensity)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Content to Analyze</label>
                        <Button onClick={clearAll} variant="ghost" size="sm" className="gap-1">
                            <Trash2 className="w-3 h-3" />
                            Clear
                        </Button>
                    </div>
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your content here to analyze keyword density..."
                        className="min-h-[200px] bg-background/50"
                    />
                </div>

                {/* Stats */}
                {analysis.totalWords > 0 && (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-2xl font-bold text-primary">{analysis.totalWords}</p>
                                <p className="text-sm text-muted-foreground">Total Words</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold text-foreground">{analysis.uniqueWords}</p>
                                <p className="text-sm text-muted-foreground">Unique Words</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-2xl font-bold text-foreground">{analysis.keywords.length}</p>
                                <p className="text-sm text-muted-foreground">Top Keywords</p>
                            </div>
                        </div>

                        {/* Keywords Table */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Top Keywords (excluding common words)
                                </label>
                                <Button onClick={copyResults} variant="ghost" size="sm" className="gap-1">
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy
                                </Button>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Keyword</th>
                                            <th className="text-center p-3 font-medium">Count</th>
                                            <th className="text-center p-3 font-medium">Density</th>
                                            <th className="p-3 font-medium">Distribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.keywords.slice(0, 15).map((kw, i) => (
                                            <tr key={kw.word} className="border-t">
                                                <td className="p-3 font-mono">{kw.word}</td>
                                                <td className="p-3 text-center">{kw.count}</td>
                                                <td className={`p-3 text-center font-medium ${getDensityColor(kw.density)}`}>
                                                    {kw.density.toFixed(2)}%
                                                </td>
                                                <td className="p-3">
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full"
                                                            style={{ width: `${Math.min(kw.density * 20, 100)}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Keyword Density Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>1-2%</strong> is generally considered optimal for primary keywords</li>
                        <li>• <strong>Avoid 3%+</strong> which may trigger keyword stuffing penalties</li>
                        <li>• Focus on natural language and user readability</li>
                        <li>• Use variations and related terms (LSI keywords)</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
