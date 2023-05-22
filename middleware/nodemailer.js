const nodemailer = require("nodemailer");
let env=require('dotenv').config()



let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, 
    auth: {
      user:process.env.EMAIL, 
      pass:process.env.PASSWORD, 
    },
  });

  let sendEmailOTP = (email,otpEmail) => {
    const mailOptions = {
      to: email,
      from: "babycare099@outlook.com",
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for email verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        otpEmail +
        "</h1>", // html body
    };
    return transporter.sendMail(mailOptions);
     
  };

  let sendCancellationEmail = (email,message) => {
    const mailOptions = {
      to: email,
      from: "babycare099@outlook.com",
      subject: "Email for Cancellation: ",
      html:
        "<h3>Email for Cancellation is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        message +
        "</h1>", // html body
    };
    return transporter.sendMail(mailOptions);
     
  };

  module.exports={
    sendEmailOTP,
    sendCancellationEmail
  }