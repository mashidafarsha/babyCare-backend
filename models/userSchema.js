const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true
},
image:{
  type:String,
 
},
  password:{
    type:String,
    required:true
},
cPassword:{
    type:String,
  
},

status: {
    type: String,
    default: "Active",
  },


  plans:{

    type:Array
  },
  planExpDate: {
    type: Date,
    required: true,
  },
  

created:{
  type:Date,
  required:true,
  default:Date.now
}
});

 

module.exports = mongoose.model("User", UserSchema);