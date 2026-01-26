import {
    FileJson, Binary, Hash, Palette, Image, Lock, Type, Code2, Link, QrCode,
    Regex, Clock, Server, FileEdit, Youtube, Instagram, Twitter, Search as SearchIcon,
    Download, ImageDown, Tags, BarChart3, Eye, Globe, Gamepad2, Pickaxe, Users,
    Wifi, Shield, Key, Bookmark, MessageSquare, TrendingUp, FileImage, Scissors,
    Merge, Minimize2, Maximize2, Languages, Music, Clapperboard, Subtitles,
    Heading, AlignLeft, ListChecks, Sparkles, Share2, Tv, Film, Popcorn, Play,
    BookOpen, Star, Calendar, ClipboardList, Fingerprint, FileText, Bot, ExternalLink
} from "lucide-react";

export interface ToolData {
    title: string;
    description: string;
    icon: any;
    category: string;
    isNew?: boolean;
}

export const allTools: ToolData[] = [
    // Minecraft Tools
    { title: "MC Server Status", description: "Check Minecraft server status, players online, and version info", icon: Server, category: "Minecraft" },
    { title: "MC Skin Viewer", description: "View and download Minecraft player skins in 3D", icon: Gamepad2, category: "Minecraft" },
    { title: "MC UUID Lookup", description: "Look up Minecraft player UUIDs and name history", icon: Pickaxe, category: "Minecraft" },
    { title: "MC Server Icon", description: "Download server icons from any Minecraft server", icon: ImageDown, category: "Minecraft" },
    { title: "MC Bot Sender", description: "Control a Minecraft bot, join servers, chat, and automate actions", icon: Bot, category: "Minecraft" },

    // YouTube Tools
    { title: "YT Thumbnail Grabber", description: "Download YouTube video thumbnails in all resolutions", icon: Youtube, category: "YouTube" },
    { title: "YT Timestamp Generator", description: "Create clickable timestamps for video chapters", icon: Clock, category: "YouTube" },
    { title: "YT Tags Extractor", description: "Extract tags from any YouTube video", icon: Tags, category: "YouTube" },
    { title: "YT Description Copy", description: "Extract and copy video descriptions", icon: AlignLeft, category: "YouTube" },
    { title: "YT Title Generator", description: "Generate click-worthy titles for your videos", icon: Heading, category: "YouTube" },
    { title: "YT Analytics Checker", description: "Check channel views, subs, and growth stats", icon: BarChart3, category: "YouTube" },
    { title: "YT Keyword Research", description: "Find high-volume keywords for YouTube video tags", icon: TrendingUp, category: "YouTube" },
    { title: "YT Video Downloader", description: "Download videos from YouTube/Twitter/TikTok (Ad-free)", icon: Download, category: "YouTube" },

    // Instagram Tools
    { title: "IG Hashtag Generator", description: "Generate relevant hashtags for maximum reach", icon: Hash, category: "Instagram" },
    { title: "IG Profile Analyzer", description: "Analyze Instagram profiles and engagement", icon: Instagram, category: "Instagram" },
    { title: "IG Bio Generator", description: "Generate aesthetic and engaging Instagram bios", icon: Sparkles, category: "Instagram" },
    { title: "IG Caption Generator", description: "Generate catchy captions for your posts", icon: MessageSquare, category: "Instagram" },

    // Twitter Tools
    { title: "Tweet Generator", description: "Generate engaging tweets with character count", icon: Twitter, category: "Twitter" },
    { title: "Thread Maker", description: "Split long text into Twitter/X threads automatically", icon: ListChecks, category: "Twitter" },

    // Link Tools
    { title: "Link Shortener", description: "Shorten URLs and create custom short links", icon: Link, category: "Link" },
    { title: "IP Logger", description: "Create trackable links that capture visitor IP and location", icon: Eye, category: "Link" },
    { title: "Link Analytics", description: "Track clicks and analytics for shortened links", icon: BarChart3, category: "Link" },

    // Entertainment
    { title: "Watch Anime", description: "Stream popular anime series and movies for free", icon: Tv, category: "Entertainment" },
    { title: "Watch Movies", description: "Stream the latest movies and TV shows online", icon: Film, category: "Entertainment" },
    { title: "Anime Finder", description: "Search and discover anime by genre, year, or rating", icon: SearchIcon, category: "Entertainment" },
    { title: "Top Rated", description: "Browse top-rated anime and movies of all time", icon: Star, category: "Entertainment" },
    { title: "Manga Reader", description: "Read manga online with multiple sources", icon: BookOpen, category: "Entertainment" },
    { title: "Trailer Hub", description: "Watch the latest movie and anime trailers", icon: Play, category: "Entertainment" },
    { title: "Anime Schedule", description: "Track when your favorite anime airs (JST)", icon: Calendar, category: "Entertainment" },
    { title: "Movie Tracker", description: "Track watched movies and create lists", icon: Popcorn, category: "Entertainment" },
    { title: "Scribd Downloader", description: "Download documents from Scribd, Issuu, etc.", icon: FileText, category: "Entertainment" },

    // SEO Tools
    { title: "Meta Tag Generator", description: "Generate SEO meta tags for your website", icon: Code2, category: "SEO" },
    { title: "Keyword Density", description: "Analyze keyword density in your content", icon: SearchIcon, category: "SEO" },
    { title: "Backlink Checker", description: "Check backlinks pointing to any website", icon: Link, category: "SEO" },
    { title: "Domain Authority", description: "Check website authority and SEO metrics", icon: BarChart3, category: "SEO" },

    // Network Tools
    { title: "IP Lookup", description: "Get geolocation and ISP info from IP addresses", icon: Globe, category: "Network" },
    { title: "DNS Lookup", description: "Query DNS records for any domain", icon: Server, category: "Network" },
    { title: "WHOIS Lookup", description: "Get domain registration information", icon: Eye, category: "Network" },
    { title: "Ping Test", description: "Check server response time and availability", icon: Wifi, category: "Network" },
    { title: "SSL Checker", description: "Verify SSL certificate installation and validity", icon: Shield, category: "Network" },

    // Text Tools
    { title: "Word Counter", description: "Count words, characters, sentences, and paragraphs", icon: Type, category: "Text" },
    { title: "Pastebin", description: "Share code snippets and text with syntax highlighting", icon: ClipboardList, category: "Text" },
    { title: "Text Translator", description: "Translate text between 100+ languages instantly", icon: Languages, category: "Text" },
    { title: "Plagiarism Checker", description: "Check content for duplicate text across the web", icon: SearchIcon, category: "Text" },
    { title: "Grammar Checker", description: "Fix grammar, spelling, and punctuation errors", icon: FileText, category: "Text" },

    // Image Tools
    { title: "Image Compressor", description: "Compress images without losing quality", icon: Minimize2, category: "Image" },
    { title: "Image Resizer", description: "Resize images to exact dimensions", icon: Maximize2, category: "Image" },
    { title: "Image Converter", description: "Convert between PNG, JPG, WebP, and more", icon: Image, category: "Image" },

    // PDF Tools
    { title: "PDF Merger", description: "Combine multiple PDF files into one document", icon: Merge, category: "PDF" },
    { title: "PDF Splitter", description: "Split PDF documents into separate pages or sections", icon: Scissors, category: "PDF" },
    { title: "PDF Editor", description: "Add watermarks and annotations to PDFs", icon: FileEdit, category: "PDF" },
    { title: "PDF to Image", description: "Convert PDF pages to high-quality images", icon: FileImage, category: "PDF" },
    { title: "PDF Compressor", description: "Reducce PDF file size while maintaining quality", icon: Minimize2, category: "PDF" },

    // Media Tools (Audio/Video)
    { title: "Audio Converter", description: "Convert audio files to MP3, WAV, iPhone ringtones, M4A, OGG, and more", icon: Music, category: "Audio" },
    { title: "Video Trimmer", description: "Trim and cut video files online without installing software", icon: Clapperboard, category: "Video" },
    { title: "Subtitle Generator", description: "Automatically generate subtitles for your videos using AI", icon: Subtitles, category: "Video" },

    // Developer Tools
    { title: "JSON Formatter", description: "Format, validate, and beautify your JSON data", icon: FileJson, category: "Developer" },
    { title: "Base64 Encoder", description: "Encode and decode Base64 strings instantly", icon: Binary, category: "Developer" },
    { title: "UUID Generator", description: "Generate random UUIDs (v1, v4, v5) for your applications", icon: Fingerprint, category: "Developer" },
    { title: "Color Converter", description: "Convert between HEX, RGB, HSL, and other formats", icon: Palette, category: "Developer" },
    { title: "QR Code Generator", description: "Create QR codes for URLs, text, and more", icon: QrCode, category: "Developer" },
    { title: "Regex Tester", description: "Test and debug regular expressions in real-time", icon: Regex, category: "Developer" },
    { title: "Lorem Ipsum", description: "Generate placeholder text for your designs", icon: FileText, category: "Developer" },
    { title: "JWT Decoder", description: "Decode and inspect JSON Web Tokens", icon: Key, category: "Developer" },
    { title: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes", icon: Lock, category: "Developer" },
    { title: "Password Generator", description: "Generate strong, secure random passwords", icon: Key, category: "Developer" },
    { title: "Code Share", description: "Collaborate on code in real-time", icon: Share2, category: "Developer" },
];

export const categories = [
    "All",
    "Developer",
    "Minecraft",
    "YouTube",
    "Instagram",
    "Twitter",
    "Network",
    "Image",
    "Text",
    "SEO",
    "Link",
    "Entertainment",
    "PDF",
    "Audio",
    "Video"
];
