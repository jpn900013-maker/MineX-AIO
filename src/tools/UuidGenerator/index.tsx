import { useState } from "react";
import { Fingerprint, Copy, Check, RefreshCw, Download, Trash2 } from "lucide-react";
import { v1 as uuidv1, v4 as uuidv4 } from "uuid";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

type UuidVersion = "v1" | "v4";

export default function UuidGenerator() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [version, setVersion] = useState<UuidVersion>("v4");
    const [count, setCount] = useState(1);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const generateUuids = () => {
        const newUuids: string[] = [];
        for (let i = 0; i < count; i++) {
            if (version === "v1") {
                newUuids.push(uuidv1());
            } else {
                newUuids.push(uuidv4());
            }
        }
        setUuids(newUuids);
        toast({ title: "Generated!", description: `${count} UUID(s) generated` });
    };

    const copyToClipboard = async (text?: string) => {
        try {
            await navigator.clipboard.writeText(text || uuids.join("\n"));
            setCopied(true);
            toast({ title: "Copied!", description: "UUID(s) copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Failed to copy",
                description: "Could not copy to clipboard",
                variant: "destructive"
            });
        }
    };

    const downloadAsFile = () => {
        const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `uuids-${version}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded!", description: "UUIDs saved to file" });
    };

    const clearAll = () => {
        setUuids([]);
    };

    return (
        <ToolPageLayout
            title="UUID Generator"
            description="Generate random UUIDs (v1, v4) for your applications. Supports bulk generation."
            icon={Fingerprint}
            category="Generator"
        >
            <div className="space-y-6">
                {/* Version Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">UUID Version</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setVersion("v1")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${version === "v1"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            UUID v1 (Time-based)
                        </button>
                        <button
                            onClick={() => setVersion("v4")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${version === "v4"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            UUID v4 (Random)
                        </button>
                    </div>
                </div>

                {/* Count Selection */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Number of UUIDs</label>
                        <span className="text-sm font-medium text-primary">{count}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[count]}
                            onValueChange={(v) => setCount(v[0])}
                            min={1}
                            max={100}
                            step={1}
                            className="flex-1"
                        />
                        <Input
                            type="number"
                            value={count}
                            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-20"
                            min={1}
                            max={100}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={generateUuids} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Generate
                    </Button>
                    <Button
                        onClick={() => copyToClipboard()}
                        variant="secondary"
                        className="gap-2"
                        disabled={uuids.length === 0}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy All"}
                    </Button>
                    <Button
                        onClick={downloadAsFile}
                        variant="outline"
                        className="gap-2"
                        disabled={uuids.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                    <Button
                        onClick={clearAll}
                        variant="ghost"
                        className="gap-2"
                        disabled={uuids.length === 0}
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </Button>
                </div>

                {/* Single UUID Quick Copy */}
                {uuids.length === 1 && (
                    <div className="flex items-center gap-2">
                        <Input
                            value={uuids[0]}
                            readOnly
                            className="font-mono bg-background/50"
                        />
                        <Button
                            onClick={() => copyToClipboard(uuids[0])}
                            variant="outline"
                            size="icon"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Multiple UUIDs Display */}
                {uuids.length > 1 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Generated UUIDs ({uuids.length})
                        </label>
                        <Textarea
                            value={uuids.join("\n")}
                            readOnly
                            className="min-h-[300px] font-mono text-sm bg-background/50"
                        />
                    </div>
                )}

                {/* UUID Info */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h3 className="font-medium text-foreground">About UUID Versions</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li><strong>UUID v1:</strong> Generated using timestamp and MAC address. Useful when you need time-ordered UUIDs.</li>
                        <li><strong>UUID v4:</strong> Completely random. Best for general-purpose unique identifiers.</li>
                    </ul>
                </div>
            </div>
        </ToolPageLayout>
    );
}
