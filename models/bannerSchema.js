const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    bannerName: {
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
module.exports = mongoose.model("Banner", BannerSchema);