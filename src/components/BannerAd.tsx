import { useEffect, useRef } from 'react';

/**
 * BannerAd Component - 300x250 Display Ad
 * Place this in suitable locations like sidebars, between content sections
 */
export default function BannerAd({ className = '' }: { className?: string }) {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Create and inject the ad script
        if (adRef.current && !adRef.current.hasChildNodes()) {
            // Options script
            const optionsScript = document.createElement('script');
            optionsScript.innerHTML = `
                atOptions = {
                    'key' : 'bc8a908221f3cd0c0081c50c4a925f4b',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                };
            `;
            adRef.current.appendChild(optionsScript);

            // Invoke script
            const invokeScript = document.createElement('script');
            invokeScript.src = 'https://www.highperformanceformat.com/bc8a908221f3cd0c0081c50c4a925f4b/invoke.js';
            adRef.current.appendChild(invokeScript);
        }
    }, []);

    return (
        <div
            ref={adRef}
            className={`flex items-center justify-center min-h-[250px] min-w-[300px] ${className}`}
            style={{ width: 300, height: 250 }}
        />
    );
}
