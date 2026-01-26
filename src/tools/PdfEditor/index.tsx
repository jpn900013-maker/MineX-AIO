import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { FileUp, Download, RefreshCw, Edit, Type } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function PdfEditor() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const addWatermark = async () => {
        if (!file || !text.trim()) return;

        setLoading(true);
        try {
            const fileBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBuffer);
            const pages = pdf.getPages();

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: 50,
                    y: height - 50,
                    size: 30,
                    color: rgb(0.75, 0.2, 0.2), // Reddish watermark
                    opacity: 0.5,
                });
            });

            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `edited_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

            toast({ title: "Success", description: "Watermark added to PDF" });
        } catch {
            toast({ title: "Error", description: "Failed to edit PDF", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="PDF Editor (Watermark)"
            description="Add text watermarks to your PDF documents (Client-side)"
            icon={Edit}
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
                            id="file-upload-edit"
                        />
                        <label htmlFor="file-upload-edit" className="cursor-pointer block">
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
                            <div className="flex-1 truncate font-medium">{file.name}</div>
                            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-white">Change</button>
                        </div>

                        <div className="space-y-4 bg-background/50 p-6 rounded-xl border border-white/5">
                            <h3 className="font-medium flex items-center gap-2">
                                <Type className="w-4 h-4 text-primary" />
                                Add Text Watermark
                            </h3>
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter watermark text (e.g. DRAFT, CONFIDENTIAL)"
                            />

                            <Button onClick={addWatermark} disabled={loading || !text.trim()} className="w-full gap-2" size="lg">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Add Watermark & Download
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
