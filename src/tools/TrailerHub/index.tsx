import { useEffect, useState } from "react";
import { Play, Calendar, Star } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    trailer: {
        youtube_id: string;
        url: string;
        embed_url: string;
        images: {
            image_url: string;
            large_image_url: string;
        }
    };
    synopsis: string;
    season: string;
    year: number;
}

export default function TrailerHub() {
    const [season, setSeason] = useState("now"); // now, upcoming
    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

    useEffect(() => {
        fetchTrailers(season);
    }, [season]);

    const fetchTrailers = async (type: string) => {
        setLoading(true);
        setAnimes([]);
        try {
            const response = await fetch(`https://api.jikan.moe/v4/seasons/${type}?limit=24`);
            const data = await response.json();
            // Filter for anime that actually have trailers
            const withTrailers = data.data.filter((a: Anime) => a.trailer.embed_url);
            setAnimes(withTrailers);
        } catch {
            console.error("Failed to fetch trailers");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="Trailer Hub"
            description="Watch the latest trailers for currently airing and upcoming anime"
            icon={Play}
            category="Entertainment"
        >
            <Tabs value={season} onValueChange={setSeason} className="space-y-6">
                <div className="flex justify-center">
                    <TabsList>
                        <TabsTrigger value="now">Currently Airing</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming Seasons</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value={season} className="space-y-6">
                    {activeTrailer && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                                <iframe
                                    src={activeTrailer}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                <button
                                    onClick={() => setActiveTrailer(null)}
                                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-video bg-muted/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {animes.map((anime) => (
                                <div key={anime.mal_id} className="group relative rounded-xl overflow-hidden bg-muted/30 border border-white/5 hover:border-primary/50 transition-all">
                                    {/* Trailer Thumbnail */}
                                    <div className="aspect-video relative cursor-pointer" onClick={() => setActiveTrailer(anime.trailer.embed_url)}>
                                        <img
                                            src={anime.trailer.images.large_image_url || anime.images.jpg.large_image_url}
                                            alt={anime.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 fill-white text-white ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold line-clamp-1 mb-1">{anime.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {anime.synopsis}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </ToolPageLayout>
    );
}
