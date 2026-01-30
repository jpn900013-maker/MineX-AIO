import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface StockDetail {
    id: string;
    name: string;
    count: number;
    restock_date: string | null;
}

const SERVICES = [
    { id: "disney", name: "Disney+" },
    { id: "minecraft", name: "Minecraft" },
    { id: "netflix", name: "Netflix" },
    { id: "crunchyroll", name: "Crunchyroll" },
    { id: "spotify", name: "Spotify" },
    { id: "hbomax", name: "HBO Max" },
    { id: "roblox", name: "Roblox" },
    { id: "xbox", name: "Xbox Game Pass" },
    { id: "xboxultimate", name: "Xbox Ultimate Game Pass" },
    { id: "steam", name: "Steam" },
];

export default function AdminDashboard() {
    // --- Database Management Logic ---
    const [stats, setStats] = useState<any>(null);
    const [databases, setDatabases] = useState<any[]>([]);
    const [newAlias, setNewAlias] = useState("");
    const [newUrl, setNewUrl] = useState("");

    // Original Logic
    const [stockDetails, setStockDetails] = useState<StockDetail[]>([]);
    const [selectedService, setSelectedService] = useState("disney");
    const [accountsText, setAccountsText] = useState("");
    const [flashMessage, setFlashMessage] = useState<{ type: string; msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // User Management Logic
    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});

    const navigate = useNavigate();
    const { toast } = useToast();
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }
        fetchStockDetails();
        fetchSystemData();
    }, [token]);

    const fetchSystemData = async () => {
        try {
            const [statsRes, dbsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
                fetch(`${API_URL}/api/admin/databases`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
            ]);
            if (statsRes.success) setStats(statsRes.stats);
            if (dbsRes.success) setDatabases(dbsRes.databases);
        } catch (e) {
            console.error("Failed to fetch system data", e);
        }
    };

    const fetchStockDetails = async () => {
        const details: StockDetail[] = [];
        for (const service of SERVICES) {
            try {
                const res = await fetch(`${API_URL}/api/generator/${service.id}/stock`);
                const data = await res.json();
                details.push({
                    id: service.id,
                    name: service.name,
                    count: data.success ? data.count : 0,
                    restock_date: data.restockDate || null,
                });
            } catch {
                details.push({
                    id: service.id,
                    name: service.name,
                    count: 0,
                    restock_date: null,
                });
            }
        }
        setStockDetails(details);
    };

    const handleAddAccounts = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountsText.trim()) {
            toast({ title: "Error", description: "Please enter accounts", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/generator/${selectedService}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ accounts: accountsText }),
            });
            const data = await res.json();

            if (data.success) {
                setFlashMessage({ type: "success", msg: `Added ${data.added} accounts to ${selectedService}` });
                setAccountsText("");
                fetchStockDetails();
            } else {
                setFlashMessage({ type: "error", msg: data.error || "Failed to add accounts" });
            }
        } catch {
            setFlashMessage({ type: "error", msg: "Failed to connect to server" });
        } finally {
            setLoading(false);
        }
    };

    const handleClearService = async (serviceId: string) => {
        if (!confirm(`Are you sure you want to clear ALL accounts for ${serviceId}?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/generator/${serviceId}/clear`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.success) {
                setFlashMessage({ type: "success", msg: `Cleared all accounts for ${serviceId}` });
                fetchStockDetails();
            } else {
                setFlashMessage({ type: "error", msg: data.error || "Failed to clear accounts" });
            }
        } catch {
            setFlashMessage({ type: "error", msg: "Failed to connect to server" });
        } finally {
            setLoading(false);
        }
    };

    // User Management Handlers
    const handleSearchUsers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userQuery.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users/search?q=${encodeURIComponent(userQuery)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUserResults(data.users);
                if (data.users.length === 0) toast({ title: "No users found" });
            }
        } catch {
            toast({ title: "Search Failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCredits = async (username: string) => {
        const amount = creditAmounts[username];
        if (!amount || isNaN(parseInt(amount))) return toast({ title: "Invalid amount", variant: "destructive" });

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users/add-credits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username, amount: parseInt(amount) })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Success", description: data.message });
                setCreditAmounts(prev => ({ ...prev, [username]: "" }));
                // Refresh list
                handleSearchUsers({ preventDefault: () => { } } as any);
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Failed to add credits", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId: string) => {
        const newPassword = prompt("Enter new password:");
        if (!newPassword) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/user/${userId}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();
            if (data.success) toast({ title: "Success", description: "Password reset" });
            else toast({ title: "Error", description: data.error, variant: "destructive" });
        } catch {
            toast({ title: "Failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/user/${userId}/delete`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: "User removed" });
                handleSearchUsers({ preventDefault: () => { } } as any);
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } catch {
            toast({ title: "Failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
    };

    const getStockClass = (count: number) => {
        if (count > 10) return "stock-high";
        if (count > 0) return "stock-medium";
        return "stock-low";
    };

    // DB Handlers
    const handleAddDB = async () => {
        if (!newAlias || !newUrl) return toast({ title: "Error", description: "Alias and URL required", variant: "destructive" });
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/database/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ alias: newAlias, connectionString: newUrl })
            });
            const data = await res.json();
            if (data.success) {
                setDatabases(data.databases);
                setNewAlias("");
                setNewUrl("");
                toast({ title: "Database Added", description: `Added ${newAlias}` });
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchDB = async (alias: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/database/switch`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ alias })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Switched Database", description: `Now using ${alias}` });
                fetchSystemData();
                fetchStockDetails(); // Refresh stock for new DB
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/admin/database/disconnect`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: "Disconnected", description: "Reverted to In-Memory Storage" });
            fetchSystemData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">MineAlts Admin Panel</header>

            <div className="admin-container">
                {flashMessage && (
                    <div className={`flash ${flashMessage.type}`}>{flashMessage.msg}</div>
                )}

                {/* System Status Banner */}
                {stats ? (
                    <div className="system-status-banner mb-6 p-4 rounded-lg border border-purple-500/30 bg-purple-900/10 flex justify-between items-center">
                        <div>
                            <span className="text-gray-400 text-sm">Active Database:</span>
                            <span className={`ml-2 font-bold ${stats?.dbStatus === 'mongodb' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {stats?.dbStatus === 'mongodb' ? 'MONGODB' : 'IN-MEMORY'}
                                {(databases || []).find(d => d.active)?.alias ? ` (${(databases || []).find(d => d.active)?.alias})` : ''}
                            </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span>Users: <b className="text-white">{stats?.users || 0}</b></span>
                            <span>Pastes: <b className="text-white">{stats?.pastes || 0}</b></span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 text-center text-gray-500">Loading system stats...</div>
                )}

                {/* Quick Navigation Buttons */}
                <div className="admin-nav-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <Link to="/" className="nav-btn purple">⬅ Back to Site</Link>
                </div>

                {/* User Credit Management */}
                <div className="form-box mb-8">
                    <h2 className="section-title">Manage User Credits</h2>
                    <form onSubmit={handleSearchUsers} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Search by username..."
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            className="flex-1 bg-[#121212] p-2 rounded text-white border border-gray-700 outline-none focus:border-purple-500"
                        />
                        <button type="submit" disabled={loading} className="bg-purple-600 px-4 py-2 rounded text-white font-bold hover:bg-purple-500">
                            Search
                        </button>
                    </form>

                    {userResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {userResults.map(user => (
                                <div key={user.username} className="bg-black/20 p-3 rounded flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-white">{user.username}</div>
                                        <div className="text-gray-400 text-sm">Credits: <span className="text-purple-400">{user.credits}</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={creditAmounts[user.username] || ""}
                                            onChange={(e) => setCreditAmounts(prev => ({ ...prev, [user.username]: e.target.value }))}
                                            className="w-20 bg-[#121212] p-1 rounded text-white text-sm border border-gray-700"
                                        />
                                        <button
                                            onClick={() => handleAddCredits(user.username)}
                                            className="bg-green-600 px-3 py-1 rounded text-white text-sm hover:bg-green-500"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => handleResetPassword(user._id)}
                                            className="bg-yellow-600 px-3 py-1 rounded text-white text-sm hover:bg-yellow-500"
                                        >
                                            Reset PW
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stock Management Section */}
                <h2 className="section-title">Manage Services - Stock Details</h2>
                {stockDetails.map((details) => (
                    <div key={details.id} className="service-box">
                        <div className="service-info">
                            <span className="service-name">{details.name}</span>
                            <span className="service-meta">
                                Service ID: {details.id} | Stock:{" "}
                                <span className={`stock-count ${getStockClass(details.count)}`}>
                                    {details.count} accounts
                                </span>
                            </span>
                            <span className="service-restock">
                                Last Restocked: {details.restock_date || "Never"}
                            </span>
                        </div>
                        <div className="service-actions">
                            <Link to={`/admin/accounts/${details.id}`}>
                                <button className="visit-btn">View</button>
                            </Link>
                            <button
                                className="clear-btn"
                                onClick={() => handleClearService(details.id)}
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Accounts Form */}
                <div className="form-box">
                    <h2 className="section-title">Add Accounts</h2>
                    <form onSubmit={handleAddAccounts}>
                        <label htmlFor="service">Choose Service:</label>
                        <select
                            name="service"
                            id="service"
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                        >
                            {SERVICES.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="accounts">Accounts (one per line):</label>
                        <Textarea
                            name="accounts"
                            id="accounts"
                            rows={6}
                            value={accountsText}
                            onChange={(e) => setAccountsText(e.target.value)}
                            placeholder="email:password&#10;user:pass"
                            className="accounts-textarea"
                        />
                        <input type="submit" value={loading ? "Adding..." : "Add Accounts"} disabled={loading} />
                    </form>
                </div>

                {/* Database Management Section */}
                <div className="form-box mt-8 border-t border-gray-800 pt-8">
                    <h2 className="section-title">Database Management</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Connection Manager */}
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-300 mb-4">Connections</h3>
                            <div className="space-y-3 mb-4">
                                <input
                                    value={newAlias}
                                    onChange={e => setNewAlias(e.target.value)}
                                    placeholder="Alias (e.g. BackupDB)"
                                    className="w-full bg-[#121212] p-2 rounded text-sm text-white border border-gray-700 focus:border-purple-500 outline-none"
                                />
                                <input
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="mongodb+srv://..."
                                    className="w-full bg-[#121212] p-2 rounded text-sm text-white border border-gray-700 focus:border-purple-500 outline-none"
                                />
                                <button onClick={handleAddDB} disabled={loading} className="w-full py-2 bg-purple-600 rounded text-sm font-bold hover:bg-purple-500 transition-colors">
                                    Add Connection
                                </button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {(databases || []).map(db => (
                                    <div key={db.alias} className={`flex justify-between items-center p-2 rounded ${db.active ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-800/30'}`}>
                                        <div className="text-sm">
                                            <div className="font-bold text-gray-300">{db.alias} {db.active && <span className="text-green-400 text-xs ml-1">(Active)</span>}</div>
                                            <div className="text-xs text-gray-500 truncate w-32">{db.url}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {db.active ? (
                                                <button onClick={handleDisconnect} className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded hover:bg-red-900">Disconnect</button>
                                            ) : (
                                                <button onClick={() => handleSwitchDB(db.alias)} className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded hover:bg-purple-900">Switch</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Migration Tools (Simplified UI) */}
                        <div className="bg-black/20 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-300 mb-4">Data Migration</h3>
                            <div className="text-gray-500 text-sm mb-4">
                                Currently using In-Memory logic mostly. Full migration UI hidden until backend support is more robust.
                            </div>
                            {/* Placeholder for future detailed migration UI if needed */}
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <div className="logout">
                    <a href="#" onClick={handleLogout}>🔒 Logout</a>
                </div>
            </div>
        </div>
    );
}
