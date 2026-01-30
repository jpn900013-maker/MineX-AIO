import { BarChart3 } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function DomainAuthority() {
    return (
        <ExternalTool
            title="Domain Authority"
            description="Check website authority and SEO metrics"
            icon={BarChart3}
            category="SEO"
            targetUrl="https://ahrefs.com/website-authority-checker"
            serviceName="Ahrefs Authority Checker"
        />
    );
}
