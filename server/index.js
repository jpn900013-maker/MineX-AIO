// MineX AIO Hub - Backend Server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mineflayer = require('mineflayer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { DatabaseManager, User, Paste, IpLog } = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'minex-secret-key-change-this';

// In-Memory Data Stores
const memUsers = new Map();
const memPastes = new Map();
const memIpLogs = new Map();
const activeBots = new Map();

// Initialize Database Manager
const dbManager = new DatabaseManager(memUsers, memPastes, memIpLogs);

// --- HELPER FUNCTIONS (Unified Data Access) ---

async function findUser(username) {
    if (dbManager.status === 'mongodb') {
        const user = await User.findOne({ username });
        return user ? user.toObject() : null;
    }
    return memUsers.get(username);
}

async function createUser(userData) {
    if (dbManager.status === 'mongodb') {
        const user = new User(userData);
        await user.save();
        return user.toObject();
    }
    memUsers.set(userData.username, userData);
    return userData;
}

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) req.user = user;
        next();
    });
};

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ============= ADMIN ROUTES =============

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    // Hardcoded Admin Credentials
    if (email === 'operators130@gmail.com' && password === '0po98iu76yt5@SS') {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
});

const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') return res.sendStatus(403);
        next();
    });
};

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    let stats = {
        users: memUsers.size,
        pastes: memPastes.size,
        links: memIpLogs.size,
        bots: activeBots.size,
        dbStatus: dbManager.status
    };

    if (dbManager.status === 'mongodb') {
        try {
            stats.users = await User.countDocuments();
            stats.pastes = await Paste.countDocuments();
            stats.links = await IpLog.countDocuments();
        } catch (e) {
            console.error(e);
        }
    }
    res.json({ success: true, stats });
});

app.get('/api/admin/databases', requireAdmin, (req, res) => {
    res.json({ success: true, databases: dbManager.getDatabases() });
});

app.post('/api/admin/database/add', requireAdmin, (req, res) => {
    const { alias, connectionString } = req.body;
    if (!alias || !connectionString) return res.json({ success: false, error: 'Alias and URL required' });
    const result = dbManager.addDatabase(alias, connectionString);
    res.json(result);
});

app.post('/api/admin/database/switch', requireAdmin, async (req, res) => {
    const { alias } = req.body;
    const result = await dbManager.switchDatabase(alias);
    res.json(result);
});

app.post('/api/admin/database/disconnect', requireAdmin, async (req, res) => {
    const result = await dbManager.disconnect();
    res.json(result);
});

app.post('/api/admin/database/migrate', requireAdmin, async (req, res) => {
    const { options, targetAlias } = req.body; // { users: boolean, tools: boolean }, targetAlias: string

    if (targetAlias) {
        const switchResult = await dbManager.switchDatabase(targetAlias);
        if (!switchResult.success) return res.json(switchResult);
    }

    const result = await dbManager.migrateToMongo(options || { users: true, tools: true });
    res.json(result);
});

// ============= AUTH ROUTES =============

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'Missing fields' });

    const existing = await findUser(username);
    if (existing) return res.status(400).json({ success: false, error: 'Username taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        username,
        password: hashedPassword,
        createdAt: Date.now()
    };
    await createUser(user);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username } });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await findUser(username);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user.id, username: user.username } });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get('/api/user/history', requireAuth, async (req, res) => {
    const userId = req.user.id;
    let userPastes = [];
    let userLinks = [];

    if (dbManager.status === 'mongodb') {
        userPastes = await Paste.find({ userId });
        userLinks = await IpLog.find({ userId });
    } else {
        for (const [code, paste] of memPastes.entries()) {
            if (paste.userId === userId) userPastes.push({ ...paste, code });
        }
        for (const [code, link] of memIpLogs.entries()) {
            if (link.userId === userId) userLinks.push({ ...link, code });
        }
    }
    res.json({ success: true, pastes: userPastes, links: userLinks });
});

