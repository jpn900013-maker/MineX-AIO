import {
  FileJson,
  Binary,
  Hash,
  Palette,
  Image,
  Lock,
  Type,
  Code2,
  Link,
  QrCode,
  Regex,
  Clock,
  Calculator,
  Shuffle,
  FileText,
  Fingerprint,
  Server,
  FileEdit,
  Youtube,
  Instagram,
  Twitter,
  Search,
  Download,
  ImageDown,
  Tags,
  BarChart3,
  Eye,
  Globe,
  Gamepad2,
  Pickaxe,
  Users,
  Wifi,
  Shield,
  Key,
  Bookmark,
  MessageSquare,
  TrendingUp,
  FileImage,
  Scissors,
  Merge,
  RotateCcw,
  Minimize2,
  Maximize2,
  FileType,
  Languages,
  Mic,
  Volume2,
  Music,
  Video,
  Clapperboard,
  Subtitles,
  Heading,
  AlignLeft,
  ListChecks,
  Sparkles,
  LinkIcon,
  DollarSign,
  ClipboardList,
  Share2,
  Tv,
  Film,
  Popcorn,
  Play,
  BookOpen,
  Star,
  Calendar
} from "lucide-react";
import { ToolCard } from "@/components/ui/ToolCard";
import { useNavigate } from "react-router-dom";
import { getToolRoute, isToolAvailable } from "@/lib/toolRoutes";

