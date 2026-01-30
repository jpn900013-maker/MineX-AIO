import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUp, Download, RefreshCw, Archive, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PdfFile {
    file: File;
    id: string;
}

export default function PdfMerger() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                file,
                id: Math.random().toString(36).substring(7),
            }));
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const mergePdfs = async () => {
        if (files.length < 2) {
            toast({ title: "Select files", description: "Please select at least 2 PDF files to merge", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const pdfFile of files) {
                const fileBuffer = await pdfFile.file.arrayBuffer();
                const pdf = await PDFDocument.load(fileBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `merged_${Date.now()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast({ title: "Success!", description: "PDFs merged successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to merge PDFs. Ensure they are valid files.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="PDF Merger"
            description="Combine multiple PDF files into one document instantly (Client-side, secure)"
            icon={Archive}
            category="PDF"
        >
            <div className="max-w-xl mx-auto space-y-8">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-muted/30 transition-colors">
                    <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileUp className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Upload PDF Files</h3>
                        <p className="text-sm text-muted-foreground">Click to select files</p>
                    </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                            Files to Merge ({files.length})
                        </h3>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div key={file.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-white/5">
                                    <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-xs font-mono">
                                        {index + 1}
                                    </span>
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="flex-1 truncate text-sm">{file.file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <Button onClick={mergePdfs} disabled={loading} className="w-full gap-2" size="lg">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {loading ? "Merging..." : "Merge PDFs"}
                        </Button>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
