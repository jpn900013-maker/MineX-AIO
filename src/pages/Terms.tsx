import { ScrollText } from "lucide-react";

export default function Terms() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ScrollText className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Terms of Service</h1>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
                <section>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using MineX AIO, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section>
                    <h3>2. Use License</h3>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on MineX AIO for personal, non-commercial transitory viewing only.</p>
                </section>

                <section>
                    <h3>3. Disclaimer</h3>
                    <p>The materials on MineX AIO are provided on an 'as is' basis. MineX AIO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                </section>

                <section>
                    <h3>4. Limitations</h3>
                    <p>In no event shall MineX AIO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on MineX AIO.</p>
                </section>

                <section>
                    <h3>5. Third-Party Tools</h3>
                    <p>Some tools on this website may interact with third-party APIs (e.g., YouTube, Minecraft services). By using these tools, you also agree to be bound by the terms of service of those respective third parties.</p>
                </section>
            </div>
        </div>
    );
}
