import { useState } from "react";
import { Search, Info, Calendar, Star, Play } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Anime {
    mal_id: number;
    title: string;
    images: {
        jpg: {
            image_url: string;
            large_image_url: string;
        }
    };
    score: number;
    episodes: number;
    synopsis: string;
    year: number;
    url: string;
    type: string;
}

export default function AnimeFinder() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const searchAnime = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw=true`);
            const data = await response.json();

            if (data.data) {
                setResults(data.data);
            } else {
                setResults([]);
                toast({ title: "No results", description: "Try a different search term" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to fetch anime data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="Anime Finder"
            description="Search and discover anime details using Jikan API"
            icon={Search}
            category="Entertainment"
        >
            <div className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search anime (e.g. Naruto, One Piece)..."
                        onKeyDown={(e) => e.key === "Enter" && searchAnime()}
                        className="bg-background/50"
                    />
                    <Button onClick={searchAnime} disabled={loading} className="gap-2">
                        {loading ? "Searching..." : "Search"}
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((anime) => (
                        <div key={anime.mal_id} className="group relative overflow-hidden rounded-xl bg-muted/30 border border-white/5 hover:border-primary/50 transition-colors">
                            <div className="aspect-[2/3] relative overflow-hidden">
                                <img
                                    src={anime.images.jpg.large_image_url}
                                    alt={anime.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-bold flex items-center gap-1 text-yellow-400">
                                    <Star className="w-3 h-3 fill-yellow-400" />
                                    {anime.score || "N/A"}
                                </div>

                                <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-xs font-bold">
                                    {anime.type}
                                </div>
                            </div>

                            <div className="p-4 relative">
                                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{anime.title}</h3>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {anime.year || "Unknown"}
                                    </span>
                                    <span>•</span>
                                    <span>{anime.episodes || "?"} eps</span>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {anime.synopsis}
                                </p>

                                <Button className="w-full gap-2" variant="secondary" onClick={() => window.open(anime.url, "_blank")}>
                                    <Info className="w-4 h-4" />
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ToolPageLayout>
    );
}
