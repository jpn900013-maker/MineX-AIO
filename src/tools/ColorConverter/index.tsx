import { useState, useEffect } from "react";
import { Palette, Copy, Check, RefreshCw } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ColorValues {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    cmyk: { c: number; m: number; y: number; k: number };
}

export default function ColorConverter() {
    const [color, setColor] = useState<ColorValues>({
        hex: "#6366f1",
        rgb: { r: 99, g: 102, b: 241 },
        hsl: { h: 239, s: 84, l: 67 },
        cmyk: { c: 59, m: 58, y: 0, k: 5 }
    });
    const [copied, setCopied] = useState<string | null>(null);
    const { toast } = useToast();

    // Conversion functions
    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r: number, g: number, b: number): string => {
        return "#" + [r, g, b].map(x => {
            const hex = Math.min(255, Math.max(0, x)).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    };

    const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
        r /= 255; g /= 255; b /= 255;
        const k = 1 - Math.max(r, g, b);
        if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
    };

    const updateFromHex = (hex: string) => {
        if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) return;
        const formattedHex = hex.startsWith("#") ? hex : `#${hex}`;
        const rgb = hexToRgb(formattedHex);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
            setColor({ hex: formattedHex, rgb, hsl, cmyk });
        }
    };

    const updateFromRgb = (r: number, g: number, b: number) => {
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        const cmyk = rgbToCmyk(r, g, b);
        setColor({ hex, rgb: { r, g, b }, hsl, cmyk });
    };

    const updateFromHsl = (h: number, s: number, l: number) => {
        h = Math.min(360, Math.max(0, h));
        s = Math.min(100, Math.max(0, s));
        l = Math.min(100, Math.max(0, l));
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        setColor({ hex, rgb, hsl: { h, s, l }, cmyk });
    };

    const copyValue = async (label: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(label);
            toast({ title: "Copied!", description: `${label} copied to clipboard` });
            setTimeout(() => setCopied(null), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const generateRandom = () => {
        const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
        updateFromHex(hex);
    };

    return (
        <ToolPageLayout
            title="Color Converter"
            description="Convert between HEX, RGB, HSL, and CMYK color formats"
            icon={Palette}
            category="Converter"
        >
            <div className="space-y-8">
                {/* Color Preview */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div
                        className="w-full md:w-48 h-48 rounded-xl border border-white/10 shadow-lg"
                        style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Color Preview</h3>
                            <p className="text-muted-foreground text-sm">
                                Click on any value to copy it to your clipboard
                            </p>
                        </div>
                        <Button onClick={generateRandom} variant="outline" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Random Color
                        </Button>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Color Picker</label>
                            <input
                                type="color"
                                value={color.hex}
                                onChange={(e) => updateFromHex(e.target.value)}
                                className="w-full h-12 rounded-lg cursor-pointer mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Color Values Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* HEX */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">HEX</label>
                        <div className="flex gap-2">
                            <Input
                                value={color.hex}
                                onChange={(e) => updateFromHex(e.target.value)}
                                className="font-mono bg-background/50"
                                placeholder="#000000"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyValue("HEX", color.hex)}
                            >
                                {copied === "HEX" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* RGB */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">RGB</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={color.rgb.r}
                                onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, color.rgb.g, color.rgb.b)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={255}
                                placeholder="R"
                            />
                            <Input
                                type="number"
                                value={color.rgb.g}
                                onChange={(e) => updateFromRgb(color.rgb.r, parseInt(e.target.value) || 0, color.rgb.b)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={255}
                                placeholder="G"
                            />
                            <Input
                                type="number"
                                value={color.rgb.b}
                                onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, parseInt(e.target.value) || 0)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={255}
                                placeholder="B"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyValue("RGB", `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
                            >
                                {copied === "RGB" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* HSL */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">HSL</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={color.hsl.h}
                                onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, color.hsl.s, color.hsl.l)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={360}
                                placeholder="H"
                            />
                            <Input
                                type="number"
                                value={color.hsl.s}
                                onChange={(e) => updateFromHsl(color.hsl.h, parseInt(e.target.value) || 0, color.hsl.l)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={100}
                                placeholder="S"
                            />
                            <Input
                                type="number"
                                value={color.hsl.l}
                                onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, parseInt(e.target.value) || 0)}
                                className="font-mono bg-background/50"
                                min={0}
                                max={100}
                                placeholder="L"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyValue("HSL", `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}
                            >
                                {copied === "HSL" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* CMYK */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">CMYK</label>
                        <div className="flex gap-2">
                            <Input
                                value={`${color.cmyk.c}%`}
                                readOnly
                                className="font-mono bg-background/50"
                                placeholder="C"
                            />
                            <Input
                                value={`${color.cmyk.m}%`}
                                readOnly
                                className="font-mono bg-background/50"
                                placeholder="M"
                            />
                            <Input
                                value={`${color.cmyk.y}%`}
                                readOnly
                                className="font-mono bg-background/50"
                                placeholder="Y"
                            />
                            <Input
                                value={`${color.cmyk.k}%`}
                                readOnly
                                className="font-mono bg-background/50"
                                placeholder="K"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyValue("CMYK", `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`)}
                            >
                                {copied === "CMYK" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CSS Values */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h3 className="font-medium text-foreground">CSS Values</h3>
                    <div className="grid md:grid-cols-2 gap-2 font-mono text-sm">
                        <button
                            onClick={() => copyValue("CSS HEX", color.hex)}
                            className="p-2 bg-background/50 rounded text-left hover:bg-background/80 transition-colors"
                        >
                            color: {color.hex};
                        </button>
                        <button
                            onClick={() => copyValue("CSS RGB", `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}
                            className="p-2 bg-background/50 rounded text-left hover:bg-background/80 transition-colors"
                        >
                            color: rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b});
                        </button>
                        <button
                            onClick={() => copyValue("CSS HSL", `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}
                            className="p-2 bg-background/50 rounded text-left hover:bg-background/80 transition-colors"
                        >
                            color: hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%);
                        </button>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
}
