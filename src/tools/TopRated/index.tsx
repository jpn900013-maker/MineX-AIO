import { useEffect, useState } from "react";
import { Star, Trophy, TrendingUp } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";

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
    rank: number;
    url: string;
}

export default function TopRated() {
    const [topAnime, setTopAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopAnime = async () => {
            try {
                const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=24");
                const data = await response.json();
                setTopAnime(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopAnime();
    }, []);

    return (
        <ToolPageLayout
            title="Top Rated Anime"
            description="Highest rated anime of all time"
            icon={Trophy}
            category="Entertainment"
        >
            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topAnime.map((anime, index) => (
                        <div key={anime.mal_id} className="relative group overflow-hidden rounded-xl border border-white/5 bg-background/50 hover:bg-muted/50 transition-colors">
                            {/* Rank Badge */}
                            <div className="absolute top-0 left-0 z-10 w-12 h-12 flex items-center justify-center bg-primary/90 text-primary-foreground font-bold text-xl rounded-br-2xl shadow-lg">
                                #{anime.rank || index + 1}
                            </div>

                            {/* Image */}
                            <div className="aspect-[2/3] relative overflow-hidden">
                                <img
                                    src={anime.images.jpg.large_image_url}
                                    alt={anime.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" onClick={() => window.open(anime.url, "_blank")}>
                                        View Details
                                    </Button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold truncate group-hover:text-primary transition-colors" title={anime.title}>
                                    {anime.title}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Star className="w-4 h-4 fill-yellow-500" />
                                        {anime.score}
                                    </div>
                                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                        Score
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ToolPageLayout>
    );
}
