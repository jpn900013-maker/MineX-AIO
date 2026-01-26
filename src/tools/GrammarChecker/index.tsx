import { FileText } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function GrammarChecker() {
    return (
        <ExternalTool
            title="Grammar Checker"
            description="Fix grammar, spelling, and punctuation errors"
            icon={FileText}
            category="Text"
            targetUrl="https://quillbot.com/grammar-check"
            serviceName="QuillBot"
        />
    );
}
