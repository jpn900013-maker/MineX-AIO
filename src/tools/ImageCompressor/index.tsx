import { useState, useRef } from "react";
import { Minimize2, Upload, Download, Trash2, Settings } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

interface CompressedImage {
    original: {
        name: string;
        size: number;
        dataUrl: string;
    };
    compressed: {
        size: number;
        dataUrl: string;
    };
    savings: number;
}

export default function ImageCompressor() {
    const [images, setImages] = useState<CompressedImage[]>([]);
    const [quality, setQuality] = useState(80);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const compressImage = (file: File, quality: number): Promise<CompressedImage> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Could not get canvas context"));
                        return;
                    }

                    ctx.drawImage(img, 0, 0);

                    // Use JPEG for compression (better compression than PNG)
                    const compressedDataUrl = canvas.toDataURL("image/jpeg", quality / 100);
                    const compressedSize = Math.round((compressedDataUrl.length - 22) * 0.75);

                    resolve({
                        original: {
                            name: file.name,
                            size: file.size,
                            dataUrl: e.target?.result as string,
                        },
                        compressed: {
                            size: compressedSize,
                            dataUrl: compressedDataUrl,
                        },
                        savings: Math.round((1 - compressedSize / file.size) * 100),
                    });
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        const newImages: CompressedImage[] = [];

        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;

            try {
                const compressed = await compressImage(file, quality);
                newImages.push(compressed);
            } catch (err) {
                toast({
                    title: "Error",
                    description: `Failed to compress ${file.name}`,
                    variant: "destructive"
                });
            }
        }

        setImages((prev) => [...prev, ...newImages]);
        setLoading(false);

        if (newImages.length > 0) {
            toast({
                title: "Compressed!",
                description: `${newImages.length} image(s) compressed successfully`
            });
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const downloadImage = (image: CompressedImage) => {
        const a = document.createElement("a");
        a.href = image.compressed.dataUrl;
        a.download = `compressed-${image.original.name.replace(/\.[^.]+$/, ".jpg")}`;
        a.click();
    };

    const downloadAll = () => {
        images.forEach((img) => downloadImage(img));
        toast({ title: "Downloaded!", description: `${images.length} image(s) saved` });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setImages([]);
    };

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const totalSavings = images.reduce((acc, img) => acc + (img.original.size - img.compressed.size), 0);

    return (
        <ToolPageLayout
            title="Image Compressor"
            description="Compress images to reduce file size while maintaining quality"
            icon={Minimize2}
            category="Image"
        >
            <div className="space-y-6">
                {/* Quality Slider */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Compression Settings</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-muted-foreground">Quality</label>
                            <span className="text-sm font-medium text-primary">{quality}%</span>
                        </div>
                        <Slider
                            value={[quality]}
                            onValueChange={(v) => setQuality(v[0])}
                            min={10}
                            max={100}
                            step={5}
                        />
                        <p className="text-xs text-muted-foreground">
                            Lower quality = smaller file size. 80% is recommended for most uses.
                        </p>
                    </div>
                </div>

                {/* Upload Zone */}
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                        {loading ? "Compressing..." : "Click or drag images here to compress"}
                    </p>
                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP, GIF</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Actions */}
                {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {images.length} image(s) • Saved {formatSize(totalSavings)}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={downloadAll} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download All
                            </Button>
                            <Button onClick={clearAll} variant="ghost" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                {images.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                                <div className="flex gap-3">
                                    <img
                                        src={img.compressed.dataUrl}
                                        alt={img.original.name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{img.original.name}</p>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Original: {formatSize(img.original.size)}</p>
                                            <p>Compressed: {formatSize(img.compressed.size)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${img.savings > 0 ? "text-green-500" : "text-yellow-500"}`}>
                                        {img.savings > 0 ? `${img.savings}% smaller` : "No size reduction"}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button onClick={() => downloadImage(img)} size="sm" variant="outline">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button onClick={() => removeImage(index)} size="sm" variant="ghost">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
