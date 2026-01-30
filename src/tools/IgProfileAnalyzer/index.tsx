import { Instagram } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function IgProfileAnalyzer() {
    return (
        <ExternalTool
            title="IG Profile Analyzer"
            description="Analyze Instagram profiles and engagement"
            icon={Instagram}
            category="Instagram"
            targetUrl="https://socialblade.com/instagram/"
            serviceName="SocialBlade"
        />
    );
}
