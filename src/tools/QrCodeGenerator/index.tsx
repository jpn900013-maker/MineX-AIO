import { useState, useRef, useEffect } from "react";
import { QrCode, Download, Copy, Check, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

type QrType = "text" | "url" | "wifi" | "email";

export default function QrCodeGenerator() {
    const [qrType, setQrType] = useState<QrType>("text");
    const [content, setContent] = useState("Hello from MineX AIO Hub!");
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    // WiFi specific fields
    const [wifiSsid, setWifiSsid] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

    // Email specific fields
    const [emailTo, setEmailTo] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    const generateQrContent = (): string => {
        switch (qrType) {
            case "wifi":
                return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
            case "email":
                return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            default:
                return content;
        }
    };

    const generateQR = async () => {
        const qrContent = generateQrContent();
        if (!qrContent.trim()) {
            toast({
                title: "Empty content",
                description: "Please enter some content to generate QR code",
                variant: "destructive"
            });
            return;
        }

        try {
            const dataUrl = await QRCode.toDataURL(qrContent, {
                width: size,
                margin: 2,
                color: {
                    dark: fgColor,
                    light: bgColor
                },
                errorCorrectionLevel: "M"
            });
            setQrDataUrl(dataUrl);
            toast({ title: "Generated!", description: "QR code created successfully" });
        } catch (err) {
            toast({
                title: "Generation failed",
                description: "Could not generate QR code",
                variant: "destructive"
            });
        }
    };

    useEffect(() => {
        generateQR();
    }, []);

    const downloadQR = (format: "png" | "svg") => {
        if (!qrDataUrl) return;

        if (format === "svg") {
            QRCode.toString(generateQrContent(), { type: "svg", width: size }, (err, svg) => {
                if (err) return;
                const blob = new Blob([svg], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `qrcode-${Date.now()}.svg`;
                a.click();
                URL.revokeObjectURL(url);
            });
        } else {
            const a = document.createElement("a");
            a.href = qrDataUrl;
            a.download = `qrcode-${Date.now()}.png`;
            a.click();
        }
        toast({ title: "Downloaded!", description: `QR code saved as ${format.toUpperCase()}` });
    };

    const copyToClipboard = async () => {
        try {
            const response = await fetch(qrDataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);
            setCopied(true);
            toast({ title: "Copied!", description: "QR code copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: copy data URL
            try {
                await navigator.clipboard.writeText(qrDataUrl);
                setCopied(true);
                toast({ title: "Copied!", description: "QR code data URL copied" });
                setTimeout(() => setCopied(false), 2000);
            } catch {
                toast({ title: "Failed to copy", variant: "destructive" });
            }
        }
    };

    return (
        <ToolPageLayout
            title="QR Code Generator"
            description="Create QR codes for URLs, text, WiFi credentials, and more"
            icon={QrCode}
            category="Generator"
        >
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    {/* Ad Banner */}
                    <div className="flex justify-center">
                        <BannerAd />
                    </div>
                    <Tabs value={qrType} onValueChange={(v) => setQrType(v as QrType)}>
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="text">Text</TabsTrigger>
                            <TabsTrigger value="url">URL</TabsTrigger>
                            <TabsTrigger value="wifi">WiFi</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Text Content</label>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Enter text to encode..."
                                    className="min-h-[120px] bg-background/50"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">URL</label>
                                <Input
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="https://example.com"
                                    className="bg-background/50"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="wifi" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Network Name (SSID)</label>
                                <Input
                                    value={wifiSsid}
                                    onChange={(e) => setWifiSsid(e.target.value)}
                                    placeholder="Your WiFi name"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Password</label>
                                <Input
                                    type="password"
                                    value={wifiPassword}
                                    onChange={(e) => setWifiPassword(e.target.value)}
                                    placeholder="WiFi password"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Encryption</label>
                                <div className="flex gap-2">
                                    {(["WPA", "WEP", "nopass"] as const).map((enc) => (
                                        <button
                                            key={enc}
                                            onClick={() => setWifiEncryption(enc)}
                                            className={`px-3 py-1.5 rounded-md text-sm ${wifiEncryption === enc
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {enc === "nopass" ? "None" : enc}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="email" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">To</label>
                                <Input
                                    type="email"
                                    value={emailTo}
                                    onChange={(e) => setEmailTo(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                <Input
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Body</label>
                                <Textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Email body..."
                                    className="min-h-[80px] bg-background/50"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Customization Options */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="font-medium text-foreground">Customization</h3>

                        {/* Size */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm text-muted-foreground">Size</label>
                                <span className="text-sm text-primary">{size}px</span>
                            </div>
                            <Slider
                                value={[size]}
                                onValueChange={(v) => setSize(v[0])}
                                min={128}
                                max={512}
                                step={32}
                            />
                        </div>

                        {/* Colors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Foreground</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer"
                                    />
                                    <Input
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="font-mono bg-background/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Background</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer"
                                    />
                                    <Input
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="font-mono bg-background/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button onClick={generateQR} className="w-full gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Generate QR Code
                    </Button>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <div className="p-8 bg-white rounded-xl flex items-center justify-center">
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="Generated QR Code"
                                style={{ width: size, height: size, maxWidth: "100%" }}
                            />
                        ) : (
                            <div className="text-muted-foreground text-center">
                                <QrCode className="w-24 h-24 mx-auto mb-4 opacity-20" />
                                <p>QR code will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* Download Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => downloadQR("png")} variant="secondary" className="gap-2 flex-1">
                            <Download className="w-4 h-4" />
                            Download PNG
                        </Button>
                        <Button onClick={() => downloadQR("svg")} variant="secondary" className="gap-2 flex-1">
                            <Download className="w-4 h-4" />
                            Download SVG
                        </Button>
                        <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
