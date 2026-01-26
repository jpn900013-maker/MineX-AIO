import { BarChart3 } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function YtAnalyticsChecker() {
    return (
        <ExternalTool
            title="YT Analytics Checker"
            description="Check channel views, subs, and growth stats"
            icon={BarChart3}
            category="YouTube"
            targetUrl="https://socialblade.com/youtube/"
            serviceName="SocialBlade"
        />
    );
}
