import { useState, useRef } from "react";
import { Image, Upload, Download, Trash2, ArrowRight } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type OutputFormat = "png" | "jpeg" | "webp";

interface ConvertedImage {
    original: {
        name: string;
        type: string;
        size: number;
        dataUrl: string;
    };
    converted: {
        format: OutputFormat;
        size: number;
        dataUrl: string;
    };
}

export default function ImageConverter() {
    const [images, setImages] = useState<ConvertedImage[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const convertImage = (file: File, format: OutputFormat): Promise<ConvertedImage> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Could not get canvas context"));
                        return;
                    }

                    // Fill white background for JPEG (transparent -> white)
                    if (format === "jpeg") {
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    ctx.drawImage(img, 0, 0);

                    const mimeType = `image/${format}`;
                    const quality = format === "jpeg" ? 0.92 : undefined;
                    const convertedDataUrl = canvas.toDataURL(mimeType, quality);
                    const convertedSize = Math.round((convertedDataUrl.length - 22) * 0.75);

                    resolve({
                        original: {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            dataUrl: e.target?.result as string,
                        },
                        converted: {
                            format,
                            size: convertedSize,
                            dataUrl: convertedDataUrl,
                        },
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
        const newImages: ConvertedImage[] = [];

        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;

            try {
                const converted = await convertImage(file, outputFormat);
                newImages.push(converted);
            } catch (err) {
                toast({
                    title: "Error",
                    description: `Failed to convert ${file.name}`,
                    variant: "destructive"
                });
            }
        }

        setImages((prev) => [...prev, ...newImages]);
        setLoading(false);

        if (newImages.length > 0) {
            toast({
                title: "Converted!",
                description: `${newImages.length} image(s) converted to ${outputFormat.toUpperCase()}`
            });
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const downloadImage = (image: ConvertedImage) => {
        const a = document.createElement("a");
        a.href = image.converted.dataUrl;
        const baseName = image.original.name.replace(/\.[^.]+$/, "");
        a.download = `${baseName}.${image.converted.format}`;
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

    const getFormatFromType = (type: string): string => {
        return type.replace("image/", "").toUpperCase();
    };

    return (
        <ToolPageLayout
            title="Image Converter"
            description="Convert images between PNG, JPG, and WebP formats"
            icon={Image}
            category="Image"
        >
            <div className="space-y-6">
                {/* Format Selection */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <label className="text-sm font-medium">Convert to</label>
                    <div className="flex gap-2">
                        {(["png", "jpeg", "webp"] as OutputFormat[]).map((format) => (
                            <Button
                                key={format}
                                variant={outputFormat === format ? "default" : "outline"}
                                onClick={() => setOutputFormat(format)}
                                className="flex-1"
                            >
                                {format.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {outputFormat === "png" && "PNG: Lossless, supports transparency, larger file size"}
                        {outputFormat === "jpeg" && "JPEG: Lossy, no transparency, smaller file size"}
                        {outputFormat === "webp" && "WebP: Modern format, good compression, supports transparency"}
                    </p>
                </div>

                {/* Upload Zone */}
                <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                        {loading ? "Converting..." : "Click or drag images to convert"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Images will be converted to {outputFormat.toUpperCase()}
                    </p>
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
                            {images.length} image(s) converted
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

                {/* Results */}
                {images.length > 0 && (
                    <div className="space-y-3">
                        {images.map((img, index) => (
                            <div key={index} className="p-4 bg-muted/50 rounded-lg flex items-center gap-4">
                                <img
                                    src={img.converted.dataUrl}
                                    alt={img.original.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{img.original.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{getFormatFromType(img.original.type)}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="text-primary font-medium">{img.converted.format.toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatSize(img.original.size)} → {formatSize(img.converted.size)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => downloadImage(img)} size="sm" variant="outline">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => removeImage(index)} size="sm" variant="ghost">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
