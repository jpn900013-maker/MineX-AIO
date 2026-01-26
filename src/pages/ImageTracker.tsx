import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * ImageTracker Component
 * Handles /img/:code routes for IP Logger tracking links
 * Fetches image from backend and logs visitor information
 */
export default function ImageTracker() {
    const { code } = useParams<{ code: string }>();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;

        const loadImage = async () => {
            try {
                // Fetch the image from backend - this also logs the visitor
                const response = await fetch(`${API_URL}/track/${code}`);

                if (!response.ok) {
                    setError("Image not found or link expired");
                    setLoading(false);
                    return;
                }

                // The backend returns the image directly
                const contentType = response.headers.get("content-type");

                if (contentType?.includes("image")) {
                    // Backend returns actual image data
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                } else {
                    // If redirected to external URL, use that
                    setImageUrl(response.url);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error loading image:", err);
                setError("Failed to load image");
                setLoading(false);
            }
        };

        loadImage();
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
                    <p className="text-muted-foreground mb-6">{error || "Failed to load image"}</p>
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
