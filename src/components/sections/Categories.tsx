import { useNavigate } from "react-router-dom";
import {
  Code2, Image, Type, Hash, Palette, Lock, Globe, FileJson,
  Youtube, Gamepad2, Tv, Link, FileText, Music, Video, File
} from "lucide-react";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { allTools } from "@/lib/toolsData";

const categoryConfig = [
  { title: "Developer", icon: Code2, slug: "Developer" },
  { title: "Minecraft", icon: Gamepad2, slug: "Minecraft" },
  { title: "YouTube", icon: Youtube, slug: "YouTube" },
  { title: "Image Tools", icon: Image, slug: "Image" },
  { title: "Text Tools", icon: Type, slug: "Text" },
  { title: "Network", icon: Globe, slug: "Network" },
  { title: "SEO Tools", icon: Hash, slug: "SEO" },
  { title: "Social Media", icon: Palette, slug: "Instagram" }, // Maps to Instagram for now, but should ideally be split or grouped
  { title: "Entertainment", icon: Tv, slug: "Entertainment" },
  { title: "Link Tools", icon: Link, slug: "Link" },
  { title: "PDF Tools", icon: FileText, slug: "PDF" },
  { title: "Audio Tools", icon: Music, slug: "Audio" },
  { title: "Video Tools", icon: Video, slug: "Video" },
];

export function Categories() {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/search?category=${encodeURIComponent(slug)}`);
  };

  // Dynamically calculate counts
  const categoriesWithCounts = categoryConfig.map(cat => {
    let count = 0;
    if (cat.title === "Social Media") {
      // Aggregate Instagram and Twitter
      count = allTools.filter(t => t.category === "Instagram" || t.category === "Twitter").length;
    } else {
      count = allTools.filter(t => t.category === cat.slug).length;
    }
    return { ...cat, count };
  });

  return (
    <section id="categories" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of tools organized by category
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoriesWithCounts.map((category, index) => (
            <div
              key={category.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard
                title={category.title}
                count={category.count}
                icon={category.icon}
                onClick={() => handleCategoryClick(category.slug)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
