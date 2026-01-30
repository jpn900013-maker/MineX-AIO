// Tool slug mapping - converts tool titles to URL-friendly routes
export const toolRoutes: Record<string, string> = {
    // Developer Tools
    "JSON Formatter": "/tools/json-formatter",
    "Base64 Encoder": "/tools/base64-encoder",
    "UUID Generator": "/tools/uuid-generator",
    "Color Converter": "/tools/color-converter",
    "QR Code Generator": "/tools/qr-code-generator",
    "Regex Tester": "/tools/regex-tester",
    "Lorem Ipsum": "/tools/lorem-ipsum",
    "JWT Decoder": "/tools/jwt-decoder",

    // Security Tools
    "Hash Generator": "/tools/hash-generator",
    "Password Generator": "/tools/password-generator",

    // Text Tools
    "Word Counter": "/tools/word-counter",
    "Text Translator": "/tools/text-translator",
    "Pastebin": "/tools/pastebin",
    "Plagiarism Checker": "/tools/plagiarism-checker",
    "Grammar Checker": "/tools/grammar-checker",

    // Network Tools
    "IP Lookup": "/tools/ip-lookup",
    "DNS Lookup": "/tools/dns-lookup",
    "Ping Test": "/tools/ping-test",
    "SSL Checker": "/tools/ssl-checker",
    "WHOIS Lookup": "/tools/whois-lookup",

    // YouTube Tools
    "YT Thumbnail Grabber": "/tools/yt-thumbnail-grabber",
    "YT Tags Extractor": "/tools/yt-tags-extractor",
    "YT Description Copy": "/tools/yt-description-copy",
    "YT Title Generator": "/tools/yt-title-generator",
    "YT Analytics Checker": "/tools/yt-analytics-checker",
    "YT Keyword Research": "/tools/yt-keyword-research",
    "YT Timestamp Generator": "/tools/yt-timestamp-generator",

    // Instagram Tools
    "IG Profile Analyzer": "/tools/ig-profile-analyzer",
    "IG Hashtag Generator": "/tools/ig-hashtag-generator",
    "IG Caption Generator": "/tools/ig-caption-generator",
    "IG Bio Generator": "/tools/ig-bio-generator",

    // Twitter Tools
    "Tweet Generator": "/tools/tweet-generator",
    "Thread Maker": "/tools/thread-maker",

    // Link Tools
    "Link Shortener": "/tools/link-shortener",
    "Link Analytics": "/tools/link-analytics",
    "Backlink Checker": "/tools/backlink-checker",
    "Domain Authority": "/tools/domain-authority",
    "IP Logger": "/tools/ip-logger",

    // Generators
    "Account Generator": "/tools/account-generator",

    // Minecraft Tools
    "MC Server Status": "/tools/mc-server-status",
    "MC Skin Viewer": "/tools/mc-skin-viewer",
    "MC UUID Lookup": "/tools/mc-uuid-lookup",
    "MC Server Icon": "/tools/mc-server-icon",
    "MC Bot Sender": "/tools/mc-bot-sender",

    // PDF Tools
    "PDF Editor": "/tools/pdf-editor",
    "PDF Merger": "/tools/pdf-merger",
    "PDF Splitter": "/tools/pdf-splitter",
    "PDF to Image": "/tools/pdf-to-image",
    "PDF Compressor": "/tools/pdf-compressor",

    // Image Tools
    "Image Compressor": "/tools/image-compressor",
    "Image Resizer": "/tools/image-resizer",
    "Image Converter": "/tools/image-converter",

    // Audio/Video Tools
    "Audio Converter": "/tools/audio-converter",
    "Video Trimmer": "/tools/video-trimmer",
    "Subtitle Generator": "/tools/subtitle-generator",

    // SEO Tools
    "Meta Tag Generator": "/tools/meta-tag-generator",
    "Keyword Density": "/tools/keyword-density",


    // Entertainment
    "Watch Anime": "/tools/watch-anime",
    "Watch Movies": "/tools/watch-movies",
    "Anime Finder": "/tools/anime-finder",
    "Movie Tracker": "/tools/movie-tracker",
    "Manga Reader": "/tools/manga-reader",
    "Anime Schedule": "/tools/anime-schedule",
    "Top Rated": "/tools/top-rated",
    "Trailer Hub": "/tools/trailer-hub",
    "YT Video Downloader": "/tools/yt-downloader",
    "Scribd Downloader": "/tools/scribd-downloader",

    // Code Sharing
    "Code Share": "/tools/code-share",
};

export function getToolRoute(title: string): string | null {
    return toolRoutes[title] || null;
}

export function isToolAvailable(title: string): boolean {
    const route = toolRoutes[title];
    const implementedTools = [
        // Developer Tools
        "JSON Formatter", "Base64 Encoder", "UUID Generator", "Color Converter",
        "QR Code Generator", "Regex Tester", "Lorem Ipsum", "JWT Decoder",
        "Hash Generator", "Password Generator", "Code Share",
        // Text Tools
        "Word Counter", "Pastebin", "Text Translator", "Plagiarism Checker", "Grammar Checker",
        // Network Tools
        "IP Lookup", "DNS Lookup", "WHOIS Lookup", "Ping Test", "SSL Checker",
        // YouTube Tools
        "YT Thumbnail Grabber", "YT Timestamp Generator", "YT Tags Extractor", "YT Description Copy",
        "YT Title Generator", "YT Analytics Checker", "YT Keyword Research",
        // Minecraft Tools
        "MC Server Status", "MC Skin Viewer", "MC UUID Lookup", "MC Server Icon", "MC Bot Sender",
        // Image Tools
        "Image Compressor", "Image Resizer", "Image Converter",
        "Audio Converter", "Video Trimmer", "Subtitle Generator",
        // SEO Tools
        "Meta Tag Generator", "Keyword Density", "Backlink Checker", "Domain Authority",
        // Social Media Tools
        "IG Hashtag Generator", "Tweet Generator", "Thread Maker",
        "IG Profile Analyzer", "IG Bio Generator", "IG Caption Generator",
        // Link Tools
        "Link Shortener", "IP Logger", "Link Analytics",
        // Entertainment
        "Watch Anime", "Watch Movies", "Anime Finder", "Top Rated", "Manga Reader",
        "Trailer Hub", "Anime Schedule", "Movie Tracker",
        "YT Video Downloader", "Scribd Downloader",
        // PDF Tools
        "PDF Merger", "PDF Splitter", "PDF Editor", "PDF to Image", "PDF Compressor",
    ];
    return route !== undefined && implementedTools.includes(title);
}
