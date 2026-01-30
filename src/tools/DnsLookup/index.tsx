import { useState } from "react";
import { Server, Search, Copy, Check, Globe, Mail, FileText, Shield } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type RecordType = "A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME" | "SOA";

interface DnsRecord {
    name: string;
    type: number;
    TTL: number;
    data: string;
}

const RECORD_TYPES: { value: RecordType; label: string; icon: typeof Globe }[] = [
    { value: "A", label: "A (IPv4)", icon: Globe },
    { value: "AAAA", label: "AAAA (IPv6)", icon: Globe },
    { value: "MX", label: "MX (Mail)", icon: Mail },
    { value: "TXT", label: "TXT (Text)", icon: FileText },
    { value: "NS", label: "NS (Nameserver)", icon: Server },
    { value: "CNAME", label: "CNAME (Alias)", icon: Globe },
    { value: "SOA", label: "SOA (Authority)", icon: Shield },
];

export default function DnsLookup() {
    const [domain, setDomain] = useState("");
    const [recordType, setRecordType] = useState<RecordType>("A");
    const [results, setResults] = useState<DnsRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const lookupDns = async () => {
        if (!domain.trim()) {
            toast({ title: "Enter domain", description: "Please enter a domain name", variant: "destructive" });
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // Using Google's DNS-over-HTTPS API
            const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            const response = await fetch(
                `https://dns.google/resolve?name=${encodeURIComponent(cleanDomain)}&type=${recordType}`
            );
            const data = await response.json();

            if (data.Status !== 0) {
                const errors: Record<number, string> = {
                    1: "Format error - The name server was unable to interpret the query",
                    2: "Server failure - The name server was unable to process this query",
                    3: "Name error - The domain name does not exist",
                    4: "Not implemented - The name server does not support the requested query type",
                    5: "Refused - The name server refuses to perform the operation",
                };
                setError(errors[data.Status] || `DNS query failed with status ${data.Status}`);
                return;
            }

            if (!data.Answer || data.Answer.length === 0) {
                setError(`No ${recordType} records found for ${cleanDomain}`);
                return;
            }

            setResults(data.Answer);
            toast({ title: "Success!", description: `Found ${data.Answer.length} record(s)` });
        } catch (e) {
            setError("Failed to perform DNS lookup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyResults = async () => {
        const text = results.map((r) => `${r.name} ${r.TTL} ${getTypeName(r.type)} ${r.data}`).join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({ title: "Copied!", description: "DNS records copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const getTypeName = (type: number): string => {
        const types: Record<number, string> = {
            1: "A",
            28: "AAAA",
            15: "MX",
            16: "TXT",
            2: "NS",
            5: "CNAME",
            6: "SOA",
        };
        return types[type] || `TYPE${type}`;
    };

    const formatTTL = (ttl: number): string => {
        if (ttl < 60) return `${ttl}s`;
        if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
        if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`;
        return `${Math.floor(ttl / 86400)}d`;
    };

    return (
        <ToolPageLayout
            title="DNS Lookup"
            description="Query DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA) for any domain"
            icon={Server}
            category="Network"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex flex-col md:flex-row gap-2">
                    <Input
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Enter domain (e.g., google.com)"
                        className="bg-background/50 flex-1"
                        onKeyDown={(e) => e.key === "Enter" && lookupDns()}
                    />
                    <Select value={recordType} onValueChange={(v) => setRecordType(v as RecordType)}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Record Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {RECORD_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={lookupDns} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        {loading ? "Looking up..." : "Lookup"}
                    </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                    {RECORD_TYPES.slice(0, 5).map((type) => (
                        <Button
                            key={type.value}
                            variant={recordType === type.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRecordType(type.value)}
                        >
                            {type.value}
                        </Button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">
                                {results.length} Record{results.length > 1 ? "s" : ""} Found
                            </h3>
                            <Button onClick={copyResults} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy All
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {results.map((record, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-muted/50 rounded-lg space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                                            {getTypeName(record.type)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            TTL: {formatTTL(record.TTL)}
                                        </span>
                                    </div>
                                    <p className="font-mono text-sm break-all">{record.data}</p>
                                    <p className="text-xs text-muted-foreground">{record.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Record Types</h4>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p><strong>A:</strong> IPv4 address</p>
                        <p><strong>AAAA:</strong> IPv6 address</p>
                        <p><strong>MX:</strong> Mail server</p>
                        <p><strong>TXT:</strong> Text records (SPF, DKIM, etc.)</p>
                        <p><strong>NS:</strong> Nameservers</p>
                        <p><strong>CNAME:</strong> Canonical name (alias)</p>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
