import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category?: string;
  isNew?: boolean;
  isAvailable?: boolean;
  onClick?: () => void;
}

export function ToolCard({ title, description, icon: Icon, category, isNew, isAvailable = false, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full text-left p-5 rounded-xl",
        "glass glass-hover",
        "transform transition-all duration-300",
        "hover:scale-[1.02] hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        !isAvailable && "opacity-60 hover:opacity-80"
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and badges */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-2.5 rounded-lg",
            "bg-gradient-to-br from-primary/20 to-accent/20",
            "border border-primary/20",
            "group-hover:from-primary/30 group-hover:to-accent/30",
            "transition-all duration-300"
          )}>
            <Icon className="w-5 h-5 text-primary" />
          </div>

          <div className="flex gap-2">
            {isAvailable && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                Live
              </span>
            )}
            {isNew && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/20 text-primary border border-primary/30">
                New
              </span>
            )}
            {category && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {category}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Coming Soon indicator */}
        {!isAvailable && (
          <p className="text-xs text-muted-foreground/60 mt-2 italic">Coming soon</p>
        )}
      </div>

      {/* Bottom gradient line on hover */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}