// ============= MC BOT ROUTES =============

app.post('/api/bot/create', (req, res) => {
    const { sessionId, host, port, username, version } = req.body;

    if (activeBots.has(sessionId)) return res.json({ success: false, error: 'Bot exists' });

    try {
        const bot = mineflayer.createBot({
            host: host,
            port: port || 25565,
            username: username || 'MineXBot',
            version: version || false,
            auth: 'offline',
            viewDistance: 'tiny',
            hideErrors: false
        });

        bot.on('spawn', () => {
            io.to(sessionId).emit('bot:spawned', { position: bot.entity.position, health: bot.health, food: bot.food });
        });

        bot.on('chat', (username, message) => io.to(sessionId).emit('bot:chat', { username, message, timestamp: Date.now() }));
        bot.on('message', (message) => io.to(sessionId).emit('bot:message', { message: message.toString(), timestamp: Date.now() }));

        bot.on('error', (err) => {
            const errorMsg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
            io.to(sessionId).emit('bot:error', { error: errorMsg });
            console.error(`Bot Error [${sessionId}]:`, errorMsg);
        });

        bot.on('kicked', (reason) => {
            io.to(sessionId).emit('bot:kicked', { reason });
            activeBots.delete(sessionId);
        });

        bot.on('end', () => {
            io.to(sessionId).emit('bot:disconnected');
            activeBots.delete(sessionId);
        });

        activeBots.set(sessionId, bot);
        res.json({ success: true, message: 'Bot created' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/bot/chat', (req, res) => {
    const { sessionId, message } = req.body;
    const bot = activeBots.get(sessionId);
    if (!bot) return res.json({ success: false, error: 'Bot not found' });
    bot.chat(message);
    res.json({ success: true });
});

app.post('/api/bot/action', (req, res) => {
    const { sessionId, action } = req.body;
    const bot = activeBots.get(sessionId);
    if (!bot) return res.json({ success: false, error: 'Bot not found' });

    try {
        switch (action) {
            case 'jump': bot.setControlState('jump', true); setTimeout(() => bot.setControlState('jump', false), 500); break;
            case 'forward': bot.setControlState('forward', true); setTimeout(() => bot.setControlState('forward', false), 2000); break;
            case 'back': bot.setControlState('back', true); setTimeout(() => bot.setControlState('back', false), 2000); break;
            case 'left': bot.setControlState('left', true); setTimeout(() => bot.setControlState('left', false), 1000); break;
            case 'right': bot.setControlState('right', true); setTimeout(() => bot.setControlState('right', false), 1000); break;
            case 'sneak': bot.setControlState('sneak', !bot.controlState.sneak); break;
            case 'stop': bot.clearControlStates(); break;
        }
        res.json({ success: true, action });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.post('/api/bot/disconnect', (req, res) => {
    const { sessionId } = req.body;
    const bot = activeBots.get(sessionId);
    if (bot) {
        bot.quit();
        activeBots.delete(sessionId);
        res.json({ success: true });
    } else res.json({ success: false, error: 'Bot not found' });
});

app.get('/api/bot/status/:sessionId', (req, res) => {
    const bot = activeBots.get(req.params.sessionId);
    if (bot && bot.entity) {
        res.json({ online: true, health: bot.health, food: bot.food, position: bot.entity.position, players: Object.keys(bot.players).length });
    } else res.json({ online: false });
});

// ============= IP LOGGER ROUTES =============

app.post('/api/iplogger/create', authenticateToken, async (req, res) => {
    const { imageData } = req.body;
    const code = Math.random().toString(36).substring(2, 10);
    const logData = {
        code, // for Mongo
        userId: req.user ? req.user.id : null,
        imageData,
        createdAt: Date.now(),
        visitors: []
    };

    if (dbManager.status === 'mongodb') {
        const log = new IpLog(logData);
        await log.save();
        // Optional: Implement limit logic for Mongo if desired
    } else {
        memIpLogs.set(code, logData);
        if (memIpLogs.size > 3) memIpLogs.delete(memIpLogs.keys().next().value);
    }
    res.json({ success: true, code, url: `/track/${code}` });
});

app.get('/track/:code', async (req, res) => {
    const { code } = req.params;
    let data;

    if (dbManager.status === 'mongodb') {
        data = await IpLog.findOne({ code });
    } else {
        data = memIpLogs.get(code);
    }

    if (!data) return res.status(404).send('Not found');

    const visitorInfo = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'] || 'Direct'
    };

    // Update visitors
    data.visitors.push(visitorInfo);
    if (data.visitors.length > 3) data.visitors = data.visitors.slice(-3); // Keep limit

    if (dbManager.status === 'mongodb') {
        await IpLog.updateOne({ code }, { visitors: data.visitors });
    }

    if (data.imageData.startsWith('data:image')) {
        const base64Data = data.imageData.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(imgBuffer);
    } else {
        res.redirect(data.imageData);
    }
});

app.get('/api/iplogger/visitors/:code', async (req, res) => {
    const { code } = req.params;
    let data;
    if (dbManager.status === 'mongodb') {
        data = await IpLog.findOne({ code });
    } else {
        data = memIpLogs.get(code);
    }

    if (!data) return res.json({ success: false, error: 'Not found' });
    res.json({ success: true, visitors: data.visitors, createdAt: data.createdAt });
});

// ============= PASTEBIN ROUTES =============

app.post('/api/paste/create', authenticateToken, async (req, res) => {
    const { title, content, language, expiresIn, password } = req.body;
    if (!content) return res.json({ success: false, error: 'Content required' });
    const code = Math.random().toString(36).substring(2, 10);

    // ... expiry logic (simplified for brevity, identical to before)
    let expiresAt = null; // Add logic if needed

    const pasteData = {
        code,
        userId: req.user ? req.user.id : null,
        title: title || 'Untitled',
        content,
        language: language || 'plaintext',
        createdAt: Date.now(),
        expiresAt,
        password: password || null,
        views: 0
    };

    if (dbManager.status === 'mongodb') {
        await new Paste(pasteData).save();
    } else {
        memPastes.set(code, pasteData);
    }

    res.json({ success: true, code, url: `/paste/${code}`, hasPassword: !!password });
});

app.post('/api/paste/view/:code', async (req, res) => {
    const { code } = req.params;
    const { password } = req.body;
    let paste;

    if (dbManager.status === 'mongodb') {
        paste = await Paste.findOne({ code });
    } else {
        paste = memPastes.get(code);
    }

    if (!paste) return res.json({ success: false, error: 'Not found' });
    if (paste.password && paste.password !== password) return res.json({ success: false, error: 'Incorrect password', requiresPassword: true });

    if (dbManager.status === 'mongodb') {
        await Paste.updateOne({ code }, { $inc: { views: 1 } });
    } else {
        paste.views++;
    }

    res.json({ success: true, paste });
});

app.get('/api/paste/check/:code', async (req, res) => {
    const { code } = req.params;
    let paste;
    if (dbManager.status === 'mongodb') paste = await Paste.findOne({ code });
    else paste = memPastes.get(code);

    if (!paste) return res.json({ success: false, error: 'Not found' });
    res.json({ success: true, requiresPassword: !!paste.password, title: paste.title, language: paste.language });
});

app.get('/raw/:code', async (req, res) => {
    const { code } = req.params;
    let paste;
    if (dbManager.status === 'mongodb') paste = await Paste.findOne({ code });
    else paste = memPastes.get(code);

    if (!paste || paste.password) return res.status(404).send('Not found or locked');
    res.setHeader('Content-Type', 'text/plain');
    res.send(paste.content);
});

// Socket.io
io.on('connection', (socket) => {
    socket.on('join:session', (id) => socket.join(id));
});

// Start
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`MineX Server running on port ${PORT}`);
});
