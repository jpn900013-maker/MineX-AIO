import { Search } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function PlagiarismChecker() {
    return (
        <ExternalTool
            title="Plagiarism Checker"
            description="Check content for duplicate text across the web"
            icon={Search}
            category="Text"
            targetUrl="https://www.duplichecker.com/"
            serviceName="DupliChecker"
        />
    );
}
