import { useState } from "react";
import { Code2, Copy, Check, Eye, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface MetaTags {
    title: string;
    description: string;
    keywords: string;
    author: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    twitterCard: "summary" | "summary_large_image";
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    canonical: string;
    robots: string;
}

export default function MetaTagGenerator() {
    const [meta, setMeta] = useState<MetaTags>({
        title: "",
        description: "",
        keywords: "",
        author: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        ogUrl: "",
        twitterCard: "summary_large_image",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        canonical: "",
        robots: "index, follow",
    });
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const generateMetaTags = () => {
        const tags: string[] = [];

        // Basic meta tags
        if (meta.title) {
            tags.push(`<title>${meta.title}</title>`);
        }
        if (meta.description) {
            tags.push(`<meta name="description" content="${meta.description}">`);
        }
        if (meta.keywords) {
            tags.push(`<meta name="keywords" content="${meta.keywords}">`);
        }
        if (meta.author) {
            tags.push(`<meta name="author" content="${meta.author}">`);
        }
        if (meta.robots) {
            tags.push(`<meta name="robots" content="${meta.robots}">`);
        }
        if (meta.canonical) {
            tags.push(`<link rel="canonical" href="${meta.canonical}">`);
        }

        // Open Graph tags
        if (meta.ogTitle || meta.title) {
            tags.push(`<meta property="og:title" content="${meta.ogTitle || meta.title}">`);
        }
        if (meta.ogDescription || meta.description) {
            tags.push(`<meta property="og:description" content="${meta.ogDescription || meta.description}">`);
        }
        if (meta.ogImage) {
            tags.push(`<meta property="og:image" content="${meta.ogImage}">`);
        }
        if (meta.ogUrl) {
            tags.push(`<meta property="og:url" content="${meta.ogUrl}">`);
        }
        tags.push(`<meta property="og:type" content="website">`);

        // Twitter Card tags
        tags.push(`<meta name="twitter:card" content="${meta.twitterCard}">`);
        if (meta.twitterTitle || meta.ogTitle || meta.title) {
            tags.push(`<meta name="twitter:title" content="${meta.twitterTitle || meta.ogTitle || meta.title}">`);
        }
        if (meta.twitterDescription || meta.ogDescription || meta.description) {
            tags.push(`<meta name="twitter:description" content="${meta.twitterDescription || meta.ogDescription || meta.description}">`);
        }
        if (meta.twitterImage || meta.ogImage) {
            tags.push(`<meta name="twitter:image" content="${meta.twitterImage || meta.ogImage}">`);
        }

        // Viewport
        tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
        tags.push(`<meta charset="UTF-8">`);

        setOutput(tags.join("\n"));
        toast({ title: "Generated!", description: `${tags.length} meta tags created` });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            toast({ title: "Copied!", description: "Meta tags copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const updateMeta = <K extends keyof MetaTags>(key: K, value: MetaTags[K]) => {
        setMeta({ ...meta, [key]: value });
    };

    const charCount = (text: string, max: number) => {
        const count = text.length;
        const color = count > max ? "text-destructive" : count > max * 0.8 ? "text-yellow-500" : "text-muted-foreground";
        return <span className={`text-xs ${color}`}>{count}/{max}</span>;
    };

    return (
        <ToolPageLayout
            title="Meta Tag Generator"
            description="Generate SEO-optimized meta tags for your website"
            icon={Code2}
            category="SEO"
        >
            <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Fields */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground">Basic SEO</h3>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm text-muted-foreground">Page Title</label>
                                {charCount(meta.title, 60)}
                            </div>
                            <Input
                                value={meta.title}
                                onChange={(e) => updateMeta("title", e.target.value)}
                                placeholder="My Awesome Website"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm text-muted-foreground">Meta Description</label>
                                {charCount(meta.description, 160)}
                            </div>
                            <Textarea
                                value={meta.description}
                                onChange={(e) => updateMeta("description", e.target.value)}
                                placeholder="A brief description of your page..."
                                className="bg-background/50 min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Keywords (comma separated)</label>
                            <Input
                                value={meta.keywords}
                                onChange={(e) => updateMeta("keywords", e.target.value)}
                                placeholder="seo, meta tags, website"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Author</label>
                            <Input
                                value={meta.author}
                                onChange={(e) => updateMeta("author", e.target.value)}
                                placeholder="Your name"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Canonical URL</label>
                            <Input
                                value={meta.canonical}
                                onChange={(e) => updateMeta("canonical", e.target.value)}
                                placeholder="https://example.com/page"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Robots</label>
                            <Input
                                value={meta.robots}
                                onChange={(e) => updateMeta("robots", e.target.value)}
                                placeholder="index, follow"
                                className="bg-background/50"
                            />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-foreground">Social Media (Open Graph / Twitter)</h3>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">OG Title (defaults to page title)</label>
                            <Input
                                value={meta.ogTitle}
                                onChange={(e) => updateMeta("ogTitle", e.target.value)}
                                placeholder="Leave empty to use page title"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">OG Description</label>
                            <Textarea
                                value={meta.ogDescription}
                                onChange={(e) => updateMeta("ogDescription", e.target.value)}
                                placeholder="Leave empty to use meta description"
                                className="bg-background/50 min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">OG Image URL</label>
                            <Input
                                value={meta.ogImage}
                                onChange={(e) => updateMeta("ogImage", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">OG URL</label>
                            <Input
                                value={meta.ogUrl}
                                onChange={(e) => updateMeta("ogUrl", e.target.value)}
                                placeholder="https://example.com/page"
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Twitter Card Type</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={meta.twitterCard === "summary" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateMeta("twitterCard", "summary")}
                                >
                                    Summary
                                </Button>
                                <Button
                                    variant={meta.twitterCard === "summary_large_image" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateMeta("twitterCard", "summary_large_image")}
                                >
                                    Large Image
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateMetaTags} className="w-full gap-2" size="lg">
                    <RefreshCw className="w-4 h-4" />
                    Generate Meta Tags
                </Button>

                {/* Output */}
                {output && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">Generated HTML</label>
                            <Button onClick={copyToClipboard} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy
                            </Button>
                        </div>
                        <pre className="p-4 bg-background/50 rounded-lg border font-mono text-xs overflow-auto max-h-[300px]">
                            {output}
                        </pre>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
