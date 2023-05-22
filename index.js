const express = require("express")
const cors = require("cors");
const http = require("http");
const app = express();
const path = require('path');
const bodyParser = require('body-parser')
const {Server} = require('socket.io');
// const server = http.createServer(app);
// ROUTE SETUP-------------------
const patientRouter = require('./Routes/patientRouter')
const adminRouter = require('./Routes/adminRouter')
const doctorRouter=require('./Routes/doctorRouter')

// MONGODB SETUP---------------
const mongoosedb=require('./config/dbconnection')
mongoosedb.init()
app.use('/', express.static(path.join(__dirname, 'public')))    
app.use(bodyParser.json({limit:"1200kb"}))
// CORS SETUP----------------
app.use(
    cors({
        origin:"*",
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,

    })
)




// const cookieParser = require("cookie-parser");
// app.use(cookieParser())
app.use(express.json());






app.use('/', patientRouter)
app.use('/admin', adminRouter)
app.use('/doctor',doctorRouter)


// PORT SETUP------------
const server = app.listen(4000, () => {
    console.log("server started on port 4000");
})


// const io = new Server(server, {
//     cors: {
//         origin:"*",
//         credentials: true,
//     }
// })
const io = new Server(server, {
    cors: {
        origin:"*",
      methods: ['GET', 'POST'],
      credentials:true
    }
  })

global.onlineUsers= new Map()
  io.on("connection",(socket)=>{
    console.log('connected success')
    global.chatSocket =socket

    socket.on("add-user",(userId)=>{
      onlineUsers.set(userId,socket.id)
    })

    socket.on('send-message',(data)=>{
      console.log('object')
      const sendUserSocket= onlineUsers.get(data.to)
      if(sendUserSocket){
        socket.to(sendUserSocket).emit('msg-recieve',data.msg)
      }
    })
  })