import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Info, Shield, CheckCircle } from "lucide-react";

export default function About() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">About <span className="text-gradient">MineX AIO</span></h1>
                <p className="text-xl text-muted-foreground">The Ultimate All-in-One Tool Suite for Gamers & Developers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="p-6 rounded-2xl bg-muted/30 border border-white/5 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Free & Open</h3>
                    <p className="text-sm text-muted-foreground">Everything is 100% free to use. No hidden subscriptions or paywalls.</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 border border-white/5 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">We respect your privacy. All processing happens locally or via secure APIs.</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 border border-white/5 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">50+ Tools</h3>
                    <p className="text-sm text-muted-foreground">From Minecraft utilities to PDF editors, we have everything you need.</p>
                </div>
            </div>

            <div className="prose prose-invert max-w-none">
                <h2>Our Mission</h2>
                <p>
                    MineX AIO was built with a simple mission: to provide a centralized platform where users can access essential digital tools without the hassle of bookmarking dozens of different websites. Whether you are a Minecraft server owner needing to check status, a developer needing to format JSON, or just someone looking to watch anime, existing solutions were often cluttered with ads or required payment.
                </p>
                <p>
                    We believe in clean, modern design and functionality first.
                </p>

                <h2>The Developer</h2>
                <p>
                    MineX AIO is developed and maintained by <strong>MineX13</strong>.
                    Passionate about creating useful software and contributing to the open-source community.
                </p>
            </div>
        </div>
    );
}