const popularTools = [
  // Generators
  {
    title: "Account Generator",
    description: "Generate premium accounts for Disney+, Netflix, & more",
    icon: Tv,
    category: "Generators",
    isNew: true,
  },
  // Minecraft Tools
  {
    title: "MC Server Status",
    description: "Check Minecraft server status, players online, and version info",
    icon: Server,
    category: "Minecraft",
    isNew: true,
  },
  {
    title: "MC Skin Viewer",
    description: "View and download Minecraft player skins in 3D",
    icon: Gamepad2,
    category: "Minecraft",
    isNew: true,
  },
  {
    title: "MC UUID Lookup",
    description: "Look up Minecraft player UUIDs and name history",
    icon: Pickaxe,
    category: "Minecraft",
    isNew: true,
  },
  {
    title: "MC Server Icon",
    description: "Generate and download Minecraft server icons",
    icon: ImageDown,
    category: "Minecraft",
    isNew: false,
  },

  // PDF Tools
  {
    title: "PDF Editor",
    description: "Edit, annotate, and modify PDF documents online",
    icon: FileEdit,
    category: "PDF",
    isNew: true,
  },
  {
    title: "PDF Merger",
    description: "Combine multiple PDF files into one document",
    icon: Merge,
    category: "PDF",
    isNew: false,
  },
  {
    title: "PDF Splitter",
    description: "Split PDF documents into separate pages or sections",
    icon: Scissors,
    category: "PDF",
    isNew: false,
  },
  {
    title: "PDF to Image",
    description: "Convert PDF pages to high-quality images",
    icon: FileImage,
    category: "PDF",
    isNew: false,
  },
  {
    title: "PDF Compressor",
    description: "Reduce PDF file size while maintaining quality",
    icon: Minimize2,
    category: "PDF",
    isNew: false,
  },

  // YouTube Tools
  {
    title: "YT Thumbnail Grabber",
    description: "Download YouTube video thumbnails in all resolutions",
    icon: Youtube,
    category: "YouTube",
    isNew: true,
  },
  {
    title: "YT Tags Extractor",
    description: "Extract and copy tags from any YouTube video",
    icon: Tags,
    category: "YouTube",
    isNew: true,
  },
  {
    title: "YT Description Copy",
    description: "Copy video descriptions with formatting intact",
    icon: AlignLeft,
    category: "YouTube",
    isNew: true,
  },
  {
    title: "YT Title Generator",
    description: "Generate SEO-optimized titles for your videos",
    icon: Heading,
    category: "YouTube",
    isNew: true,
  },
  {
    title: "YT Analytics Checker",
    description: "Check channel stats, views, and subscriber count",
    icon: BarChart3,
    category: "YouTube",
    isNew: false,
  },
  {
    title: "YT Keyword Research",
    description: "Find trending keywords for YouTube SEO",
    icon: TrendingUp,
    category: "YouTube",
    isNew: false,
  },
  {
    title: "YT Timestamp Generator",
    description: "Create clickable timestamps for video chapters",
    icon: Clock,
    category: "YouTube",
    isNew: false,
  },

  // Instagram Tools
  {
    title: "IG Profile Analyzer",
    description: "Analyze Instagram profiles and engagement rates",
    icon: Instagram,
    category: "Instagram",
    isNew: true,
  },
  {
    title: "IG Hashtag Generator",
    description: "Generate relevant hashtags for maximum reach",
    icon: Hash,
    category: "Instagram",
    isNew: true,
  },
  {
    title: "IG Caption Generator",
    description: "AI-powered captions for your Instagram posts",
    icon: MessageSquare,
    category: "Instagram",
    isNew: true,
  },
  {
    title: "IG Bio Generator",
    description: "Create engaging Instagram bio with emojis",
    icon: Sparkles,
    category: "Instagram",
    isNew: false,
  },

  // Twitter/X Tools
  {
    title: "Tweet Generator",
    description: "Generate engaging tweets with character count",
    icon: Twitter,
    category: "Twitter",
    isNew: true,
  },
  {
    title: "Thread Maker",
    description: "Create and format Twitter threads easily",
    icon: ListChecks,
    category: "Twitter",
    isNew: false,
  },

  // Link Tools
  {
    title: "Link Shortener",
    description: "Shorten URLs and monetize with ad-supported redirects",
    icon: LinkIcon,
    category: "Link",
    isNew: true,
  },
  {
    title: "Link Analytics",
    description: "Track clicks, locations, and devices for your short links",
    icon: BarChart3,
    category: "Link",
    isNew: true,
  },

  // Pastebin & Code Sharing
  {
    title: "Pastebin",
    description: "Share code snippets and text with syntax highlighting",
    icon: ClipboardList,
    category: "Text",
    isNew: true,
  },
  {
    title: "Code Share",
    description: "Share and collaborate on code in real-time",
    icon: Share2,
    category: "Dev",
    isNew: true,
  },

  // Entertainment
  {
    title: "Watch Anime",
    description: "Stream popular anime series and movies for free",
    icon: Tv,
    category: "Entertainment",
    isNew: true,
  },
  {
    title: "Watch Movies",
    description: "Stream the latest movies and TV shows online",
    icon: Film,
    category: "Entertainment",
    isNew: true,
  },
  {
    title: "Anime Finder",
    description: "Search and discover anime by genre, year, or rating",
    icon: Search,
    category: "Entertainment",
    isNew: true,
  },
  {
    title: "Movie Tracker",
    description: "Track watched movies and create your watchlist",
    icon: Popcorn,
    category: "Entertainment",
    isNew: false,
  },
  {
    title: "Manga Reader",
    description: "Read manga online with multiple sources",
    icon: BookOpen,
    category: "Entertainment",
    isNew: true,
  },
  {
    title: "Anime Schedule",
    description: "See upcoming anime episodes and release dates",
    icon: Calendar,
    category: "Entertainment",
    isNew: false,
  },
  {
    title: "Top Rated",
    description: "Browse top-rated anime and movies of all time",
    icon: Star,
    category: "Entertainment",
    isNew: false,
  },
  {
    title: "Trailer Hub",
    description: "Watch the latest movie and anime trailers",
    icon: Play,
    category: "Entertainment",
    isNew: false,
  },

  {
    title: "Thread Maker",
    description: "Create and format Twitter threads easily",
    icon: ListChecks,
    category: "Twitter",
    isNew: false,
  },

  // SEO Tools
  {
    title: "Meta Tag Generator",
    description: "Generate SEO meta tags for your website",
    icon: Code2,
    category: "SEO",
    isNew: false,
  },
  {
    title: "Keyword Density",
    description: "Analyze keyword density in your content",
    icon: Search,
    category: "SEO",
    isNew: false,
  },
  {
    title: "Backlink Checker",
    description: "Check backlinks pointing to any website",
    icon: Link,
    category: "SEO",
    isNew: false,
  },
  {
    title: "Domain Authority",
    description: "Check domain authority and page rank",
    icon: BarChart3,
    category: "SEO",
    isNew: false,
  },

  // Network Tools
  {
    title: "IP Lookup",
    description: "Get geolocation and ISP info from IP addresses",
    icon: Globe,
    category: "Network",
    isNew: false,
  },
  {
    title: "DNS Lookup",
    description: "Query DNS records for any domain",
    icon: Server,
    category: "Network",
    isNew: false,
  },
  {
    title: "Ping Test",
    description: "Test server response time and availability",
    icon: Wifi,
    category: "Network",
    isNew: false,
  },
  {
    title: "SSL Checker",
    description: "Verify SSL certificate validity and details",
    icon: Shield,
    category: "Network",
    isNew: false,
  },
  {
    title: "WHOIS Lookup",
    description: "Get domain registration information",
    icon: Eye,
    category: "Network",
    isNew: false,
  },

  // Text & Content Tools
  {
    title: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs",
    icon: Type,
    category: "Text",
    isNew: false,
  },
  {
    title: "Text Translator",
    description: "Translate text between 100+ languages",
    icon: Languages,
    category: "Text",
    isNew: false,
  },
  {
    title: "Plagiarism Checker",
    description: "Check content for duplicate text online",
    icon: Search,
    category: "Text",
    isNew: false,
  },
  {
    title: "Grammar Checker",
    description: "Fix grammar and spelling mistakes instantly",
    icon: FileText,
    category: "Text",
    isNew: false,
  },

  // Security Tools
  {
    title: "Password Generator",
    description: "Generate strong, secure random passwords",
    icon: Key,
    category: "Security",
    isNew: false,
  },
  {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    icon: Lock,
    category: "Security",
    isNew: false,
  },

  // Media Tools
  {
    title: "Image Compressor",
    description: "Compress images without losing quality",
    icon: Minimize2,
    category: "Image",
    isNew: false,
  },
  {
    title: "Image Resizer",
    description: "Resize images to exact dimensions",
    icon: Maximize2,
    category: "Image",
    isNew: false,
  },
  {
    title: "Image Converter",
    description: "Convert between PNG, JPG, WebP, and more",
    icon: Image,
    category: "Image",
    isNew: false,
  },
  {
    title: "Audio Converter",
    description: "Convert audio files between formats",
    icon: Music,
    category: "Audio",
    isNew: false,
  },
  {
    title: "Video Trimmer",
    description: "Trim and cut video clips online",
    icon: Clapperboard,
    category: "Video",
    isNew: true,
  },
  {
    title: "Subtitle Generator",
    description: "Generate subtitles from video or audio",
    icon: Subtitles,
    category: "Video",
    isNew: true,
  },

  // Developer Tools
  {
    title: "JSON Formatter",
    description: "Format, validate, and beautify your JSON data",
    icon: FileJson,
    category: "Formatter",
    isNew: false,
  },
  {
    title: "Base64 Encoder",
    description: "Encode and decode Base64 strings instantly",
    icon: Binary,
    category: "Encoder",
    isNew: false,
  },
  {
    title: "UUID Generator",
    description: "Generate random UUIDs (v1, v4, v5) for your applications",
    icon: Fingerprint,
    category: "Generator",
    isNew: false,
  },
  {
    title: "Color Converter",
    description: "Convert between HEX, RGB, HSL, and other formats",
    icon: Palette,
    category: "Converter",
    isNew: false,
  },
  {
    title: "QR Code Generator",
    description: "Create QR codes for URLs, text, and more",
    icon: QrCode,
    category: "Generator",
    isNew: false,
  },
  {
    title: "Regex Tester",
    description: "Test and debug regular expressions in real-time",
    icon: Regex,
    category: "Dev",
    isNew: false,
  },
  {
    title: "Lorem Ipsum",
    description: "Generate placeholder text for your designs",
    icon: FileText,
    category: "Generator",
    isNew: false,
  },
  {
    title: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens",
    icon: Key,
    category: "Crypto",
    isNew: false,
  },
];

export function PopularTools() {
  const navigate = useNavigate();

  const handleToolClick = (toolTitle: string) => {
    const route = getToolRoute(toolTitle);
    if (route && isToolAvailable(toolTitle)) {
      navigate(route);
    }
  };

  return (
    <section id="tools" className="py-20 relative">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular <span className="text-gradient">Tools</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              The most used tools by our community. Jump right in and get things done.
            </p>
          </div>
          <button className="mt-4 md:mt-0 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            View all tools
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {popularTools.map((tool, index) => (
            <div
              key={tool.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <ToolCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                category={tool.category}
                isNew={tool.isNew}
                isAvailable={isToolAvailable(tool.title)}
                onClick={() => handleToolClick(tool.title)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
