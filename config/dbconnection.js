
const mongoose = require("mongoose");
let env=require('dotenv').config()

let dbinit={
    init:()=>{
        mongoose.connect(process.env.MONGODB_URL,
            {
              useNewUrlParser: true,
              
              useUnifiedTopology: true
            }
          );
          const db= mongoose.connection;
          db.on("error", console.error.bind(console, "connection error: "));
          db.once("open", function () {
            console.log("Successfully Connected Port 27017");
          });
    }
    
}


module.exports = dbinit