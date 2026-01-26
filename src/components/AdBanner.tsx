/**
 * AdBanner Component
 * Displays an ad placeholder that integrates with your ad network
 * Place this component before download buttons, after form submissions, etc.
 */

interface AdBannerProps {
    variant?: 'horizontal' | 'square' | 'vertical';
    className?: string;
}

export default function AdBanner({ variant = 'horizontal', className = '' }: AdBannerProps) {
    const sizeClasses = {
        horizontal: 'w-full h-[90px] md:h-[100px]',
        square: 'w-[300px] h-[250px] mx-auto',
        vertical: 'w-[160px] h-[600px]'
    };

    return (
        <div className={`${sizeClasses[variant]} ${className} relative overflow-hidden`}>
            {/* Ad container - the ad network script will inject ads here */}
            <div
                id={`ad-container-${Math.random().toString(36).substring(7)}`}
                className="w-full h-full bg-gradient-to-r from-card/50 to-card/30 border border-border/50 rounded-lg flex items-center justify-center"
            >
                {/* Fallback content while ad loads */}
                <div className="text-center text-muted-foreground/50 text-xs">
                    <div className="animate-pulse">Advertisement</div>
                </div>
            </div>
        </div>
    );
}

/**
 * Inline ad that appears between content sections
 */
export function InlineAd({ className = '' }: { className?: string }) {
    return (
        <div className={`my-6 py-4 ${className}`}>
            <div className="text-[10px] text-muted-foreground/50 text-center mb-1">SPONSORED</div>
            <AdBanner variant="horizontal" />
        </div>
    );
}

/**
 * Ad that appears before a major action (download, generate, etc.)
 */
export function ActionAd({ onContinue, actionLabel = "Continue" }: { onContinue: () => void; actionLabel?: string }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full text-center">
                <div className="text-sm text-muted-foreground mb-4">Please wait while we prepare your file...</div>
                <AdBanner variant="square" className="mb-4" />
                <button
                    onClick={onContinue}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
