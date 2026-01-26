import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Database, Server, RefreshCw, HardDrive, Users, FileText, Globe, Trash2, ArrowRightLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [databases, setDatabases] = useState<any[]>([]);
    const [newAlias, setNewAlias] = useState("");
    const [newUrl, setNewUrl] = useState("");

    // Migration Options
    const [migrateUsers, setMigrateUsers] = useState(true);
    const [migrateTools, setMigrateTools] = useState(true);
    const [targetDb, setTargetDb] = useState(""); // For selective migration
    const [sourceDb, setSourceDb] = useState(""); // For DB-to-DB migration

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }
        refreshData();
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const refreshData = () => {
        fetchStats();
        fetchDatabases();
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDatabases = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/databases`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDatabases(data.databases);
        } catch (e) {
            console.error(e);
        }
    };

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
                toast({ title: "Database Added", description: `Added ${newAlias}` });
                setNewAlias("");
                setNewUrl("");
                fetchDatabases();
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
                toast({ title: "Switched Database", description: `Active: ${alias}` });
                refreshData();
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
            refreshData();
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!migrateUsers && !migrateTools) return toast({ title: "Error", description: "Select at least one data type", variant: "destructive" });

        // Use active DB if no specific target selected
        const target = targetDb || databases.find(d => d.active)?.alias;
        if (!target) return toast({ title: "Error", description: "No database selected or active", variant: "destructive" });

        if (!confirm(`Migrate RAM data to "${target}"?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/database/migrate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    options: { users: migrateUsers, tools: migrateTools },
                    targetAlias: target
                })
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: "Migration Complete",
                    description: `Transferred data to ${target}.`
                });
                refreshData(); // Refresh to show new active status if switched
            } else {
                toast({ title: "Migration Failed", description: data.error, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDB = async (alias: string) => {
        if (!confirm(`Delete "${alias}" from the list?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/database/delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ alias })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Deleted", description: `Removed ${alias} from list` });
                refreshData();
            } else {
                toast({ title: "Error", description: data.error, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDbToDbMigration = async () => {
        if (!sourceDb || !targetDb || sourceDb === targetDb) {
            return toast({ title: "Error", description: "Select different source and target databases", variant: "destructive" });
        }
        if (!confirm(`Migrate data from "${sourceDb}" to "${targetDb}"?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/database/migrate-db`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    sourceAlias: sourceDb,
                    targetAlias: targetDb,
                    options: { users: migrateUsers, tools: migrateTools }
                })
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: "DB-to-DB Migration Complete",
                    description: `Transferred ${data.count?.users || 0} users, ${data.count?.pastes || 0} pastes`
                });
            } else {
                toast({ title: "Migration Failed", description: data.error, variant: "destructive" });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!stats) return <div className="p-8 text-green-500 font-mono">Loading System...</div>;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-8">
            <div className="container mx-auto max-w-6xl">
                <header className="flex items-center justify-between mb-12 border-b border-green-500/30 pb-4">
                    <h1 className="text-2xl font-bold tracking-widest">[ SYSTEM CONTROL ]</h1>
                    <div className="flex bg-green-900/20 px-4 py-2 rounded-none border border-green-500/30">
                        <span className="mr-2 opacity-50">STATUS:</span>
                        <span className={stats.dbStatus === 'mongodb' ? "text-green-400 font-bold" : "text-yellow-400 font-bold"}>
                            {stats.dbStatus === 'mongodb' ? "MONGODB ACTIVE" : "IN-MEMORY (VOLATILE)"}
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* Stats Cards */}
                    <div className="p-6 border border-green-500/30 bg-green-900/10">
                        <div className="text-xs opacity-70 mb-2">TOTAL USERS</div>
                        <div className="text-4xl font-bold">{stats.users}</div>
                    </div>
                    <div className="p-6 border border-green-500/30 bg-green-900/10">
                        <div className="text-xs opacity-70 mb-2">TOTAL PASTES</div>
                        <div className="text-4xl font-bold">{stats.pastes}</div>
                    </div>
                    <div className="p-6 border border-green-500/30 bg-green-900/10">
                        <div className="text-xs opacity-70 mb-2">TRACKED LINKS</div>
                        <div className="text-4xl font-bold">{stats.links}</div>
                    </div>
                    <div className="p-6 border border-green-500/30 bg-green-900/10">
                        <div className="text-xs opacity-70 mb-2">ACTIVE BOTS</div>
                        <div className="text-4xl font-bold">{stats.bots}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Database Manager */}
                    <div className="p-8 border border-green-500/30 bg-green-900/10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5" /> DATABASE FLEET
                        </h2>

                        {/* New DB Form */}
                        <div className="flex gap-2 mb-6">
                            <Input value={newAlias} onChange={e => setNewAlias(e.target.value)} placeholder="Alias (e.g. MainDB)" className="bg-black border-green-500/30 h-10 w-1/3 text-green-500" />
                            <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="mongodb+srv://..." className="bg-black border-green-500/30 h-10 w-full text-green-500" />
                            <Button onClick={handleAddDB} disabled={loading} className="bg-green-500/20 border border-green-500 hover:bg-green-500 hover:text-black rounded-none">ADD</Button>
                        </div>

                        {/* DB List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {databases.length === 0 && <p className="opacity-50 italic text-sm">No databases added.</p>}
                            {databases.map((db: any) => (
                                <div key={db.alias} className={`flex items-center justify-between p-3 border ${db.active ? 'border-green-400 bg-green-900/30' : 'border-green-500/30'}`}>
                                    <div>
                                        <div className="font-bold text-sm flex items-center gap-2">
                                            {db.alias}
                                            {db.active && <span className="text-[10px] bg-green-500 text-black px-1 rounded font-bold animate-pulse">ACTIVE WRITER</span>}
                                        </div>
                                        <div className="text-[10px] opacity-50 truncate w-48">{db.url.substring(0, 25)}...</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {db.active ? (
                                            <Button onClick={handleDisconnect} variant="destructive" size="sm" className="h-7 text-xs rounded-none">Disconnect</Button>
                                        ) : (
                                            <>
                                                <Button onClick={() => handleSwitchDB(db.alias)} size="sm" className="h-7 text-xs bg-green-500/20 border border-green-500 hover:bg-green-500 hover:text-black rounded-none">Switch To</Button>
                                                <Button onClick={() => handleDeleteDB(db.alias)} variant="destructive" size="sm" className="h-7 text-xs rounded-none"><Trash2 className="w-3 h-3" /></Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Migration */}
                    <div className="p-8 border border-green-500/30 bg-green-900/10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" /> DATA MIGRATION
                        </h2>
                        <div className="space-y-6">
                            <div className="text-sm opacity-70">
                                <p className="mb-2">Transfer In-Memory data to a specific MongoDB.</p>
                                <p className="text-green-400 text-xs">Note: This will verify the connection before transfer.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider">Target Database</label>
                                <select
                                    value={targetDb}
                                    onChange={(e) => setTargetDb(e.target.value)}
                                    className="w-full bg-black border border-green-500/30 text-green-500 h-10 px-3 outline-none focus:border-green-500"
                                >
                                    <option value="">-- Active Database ({databases.find(d => d.active)?.alias || 'None'}) --</option>
                                    {databases.map(db => (
                                        <option key={db.alias} value={db.alias}>{db.alias} {db.active ? '(Active)' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-4 p-4 border border-green-500/30 bg-black/50">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={migrateUsers} onChange={e => setMigrateUsers(e.target.checked)} className="w-5 h-5 accent-green-500" />
                                    <span>USER ACCOUNTS</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={migrateTools} onChange={e => setMigrateTools(e.target.checked)} className="w-5 h-5 accent-green-500" />
                                    <span>TOOLS DATA</span>
                                </label>
                            </div>

                            <Button
                                onClick={handleMigrate}
                                disabled={loading || databases.length === 0}
                                className="w-full bg-green-500 text-black hover:bg-green-400 rounded-none h-12 font-bold uppercase tracking-widest"
                            >
                                <HardDrive className="w-4 h-4 mr-2" />
                                Initiate Transfer
                            </Button>

                            {/* DB-to-DB Migration */}
                            <div className="mt-8 pt-6 border-t border-green-500/30">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4" /> DB-TO-DB MIGRATION
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs opacity-70">SOURCE</label>
                                        <select
                                            value={sourceDb}
                                            onChange={(e) => setSourceDb(e.target.value)}
                                            className="w-full bg-black border border-green-500/30 text-green-500 h-10 px-3 outline-none focus:border-green-500"
                                        >
                                            <option value="">-- Select Source --</option>
                                            {databases.map(db => (
                                                <option key={db.alias} value={db.alias}>{db.alias}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs opacity-70">TARGET</label>
                                        <select
                                            value={targetDb}
                                            onChange={(e) => setTargetDb(e.target.value)}
                                            className="w-full bg-black border border-green-500/30 text-green-500 h-10 px-3 outline-none focus:border-green-500"
                                        >
                                            <option value="">-- Select Target --</option>
                                            {databases.map(db => (
                                                <option key={db.alias} value={db.alias}>{db.alias}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleDbToDbMigration}
                                    disabled={loading || databases.length < 2}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-none h-10 font-bold uppercase tracking-wider"
                                >
                                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                                    Migrate DB → DB
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
