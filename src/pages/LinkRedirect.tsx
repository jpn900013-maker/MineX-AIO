import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * LinkRedirect Component
 * Handles /s/:code routes for Link Shortener redirect
 * Looks up the short code and redirects to the original URL
 */
export default function LinkRedirect() {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!code) {
            navigate("/", { replace: true });
            return;
        }

        // Look up the short link in localStorage
        const savedLinks = localStorage.getItem("minex-short-links");
        if (savedLinks) {
            const links = JSON.parse(savedLinks);
            const link = links.find((l: any) => l.shortCode === code);

            if (link) {
                // Increment click count
                const updatedLinks = links.map((l: any) =>
                    l.shortCode === code ? { ...l, clicks: (l.clicks || 0) + 1 } : l
                );
                localStorage.setItem("minex-short-links", JSON.stringify(updatedLinks));

                // Redirect to original URL
                window.location.href = link.originalUrl;
                return;
            }
        }

        // Link not found - show 404
        navigate("/404", { replace: true });
    }, [code, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        </div>
    );
}
