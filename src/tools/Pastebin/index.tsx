import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, Copy, Check, Trash2, Clock, Eye, EyeOff, Code2, Link, Share2, Lock } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:3001";

interface Paste {
    id: string;
    title: string;
    content: string;
    language: string;
    createdAt: Date;
    expiresAt: Date | null;
    isPrivate: boolean;
    shareUrl?: string;
    password?: string;
}

interface ViewingPaste {
    title: string;
    content: string;
    language: string;
    createdAt: number;
    views: number;
}

const LANGUAGES = [
    "plaintext", "javascript", "typescript", "python", "java", "csharp",
    "cpp", "go", "rust", "php", "ruby", "swift", "kotlin", "html",
    "css", "sql", "json", "xml", "yaml", "markdown", "bash", "powershell"
];

const EXPIRY_OPTIONS = [
    { label: "Never", value: "never" },
    { label: "10 minutes", value: "10m" },
    { label: "1 hour", value: "1h" },
    { label: "1 day", value: "1d" },
    { label: "1 week", value: "1w" },
    { label: "1 month", value: "1M" },
];

export default function Pastebin() {
    const [searchParams] = useSearchParams();
    const viewCode = searchParams.get("view");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [language, setLanguage] = useState("plaintext");
    const [expiry, setExpiry] = useState("never");
    const [password, setPassword] = useState("");
    const [usePassword, setUsePassword] = useState(false);
    const [pastes, setPastes] = useState<Paste[]>(() => {
        try {
            const saved = localStorage.getItem("minex-pastes");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [viewingPaste, setViewingPaste] = useState<ViewingPaste | null>(null);
    const [viewingCode, setViewingCode] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Handle viewing paste from URL
    useEffect(() => {
        if (viewCode) {
            loadPaste(viewCode);
        }
    }, [viewCode]);

    const loadPaste = async (code: string, pwd?: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/paste/view/${code}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pwd }),
            });
            const data = await response.json();

            if (data.success) {
                setViewingPaste(data.paste);
                setViewingCode(code);
                setNeedsPassword(false);
            } else if (data.requiresPassword) {
                setNeedsPassword(true);
                setViewingCode(code);
                toast({ title: "Password required", description: "This paste is password protected" });
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to load paste. Ensure backend is running.", variant: "destructive" });
        }
        setLoading(false);
    };

    const savePaste = async () => {
        if (!content.trim()) {
            toast({ title: "Empty content", description: "Please enter some content", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/paste/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title || `Paste ${pastes.length + 1}`,
                    content,
                    language,
                    expiresIn: expiry,
                    password: usePassword ? password : null,
                }),
            });
            const data = await response.json();

            if (data.success) {
                const shareUrl = `${window.location.origin}/tools/pastebin?view=${data.code}`;

                const newPaste: Paste = {
                    id: data.code,
                    title: title || `Paste ${pastes.length + 1}`,
                    content,
                    language,
                    createdAt: new Date(),
                    expiresAt: null,
                    isPrivate: usePassword,
                    shareUrl,
                    password: usePassword ? password : undefined,
                };

                const updatedPastes = [newPaste, ...pastes].slice(0, 50);
                setPastes(updatedPastes);
                localStorage.setItem("minex-pastes", JSON.stringify(updatedPastes));

                toast({
                    title: "Paste created!",
                    description: `Share link: ${shareUrl}`
                });

                // Reset form
                setTitle("");
                setContent("");
                setLanguage("plaintext");
                setPassword("");
                setUsePassword(false);
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch {
            // Fallback to local storage only
            const localId = Math.random().toString(36).substring(2, 10);
            const newPaste: Paste = {
                id: localId,
                title: title || `Paste ${pastes.length + 1}`,
                content,
                language,
                createdAt: new Date(),
                expiresAt: null,
                isPrivate: usePassword,
            };

            const updatedPastes = [newPaste, ...pastes].slice(0, 50);
            setPastes(updatedPastes);
            localStorage.setItem("minex-pastes", JSON.stringify(updatedPastes));

            toast({
                title: "Saved locally",
                description: "Backend not running. Saved to local storage only.",
                variant: "default"
            });

            setTitle("");
            setContent("");
        }
        setLoading(false);
    };

    const deletePaste = (id: string) => {
        const updatedPastes = pastes.filter((p) => p.id !== id);
        setPastes(updatedPastes);
        localStorage.setItem("minex-pastes", JSON.stringify(updatedPastes));
        toast({ title: "Deleted", description: "Paste removed" });
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({ title: "Copied!", description: "Content copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const copyShareLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            toast({ title: "Link copied!", description: "Share link copied to clipboard" });
            setTimeout(() => setCopiedLink(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const clearAll = () => {
        setTitle("");
        setContent("");
        setPassword("");
        setUsePassword(false);
    };

    // View from URL parameter
    if (viewCode && (needsPassword || viewingPaste)) {
        return (
            <ToolPageLayout
                title="View Paste"
                description="Viewing shared paste"
                icon={ClipboardList}
                category="Text"
            >
                {needsPassword ? (
                    <div className="max-w-md mx-auto space-y-4 py-8">
                        <div className="text-center">
                            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h2 className="text-xl font-bold">Password Protected</h2>
                            <p className="text-muted-foreground">Enter the password to view this paste</p>
                        </div>
                        <Input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter password"
                            className="bg-background/50"
                            onKeyDown={(e) => e.key === "Enter" && loadPaste(viewCode, passwordInput)}
                        />
                        <Button onClick={() => loadPaste(viewCode, passwordInput)} className="w-full" disabled={loading}>
                            {loading ? "Loading..." : "Unlock"}
                        </Button>
                    </div>
                ) : viewingPaste ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{viewingPaste.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {viewingPaste.language} • {new Date(viewingPaste.createdAt).toLocaleString()} • {viewingPaste.views} views
                                </p>
                            </div>
                            <Button onClick={() => copyToClipboard(viewingPaste.content)} variant="outline">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <pre className="p-4 bg-muted rounded-lg border font-mono text-sm overflow-auto max-h-[500px]">
                            {viewingPaste.content}
                        </pre>
                        <Button onClick={() => window.location.href = "/tools/pastebin"} variant="outline">
                            Create New Paste
                        </Button>
                    </div>
                ) : null}
            </ToolPageLayout>
        );
    }

    return (
        <ToolPageLayout
            title="Pastebin"
            description="Share code snippets with shareable links and optional password protection"
            icon={ClipboardList}
            category="Text"
        >
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Create Paste */}
                <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Create New Paste</h3>

                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Paste title (optional)"
                        className="bg-background/50"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {LANGUAGES.map((lang) => (
                                    <SelectItem key={lang} value={lang}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={expiry} onValueChange={setExpiry}>
                            <SelectTrigger>
                                <SelectValue placeholder="Expiry" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPIRY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Password Option */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setUsePassword(!usePassword)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${usePassword
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                        >
                            <Lock className="w-4 h-4" />
                            {usePassword ? "Password Protected" : "Add Password (Optional)"}
                        </button>
                        {usePassword && (
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="bg-background/50"
                            />
                        )}
                    </div>

                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your code or text here..."
                        className="min-h-[300px] font-mono text-sm bg-background/50"
                    />

                    <div className="flex gap-2">
                        <Button onClick={savePaste} className="gap-2" disabled={loading}>
                            <Share2 className="w-4 h-4" />
                            {loading ? "Creating..." : "Create & Share"}
                        </Button>
                        <Button onClick={clearAll} variant="ghost" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Your Pastes */}
                <div className="space-y-4">
                    <h3 className="font-medium text-foreground">
                        Your Pastes ({pastes.length})
                    </h3>

                    <div className="space-y-2 max-h-[500px] overflow-auto">
                        {pastes.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-8">
                                No pastes yet. Create your first one!
                            </p>
                        ) : (
                            pastes.map((paste) => (
                                <div
                                    key={paste.id}
                                    className="p-3 bg-muted/50 rounded-lg space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{paste.title}</span>
                                            {paste.password && <Lock className="w-3 h-3 text-muted-foreground" />}
                                        </div>
                                        <Button
                                            onClick={() => deletePaste(paste.id)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{paste.language}</span>
                                        <span>•</span>
                                        <span>{new Date(paste.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {paste.shareUrl && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={paste.shareUrl}
                                                readOnly
                                                className="text-xs h-8 bg-background/50"
                                            />
                                            <Button
                                                onClick={() => copyShareLink(paste.shareUrl!)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {copiedLink ? <Check className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mt-6">
                <h4 className="font-medium text-blue-400 mb-2">💡 Shareable Links</h4>
                <p className="text-sm text-muted-foreground">
                    When you create a paste with the backend running, you'll get a shareable link that anyone can use to view your code.
                    Add a password for extra protection!
                </p>
            </div>
        </ToolPageLayout>
    );
}
