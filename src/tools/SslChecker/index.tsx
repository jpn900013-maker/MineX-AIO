import { Shield } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function SslChecker() {
    return (
        <ExternalTool
            title="SSL Checker"
            description="Verify SSL certificate installation and validity"
            icon={Shield}
            category="Network"
            targetUrl="https://www.sslshopper.com/ssl-checker.html"
            serviceName="SSL Shopper"
        />
    );
}
