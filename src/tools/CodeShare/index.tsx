import { Share2 } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function CodeShare() {
    return (
        <ExternalTool
            title="Code Share"
            description="Collaborate on code in real-time"
            icon={Share2}
            category="Dev"
            targetUrl="https://codeshare.io/"
            serviceName="CodeShare.io"
        />
    );
}
