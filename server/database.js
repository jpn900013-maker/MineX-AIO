const mongoose = require('mongoose');

// Schemas
const UserSchema = new mongoose.Schema({
    id: String,
    username: { type: String, unique: true },
    password: String,
    createdAt: Number
});

const PasteSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    userId: String,
    title: String,
    content: String,
    language: String,
    createdAt: Number,
    expiresAt: Number,
    password: String,
    views: Number
});

const IpLogSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    userId: String,
    imageData: String,
    createdAt: Number,
    visitors: Array
});

// Models
const User = mongoose.model('User', UserSchema);
const Paste = mongoose.model('Paste', PasteSchema);
const IpLog = mongoose.model('IpLog', IpLogSchema);

class DatabaseManager {
    constructor(inMemoryUsers, inMemoryPastes, inMemoryIpLogs) {
        this.status = 'memory'; // 'memory' or 'mongodb'
        this.activeAlias = null;
        this.databases = new Map(); // alias -> connectionString

        // In-memory data references
        this.memUsers = inMemoryUsers;
        this.memPastes = inMemoryPastes;
        this.memIpLogs = inMemoryIpLogs;
    }

    addDatabase(alias, connectionString) {
        this.databases.set(alias, connectionString);
        return { success: true, databases: Array.from(this.databases.entries()) };
    }

    getDatabases() {
        return Array.from(this.databases.entries()).map(([alias, url]) => ({ alias, url, active: this.activeAlias === alias }));
    }

    async switchDatabase(alias) {
        const url = this.databases.get(alias);
        if (!url) return { success: false, error: 'Database alias not found' };

        try {
            // Disconnect valid existing connection
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }

            await mongoose.connect(url);
            this.status = 'mongodb';
            this.activeAlias = alias;
            console.log(`Switched to MongoDB: ${alias}`);
            return { success: true };
        } catch (error) {
            console.error('MongoDB Connection Error:', error);
            return { success: false, error: error.message };
        }
    }

    async connect(connectionString) {
        // Legacy single-connect support (defaults to alias 'default')
        return this.addDatabase('default', connectionString) && this.switchDatabase('default');
    }

    async disconnect() {
        if (this.status === 'mongodb') {
            await mongoose.disconnect();
            this.status = 'memory';
            this.activeAlias = null;
            return { success: true };
        }
        return { success: true };
    }

    // Migration: Memory -> MongoDB (Selective)
    async migrateToMongo(options = { users: true, tools: true }) {
        if (this.status !== 'mongodb') return { success: false, error: 'Not connected to MongoDB' };

        try {
            const results = { users: 0, pastes: 0, logs: 0 };

            // 1. Migrate Users
            if (options.users) {
                const userOps = [];
                for (const user of this.memUsers.values()) {
                    userOps.push({ updateOne: { filter: { username: user.username }, update: user, upsert: true } });
                }
                if (userOps.length > 0) {
                    await User.bulkWrite(userOps);
                    results.users = userOps.length;
                }
            }

            // 2. Migrate Tools Data
            if (options.tools) {
                // Pastes
                const pasteOps = [];
                for (const [code, paste] of this.memPastes.entries()) {
                    pasteOps.push({ updateOne: { filter: { code }, update: { ...paste, code }, upsert: true } });
                }
                if (pasteOps.length > 0) {
                    await Paste.bulkWrite(pasteOps);
                    results.pastes = pasteOps.length;
                }

                // IP Logs
                const logOps = [];
                for (const [code, log] of this.memIpLogs.entries()) {
                    logOps.push({ updateOne: { filter: { code }, update: { ...log, code }, upsert: true } });
                }
                if (logOps.length > 0) {
                    await IpLog.bulkWrite(logOps);
                    results.logs = logOps.length;
                }
            }

            return { success: true, count: results };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
// Proxy methods to get/set data based on active mode
// (This part is tricky without rewriting the whole index.js, 
//  so for now the Admin Panel will just migrate data, 
//  and we might need to update index.js to use this Manager for all ops)
// End of Class


module.exports = { DatabaseManager, User, Paste, IpLog };
