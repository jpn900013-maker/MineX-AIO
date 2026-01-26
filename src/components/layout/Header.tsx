import { useState, useEffect } from "react";
import { Search, User, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className={`absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />

      <div className="container mx-auto px-4 h-16 relative flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="MineX Logo" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary to-accent opacity-30 blur-md -z-10" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            MineX <span className="text-gradient">AIO</span>
          </span>
        </a>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ tools..."
              className="pl-9 pr-12 h-10 bg-black/20 border-white/10 focus:bg-black/40 transition-colors rounded-full text-sm"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">⌘ K</kbd>
          </div>
        </form>

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Tools
          </Link>
          <a href="/#categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Categories
          </a>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3 rounded-full hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary text-xs">{user.username.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2 rounded-full px-5 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-white/5 p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <form onSubmit={handleSearch}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="bg-secondary/50"
            />
          </form>
          <Link to="/search" className="px-4 py-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
            Tools
          </Link>
          <a href="/#categories" className="px-4 py-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
            Categories
          </a>
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="px-4 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 text-red-400 text-left">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
