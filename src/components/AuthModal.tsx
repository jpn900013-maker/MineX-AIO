import { useState } from "react";
import { X, Mail, Lock, User, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate auth
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
            title: mode === "login" ? "Welcome back!" : "Account created!",
            description: mode === "login"
                ? `Logged in as ${email}`
                : "You can now access all features",
        });

        setLoading(false);
        onClose();
    };

    const handleSocialAuth = (provider: string) => {
        toast({
            title: "Coming soon!",
            description: `${provider} login will be available soon`,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 p-6 bg-background border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {mode === "login"
                            ? "Sign in to access your saved tools and settings"
                            : "Join MineX AIO to unlock all features"}
                    </p>
                </div>

                {/* Social Buttons */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleSocialAuth("Google")}
                    >
                        <Chrome className="w-4 h-4" />
                        Google
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleSocialAuth("GitHub")}
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </Button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-background text-muted-foreground">or continue with email</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "register" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="minexuser"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {mode === "login" && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-sm text-primary hover:underline"
                                onClick={() => toast({ title: "Coming soon!", description: "Password reset will be available soon" })}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                    </Button>
                </form>

                {/* Toggle mode */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        className="text-primary font-medium hover:underline"
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                    >
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
