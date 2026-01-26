import { Tags } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function YtTagsExtractor() {
    return (
        <ExternalTool
            title="YT Tags Extractor"
            description="Extract tags from any YouTube video"
            icon={Tags}
            category="YouTube"
            targetUrl="https://www.tunepocket.com/youtube-tags-inspector/"
            serviceName="TunePocket Tag Inspector"
        />
    );
}
