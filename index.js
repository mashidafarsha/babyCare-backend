const express = require("express")
const cors = require("cors");
const app = express();
const path = require('path');


// ROUTE SETUP-------------------
const patientRouter = require('./Routes/patientRouter')
const adminRouter = require('./Routes/adminRouter')
const doctorRouter=require('./Routes/doctorRouter')

// MONGODB SETUP---------------
const mongoosedb=require('./config/dbconnection')
mongoosedb.init()


// CORS SETUP----------------
app.use(
    cors({
        origin:"*",
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true,

    })
)




const cookieParser = require("cookie-parser");
app.use(cookieParser())
app.use(express.json());





app.use('/', patientRouter)
app.use('/admin', adminRouter)
app.use('/doctor',doctorRouter)


// PORT SETUP------------
app.listen(4000, () => {
    console.log("server started on port 4000");
})
