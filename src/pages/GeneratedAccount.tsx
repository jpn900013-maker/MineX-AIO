import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function GeneratedAccount() {
    const { linkId } = useParams();
    const [data, setData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    const token = localStorage.getItem('minex-token');

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchAccount();
    }, [linkId, token]);

    const fetchAccount = async () => {
        try {
            const res = await fetch(`${API_URL}/api/generator/link/${linkId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                setError(json.error || "Failed to load account");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    const copyAccount = () => {
        if (data) {
            navigator.clipboard.writeText(data);
            toast({ title: "Copied!", description: "Account copied to clipboard" });
        }
    };

    const styles = {
        container: {
            fontFamily: "'Inter', system-ui, sans-serif",
            background: "#0B0B0F",
            color: "#E5E5E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            margin: 0
        } as React.CSSProperties,
        box: {
            background: "#141418",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center" as const,
            width: "420px",
            boxShadow: "0 8px 24px rgba(139,92,246,0.25)",
            border: "1px solid rgba(255,255,255,0.07)"
        } as React.CSSProperties,
        h1: {
            color: "#C084FC",
            fontWeight: 700,
            marginBottom: "22px",
            fontSize: "1.6rem"
        } as React.CSSProperties,
        account: {
            background: "#1C1C20",
            padding: "14px",
            borderRadius: "8px",
            fontSize: "16px",
            color: "#fff",
            wordBreak: "break-all" as const,
            marginBottom: "18px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)"
        } as React.CSSProperties,
        btn: {
            background: "#8B5CF6",
            color: "white",
            padding: "10px 22px",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.3s ease",
            display: "inline-block",
            margin: "6px 4px",
            cursor: "pointer"
        } as React.CSSProperties
    };

    if (loading) return <div style={styles.container}>Loading...</div>;
    if (error) return <div style={styles.container}><div style={{ color: '#EF4444' }}>{error}</div></div>;

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h1 style={styles.h1}>Your Generated Account</h1>

                <div style={styles.account} id="account-text">
                    {data}
                </div>

                <button
                    onClick={copyAccount}
                    style={styles.btn}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    📋 Copy
                </button>

                <Link
                    to="/tools/account-generator"
                    style={styles.btn}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    ⬅ Back to Generator
                </Link>
            </div>
        </div>
    );
}
