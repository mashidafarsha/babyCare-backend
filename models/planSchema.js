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
    type:Number,
    required:true
},
offerAmount:{
    type:Number,
   
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
user:{
  type:Array,
  ref:"User"
}

})
module.exports = mongoose.model("Plans", PlanSchema);