import { useState } from "react";
import { Lock, Copy, Check, RefreshCw, Upload, FileText } from "lucide-react";
import CryptoJS from "crypto-js";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

type HashAlgorithm = "MD5" | "SHA1" | "SHA256" | "SHA512" | "SHA3";

interface HashResult {
    algorithm: HashAlgorithm;
    hash: string;
}

export default function HashGenerator() {
    const [input, setInput] = useState("");
    const [results, setResults] = useState<HashResult[]>([]);
    const [compareHash, setCompareHash] = useState("");
    const [copied, setCopied] = useState<string | null>(null);
    const { toast } = useToast();

    const generateHashes = () => {
        if (!input.trim()) {
            toast({
                title: "Empty input",
                description: "Please enter some text to hash",
                variant: "destructive"
            });
            return;
        }

        const hashes: HashResult[] = [
            { algorithm: "MD5", hash: CryptoJS.MD5(input).toString() },
            { algorithm: "SHA1", hash: CryptoJS.SHA1(input).toString() },
            { algorithm: "SHA256", hash: CryptoJS.SHA256(input).toString() },
            { algorithm: "SHA512", hash: CryptoJS.SHA512(input).toString() },
            { algorithm: "SHA3", hash: CryptoJS.SHA3(input).toString() },
        ];

        setResults(hashes);
        toast({ title: "Generated!", description: "All hashes computed successfully" });
    };

    const generateSingleHash = (algorithm: HashAlgorithm) => {
        if (!input.trim()) return "";

        switch (algorithm) {
            case "MD5": return CryptoJS.MD5(input).toString();
            case "SHA1": return CryptoJS.SHA1(input).toString();
            case "SHA256": return CryptoJS.SHA256(input).toString();
            case "SHA512": return CryptoJS.SHA512(input).toString();
            case "SHA3": return CryptoJS.SHA3(input).toString();
        }
    };

    const copyHash = async (algorithm: string, hash: string) => {
        try {
            await navigator.clipboard.writeText(hash);
            setCopied(algorithm);
            toast({ title: "Copied!", description: `${algorithm} hash copied` });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setInput(content);
            toast({ title: "File loaded!", description: `${file.name} content loaded` });
        };
        reader.readAsText(file);
    };

    const checkMatch = (hash: string) => {
        if (!compareHash.trim()) return null;
        return hash.toLowerCase() === compareHash.toLowerCase().trim();
    };

    return (
        <ToolPageLayout
            title="Hash Generator"
            description="Generate MD5, SHA-1, SHA-256, SHA-512, and SHA-3 hashes from text or files"
            icon={Lock}
            category="Security"
        >
            <Tabs defaultValue="text" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="file">File Hash</TabsTrigger>
                    <TabsTrigger value="compare">Compare Hash</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-6">
                    {/* Text Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Text to Hash</label>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to generate hashes..."
                            className="min-h-[150px] bg-background/50"
                        />
                    </div>

                    <Button onClick={generateHashes} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Generate All Hashes
                    </Button>

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground">Generated Hashes</label>
                            {results.map((result) => (
                                <div key={result.algorithm} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-primary">{result.algorithm}</span>
                                        <Button
                                            onClick={() => copyHash(result.algorithm, result.hash)}
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1"
                                        >
                                            {copied === result.algorithm ? (
                                                <Check className="w-3 h-3" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                            Copy
                                        </Button>
                                    </div>
                                    <div className="p-3 bg-background/50 rounded-lg font-mono text-xs break-all border">
                                        {result.hash}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="file" className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Upload a text file to hash its contents</p>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                            accept=".txt,.json,.md,.csv,.xml,.html,.css,.js,.ts"
                        />
                        <label htmlFor="file-upload">
                            <Button asChild>
                                <span className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Choose File
                                </span>
                            </Button>
                        </label>
                    </div>

                    {input && (
                        <>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    File loaded: {input.length} characters
                                </p>
                            </div>
                            <Button onClick={generateHashes} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Generate Hashes
                            </Button>
                        </>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-3">
                            {results.map((result) => (
                                <div key={result.algorithm} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-primary w-20">{result.algorithm}</span>
                                    <Input
                                        value={result.hash}
                                        readOnly
                                        className="font-mono text-xs bg-background/50"
                                    />
                                    <Button
                                        onClick={() => copyHash(result.algorithm, result.hash)}
                                        variant="outline"
                                        size="icon"
                                    >
                                        {copied === result.algorithm ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="compare" className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Text to Hash</label>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text..."
                            className="min-h-[100px] bg-background/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Hash to Compare</label>
                        <Input
                            value={compareHash}
                            onChange={(e) => setCompareHash(e.target.value)}
                            placeholder="Paste hash to verify..."
                            className="font-mono bg-background/50"
                        />
                    </div>

                    <Button onClick={generateHashes} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Compare
                    </Button>

                    {results.length > 0 && compareHash && (
                        <div className="space-y-2">
                            {results.map((result) => {
                                const matches = checkMatch(result.hash);
                                return (
                                    <div
                                        key={result.algorithm}
                                        className={`p-3 rounded-lg flex items-center justify-between ${matches
                                                ? "bg-green-500/10 border border-green-500/30"
                                                : "bg-muted/50 border border-transparent"
                                            }`}
                                    >
                                        <span className="font-medium">{result.algorithm}</span>
                                        {matches !== null && (
                                            <span className={matches ? "text-green-500" : "text-muted-foreground"}>
                                                {matches ? "✓ Match!" : "No match"}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </ToolPageLayout>
    );
}
