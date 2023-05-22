const mongoose = require("mongoose");

const slotBookingSchema = new mongoose.Schema({
status:{
    type:String,
    required:true,
    default:"Active"
},
bookingTime:{
    type:String,
    required:true, 

},
totalAmount:{
    type:Number,
    require:true
},
DoctorId:{
    type: mongoose.Schema.Types.ObjectId,
    require:true
  
},
DoctorName:{
    type:String,
    require:true
},
DoctorDepartment:{
    type:String,
    require:true
},
UserId:{
    type: mongoose.Schema.Types.ObjectId,
    require:true,
    ref:"User"
},



created:{
  type:Date,
  required:true,
  default:Date.now
}
});

 

module.exports = mongoose.model("Slotbooking", slotBookingSchema);