import { useState } from "react";
import { FileJson, Copy, Check, Trash2, Minimize2, Maximize2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function JsonFormatter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const formatJson = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast({ title: "Success", description: "JSON formatted successfully!" });
        } catch (e) {
            setError((e as Error).message);
            setOutput("");
        }
    };

    const minifyJson = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
            toast({ title: "Success", description: "JSON minified successfully!" });
        } catch (e) {
            setError((e as Error).message);
            setOutput("");
        }
    };

    const validateJson = () => {
        try {
            JSON.parse(input);
            setError(null);
            toast({ title: "Valid JSON", description: "Your JSON is valid!" });
        } catch (e) {
            setError((e as Error).message);
            toast({
                title: "Invalid JSON",
                description: (e as Error).message,
                variant: "destructive"
            });
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(output || input);
            setCopied(true);
            toast({ title: "Copied!", description: "Content copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Failed to copy",
                description: "Could not copy to clipboard",
                variant: "destructive"
            });
        }
    };

    const clearAll = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const loadSample = () => {
        const sample = {
            name: "MineX AIO Hub",
            version: "1.0.0",
            tools: ["JSON Formatter", "Base64 Encoder", "UUID Generator"],
            features: {
                free: true,
                openSource: true,
                categories: 12
            }
        };
        setInput(JSON.stringify(sample));
    };

    return (
        <ToolPageLayout
            title="JSON Formatter"
            description="Format, validate, and beautify your JSON data with syntax highlighting"
            icon={FileJson}
            category="Developer"
        >
            <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={formatJson} className="gap-2">
                        <Maximize2 className="w-4 h-4" />
                        Format
                    </Button>
                    <Button onClick={minifyJson} variant="secondary" className="gap-2">
                        <Minimize2 className="w-4 h-4" />
                        Minify
                    </Button>
                    <Button onClick={validateJson} variant="outline" className="gap-2">
                        <Check className="w-4 h-4" />
                        Validate
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button onClick={clearAll} variant="ghost" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </Button>
                    <Button onClick={loadSample} variant="ghost" size="sm">
                        Load Sample
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        <p className="font-medium">Error:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Input/Output Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Input JSON</label>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="min-h-[400px] font-mono text-sm bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Output</label>
                        <Textarea
                            value={output}
                            readOnly
                            placeholder="Formatted JSON will appear here..."
                            className="min-h-[400px] font-mono text-sm bg-background/50"
                        />
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
