import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/ui/ToolCard";
import { allTools } from "@/lib/toolsData";
import { getToolRoute, isToolAvailable } from "@/lib/toolRoutes";
import { Gamepad2, Wrench, BookOpen, Clock, Mail, ChevronDown, ChevronUp } from "lucide-react";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface HistoryItem {
    service: string;
    serviceName: string;
    account_data: string;
    generated_at: number;
}

const SERVICE_NAMES: Record<string, string> = {
    minecraft: "Minecraft",
    netflix: "Netflix",
    spotify: "Spotify",
    hbomax: "HBO Max",
    disney: "Disney+",
    crunchyroll: "Crunchyroll",
    xbox: "Xbox Game Pass",
    xboxultimate: "Xbox Ultimate",
    roblox: "Roblox",
    steam: "Steam",
};

export default function Dashboard() {
    const { user, token, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState<{ type: string; msg: string } | null>(null);
    const [showAllTools, setShowAllTools] = useState(false);

    // Initial tools to show: Account Gen, Mc Bot + 2 others
    const highlightedTools = ["Account Generator", "MC Bot Sender", "Watch Anime", "YT Video Downloader"];

    const visibleTools = showAllTools
        ? allTools
        : allTools.filter(t => highlightedTools.includes(t.title) || t.isNew).slice(0, 6); // Show highlights + new, cap at 6 initially

    const handleToolClick = (toolTitle: string) => {
        const route = getToolRoute(toolTitle);
        if (route && isToolAvailable(toolTitle)) {
            navigate(route);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/generation-history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.success) {
                    setHistory(data.history || []);
                }
            } catch (error) {
                console.error("Failed to fetch history");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated, token, navigate]);

    if (!user) return null;

    return (
        <div className="dashboard-page">
            <Header />
            <div className="dashboard-container">
                {flashMessage && (
                    <div className={`flash ${flashMessage.type}`}>{flashMessage.msg}</div>
                )}

                <div className="welcome-section">
                    <h1>Welcome back, {user.username}! 👋</h1>
                    <p>Your personal account generation dashboard</p>
                </div>

                <div className="mb-12">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="cards-grid">
                        <div className="card">
                            <div className="card-icon">🎮</div>
                            <h3>Generate Accounts</h3>
                            <p>Browse available services and generate premium accounts instantly</p>
                            <Link to="/tools/account-generator" className="btn">
                                Browse Services →
                            </Link>
                        </div>

                        <div className="card">
                            <div className="card-icon">🛠️</div>
                            <h3>Browse Tools</h3>
                            <p>Access powerful tools that run directly in your browser</p>
                            <Link to="/search" className="btn">
                                View Tools →
                            </Link>
                        </div>

                        <div className="card">
                            <div className="card-icon">💰</div>
                            <h3>Earn Credits</h3>
                            <p>Watch ads and complete offers to earn credits for generations</p>
                            <Link to="/earn-credits" className="btn">
                                Earn Now →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="section-title mb-0">Your Tools</h2>
                    <button
                        onClick={() => setShowAllTools(!showAllTools)}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        {showAllTools ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> View All Tools</>}
                    </button>
                </div>

                <div className="cards-grid mb-12">
                    {visibleTools.map((tool) => (
                        <ToolCard
                            key={tool.title}
                            title={tool.title}
                            description={tool.description}
                            icon={tool.icon}
                            category={tool.category}
                            isAvailable={isToolAvailable(tool.title)}
                            onClick={() => handleToolClick(tool.title)}
                        />
                    ))}
                </div>

                {!showAllTools && (
                    <div className="text-center mb-8">
                        <button
                            onClick={() => setShowAllTools(true)}
                            className="btn"
                        >
                            Explore All {allTools.length} Tools →
                        </button>
                    </div>
                )}

                <div className="history-section">
                    <h2 className="section-title">Recent Generation History</h2>
                    {isLoading ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">⏳</div>
                            <p>Loading...</p>
                        </div>
                    ) : history.length > 0 ? (
                        history.map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-service">
                                    {SERVICE_NAMES[item.service] || item.serviceName || item.service}
                                </div>
                                <div className="history-account">{item.account_data}</div>
                                <div className="history-time">
                                    {new Date(item.generated_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <p>No generation history yet</p>
                            <p style={{ fontSize: "0.95rem", color: "#888", marginBottom: "1.5rem" }}>
                                Start by generating some accounts!
                            </p>
                            <Link to="/tools/account-generator" className="btn">
                                Generate Now →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
