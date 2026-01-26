import { Popcorn } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function MovieTracker() {
    return (
        <ExternalTool
            title="Movie Tracker"
            description="Track watched movies and create lists"
            icon={Popcorn}
            category="Entertainment"
            targetUrl="https://letterboxd.com/"
            serviceName="Letterboxd"
        />
    );
}
