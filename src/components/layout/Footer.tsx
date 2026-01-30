import { Sparkles, Github, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/20 backdrop-blur-lg mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full bg-black/40 rounded-[10px] flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  <img src="/logo.png" alt="MineX Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-foreground">MineX</span>
                <span className="text-gradient"> AIO</span>
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/MineX13"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:scale-105 border border-white/5"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <div
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-[#5865F2] transition-all hover:scale-105 border border-white/5 relative group cursor-pointer"
              aria-label="Discord"
              onClick={() => {
                navigator.clipboard.writeText("941139424580890666");
                // Optional: Toast notification here if we had access to hook
              }}
              title="Click to copy ID: 941139424580890666"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                ID: 941139424580890666
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            © {new Date().getFullYear()} MineX AIO. Built by <a href="https://github.com/MineX13" className="text-primary hover:underline">MineX13</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
