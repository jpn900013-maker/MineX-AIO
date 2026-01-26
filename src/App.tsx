import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Admin
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

// Tool imports - Developer
import JsonFormatter from "./tools/JsonFormatter";
import Base64Encoder from "./tools/Base64Encoder";
import UuidGenerator from "./tools/UuidGenerator";
import ColorConverter from "./tools/ColorConverter";
import QrCodeGenerator from "./tools/QrCodeGenerator";
import RegexTester from "./tools/RegexTester";
import LoremIpsum from "./tools/LoremIpsum";
import JwtDecoder from "./tools/JwtDecoder";
import HashGenerator from "./tools/HashGenerator";
import PasswordGenerator from "./tools/PasswordGenerator";

// Tool imports - Text Tools
import WordCounter from "./tools/WordCounter";
import Pastebin from "./tools/Pastebin";

// Tool imports - Network Tools
import IpLookup from "./tools/IpLookup";
import DnsLookup from "./tools/DnsLookup";
import WhoisLookup from "./tools/WhoisLookup";

// Tool imports - YouTube Tools
import YtThumbnailGrabber from "./tools/YtThumbnailGrabber";
import YtTimestampGenerator from "./tools/YtTimestampGenerator";

// Tool imports - Minecraft Tools
import McServerStatus from "./tools/McServerStatus";
import McSkinViewer from "./tools/McSkinViewer";
import McUuidLookup from "./tools/McUuidLookup";

// Tool imports - PDF
import PdfMerger from "./tools/PdfMerger";
import PdfSplitter from "./tools/PdfSplitter";
import PdfEditor from "./tools/PdfEditor";
import PdfToImage from "./tools/PdfToImage";

// Tool imports - Media
import VideoTrimmer from "./tools/VideoTrimmer";
import SubtitleGenerator from "./tools/SubtitleGenerator";

// Tool imports - Social
import ThreadMaker from "./tools/ThreadMaker";

// Tool imports - Image Tools
import ImageCompressor from "./tools/ImageCompressor";
import ImageResizer from "./tools/ImageResizer";
import ImageConverter from "./tools/ImageConverter";

// Tool imports - SEO Tools
import MetaTagGenerator from "./tools/MetaTagGenerator";
import KeywordDensity from "./tools/KeywordDensity";

// Tool imports - Social Media Tools
import IgHashtagGenerator from "./tools/IgHashtagGenerator";
import TweetGenerator from "./tools/TweetGenerator";

// Tool imports - Link Tools
import LinkShortener from "./tools/LinkShortener";
import IpLogger from "./tools/IpLogger";

// Tool imports - Entertainment
import WatchAnime from "./tools/WatchAnime";
// Tool imports - Network/Seo/Text (Redirects)
import PingTest from "./tools/PingTest";
import SslChecker from "./tools/SslChecker";
import BacklinkChecker from "./tools/BacklinkChecker";
import DomainAuthority from "./tools/DomainAuthority";
import LinkAnalytics from "./tools/LinkAnalytics";
import TextTranslator from "./tools/TextTranslator";
import PlagiarismChecker from "./tools/PlagiarismChecker";
import GrammarChecker from "./tools/GrammarChecker";
import CodeShare from "./tools/CodeShare";
import MovieTracker from "./tools/MovieTracker";

// Tool imports - YouTube (Redirects)
import YtTagsExtractor from "./tools/YtTagsExtractor";
import YtDescriptionCopy from "./tools/YtDescriptionCopy";
import YtTitleGenerator from "./tools/YtTitleGenerator";
import YtAnalyticsChecker from "./tools/YtAnalyticsChecker";
import YtKeywordResearch from "./tools/YtKeywordResearch";

// Tool imports - Instagram
import IgProfileAnalyzer from "./tools/IgProfileAnalyzer";
import IgBioGenerator from "./tools/IgBioGenerator";
import IgCaptionGenerator from "./tools/IgCaptionGenerator";

import WatchMovies from "./tools/WatchMovies";
import AnimeFinder from "./tools/AnimeFinder";
import TopRated from "./tools/TopRated";
import TrailerHub from "./tools/TrailerHub";
import AnimeSchedule from "./tools/AnimeSchedule";
import MangaReader from "./tools/MangaReader";
import YtDownloader from "./tools/YtDownloader";
import ScribdDownloader from "./tools/ScribdDownloader";

// Tool imports - Minecraft (Additional)
import McBotSender from "./tools/McBotSender";
import McServerIcon from "./tools/McServerIcon";

// Pages
import SearchPage from "./pages/SearchPage";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import ImageTracker from "./pages/ImageTracker";
import LinkRedirect from "./pages/LinkRedirect";

const queryClient = new QueryClient();

// Security
import { useSecurity, SecurityScreen } from "./components/Security";

