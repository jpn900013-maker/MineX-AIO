import { useState, useRef } from "react";
import { Eye, Upload, Copy, Check, Trash2, MapPin, Globe, Wifi, Clock, Users } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface VisitorLog {
    id: string;
    timestamp: Date;
    ip: string;
    city: string;
    region: string;
    country: string;
    postal: string;
    isp: string;
    userAgent: string;
    referrer: string;
}

interface TrackedLink {
    id: string;
    code: string;
    imageDataUrl: string;
    createdAt: Date;
    visitors: VisitorLog[];
}

export default function IpLogger() {
    const [links, setLinks] = useState<TrackedLink[]>(() => {
        try {
            const saved = localStorage.getItem("minex-ip-logger");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [selectedLink, setSelectedLink] = useState<TrackedLink | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const generateCode = (): string => {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
            return;
        }

        setLoading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageDataUrl = event.target?.result as string;

            const newLink: TrackedLink = {
                id: Date.now().toString(),
                code: generateCode(),
                imageDataUrl,
                createdAt: new Date(),
                visitors: [],
            };

            const updatedLinks = [newLink, ...links];
            setLinks(updatedLinks);
            localStorage.setItem("minex-ip-logger", JSON.stringify(updatedLinks));
            setSelectedLink(newLink);
            setLoading(false);

            toast({ title: "Link created!", description: "Your tracking link is ready" });
        };

        reader.onerror = () => {
            setLoading(false);
            toast({ title: "Error", description: "Failed to read image", variant: "destructive" });
        };

        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const simulateVisitor = async (linkId: string) => {
        // Fetch real IP info for demo purposes
        try {
            const response = await fetch("http://ip-api.com/json/");
            const data = await response.json();

            const visitor: VisitorLog = {
                id: Date.now().toString(),
                timestamp: new Date(),
                ip: data.query || "Unknown",
                city: data.city || "Unknown",
                region: data.regionName || "Unknown",
                country: data.country || "Unknown",
                postal: data.zip || "Unknown",
                isp: data.isp || "Unknown",
                userAgent: navigator.userAgent,
                referrer: document.referrer || "Direct",
            };

            const updatedLinks = links.map((link) => {
                if (link.id === linkId) {
                    return { ...link, visitors: [visitor, ...link.visitors] };
                }
                return link;
            });

            setLinks(updatedLinks);
            localStorage.setItem("minex-ip-logger", JSON.stringify(updatedLinks));

            if (selectedLink?.id === linkId) {
                setSelectedLink({ ...selectedLink, visitors: [visitor, ...selectedLink.visitors] });
            }

            toast({ title: "Visitor logged!", description: `Captured: ${visitor.ip}` });
        } catch {
            toast({ title: "Error", description: "Could not capture visitor info", variant: "destructive" });
        }
    };

    const copyLink = async (code: string) => {
        const fullUrl = `${window.location.origin}/img/${code}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast({ title: "Copied!", description: "Tracking link copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const deleteLink = (id: string) => {
        const updatedLinks = links.filter((l) => l.id !== id);
        setLinks(updatedLinks);
        localStorage.setItem("minex-ip-logger", JSON.stringify(updatedLinks));
        if (selectedLink?.id === id) {
            setSelectedLink(null);
        }
        toast({ title: "Deleted", description: "Tracking link removed" });
    };

    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleString();
    };

    return (
        <ToolPageLayout
            title="IP Logger"
            description="Create image links that track visitor IP, location, and device info"
            icon={Eye}
            category="Network"
        >
            <Tabs defaultValue="create" className="space-y-6">
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="create">Create Link</TabsTrigger>
                    <TabsTrigger value="manage">
                        View Logs ({links.reduce((acc, l) => acc + l.visitors.length, 0)})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-6">
                    {/* Upload Zone */}
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                            {loading ? "Creating link..." : "Click or drag an image to create a tracking link"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Image will be hosted and tracking will capture visitor info
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Created Link */}
                    {selectedLink && (
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-foreground">Your Tracking Link</h3>
                                <Button onClick={() => simulateVisitor(selectedLink.id)} variant="outline" size="sm">
                                    Test (Capture My IP)
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <img
                                    src={selectedLink.imageDataUrl}
                                    alt="Uploaded"
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <Input
                                        value={`${window.location.origin}/img/${selectedLink.code}`}
                                        readOnly
                                        className="font-mono bg-background/50"
                                    />
                                </div>
                                <Button onClick={() => copyLink(selectedLink.code)} variant="outline">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Share this link. When someone opens it, their info will be captured.
                            </p>
                        </div>
                    )}

                    {/* Recent Links */}
                    {links.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-medium text-foreground">Recent Links ({links.length})</h3>
                            <div className="space-y-2 max-h-[300px] overflow-auto">
                                {links.slice(0, 10).map((link) => (
                                    <div
                                        key={link.id}
                                        className="p-3 bg-muted/50 rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={link.imageDataUrl}
                                                alt="Link"
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-mono text-sm">{window.location.host}/img/{link.code}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {link.visitors.length} visitor(s) • {formatDate(link.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                onClick={() => setSelectedLink(link)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Users className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => deleteLink(link.id)}
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="manage" className="space-y-6">
                    {/* Link Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Select Link to View Logs</label>
                        <div className="flex flex-wrap gap-2">
                            {links.map((link) => (
                                <Button
                                    key={link.id}
                                    variant={selectedLink?.id === link.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedLink(link)}
                                    className="gap-2"
                                >
                                    <img
                                        src={link.imageDataUrl}
                                        alt=""
                                        className="w-4 h-4 object-cover rounded"
                                    />
                                    {link.code}
                                    <span className="text-xs opacity-75">({link.visitors.length})</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Visitor Logs */}
                    {selectedLink && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-foreground">
                                    Visitor Logs for /{selectedLink.code}
                                </h3>
                                <span className="text-sm text-muted-foreground">
                                    {selectedLink.visitors.length} total
                                </span>
                            </div>

                            {selectedLink.visitors.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No visitors yet</p>
                                    <p className="text-sm">Share the link to capture visitor info</p>
                                    <Button
                                        onClick={() => simulateVisitor(selectedLink.id)}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Test with your IP
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedLink.visitors.map((visitor) => (
                                        <div
                                            key={visitor.id}
                                            className="p-4 bg-muted/50 rounded-lg space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-primary">{visitor.ip}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(visitor.timestamp)}
                                                </span>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    <span>{visitor.city}, {visitor.region}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                                    <span>{visitor.country} ({visitor.postal})</span>
                                                </div>
                                                <div className="flex items-center gap-2 md:col-span-2">
                                                    <Wifi className="w-4 h-4 text-muted-foreground" />
                                                    <span>{visitor.isp}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground truncate">
                                                {visitor.userAgent}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedLink && links.length > 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            Select a link above to view its visitor logs
                        </p>
                    )}

                    {links.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            Create a tracking link first in the "Create Link" tab
                        </p>
                    )}
                </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-6">
                <p className="text-sm text-yellow-500">
                    ⚠️ <strong>For educational purposes only.</strong> This is a demo that stores data locally.
                    In production, this would require a backend server. Always use such tools ethically and legally.
                </p>
            </div>
        </ToolPageLayout>
    );
}
