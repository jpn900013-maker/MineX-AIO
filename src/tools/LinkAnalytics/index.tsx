import { BarChart3 } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function LinkAnalytics() {
    return (
        <ExternalTool
            title="Link Analytics"
            description="Track clicks and analytics for shortened links"
            icon={BarChart3}
            category="Link"
            targetUrl="https://bitly.com/"
            serviceName="Bitly"
        />
    );
}
