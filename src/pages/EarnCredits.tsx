import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Clock, Gift, Coins, Play, AlertCircle, CheckCircle2, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import "./EarnCredits.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface AdOffer {
    id: string;
    name: string;
    credits: number;
    duration: number; // seconds
    icon: string;
    description: string;
}

const AD_OFFERS: AdOffer[] = [
    { id: "daily-bonus", name: "Daily Bonus", credits: 10, duration: 0, icon: "🎁", description: "Claim your daily free credits" },
    { id: "afk-page", name: "AFK Page", credits: 1, duration: 60, icon: "⏳", description: "Earn 1 credit every 60 seconds while this page is open" },
];

const AdScript = () => {
    useEffect(() => {
        // Vignette Ads (Popup/Overlay style)
        const loadVignette = (zoneId: string) => {
            const s = document.createElement('script');
            s.dataset.zone = zoneId;
            s.src = 'https://gizokraijaw.net/vignette.min.js';
            document.body.appendChild(s);
            return s;
        };

        // Display Ads (Banner style)
        const loadTag = (zoneId: string, containerId: string) => {
            const container = document.getElementById(containerId);
            if (container) {
                const s = document.createElement('script');
                s.src = "https://quge5.com/88/tag.min.js";
                s.async = true;
                s.dataset.zone = zoneId;
                s.dataset.cfasync = "false";
                container.appendChild(s);
                return s;
            }
            return null;
        };

        // Load all ads
        const scripts: (HTMLScriptElement | null)[] = [];

        // 1. Vignettes
        scripts.push(loadVignette('10522888'));
        scripts.push(loadVignette('10522982'));
        scripts.push(loadVignette('10523109'));

        // 2. Display Tags
        scripts.push(loadTag('206552', 'ad-container-1'));
        scripts.push(loadTag('205745', 'ad-container-2'));

        return () => {
            // Cleanup scripts
            scripts.forEach(s => s && s.remove());

            // Clear containers
            ['ad-container-1', 'ad-container-2'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });

            // Aggressive cleanup for Vignette/Overlay ads that might be attached to body
            // We search for scripts again by src to be sure
            const allScripts = document.querySelectorAll('script[src*="gizokraijaw"], script[src*="quge5"]');
            allScripts.forEach(s => s.remove());

            // Remove any potential overlay divs that might have been added (heuristic)
            // Note: Use with caution, checking for specific classes if known would be better.
            // For now, we rely on removing the script stopping the behavior, but some 
            // might have already rendered. 
        };
    }, []);

    return (
        <div className="flex flex-col gap-4 items-center mt-6 w-full max-w-4xl mx-auto">


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Ad Slot 1 */}
                <div className="flex flex-col items-center">
                    <div id="ad-container-1" className="min-w-[300px] min-h-[250px] bg-black/20 rounded-lg flex items-center justify-center border border-white/5">
                        {/* Script 206552 injects here */}
                    </div>
                </div>

                {/* Ad Slot 2 */}
                <div className="flex flex-col items-center">
                    <div id="ad-container-2" className="min-w-[300px] min-h-[250px] bg-black/20 rounded-lg flex items-center justify-center border border-white/5">
                        {/* Script 205745 injects here */}
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-gray-600">
                AFK Mode is active. Do not close this tab.
            </div>
        </div>
    );
};

