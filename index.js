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
        // Array-il local URL-um process.env-um orumichu nalkunnu
        origin: ["http://localhost:5173", process.env.CORS_API],
        methods: ["GET", "POST", "DELETE", "PUT"],
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
const PORT = 4000;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", process.env.CORS_API],
        methods: ['GET', 'POST'],
        credentials: true
    }
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
            socket.to(sendUserSocket).emit('msg-recieve', data.msg);
        }
    });
});