import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JwtDecoder = () => {
    const [token, setToken] = useState("");
    const [decodedHeader, setDecodedHeader] = useState("");
    const [decodedPayload, setDecodedPayload] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (!token) {
            setDecodedHeader("");
            setDecodedPayload("");
            return;
        }

        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                throw new Error("Invalid JWT format");
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));

            setDecodedHeader(JSON.stringify(header, null, 2));
            setDecodedPayload(JSON.stringify(payload, null, 2));
        } catch (error) {
            setDecodedHeader("Invalid Token");
            setDecodedPayload("Invalid Token");
        }
    }, [token]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Content copied to clipboard",
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">JWT Decoder</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Encoded Token</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Paste your JWT here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                        className="min-h-[100px] font-mono"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Header</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(decodedHeader)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs font-mono">
                            {decodedHeader || "// Header will appear here"}
                        </pre>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Payload</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(decodedPayload)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-xs font-mono">
                            {decodedPayload || "// Payload will appear here"}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default JwtDecoder;
