const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
require("dotenv").config(); // dotenv initialize cheyyanulla correct reethi

// ROUTE SETUP-------------------
const patientRouter = require('./Routes/patientRouter');
const adminRouter = require('./Routes/adminRouter');
const doctorRouter = require('./Routes/doctorRouter');

// MONGODB SETUP---------------
const mongoosedb = require('./config/dbconnection');
mongoosedb.init();

// CORS SETUP (Ithu routes-inu munnil undayirikkanam)
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174", process.env.CORS_API],
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
        credentials: true,
    })
);

// MIDDLEWARES
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: "1200kb" }));
app.use(express.json());

// ROUTES setup
app.use('/', patientRouter);
app.use('/admin', adminRouter);
app.use('/doctor', doctorRouter);

// PORT SETUP------------
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", process.env.CORS_API],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log('connected success');
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on('send-message', (data) => {
        console.log('message received');
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit('msg-recieve', data.message);
        }
    });

    // --- WebRTC Video Consultation Signaling ---
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        console.log(`[WebRTC] Incoming call from ${name} (${from}) to User ${userToCall}`);
        const toSocketId = onlineUsers.get(userToCall);
        if (toSocketId) {
            console.log(`[WebRTC] Routing call to socket ${toSocketId}`);
            io.to(toSocketId).emit("callUser", { signal: signalData, from, name });
        } else {
            console.log(`[WebRTC] Failed to route call. User ${userToCall} is not in onlineUsers map.`);
        }
    });

    socket.on("answerCall", (data) => {
        console.log(`[WebRTC] Call answered for User ${data.to}`);
        const toSocketId = onlineUsers.get(data.to);
        if (toSocketId) {
            io.to(toSocketId).emit("callAccepted", data.signal);
        }
    });

    socket.on("endCall", (data) => {
        console.log(`[WebRTC] Call ended for User ${data.to}`);
        const toSocketId = onlineUsers.get(data.to);
        if (toSocketId) {
            io.to(toSocketId).emit("callEnded");
        }
    });

    socket.on("ice-candidate", (data) => {
        console.log(`[WebRTC] ICE Candidate from ${socket.id} to ${data.to}`);
        const toSocketId = onlineUsers.get(data.to);
        if (toSocketId) {
            io.to(toSocketId).emit("ice-candidate", data.candidate);
        }
    });

    socket.on("sos-alert", (data) => {
        console.log(`[SOS] Emergency alert from ${data.fromName} to Doctor ${data.toDoctorId}`);
        const doctorSocketId = onlineUsers.get(data.toDoctorId);
        if (doctorSocketId) {
            io.to(doctorSocketId).emit("sos-alert", {
                fromUserId: data.fromUserId,
                fromName: data.fromName,
                bookingId: data.bookingId
            });
        }
    });
});