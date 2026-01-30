import { useEffect, useState } from 'react';

export const useSecurity = () => {
    const [violation, setViolation] = useState(false);

    useEffect(() => {
        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // Disable F12 and Ctrl+Shift+I/J/C/U
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                triggerViolation();
            }
        };

        // Detect DevTools via debugger trick
        const detectDevTools = () => {
            const start = Date.now();
            // eslint-disable-next-line
            debugger;
            if (Date.now() - start > 100) {
                triggerViolation();
            }
        };

        const interval = setInterval(detectDevTools, 1000);

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, []);

    const triggerViolation = () => {
        setViolation(true);
    };

    return { violation };
};

export const SecurityScreen = () => (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-6xl font-bold text-red-600 mb-6 font-mono">⚠️ SECURITY ALERT</h1>
        <p className="text-2xl text-white mb-8">
            Developer tools are strictly prohibited.
        </p>
        <p className="text-xl text-gray-400 font-mono">
            "pls dont copy wor work"
        </p>
    </div>
);
