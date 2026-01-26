import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  gradient?: string;
  onClick?: () => void;
}

export function CategoryCard({ title, count, icon: Icon, gradient, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full p-6 rounded-2xl",
        "glass glass-hover",
        "transform transition-all duration-300",
        "hover:scale-[1.03] hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        gradient || "bg-gradient-to-br from-primary/5 to-accent/5"
      )} />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          "bg-gradient-to-br from-primary/20 to-accent/20",
          "border border-white/10",
          "group-hover:scale-110 transition-transform duration-300"
        )}>
          <Icon className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {count} tools
          </p>
        </div>

        {/* Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
