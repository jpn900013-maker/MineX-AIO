import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("adminToken", data.token);
                toast({ title: "Admin Access Granted", description: "Welcome back, Operator." });
                navigate("/admin/dashboard");
            } else {
                toast({ title: "Access Denied", description: data.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Server unreachable", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono">
            <div className="container flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-md p-8 border border-green-500/30 rounded-none bg-black">
                    <h1 className="text-xl font-bold text-center mb-8 tracking-widest">[ SYSTEM ENTRY ]</h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest">Operator ID</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent border-green-500/30 text-green-500 focus:border-green-500 rounded-none h-12"
                                placeholder="ACCESS ID"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest">Passphrase</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-green-500/30 text-green-500 focus:border-green-500 rounded-none h-12"
                                placeholder="******"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-green-900/20 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-black rounded-none h-12 uppercase tracking-widest transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : "Initialize Session"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
