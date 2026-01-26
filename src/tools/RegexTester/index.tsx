import { useState, useMemo } from "react";
import { Regex, Copy, Check, Trash2, BookOpen } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

const commonPatterns = [
    { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)" },
    { name: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}" },
    { name: "IP Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
    { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
    { name: "Hex Color", pattern: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})" },
    { name: "Username", pattern: "^[a-zA-Z0-9_]{3,16}$" },
    { name: "Strong Password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" },
];

export default function RegexTester() {
    const [pattern, setPattern] = useState("");
    const [testText, setTestText] = useState("Hello world!\ntest@example.com\n192.168.1.1\nhttps://example.com");
    const [flags, setFlags] = useState({ g: true, i: false, m: true });
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const result = useMemo(() => {
        if (!pattern) return { matches: [], error: null };

        try {
            const flagString = Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag)
                .join("");

            const regex = new RegExp(pattern, flagString);
            const matches: { match: string; index: number; groups?: string[] }[] = [];

            let match;
            if (flags.g) {
                while ((match = regex.exec(testText)) !== null) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            } else {
                match = regex.exec(testText);
                if (match) {
                    matches.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1)
                    });
                }
            }

            return { matches, error: null };
        } catch (e) {
            return { matches: [], error: (e as Error).message };
        }
    }, [pattern, testText, flags]);

    const highlightedText = useMemo(() => {
        if (!pattern || result.error || result.matches.length === 0) {
            return testText;
        }

        try {
            const flagString = Object.entries(flags)
                .filter(([_, enabled]) => enabled)
                .map(([flag]) => flag)
                .join("");
            const regex = new RegExp(pattern, flagString);
            return testText.replace(regex, (match) => `【${match}】`);
        } catch {
            return testText;
        }
    }, [pattern, testText, flags, result]);

    const copyPattern = async () => {
        try {
            await navigator.clipboard.writeText(pattern);
            setCopied(true);
            toast({ title: "Copied!", description: "Pattern copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const loadPattern = (p: string) => {
        setPattern(p);
    };

    const clearAll = () => {
        setPattern("");
        setTestText("");
    };

    return (
        <ToolPageLayout
            title="Regex Tester"
            description="Test and debug regular expressions in real-time with match highlighting"
            icon={Regex}
            category="Developer"
        >
            <div className="space-y-6">
                {/* Pattern Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Regular Expression</label>
                        <div className="flex gap-2">
                            <Button onClick={copyPattern} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                            </Button>
                            <Button onClick={clearAll} variant="ghost" size="sm" className="gap-1">
                                <Trash2 className="w-3 h-3" />
                                Clear
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-lg">/</span>
                        <Input
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="Enter regex pattern..."
                            className="font-mono bg-background/50"
                        />
                        <span className="text-muted-foreground text-lg">/</span>
                        <span className="font-mono text-primary">
                            {Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join("")}
                        </span>
                    </div>
                </div>

                {/* Flags */}
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="flag-g"
                            checked={flags.g}
                            onCheckedChange={(checked) => setFlags({ ...flags, g: !!checked })}
                        />
                        <label htmlFor="flag-g" className="text-sm">
                            <span className="font-mono text-primary">g</span> - Global
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="flag-i"
                            checked={flags.i}
                            onCheckedChange={(checked) => setFlags({ ...flags, i: !!checked })}
                        />
                        <label htmlFor="flag-i" className="text-sm">
                            <span className="font-mono text-primary">i</span> - Case insensitive
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="flag-m"
                            checked={flags.m}
                            onCheckedChange={(checked) => setFlags({ ...flags, m: !!checked })}
                        />
                        <label htmlFor="flag-m" className="text-sm">
                            <span className="font-mono text-primary">m</span> - Multiline
                        </label>
                    </div>
                </div>

                {/* Error Display */}
                {result.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        <p className="text-sm font-mono">{result.error}</p>
                    </div>
                )}

                {/* Test Text and Results */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Test String</label>
                        <Textarea
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            placeholder="Enter text to test against..."
                            className="min-h-[250px] font-mono text-sm bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Matches ({result.matches.length})
                        </label>
                        <div className="min-h-[250px] p-4 bg-background/50 rounded-lg border font-mono text-sm overflow-auto">
                            {result.matches.length > 0 ? (
                                <div className="space-y-2">
                                    {result.matches.map((m, i) => (
                                        <div key={i} className="p-2 bg-primary/10 rounded">
                                            <span className="text-muted-foreground">Match {i + 1}: </span>
                                            <span className="text-primary font-medium">"{m.match}"</span>
                                            <span className="text-muted-foreground text-xs ml-2">at index {m.index}</span>
                                            {m.groups && m.groups.length > 0 && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    Groups: {m.groups.map((g, j) => `$${j + 1}="${g}"`).join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No matches found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Common Patterns */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-medium text-foreground">Common Patterns</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {commonPatterns.map((p) => (
                            <Button
                                key={p.name}
                                variant="outline"
                                size="sm"
                                onClick={() => loadPattern(p.pattern)}
                                className="text-xs"
                            >
                                {p.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
