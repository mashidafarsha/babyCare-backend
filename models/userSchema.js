const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true,
    lowercase: true,
    trim: true
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
    required: false,
  },
  healthProfile: {
    bloodPressure: { type: String, default: "120/80" },
    heartRate: { type: Number, default: 72 },
    bloodSugar: { type: Number, default: 90 },
    weight: { type: Number, default: 70 },
    height: { type: Number, default: 170 },
  },
  

created:{
  type:Date,
  required:true,
  default:Date.now
}
});

 

module.exports = mongoose.model("User", UserSchema);