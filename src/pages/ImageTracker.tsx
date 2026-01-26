import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/**
 * ImageTracker Component
 * Handles /img/:code routes for IP Logger tracking links
 * Logs visitor information and displays the tracked image
 */
export default function ImageTracker() {
    const { code } = useParams<{ code: string }>();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;

        // Log visitor info
        const logVisitor = async () => {
            try {
                // Fetch IP info
                const ipResponse = await fetch("http://ip-api.com/json/");
                const ipData = await ipResponse.json();

                // Load saved links from localStorage
                const savedLinks = localStorage.getItem("minex-ip-logger");
                if (savedLinks) {
                    const links = JSON.parse(savedLinks);
                    const link = links.find((l: any) => l.code === code);

                    if (link) {
                        // Add visitor to the link
                        const visitor = {
                            id: Date.now().toString(),
                            timestamp: new Date(),
                            ip: ipData.query || "Unknown",
                            city: ipData.city || "Unknown",
                            region: ipData.regionName || "Unknown",
                            country: ipData.country || "Unknown",
                            postal: ipData.zip || "Unknown",
                            isp: ipData.isp || "Unknown",
                            userAgent: navigator.userAgent,
                            referrer: document.referrer || "Direct",
                        };

                        link.visitors = [visitor, ...(link.visitors || [])];

                        // Save back to localStorage
                        const updatedLinks = links.map((l: any) =>
                            l.code === code ? link : l
                        );
                        localStorage.setItem("minex-ip-logger", JSON.stringify(updatedLinks));

                        // Set the image to display
                        setImageUrl(link.imageDataUrl);
                        setLoading(false);
                        return;
                    }
                }

                // If not found locally, show error
                setError("Image not found or link expired");
                setLoading(false);
            } catch (err) {
                console.error("Error logging visitor:", err);
                setError("Failed to load image");
                setLoading(false);
            }
        };

        logVisitor();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
                    <p className="text-muted-foreground mb-6">{error || "Image not found"}</p>
                    <a href="/" className="text-primary hover:underline">
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <img
                src={imageUrl}
                alt="Tracked Image"
                className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
            />
        </div>
    );
}
