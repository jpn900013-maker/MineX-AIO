import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FileUp, Download, RefreshCw, Scissors, FileText } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function PdfSplitter() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            try {
                const buffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(buffer);
                setPageCount(pdf.getPageCount());
            } catch {
                toast({ title: "Error", description: "Invalid PDF file", variant: "destructive" });
                setFile(null);
            }
        }
    };

    const splitPdf = async (singlePageMode: boolean) => {
        if (!file) return;

        setLoading(true);
        try {
            const sourcePdfBytes = await file.arrayBuffer();
            const sourcePdf = await PDFDocument.load(sourcePdfBytes);
            const pageIndices = sourcePdf.getPageIndices();

            if (singlePageMode) {
                // Create one PDF per page
                for (const i of pageIndices) {
                    const newPdf = await PDFDocument.create();
                    const [page] = await newPdf.copyPages(sourcePdf, [i]);
                    newPdf.addPage(page);

                    const pdfBytes = await newPdf.save();
                    downloadBlob(pdfBytes, `${file.name.replace(".pdf", "")}_page_${i + 1}.pdf`);
                }
                toast({ title: "Success", description: `Split into ${pageCount} files` });
            } else {
                // Simple example: Split in half? Or just extract first page?
                // Let's implement "Extract Per Page" as the main feature for now
                // Or "Extract Pages" where user selects them? 
                // For simplicity let's stick to "Split Every Page" first.
            }
        } catch {
            toast({ title: "Error", description: "Failed to split PDF", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadBlob = (bytes: Uint8Array, name: string) => {
        const blob = new Blob([bytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ToolPageLayout
            title="PDF Splitter"
            description="Split PDF documents into separate pages (Client-side)"
            icon={Scissors}
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
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer block">
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
                            <FileText className="w-8 h-8 text-primary" />
                            <div className="flex-1">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {pageCount} Pages
                                </p>
                            </div>
                            <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-white">Change</button>
                        </div>

                        <div className="grid gap-4">
                            <Button onClick={() => splitPdf(true)} disabled={loading} className="gap-2" size="lg">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                                Split into Separate Files (All Pages)
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                This will download {pageCount} separate PDF files.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
