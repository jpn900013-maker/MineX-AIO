import { useState } from "react";
import { Eye, Search, Copy, Check, Calendar, Globe, User, Building } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface WhoisInfo {
    domainName: string;
    registrar: string;
    createdDate: string;
    expiresDate: string;
    updatedDate: string;
    status: string[];
    nameServers: string[];
    registrantOrg?: string;
    registrantCountry?: string;
}

export default function WhoisLookup() {
    const [domain, setDomain] = useState("");
    const [result, setResult] = useState<WhoisInfo | null>(null);
    const [rawWhois, setRawWhois] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const lookupWhois = async () => {
        if (!domain.trim()) {
            toast({ title: "Enter domain", description: "Please enter a domain name", variant: "destructive" });
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setRawWhois("");

        try {
            // Using RDAP (Registration Data Access Protocol) - the modern WHOIS replacement
            const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();

            // First, get the TLD's RDAP server
            const tld = cleanDomain.split(".").pop();
            const rdapBootstrap = await fetch("https://data.iana.org/rdap/dns.json");
            const bootstrapData = await rdapBootstrap.json();

            let rdapServer = null;
            for (const service of bootstrapData.services) {
                if (service[0].includes(tld)) {
                    rdapServer = service[1][0];
                    break;
                }
            }

            if (!rdapServer) {
                // Fallback to common RDAP servers
                rdapServer = "https://rdap.verisign.com/com/v1/";
            }

            const response = await fetch(`${rdapServer}domain/${cleanDomain}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError("Domain not found. It may not be registered or the RDAP server doesn't have data for it.");
                } else {
                    setError(`RDAP query failed with status ${response.status}`);
                }
                return;
            }

            const data = await response.json();

            // Parse RDAP response
            const info: WhoisInfo = {
                domainName: data.ldhName || cleanDomain,
                registrar: data.entities?.find((e: any) => e.roles?.includes("registrar"))?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] || "Unknown",
                createdDate: data.events?.find((e: any) => e.eventAction === "registration")?.eventDate || "Unknown",
                expiresDate: data.events?.find((e: any) => e.eventAction === "expiration")?.eventDate || "Unknown",
                updatedDate: data.events?.find((e: any) => e.eventAction === "last changed")?.eventDate || "Unknown",
                status: data.status || [],
                nameServers: data.nameservers?.map((ns: any) => ns.ldhName) || [],
                registrantOrg: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "org")?.[3],
                registrantCountry: data.entities?.find((e: any) => e.roles?.includes("registrant"))?.vcardArray?.[1]?.find((v: any) => v[0] === "adr")?.[3]?.country,
            };

            setResult(info);
            setRawWhois(JSON.stringify(data, null, 2));
            toast({ title: "Success!", description: "WHOIS data retrieved" });
        } catch (e) {
            setError("Failed to perform WHOIS lookup. The domain may not support RDAP.");
        } finally {
            setLoading(false);
        }
    };

    const copyResults = async () => {
        const text = showRaw ? rawWhois : `
Domain: ${result?.domainName}
Registrar: ${result?.registrar}
Created: ${result?.createdDate}
Expires: ${result?.expiresDate}
Updated: ${result?.updatedDate}
Status: ${result?.status?.join(", ")}
Nameservers: ${result?.nameServers?.join(", ")}
    `.trim();

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({ title: "Copied!", description: "WHOIS data copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const formatDate = (dateStr: string): string => {
        if (dateStr === "Unknown") return dateStr;
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const isExpiringSoon = (dateStr: string): boolean => {
        if (dateStr === "Unknown") return false;
        try {
            const expiry = new Date(dateStr);
            const now = new Date();
            const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry < 30 && daysUntilExpiry > 0;
        } catch {
            return false;
        }
    };

    return (
        <ToolPageLayout
            title="WHOIS Lookup"
            description="Get domain registration information including registrar, dates, and nameservers"
            icon={Eye}
            category="Network"
        >
            <div className="space-y-6">
                {/* Input */}
                <div className="flex gap-2">
                    <Input
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Enter domain (e.g., example.com)"
                        className="bg-background/50"
                        onKeyDown={(e) => e.key === "Enter" && lookupWhois()}
                    />
                    <Button onClick={lookupWhois} disabled={loading} className="gap-2">
                        <Search className="w-4 h-4" />
                        {loading ? "Looking up..." : "Lookup"}
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">WHOIS Information</h3>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowRaw(!showRaw)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    {showRaw ? "Parsed" : "Raw"}
                                </Button>
                                <Button onClick={copyResults} variant="ghost" size="sm" className="gap-1">
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    Copy
                                </Button>
                            </div>
                        </div>

                        {showRaw ? (
                            <pre className="p-4 bg-muted/50 rounded-lg font-mono text-xs overflow-auto max-h-[500px]">
                                {rawWhois}
                            </pre>
                        ) : (
                            <>
                                {/* Domain Name */}
                                <div className="p-4 bg-primary/10 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-primary">{result.domainName}</p>
                                </div>

                                {/* Info Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Building className="w-4 h-4" />
                                            <span className="text-sm font-medium">Registrar</span>
                                        </div>
                                        <p className="font-medium">{result.registrar}</p>
                                    </div>

                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium">Registration Dates</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="text-muted-foreground">Created:</span> {formatDate(result.createdDate)}</p>
                                            <p className={isExpiringSoon(result.expiresDate) ? "text-yellow-500" : ""}>
                                                <span className="text-muted-foreground">Expires:</span> {formatDate(result.expiresDate)}
                                                {isExpiringSoon(result.expiresDate) && " ⚠️ Expiring soon"}
                                            </p>
                                            <p><span className="text-muted-foreground">Updated:</span> {formatDate(result.updatedDate)}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-sm font-medium">Nameservers</span>
                                        </div>
                                        <div className="space-y-1">
                                            {result.nameServers.length > 0 ? (
                                                result.nameServers.map((ns, i) => (
                                                    <p key={i} className="font-mono text-sm">{ns}</p>
                                                ))
                                            ) : (
                                                <p className="text-muted-foreground text-sm">No nameservers found</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm font-medium">Status</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {result.status.map((s, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                                                >
                                                    {s.replace("https://icann.org/epp#", "")}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
