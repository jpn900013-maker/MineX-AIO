import { useState } from "react";
import { Binary, Copy, Check, Trash2, ArrowDownUp, Upload } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function Base64Encoder() {
    const [textInput, setTextInput] = useState("");
    const [textOutput, setTextOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const encode = (text: string) => {
        try {
            const encoded = btoa(unescape(encodeURIComponent(text)));
            setTextOutput(encoded);
            setError(null);
        } catch (e) {
            setError("Failed to encode. Make sure your input is valid.");
        }
    };

    const decode = (text: string) => {
        try {
            const decoded = decodeURIComponent(escape(atob(text)));
            setTextOutput(decoded);
            setError(null);
        } catch (e) {
            setError("Failed to decode. Make sure your input is valid Base64.");
        }
    };

    const handleConvert = () => {
        if (!textInput.trim()) {
            setError("Please enter some text to convert");
            return;
        }
        if (mode === "encode") {
            encode(textInput);
            toast({ title: "Encoded!", description: "Text encoded to Base64" });
        } else {
            decode(textInput);
            toast({ title: "Decoded!", description: "Base64 decoded to text" });
        }
    };

    const swapInputOutput = () => {
        const temp = textInput;
        setTextInput(textOutput);
        setTextOutput(temp);
        setMode(mode === "encode" ? "decode" : "encode");
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(textOutput);
            setCopied(true);
            toast({ title: "Copied!", description: "Output copied to clipboard" });
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
        setTextInput("");
        setTextOutput("");
        setError(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix for pure base64
            const base64 = result.split(",")[1];
            setTextOutput(base64);
            toast({ title: "File encoded!", description: `${file.name} converted to Base64` });
        };
        reader.readAsDataURL(file);
    };

    return (
        <ToolPageLayout
            title="Base64 Encoder/Decoder"
            description="Encode text to Base64 or decode Base64 to text. Also supports file encoding."
            icon={Binary}
            category="Encoder"
        >
            <Tabs defaultValue="text" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="file">File to Base64</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setMode("encode")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "encode"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Encode
                            </button>
                            <button
                                onClick={() => setMode("decode")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "decode"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Decode
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleConvert} className="gap-2">
                            {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
                        </Button>
                        <Button onClick={swapInputOutput} variant="secondary" className="gap-2">
                            <ArrowDownUp className="w-4 h-4" />
                            Swap
                        </Button>
                        <Button onClick={copyToClipboard} variant="outline" className="gap-2" disabled={!textOutput}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied" : "Copy Output"}
                        </Button>
                        <Button onClick={clearAll} variant="ghost" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </Button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Input/Output */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
                            </label>
                            <Textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 to decode..."}
                                className="min-h-[300px] font-mono text-sm bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
                            </label>
                            <Textarea
                                value={textOutput}
                                readOnly
                                placeholder="Output will appear here..."
                                className="min-h-[300px] font-mono text-sm bg-background/50"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Upload a file to convert to Base64</p>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button asChild>
                                <span>Choose File</span>
                            </Button>
                        </label>
                    </div>

                    {textOutput && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground">Base64 Output</label>
                                <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                            <Textarea
                                value={textOutput}
                                readOnly
                                className="min-h-[200px] font-mono text-xs bg-background/50"
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </ToolPageLayout>
    );
}
