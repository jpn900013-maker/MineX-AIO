import { Link } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function BacklinkChecker() {
    return (
        <ExternalTool
            title="Backlink Checker"
            description="Check backlinks pointing to any website (Free version)"
            icon={Link}
            category="SEO"
            targetUrl="https://ahrefs.com/backlink-checker"
            serviceName="Ahrefs Backlink Checker"
        />
    );
}
