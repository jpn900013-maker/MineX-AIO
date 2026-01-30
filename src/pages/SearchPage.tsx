import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, X, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/ui/ToolCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getToolRoute, isToolAvailable } from "@/lib/toolRoutes";
import { allTools, categories } from "@/lib/toolsData";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";
    const categoryFilter = searchParams.get("category") || "All";
    const [searchInput, setSearchInput] = useState(query);

    const filteredTools = useMemo(() => {
        let results = allTools;

        // Filter by category
        if (categoryFilter && categoryFilter !== "All") {
            if (categoryFilter === "Instagram") {
                // Include Twitter if we are merging? Or just let SearchPage be specific
                results = results.filter((tool) => tool.category === "Instagram" || tool.category === "Twitter");
            } else {
                results = results.filter((tool) => tool.category === categoryFilter);
            }
        }

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(
                (tool) =>
                    tool.title.toLowerCase().includes(lowerQuery) ||
                    tool.description.toLowerCase().includes(lowerQuery) ||
                    tool.category.toLowerCase().includes(lowerQuery)
            );
        }

        return results;
    }, [query, categoryFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ q: searchInput, category: categoryFilter });
    };

    const handleCategoryChange = (category: string) => {
        setSearchParams({ q: query, category: category });
    };

    const handleToolClick = (toolTitle: string) => {
        const route = getToolRoute(toolTitle);
        if (route && isToolAvailable(toolTitle)) {
            navigate(route);
        }
    };

    const clearSearch = () => {
        setSearchInput("");
        setSearchParams({ category: categoryFilter });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Search Tools
                    </h1>
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search for tools..."
                                className="pl-10 pr-10 py-6 bg-background/50"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" size="lg">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Filter by category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={categoryFilter === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
                        {query && ` for "${query}"`}
                        {categoryFilter !== "All" && ` in ${categoryFilter}`}
                    </p>
                </div>

                {filteredTools.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">No tools found</h2>
                        <p className="text-muted-foreground">
                            Try a different search term or category
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTools.map((tool) => (
                            <ToolCard
                                key={tool.title}
                                title={tool.title}
                                description={tool.description}
                                icon={tool.icon}
                                category={tool.category}
                                isAvailable={isToolAvailable(tool.title)}
                                onClick={() => handleToolClick(tool.title)}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
