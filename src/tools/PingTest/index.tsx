import { Wifi } from "lucide-react";
import { ExternalTool } from "@/components/tools/ExternalTool";

export default function PingTest() {
    return (
        <ExternalTool
            title="Ping Test"
            description="Check server response time and availability from multiple locations"
            icon={Wifi}
            category="Network"
            targetUrl="https://www.site24x7.com/tools/ping-test.html"
            serviceName="Site24x7 Ping"
        />
    );
}
