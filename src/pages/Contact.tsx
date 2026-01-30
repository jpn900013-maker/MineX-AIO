import { Mail, MessageSquare, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
    return (
        <div className="container mx-auto px-4 py-20 max-w-2xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-muted-foreground">Have questions, suggestions, or found a bug? Reach out to us!</p>
            </div>

            <div className="space-y-6">
                {/* Discord */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 bg-[#5865F2]/20 text-[#5865F2] rounded-xl flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">Discord</h3>
                        <p className="text-sm text-muted-foreground mb-2">The fastest way to get support</p>
                        <code className="bg-black/40 px-2 py-1 rounded text-xs text-muted-foreground">ID: 941139424580890666</code>
                    </div>
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText("941139424580890666")}>
                        Copy ID
                    </Button>
                </div>

                {/* GitHub */}
                <a
                    href="https://github.com/MineX13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/50 transition-colors group"
                >
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Github className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">GitHub</h3>
                        <p className="text-sm text-muted-foreground">Report issues or contribute code</p>
                    </div>
                    <Button variant="ghost">Visit Profile</Button>
                </a>

                {/* Email */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">Email</h3>
                        <p className="text-sm text-muted-foreground">For business inquiries</p>
                    </div>
                    <Button disabled variant="outline">Coming Soon</Button>
                </div>
            </div>
        </div>
    );
}
