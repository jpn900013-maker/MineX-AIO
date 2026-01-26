import { ShieldAlert } from "lucide-react";

export default function Privacy() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
                <section>
                    <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>Your privacy is important to us. It is MineX AIO's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                </section>

                <section>
                    <h3>1. Information We Collect</h3>
                    <p>We do not collect personal usage data. Any files you upload for processing (such as PDFs or Images) are processed locally in your browser when possible. If server processing is required, files are deleted immediately after processing.</p>
                </section>

                <section>
                    <h3>2. Local Storage</h3>
                    <p>We use local storage to save your preferences (such as theme headers) and tool history (like recently viewed servers). This data stays on your device and is never sent to our servers.</p>
                </section>

                <section>
                    <h3>3. Third-Party Services</h3>
                    <p>Our website uses third-party services for specific features (e.g., YouTube API, Jikan API). These services may collect their own data in accordance with their privacy policies.</p>
                </section>

                <section>
                    <h3>4. Contact Us</h3>
                    <p>If you have any questions about our privacy policy, please contact us via our Contact page or Discord.</p>
                </section>
            </div>
        </div>
    );
}
