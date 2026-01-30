import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FileUp, Image as ImageIcon, Download, RefreshCw, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToImage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setImages([]);
        }
    };

    const convertToImages = async () => {
        if (!file) return;

        setLoading(true);
        setImages([]);
        try {
            const fileBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

            const newImages: string[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    newImages.push(canvas.toDataURL("image/jpeg"));
                }
            }

            setImages(newImages);
            toast({ title: "Converted!", description: `${pdf.numPages} pages converted to images` });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to convert PDF. Try a simpler file.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = (dataUrl: string, index: number) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${file?.name.replace(".pdf", "")}_page_${index + 1}.jpg`;
        link.click();
    };

    return (
        <ToolPageLayout
            title="PDF to Image"
            description="Convert PDF pages to high-quality JPG images"
            icon={ImageIcon}
            category="PDF"
        >
            <div className="max-w-xl mx-auto space-y-8">
                {!file ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="pdf-upload-img"
                        />
                        <label htmlFor="pdf-upload-img" className="cursor-pointer block">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileUp className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">Upload PDF</h3>
                            <p className="text-sm text-muted-foreground">Click to select a file</p>
                        </label>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-white/5">
                            <FileText className="w-6 h-6 text-primary" />
                            <div className="flex-1 truncate font-medium">{file.name}</div>
                            <button onClick={() => { setFile(null); setImages([]); }} className="text-xs text-muted-foreground hover:text-white">Change</button>
                        </div>

                        {images.length === 0 && (
                            <Button onClick={convertToImages} disabled={loading} className="w-full gap-2" size="lg">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                {loading ? "Converting..." : "Convert to Images"}
                            </Button>
                        )}

                        {images.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-medium">Converted Pages ({images.length})</h3>
                                <div className="grid gap-4">
                                    {images.map((img, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg border border-white/5">
                                            <img src={img} alt={`Page ${i + 1}`} className="w-12 h-16 object-cover rounded border" />
                                            <span className="flex-1 font-mono text-sm">Page {i + 1}</span>
                                            <Button onClick={() => downloadImage(img, i)} size="sm" variant="outline" className="gap-2">
                                                <Download className="w-4 h-4" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
