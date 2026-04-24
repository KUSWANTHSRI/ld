const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for simplicity
        methods: ["GET", "POST"]
    }
});

// Map of connected users (userId -> socketId)
const connectedUsers = new Map();
// Active live polls
const activePolls = {};

io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Client sends user info to register connection
    socket.on('register', (userId) => {
        if (userId) {
            connectedUsers.set(userId, socket.id);
            console.log(`[Socket] User registered: ${userId} -> ${socket.id}`);
            
            // Send a welcome notification
            socket.emit('notification', {
                id: Date.now(),
                title: 'Welcome Back!',
                message: 'Your dashboard is up to date.',
                time: new Date().toISOString()
            });
        }
    });

    // Send existing polls to new connections
    socket.emit('active_polls', Object.values(activePolls));

    socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });

    // === LIVE POLLING FEATURE ===
    socket.on('create_poll', (pollData) => {
        const poll = {
            id: Date.now().toString(),
            question: pollData.question,
            options: pollData.options.map((opt, idx) => ({ id: idx.toString(), text: opt, votes: 0 })),
            active: true
        };
        activePolls[poll.id] = poll;
        console.log(`[Poll] Created: ${poll.question}`);
        io.emit('new_poll', poll); // Broadcast to everyone
    });

    socket.on('submit_vote', ({ pollId, optionId, previousOptionId, isUnvote }) => {
        if (activePolls[pollId] && activePolls[pollId].active) {
            if (previousOptionId) {
                const prevOpt = activePolls[pollId].options.find(o => o.id === previousOptionId);
                if (prevOpt && prevOpt.votes > 0) prevOpt.votes -= 1;
            }

            if (isUnvote) {
                const opt = activePolls[pollId].options.find(o => o.id === optionId);
                if (opt && opt.votes > 0) opt.votes -= 1;
            } else if (optionId) {
                const opt = activePolls[pollId].options.find(o => o.id === optionId);
                if (opt) opt.votes += 1;
            }

            io.emit('poll_updated', activePolls[pollId]);
        }
    });
});

// HTTP endpoint for other microservices to trigger notifications
app.post('/internal/notify', (req, res) => {
    const { userId, title, message } = req.body;

    if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
    }

    const notificationPayload = {
        id: Date.now(),
        title,
        message,
        time: new Date().toISOString()
    };

    if (userId && connectedUsers.has(userId)) {
        // Send to specific user
        const socketId = connectedUsers.get(userId);
        io.to(socketId).emit('notification', notificationPayload);
        console.log(`[Notify] Sent to ${userId}: ${title}`);
    } else if (!userId) {
        // Broadcast to all users if no userId provided
        io.emit('notification', notificationPayload);
        console.log(`[Notify] Broadcasted: ${title}`);
    } else {
        console.log(`[Notify] User ${userId} not connected.`);
    }

    res.status(200).json({ success: true, message: 'Notification processed' });
});

app.get('/', (req, res) => {
    res.send('Notification Service is running.');
});

// To easily test the UI real-time behavior without other backend services
// Let's emit a mock notification every 45 seconds to all connected users
setInterval(() => {
    if (connectedUsers.size > 0) {
        console.log('[Socket] Sending automated mock notification');
        io.emit('notification', {
            id: Date.now(),
            title: 'System Update',
            message: 'A new training session has been scheduled.',
            time: new Date().toISOString()
        });
    }
}, 45000);

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
