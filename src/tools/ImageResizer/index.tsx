import { useState, useRef } from "react";
import { Maximize2, Upload, Download, Trash2, Lock, Unlock } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ResizedImage {
    original: {
        name: string;
        width: number;
        height: number;
        dataUrl: string;
    };
    resized: {
        width: number;
        height: number;
        dataUrl: string;
    };
}

export default function ImageResizer() {
    const [image, setImage] = useState<ResizedImage | null>(null);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const [maintainAspect, setMaintainAspect] = useState(true);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const loadImage = (file: File): Promise<{ width: number; height: number; dataUrl: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        dataUrl: e.target?.result as string,
                    });
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const resizeImage = (dataUrl: string, targetWidth: number, targetHeight: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        setLoading(true);
        try {
            const { width: origWidth, height: origHeight, dataUrl } = await loadImage(file);

            setWidth(origWidth);
            setHeight(origHeight);

            setImage({
                original: {
                    name: file.name,
                    width: origWidth,
                    height: origHeight,
                    dataUrl,
                },
                resized: {
                    width: origWidth,
                    height: origHeight,
                    dataUrl,
                },
            });

            toast({ title: "Loaded!", description: `${origWidth}x${origHeight}` });
        } catch {
            toast({ title: "Error", description: "Failed to load image", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (maintainAspect && image) {
            const aspect = image.original.height / image.original.width;
            setHeight(Math.round(newWidth * aspect));
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        if (maintainAspect && image) {
            const aspect = image.original.width / image.original.height;
            setWidth(Math.round(newHeight * aspect));
        }
    };

    const applyResize = async () => {
        if (!image) return;

        setLoading(true);
        try {
            const resizedDataUrl = await resizeImage(image.original.dataUrl, width, height);

            setImage({
                ...image,
                resized: {
                    width,
                    height,
                    dataUrl: resizedDataUrl,
                },
            });

            toast({ title: "Resized!", description: `${width}x${height}` });
        } catch {
            toast({ title: "Error", description: "Failed to resize image", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = () => {
        if (!image) return;

        const a = document.createElement("a");
        a.href = image.resized.dataUrl;
        a.download = `resized-${width}x${height}-${image.original.name}`;
        a.click();
        toast({ title: "Downloaded!" });
    };

    const clearImage = () => {
        setImage(null);
        setWidth(800);
        setHeight(600);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const presetSizes = [
        { name: "HD", w: 1280, h: 720 },
        { name: "Full HD", w: 1920, h: 1080 },
        { name: "4K", w: 3840, h: 2160 },
        { name: "Instagram", w: 1080, h: 1080 },
        { name: "Twitter", w: 1200, h: 675 },
        { name: "Facebook", w: 1200, h: 630 },
    ];

    return (
        <ToolPageLayout
            title="Image Resizer"
            description="Resize images to exact dimensions with aspect ratio control"
            icon={Maximize2}
            category="Image"
        >
            <div className="space-y-6">
                {/* Upload Zone */}
                {!image && (
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                            {loading ? "Loading..." : "Click or drag an image here"}
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {image && (
                    <>
                        {/* Controls */}
                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Resize Options</span>
                                <Button
                                    onClick={() => setMaintainAspect(!maintainAspect)}
                                    variant={maintainAspect ? "default" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {maintainAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {maintainAspect ? "Locked" : "Unlocked"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Width (px)</label>
                                    <Input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                                        min={1}
                                        max={10000}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Height (px)</label>
                                    <Input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                                        min={1}
                                        max={10000}
                                    />
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {presetSizes.map((preset) => (
                                        <Button
                                            key={preset.name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setWidth(preset.w);
                                                setHeight(preset.h);
                                                setMaintainAspect(false);
                                            }}
                                        >
                                            {preset.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={applyResize} disabled={loading} className="w-full">
                                {loading ? "Resizing..." : "Apply Resize"}
                            </Button>
                        </div>

                        {/* Preview */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                    Original ({image.original.width}x{image.original.height})
                                </label>
                                <img
                                    src={image.original.dataUrl}
                                    alt="Original"
                                    className="w-full rounded-lg border"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-muted-foreground">
                                    Resized ({image.resized.width}x{image.resized.height})
                                </label>
                                <img
                                    src={image.resized.dataUrl}
                                    alt="Resized"
                                    className="w-full rounded-lg border"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button onClick={downloadImage} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                            <Button onClick={clearImage} variant="ghost" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </ToolPageLayout>
    );
}
