import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link as LinkIcon, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface Paste {
    code: string;
    title: string;
    content: string;
    createdAt: number;
    views: number;
}

interface IpLink {
    code: string;
    url: string;
    createdAt: number;
    visitors: any[];
}

export default function Dashboard() {
    const { user, token, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [pastes, setPastes] = useState<Paste[]>([]);
    const [links, setLinks] = useState<IpLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.success) {
                    setPastes(data.pastes);
                    setLinks(data.links);
                }
            } catch (error) {
                console.error("Failed to fetch history");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated, token, navigate]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user.username}</p>
                    </div>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>

                <Tabs defaultValue="pastes">
                    <TabsList>
                        <TabsTrigger value="pastes">My Pastes</TabsTrigger>
                        <TabsTrigger value="links">My Links</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pastes" className="mt-6">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : pastes.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                <p className="text-muted-foreground">No pastes found</p>
                                <Button variant="link" onClick={() => navigate("/tools/pastebin")}>Create one</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pastes.map((paste) => (
                                    <div key={paste.code} className="p-4 bg-muted/30 border border-white/5 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <h3 className="font-medium">{paste.title}</h3>
                                            </div>
                                            <a href={`/paste/${paste.code}`} target="_blank" rel="noreferrer">
                                                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(paste.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>{paste.views} views</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="links" className="mt-6">
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : links.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                <p className="text-muted-foreground">No links found</p>
                                <Button variant="link" onClick={() => navigate("/tools/ip-logger")}>Create one</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {links.map((link) => (
                                    <div key={link.code} className="p-4 bg-muted/30 border border-white/5 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="w-4 h-4 text-green-400" />
                                                <h3 className="font-medium font-mono text-sm">{link.code}</h3>
                                            </div>
                                            <a href={`/track/${link.code}`} target="_blank" rel="noreferrer">
                                                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(link.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>{link.visitors.length} visitors</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
