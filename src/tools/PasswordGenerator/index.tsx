import { useState } from "react";
import { Key, Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeAmbiguous: boolean;
}

export default function PasswordGenerator() {
    const [password, setPassword] = useState("");
    const [passwords, setPasswords] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
    });
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const charSets = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        uppercaseNoAmbiguous: "ABCDEFGHJKLMNPQRSTUVWXYZ", // No I, O
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        lowercaseNoAmbiguous: "abcdefghjkmnpqrstuvwxyz", // No i, l, o
        numbers: "0123456789",
        numbersNoAmbiguous: "23456789", // No 0, 1
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    const generatePassword = (opts: PasswordOptions): string => {
        let chars = "";

        if (opts.uppercase) {
            chars += opts.excludeAmbiguous ? charSets.uppercaseNoAmbiguous : charSets.uppercase;
        }
        if (opts.lowercase) {
            chars += opts.excludeAmbiguous ? charSets.lowercaseNoAmbiguous : charSets.lowercase;
        }
        if (opts.numbers) {
            chars += opts.excludeAmbiguous ? charSets.numbersNoAmbiguous : charSets.numbers;
        }
        if (opts.symbols) {
            chars += charSets.symbols;
        }

        if (!chars) {
            chars = charSets.lowercase; // Fallback
        }

        let result = "";
        const array = new Uint32Array(opts.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < opts.length; i++) {
            result += chars[array[i] % chars.length];
        }

        return result;
    };

    const generate = () => {
        if (count === 1) {
            const newPassword = generatePassword(options);
            setPassword(newPassword);
            setPasswords([]);
        } else {
            const newPasswords = Array.from({ length: count }, () => generatePassword(options));
            setPasswords(newPasswords);
            setPassword("");
        }
        toast({ title: "Generated!", description: `${count} password(s) created` });
    };

    const copyToClipboard = async (text?: string) => {
        try {
            const textToCopy = text || password || passwords.join("\n");
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast({ title: "Copied!", description: "Password copied to clipboard" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ title: "Failed to copy", variant: "destructive" });
        }
    };

    const getStrength = (): { label: string; color: string; icon: typeof Shield; score: number } => {
        let score = 0;

        if (options.length >= 8) score += 1;
        if (options.length >= 12) score += 1;
        if (options.length >= 16) score += 1;
        if (options.uppercase) score += 1;
        if (options.lowercase) score += 1;
        if (options.numbers) score += 1;
        if (options.symbols) score += 2;

        if (score <= 3) return { label: "Weak", color: "text-red-500", icon: ShieldAlert, score };
        if (score <= 5) return { label: "Moderate", color: "text-yellow-500", icon: Shield, score };
        if (score <= 7) return { label: "Strong", color: "text-green-500", icon: ShieldCheck, score };
        return { label: "Very Strong", color: "text-emerald-400", icon: ShieldCheck, score };
    };

    const strength = getStrength();
    const StrengthIcon = strength.icon;

    const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <ToolPageLayout
            title="Password Generator"
            description="Generate strong, secure random passwords with customizable options"
            icon={Key}
            category="Security"
        >
            <div className="space-y-6">
                {/* Generated Password Display */}
                {password && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Generated Password</label>
                        <div className="flex gap-2">
                            <Input
                                value={password}
                                readOnly
                                className="font-mono text-lg bg-background/50"
                            />
                            <Button onClick={() => copyToClipboard(password)} variant="outline" size="icon">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Strength Indicator */}
                <div className="flex items-center gap-3">
                    <StrengthIcon className={`w-5 h-5 ${strength.color}`} />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
                            <span className="text-xs text-muted-foreground">{strength.score}/9</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${strength.score <= 3 ? "bg-red-500" :
                                        strength.score <= 5 ? "bg-yellow-500" :
                                            strength.score <= 7 ? "bg-green-500" : "bg-emerald-400"
                                    }`}
                                style={{ width: `${(strength.score / 9) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Length Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Password Length</label>
                        <span className="text-sm font-bold text-primary">{options.length}</span>
                    </div>
                    <Slider
                        value={[options.length]}
                        onValueChange={(v) => updateOption("length", v[0])}
                        min={4}
                        max={64}
                        step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>4</span>
                        <span>64</span>
                    </div>
                </div>

                {/* Character Options */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Character Types</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="uppercase"
                                checked={options.uppercase}
                                onCheckedChange={(checked) => updateOption("uppercase", !!checked)}
                            />
                            <label htmlFor="uppercase" className="text-sm">
                                Uppercase (A-Z)
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="lowercase"
                                checked={options.lowercase}
                                onCheckedChange={(checked) => updateOption("lowercase", !!checked)}
                            />
                            <label htmlFor="lowercase" className="text-sm">
                                Lowercase (a-z)
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="numbers"
                                checked={options.numbers}
                                onCheckedChange={(checked) => updateOption("numbers", !!checked)}
                            />
                            <label htmlFor="numbers" className="text-sm">
                                Numbers (0-9)
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="symbols"
                                checked={options.symbols}
                                onCheckedChange={(checked) => updateOption("symbols", !!checked)}
                            />
                            <label htmlFor="symbols" className="text-sm">
                                Symbols (!@#$%...)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="excludeAmbiguous"
                        checked={options.excludeAmbiguous}
                        onCheckedChange={(checked) => updateOption("excludeAmbiguous", !!checked)}
                    />
                    <label htmlFor="excludeAmbiguous" className="text-sm text-muted-foreground">
                        Exclude ambiguous characters (0, O, l, 1, I)
                    </label>
                </div>

                {/* Count */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-muted-foreground">Number of Passwords</label>
                        <span className="text-sm font-medium text-primary">{count}</span>
                    </div>
                    <Slider
                        value={[count]}
                        onValueChange={(v) => setCount(v[0])}
                        min={1}
                        max={20}
                        step={1}
                    />
                </div>

                {/* Generate Button */}
                <Button onClick={generate} className="w-full gap-2" size="lg">
                    <RefreshCw className="w-4 h-4" />
                    Generate Password{count > 1 ? "s" : ""}
                </Button>

                {/* Bulk Passwords */}
                {passwords.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">
                                Generated Passwords ({passwords.length})
                            </label>
                            <Button onClick={() => copyToClipboard(passwords.join("\n"))} variant="ghost" size="sm" className="gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                Copy All
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-auto">
                            {passwords.map((pwd, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Input
                                        value={pwd}
                                        readOnly
                                        className="font-mono text-sm bg-background/50"
                                    />
                                    <Button onClick={() => copyToClipboard(pwd)} variant="outline" size="icon">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
}
