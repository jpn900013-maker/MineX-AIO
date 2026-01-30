import { AlignLeft } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function YtDescriptionCopy() {
    return (
        <ExternalTool
            title="YT Description Copy"
            description="Extract and copy video descriptions"
            icon={AlignLeft}
            category="YouTube"
            targetUrl="https://www.tuberanker.com/youtube-description-generator"
            serviceName="TubeRanker"
        />
    );
}
