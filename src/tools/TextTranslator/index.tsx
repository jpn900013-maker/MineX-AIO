import { Languages } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function TextTranslator() {
    return (
        <ExternalTool
            title="Text Translator"
            description="Translate text between 100+ languages instantly"
            icon={Languages}
            category="Text"
            targetUrl="https://translate.google.com/"
            serviceName="Google Translate"
        />
    );
}
