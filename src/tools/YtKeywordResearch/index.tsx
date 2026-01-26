import { TrendingUp } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function YtKeywordResearch() {
    return (
        <ExternalTool
            title="YT Keyword Research"
            description="Find high-volume keywords for YouTube video tags"
            icon={TrendingUp}
            category="YouTube"
            targetUrl="https://ahrefs.com/youtube-keyword-tool"
            serviceName="Ahrefs Keyword Tool"
        />
    );
}