export default function EarnCredits() {
    const { user, token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [credits, setCredits] = useState(0);
    const [activeOffer, setActiveOffer] = useState<AdOffer | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isWatching, setIsWatching] = useState(false);
    const [dailyClaimed, setDailyClaimed] = useState(false);

    // AFK Mode State
    const [afkSessionCredits, setAfkSessionCredits] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        fetchCredits();
        checkDailyBonus();
    }, [isAuthenticated, token, navigate]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchCredits = async () => {
        try {
            const response = await fetch(`${API_URL}/api/user/credits`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setCredits(data.credits || 0);
            }
        } catch (error) {
            console.error("Failed to fetch credits");
        }
    };

    const checkDailyBonus = () => {
        const lastClaim = localStorage.getItem("minex-daily-claim");
        if (lastClaim) {
            const lastClaimDate = new Date(lastClaim);
            const now = new Date();
            if (
                lastClaimDate.getDate() === now.getDate() &&
                lastClaimDate.getMonth() === now.getMonth() &&
                lastClaimDate.getFullYear() === now.getFullYear()
            ) {
                setDailyClaimed(true);
            }
        }
    };

    const startWatching = (offer: AdOffer) => {
        if (offer.id === "daily-bonus") {
            claimDailyBonus();
            return;
        }

        if (offer.id === "afk-page") {
            startAfkMode(offer);
            return;
        }
    };

    const startAfkMode = (offer: AdOffer) => {
        setActiveOffer(offer);
        setTimeRemaining(offer.duration);
        setIsWatching(true);
        setAfkSessionCredits(0);

        startAfkTimer(offer);
    };

    const startAfkTimer = (offer: AdOffer) => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Cycle complete
                    completeAfkCycle(offer);
                    return offer.duration; // Reset timer immediately
                }
                return prev - 1;
            });
        }, 1000);
    };

    const completeAfkCycle = async (offer: AdOffer) => {
        try {
            const response = await fetch(`${API_URL}/api/user/credits/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: offer.credits, source: offer.id }),
            });
            const data = await response.json();

            if (data.success) {
                setCredits((prev) => prev + offer.credits);
                setAfkSessionCredits((prev) => prev + offer.credits);
                // Silent toast or no toast for AFK to avoid spamming
                // Optional: distinct sound or visual indicator
            }
        } catch (error) {
            console.error("Failed to add AFK credits");
        }
    };

    const claimDailyBonus = async () => {
        const offer = AD_OFFERS.find((o) => o.id === "daily-bonus")!;

        try {
            const response = await fetch(`${API_URL}/api/user/credits/daily`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setCredits((prev) => prev + offer.credits);
                setDailyClaimed(true);
                localStorage.setItem("minex-daily-claim", new Date().toISOString());
                toast({
                    title: "Daily Bonus Claimed! 🎁",
                    description: `You received ${offer.credits} free credits!`,
                });
            } else {
                toast({
                    title: "Already Claimed",
                    description: data.error || "Come back tomorrow for more!",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to claim daily bonus.",
                variant: "destructive",
            });
        }
    };

    const stopAfk = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsWatching(false);
        setActiveOffer(null);
        setTimeRemaining(0);

        if (afkSessionCredits > 0) {
            toast({
                title: "AFK Session Ended",
                description: `You earned a total of ${afkSessionCredits} credits this session!`,
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!user) return null;

    return (
        <div className="earn-credits-page">
            <Header />
            <div className="earn-credits-container">
                <div className="credits-header">
                    <div className="credits-balance">
                        <Coins className="credits-icon" />
                        <div>
                            <span className="balance-label">Your Balance</span>
                            <span className="balance-amount">{credits} Credits</span>
                        </div>
                    </div>
                    <Link to="/tools/account-generator" className="btn btn-outline">
                        Use Credits →
                    </Link>
                </div>

                {isWatching && activeOffer && activeOffer.id === "afk-page" ? (
                    <div className="watching-overlay">
                        <div className="watching-modal">
                            <div className="watching-icon animate-pulse">{activeOffer.icon}</div>
                            <h2>AFK Mode Active</h2>
                            <p>You are earning credits automatically.</p>

                            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] px-4 py-2 rounded-lg mb-4 font-mono">
                                Session Earned: +{afkSessionCredits} Credits
                            </div>

                            <div className="timer-display">
                                <Clock className="timer-icon" />
                                <span className="timer-text">{formatTime(timeRemaining)}</span>
                            </div>
                            <div className="text-xs text-center text-gray-500 mb-2">Next credit in...</div>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${((activeOffer.duration - timeRemaining) / activeOffer.duration) * 100}%`,
                                    }}
                                />
                            </div>

                            <p className="timer-warning">
                                <AlertCircle size={16} />
                                Keep this tab open to continue earning.
                            </p>

                            <Button variant="ghost" onClick={stopAfk} className="cancel-btn bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300">
                                <Pause size={16} className="mr-2" /> Stop Earning
                            </Button>

                            {/* Ad Script Injection */}
                            <div id="afk-ad-container" className="mt-4">
                                <AdScript />
                            </div>
                        </div>
                    </div>
                ) : null}

                <h2 className="section-title">Earn Credits</h2>
                <p className="section-desc">
                    Claim your daily bonus or use the AFK page to earn passive credits.
                </p>

                <div className="offers-grid">
                    {AD_OFFERS.map((offer) => {
                        const isDaily = offer.id === "daily-bonus";
                        const isDisabled = isDaily && dailyClaimed;

                        return (
                            <div key={offer.id} className={`offer-card ${isDisabled ? "disabled" : ""}`}>
                                <div className="offer-icon">{offer.icon}</div>
                                <h3>{offer.name}</h3>
                                <p>{offer.description}</p>
                                <div className="offer-reward">
                                    <Coins size={18} />
                                    <span>+{offer.credits} credits</span>
                                    {offer.duration > 0 && <span className="text-xs text-gray-400 ml-1">/ {offer.duration}s</span>}
                                </div>
                                <Button
                                    onClick={() => startWatching(offer)}
                                    disabled={isDisabled}
                                    className="offer-btn"
                                >
                                    {isDisabled ? (
                                        <>
                                            <CheckCircle2 size={16} /> Claimed
                                        </>
                                    ) : isDaily ? (
                                        <>
                                            <Gift size={16} /> Claim Now
                                        </>
                                    ) : (
                                        <>
                                            <Play size={16} /> Start AFK
                                        </>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="credits-info">
                    <h3>How Credits Work</h3>
                    <ul>
                        <li>🎯 Each account generation costs <strong>2 credits</strong></li>
                        <li>🎁 Claim your free daily bonus every 24 hours</li>
                        <li>⏳ Use AFK Page to earn <strong>1 credit per minute</strong> automatically</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
}
