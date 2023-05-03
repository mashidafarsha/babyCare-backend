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
  password:{
    type:String,
    required:true
},
cPassword:{
    type:String,
    required:true
},
status: {
    type: String,
    default: "Active",
  },

created:{
  type:Date,
  required:true,
  default:Date.now
}
});

 

module.exports = mongoose.model("User", UserSchema);