const AppContent = () => {
  const { violation } = useSecurity();

  if (violation) return <SecurityScreen />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Developer Tools */}
      <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
      <Route path="/tools/hash-generator" element={<HashGenerator />} />
      <Route path="/tools/password-generator" element={<PasswordGenerator />} />
      <Route path="/tools/json-formatter" element={<JsonFormatter />} />
      <Route path="/tools/base64-encoder" element={<Base64Encoder />} />
      <Route path="/tools/uuid-generator" element={<UuidGenerator />} />
      <Route path="/tools/color-converter" element={<ColorConverter />} />
      <Route path="/tools/qr-code-generator" element={<QrCodeGenerator />} />
      <Route path="/tools/regex-tester" element={<RegexTester />} />
      <Route path="/tools/lorem-ipsum" element={<LoremIpsum />} />

      {/* Text Tools */}
      <Route path="/tools/word-counter" element={<WordCounter />} />
      <Route path="/tools/pastebin" element={<Pastebin />} />

      {/* Network Tools */}
      <Route path="/tools/ip-lookup" element={<IpLookup />} />
      <Route path="/tools/dns-lookup" element={<DnsLookup />} />
      <Route path="/tools/whois-lookup" element={<WhoisLookup />} />

      {/* YouTube Tools */}
      <Route path="/tools/yt-thumbnail-grabber" element={<YtThumbnailGrabber />} />
      <Route path="/tools/yt-timestamp-generator" element={<YtTimestampGenerator />} />

      {/* Minecraft Tools */}
      <Route path="/tools/mc-server-status" element={<McServerStatus />} />
      <Route path="/tools/mc-skin-viewer" element={<McSkinViewer />} />
      <Route path="/tools/mc-uuid-lookup" element={<McUuidLookup />} />
      <Route path="/tools/mc-bot-sender" element={<McBotSender />} />
      <Route path="/tools/mc-server-icon" element={<McServerIcon />} />

      {/* Entertainment */}
      <Route path="/tools/watch-anime" element={<WatchAnime />} />
      <Route path="/tools/watch-movies" element={<WatchMovies />} />
      <Route path="/tools/anime-finder" element={<AnimeFinder />} />
      <Route path="/tools/top-rated" element={<TopRated />} />
      <Route path="/tools/trailer-hub" element={<TrailerHub />} />
      <Route path="/tools/anime-schedule" element={<AnimeSchedule />} />
      <Route path="/tools/manga-reader" element={<MangaReader />} />
      <Route path="/tools/yt-downloader" element={<YtDownloader />} />
      <Route path="/tools/scribd-downloader" element={<ScribdDownloader />} />

      {/* PDF Tools */}
      <Route path="/tools/pdf-merger" element={<PdfMerger />} />
      <Route path="/tools/pdf-splitter" element={<PdfSplitter />} />
      <Route path="/tools/pdf-editor" element={<PdfEditor />} />
      <Route path="/tools/pdf-to-image" element={<PdfToImage />} />

      {/* Image Tools */}
      <Route path="/tools/image-compressor" element={<ImageCompressor />} />
      <Route path="/tools/image-resizer" element={<ImageResizer />} />
      <Route path="/tools/image-converter" element={<ImageConverter />} />

      {/* Media Tools */}
      <Route path="/tools/video-trimmer" element={<VideoTrimmer />} />
      <Route path="/tools/subtitle-generator" element={<SubtitleGenerator />} />

      {/* Social Tools */}
      <Route path="/tools/thread-maker" element={<ThreadMaker />} />

      {/* SEO Tools */}
      <Route path="/tools/meta-tag-generator" element={<MetaTagGenerator />} />
      <Route path="/tools/keyword-density" element={<KeywordDensity />} />

      {/* Social Media Tools */}
      <Route path="/tools/ig-hashtag-generator" element={<IgHashtagGenerator />} />
      <Route path="/tools/ig-profile-analyzer" element={<IgProfileAnalyzer />} />
      <Route path="/tools/ig-bio-generator" element={<IgBioGenerator />} />
      <Route path="/tools/ig-caption-generator" element={<IgCaptionGenerator />} />
      <Route path="/tools/tweet-generator" element={<TweetGenerator />} />

      {/* New Redirect Tools */}
      <Route path="/tools/ping-test" element={<PingTest />} />
      <Route path="/tools/ssl-checker" element={<SslChecker />} />
      <Route path="/tools/backlink-checker" element={<BacklinkChecker />} />
      <Route path="/tools/domain-authority" element={<DomainAuthority />} />
      <Route path="/tools/link-analytics" element={<LinkAnalytics />} />
      <Route path="/tools/text-translator" element={<TextTranslator />} />
      <Route path="/tools/plagiarism-checker" element={<PlagiarismChecker />} />
      <Route path="/tools/grammar-checker" element={<GrammarChecker />} />
      <Route path="/tools/code-share" element={<CodeShare />} />
      <Route path="/tools/movie-tracker" element={<MovieTracker />} />
      <Route path="/tools/disney-generator" element={<DisneyGenerator />} />

      <Route path="/tools/yt-tags-extractor" element={<YtTagsExtractor />} />
      <Route path="/tools/yt-description-copy" element={<YtDescriptionCopy />} />
      <Route path="/tools/yt-title-generator" element={<YtTitleGenerator />} />
      <Route path="/tools/yt-analytics-checker" element={<YtAnalyticsChecker />} />
      <Route path="/tools/yt-keyword-research" element={<YtKeywordResearch />} />

      {/* Link Tools */}
      <Route path="/tools/link-shortener" element={<LinkShortener />} />
      <Route path="/tools/ip-logger" element={<IpLogger />} />


      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

      {/* Static Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />

      {/* Tracking/Redirect Routes */}
      <Route path="/img/:code" element={<ImageTracker />} />
      <Route path="/s/:code" element={<LinkRedirect />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;




