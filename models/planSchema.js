const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    planname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description:{
      type:String,
      required:true
  },
    image:{
      type:String,
      required:true
  },
  amount:{
    type:String,
    required:true
},
offerAmount:{
    type:String,
   
},
  created:{
    type:Date,
    required:true,
    default:Date.now
  },
  status:{
    type:String,
    default:"ACTIVE"
},

})
module.exports = mongoose.model("Plans", PlanSchema);