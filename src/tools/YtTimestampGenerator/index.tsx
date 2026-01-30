import { useState } from "react";
import { Clock, Plus, Trash2, Copy, Check, ArrowUp, ArrowDown } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Timestamp {
    id: string;
    time: string;
    label: string;
}

export default function YtTimestampGenerator() {
    const [timestamps, setTimestamps] = useState<Timestamp[]>([
        { id: "1", time: "0:00", label: "Intro" },
    ]);
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const addTimestamp = () => {
        const newId = Date.now().toString();
        setTimestamps([...timestamps, { id: newId, time: "", label: "" }]);
    };

    const removeTimestamp = (id: string) => {
        if (timestamps.length === 1) {
            toast({ title: "Can't remove", description: "At least one timestamp is required", variant: "destructive" });
            return;
        }
        setTimestamps(timestamps.filter((t) => t.id !== id));
    };

    const updateTimestamp = (id: string, field: "time" | "label", value: string) => {
        setTimestamps(
            timestamps.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
    };

    const moveTimestamp = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === timestamps.length - 1)
        ) {
            return;
        }

        const newTimestamps = [...timestamps];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newTimestamps[index], newTimestamps[targetIndex]] = [
            newTimestamps[targetIndex],
            newTimestamps[index],
        ];
        setTimestamps(newTimestamps);
    };

    const formatTime = (input: string): string => {
        // Remove non-numeric characters except colons
        const cleaned = input.replace(/[^\d:]/g, "");

        // If just numbers, format as time
        if (!cleaned.includes(":")) {
            const num = parseInt(cleaned);
            if (isNaN(num)) return cleaned;

            const hours = Math.floor(num / 3600);
            const minutes = Math.floor((num % 3600) / 60);
            const seconds = num % 60;

            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            }
            return `${minutes}:${String(seconds).padStart(2, "0")}`;
        }

        return cleaned;
    };

    const generateOutput = () => {
        const validTimestamps = timestamps.filter((t) => t.time && t.label);

        if (validTimestamps.length === 0) {
            toast({ title: "No timestamps", description: "Add at least one timestamp with time and label", variant: "destructive" });
            return;
        }

        const formatted = validTimestamps
            .map((t) => `${formatTime(t.time)} ${t.label}`)
            .join("\n");

        setOutput(formatted);
        toast({ title: "Generated!", description: `${validTimestamps.length} timestamp(s) formatted` });
    };

    const copyToClipboard = async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            toast({ title: "Copied!", description: "Timestamps copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const loadSample = () => {
        setTimestamps([
            { id: "1", time: "0:00", label: "Introduction" },
            { id: "2", time: "1:30", label: "Chapter 1: Getting Started" },
            { id: "3", time: "5:45", label: "Chapter 2: Main Content" },
            { id: "4", time: "12:00", label: "Chapter 3: Advanced Topics" },
            { id: "5", time: "20:30", label: "Conclusion & Summary" },
            { id: "6", time: "22:00", label: "Outro" },
        ]);
    };

    const clearAll = () => {
        setTimestamps([{ id: "1", time: "0:00", label: "Intro" }]);
        setOutput("");
    };

    return (
        <ToolPageLayout
            title="YT Timestamp Generator"
            description="Create clickable timestamps for YouTube video chapters"
            icon={Clock}
            category="YouTube"
        >
            <div className="space-y-6">
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={addTimestamp} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Timestamp
                    </Button>
                    <Button onClick={generateOutput} variant="secondary">
                        Generate Output
                    </Button>
                    <Button onClick={loadSample} variant="outline" size="sm">
                        Load Sample
                    </Button>
                    <Button onClick={clearAll} variant="ghost" size="sm">
                        Clear All
                    </Button>
                </div>

                {/* Timestamps List */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        Timestamps ({timestamps.length})
                    </label>
                    <div className="space-y-2">
                        {timestamps.map((ts, index) => (
                            <div key={ts.id} className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    <Button
                                        onClick={() => moveTimestamp(index, "up")}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        onClick={() => moveTimestamp(index, "down")}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        disabled={index === timestamps.length - 1}
                                    >
                                        <ArrowDown className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Input
                                    value={ts.time}
                                    onChange={(e) => updateTimestamp(ts.id, "time", e.target.value)}
                                    placeholder="0:00"
                                    className="w-24 font-mono bg-background/50"
                                />
                                <Input
                                    value={ts.label}
                                    onChange={(e) => updateTimestamp(ts.id, "label", e.target.value)}
                                    placeholder="Chapter title..."
                                    className="flex-1 bg-background/50"
                                />
                                <Button
                                    onClick={() => removeTimestamp(ts.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Output */}
                {output && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">
                                Generated Timestamps (Copy to YouTube Description)
                            </label>
                            <Button onClick={copyToClipboard} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                            </Button>
                        </div>
                        <Textarea
                            value={output}
                            readOnly
                            className="min-h-[150px] font-mono bg-background/50"
                        />
                    </div>
                )}

                {/* Tips */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Tips for YouTube Chapters</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• First timestamp must start at <strong>0:00</strong></li>
                        <li>• You need at least <strong>3 timestamps</strong> for chapters to work</li>
                        <li>• Each chapter must be at least <strong>10 seconds</strong> long</li>
                        <li>• Paste the timestamps in your video description</li>
                        <li>• Time formats: 0:00, 1:30, 1:05:30 (for videos over 1 hour)</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
