import { Zap, Shield, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "All tools run instantly in your browser. No server delays, no waiting.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data never leaves your device. Everything is processed locally.",
  },
  {
    icon: Globe,
    title: "Always Free",
    description: "100% free to use, no sign-up required. No hidden fees, ever.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Fully responsive design. Use on any device, anywhere, anytime.",
  },
];

export function Features() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group relative p-6 rounded-2xl",
                "glass glass-hover",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="mb-4">
                <div className={cn(
                  "inline-flex p-3 rounded-xl",
                  "bg-gradient-to-br from-primary/10 to-accent/10",
                  "border border-primary/20",
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
