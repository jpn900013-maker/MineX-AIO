import { useState } from "react";
import { FileText, Copy, Check, RefreshCw, Download } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
    "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
    "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores",
    "quas", "molestias", "excepturi", "obcaecati", "cupiditate", "provident",
    "similique", "mollitia", "animi", "harum", "rerum", "hic", "tenetur",
    "sapiente", "delectus", "reiciendis", "voluptatibus", "maiores", "alias",
    "perferendis", "doloribus", "asperiores", "repellat"
];

type GenerateType = "paragraphs" | "sentences" | "words";

export default function LoremIpsum() {
    const [output, setOutput] = useState("");
    const [type, setType] = useState<GenerateType>("paragraphs");
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const generateWord = () => {
        return loremWords[Math.floor(Math.random() * loremWords.length)];
    };

    const generateSentence = (wordCount = 10) => {
        const words = [];
        const sentenceLength = Math.floor(Math.random() * 10) + wordCount;
        for (let i = 0; i < sentenceLength; i++) {
            words.push(generateWord());
        }
        // Capitalize first letter
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        return words.join(" ") + ".";
    };

    const generateParagraph = (sentenceCount = 5) => {
        const sentences = [];
        const paragraphLength = Math.floor(Math.random() * 3) + sentenceCount;
        for (let i = 0; i < paragraphLength; i++) {
            sentences.push(generateSentence());
        }
        return sentences.join(" ");
    };

    const generate = () => {
        let result = "";

        switch (type) {
            case "words": {
                const words = [];
                for (let i = 0; i < count; i++) {
                    words.push(generateWord());
                }
                result = words.join(" ");
                break;
            }
            case "sentences": {
                const sentences = [];
                for (let i = 0; i < count; i++) {
                    sentences.push(generateSentence());
                }
                result = sentences.join(" ");
                break;
            }
            case "paragraphs": {
                const paragraphs = [];
                for (let i = 0; i < count; i++) {
                    paragraphs.push(generateParagraph());
                }
                result = paragraphs.join("\n\n");
                break;
            }
        }

        // Start with "Lorem ipsum dolor sit amet" if option enabled
        if (startWithLorem && result.length > 0) {
            const loremStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
            if (type === "words") {
                const words = result.split(" ");
                words[0] = "Lorem";
                if (words.length > 1) words[1] = "ipsum";
                if (words.length > 2) words[2] = "dolor";
                if (words.length > 3) words[3] = "sit";
                if (words.length > 4) words[4] = "amet";
                result = words.join(" ");
            } else {
                result = loremStart + result.substring(result.indexOf(" ") + 1);
            }
        }

        setOutput(result);
        toast({ title: "Generated!", description: `${count} ${type} generated` });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            toast({ title: "Copied!", description: "Text copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const downloadAsFile = () => {
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lorem-ipsum-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded!", description: "Text saved to file" });
    };

    const getMaxCount = () => {
        switch (type) {
            case "words": return 500;
            case "sentences": return 50;
            case "paragraphs": return 20;
        }
    };

    return (
        <ToolPageLayout
            title="Lorem Ipsum Generator"
            description="Generate placeholder text for your designs and layouts"
            icon={FileText}
            category="Generator"
        >
            <div className="space-y-6">
                {/* Type Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Generate</label>
                    <div className="flex gap-2">
                        {(["paragraphs", "sentences", "words"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setType(t);
                                    setCount(t === "words" ? 50 : t === "sentences" ? 5 : 3);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${type === t
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Count Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">
                            Number of {type}
                        </label>
                        <span className="text-sm font-medium text-primary">{count}</span>
                    </div>
                    <Slider
                        value={[count]}
                        onValueChange={(v) => setCount(v[0])}
                        min={1}
                        max={getMaxCount()}
                        step={1}
                    />
                </div>

                {/* Options */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="start-lorem"
                        checked={startWithLorem}
                        onChange={(e) => setStartWithLorem(e.target.checked)}
                        className="rounded"
                    />
                    <label htmlFor="start-lorem" className="text-sm text-muted-foreground">
                        Start with "Lorem ipsum dolor sit amet..."
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button onClick={generate} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Generate
                    </Button>
                    <Button
                        onClick={copyToClipboard}
                        variant="secondary"
                        className="gap-2"
                        disabled={!output}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                        onClick={downloadAsFile}
                        variant="outline"
                        className="gap-2"
                        disabled={!output}
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                </div>

                {/* Output */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Generated Text</label>
                        {output && (
                            <span className="text-xs text-muted-foreground">
                                {output.split(/\s+/).length} words, {output.length} characters
                            </span>
                        )}
                    </div>
                    <Textarea
                        value={output}
                        readOnly
                        placeholder="Click Generate to create Lorem Ipsum text..."
                        className="min-h-[300px] bg-background/50"
                    />
                </div>
            </div>
        </ToolPageLayout>
    );
}
