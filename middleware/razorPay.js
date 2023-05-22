const Razorpay = require("razorpay");
const crypto = require("crypto");


let env = require("dotenv").config();
let keyId=process.env.KEY_ID
let keyScret=process.env.KEY_SECRET

var instance = new Razorpay({
  key_id: keyId,
  key_secret: keyScret
})
function RazorpayPayment(amount) {
  console.log("hhh");
  return new Promise((resolve, reject) => {
    instance.orders
      .create({
        amount: amount * 100,
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
      })
      .then((response) => {
   
        resolve(response);
      })
      .catch((e) => {
        console.log(e);
      });
  });
}


module.exports = {
  RazorpayPayment,

};
