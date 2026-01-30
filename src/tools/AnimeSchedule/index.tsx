import { useEffect, useState } from "react";
import { Calendar, Clock, Tv } from "lucide-react";
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
    score: number;
    broadcast: {
        time: string;
        timezone: string;
        string: string;
    };
    url: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AnimeSchedule() {
    const [activeDay, setActiveDay] = useState(() => {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday
        const adjusted = today === 0 ? 6 : today - 1; // 0 = Monday, ... 6 = Sunday
        return DAYS[adjusted];
    });
    const [schedule, setSchedule] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSchedule(activeDay);
    }, [activeDay]);

    const fetchSchedule = async (day: string) => {
        setLoading(true);
        setSchedule([]);
        try {
            const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day.toLowerCase()}&sfw=true`);
            const data = await response.json();
            setSchedule(data.data || []);
        } catch {
            console.error("Failed to fetch schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="Anime Schedule"
            description="Track when your favorite anime airs (JST)"
            icon={Calendar}
            category="Entertainment"
        >
            <div className="space-y-6">
                <div className="flex overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-2 mx-auto">
                        {DAYS.map((day) => (
                            <Button
                                key={day}
                                variant={activeDay === day ? "default" : "outline"}
                                onClick={() => setActiveDay(day)}
                                className="rounded-full"
                            >
                                {day}
                            </Button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {schedule.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-muted-foreground">
                                No anime scheduled for this day
                            </div>
                        ) : (
                            schedule.map((anime) => (
                                <div key={anime.mal_id} className="group relative flex gap-4 p-3 rounded-lg border border-white/5 bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                                        <img
                                            src={anime.images.jpg.image_url}
                                            alt={anime.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{anime.title}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{anime.broadcast.time || "Unknown Time"}</span>
                                        </div>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto justify-start text-xs mt-2 text-primary/80 hover:text-primary"
                                            onClick={() => window.open(anime.url, "_blank")}
                                        >
                                            More Info <ExternalLink className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
