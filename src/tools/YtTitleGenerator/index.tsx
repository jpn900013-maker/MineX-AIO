import { Heading } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function YtTitleGenerator() {
    return (
        <ExternalTool
            title="YT Title Generator"
            description="Generate click-worthy titles for your videos"
            icon={Heading}
            category="YouTube"
            targetUrl="https://www.tuberanker.com/youtube-title-generator"
            serviceName="TubeRanker"
        />
    );
}
