

let env=require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const service_sid=process.env.TWILIO_SERVICE_SID;


const client = require('twilio')(accountSid, authToken);


function sentOtp(mobile){
   
    return client.verify.v2.services(service_sid)
    .verifications
    .create({to:`+91${mobile}`, channel: 'sms'})
     


}

function verifyOtp(otp,mobile){
    return new Promise((resolve,reject)=>{
        client.verify.v2.services(service_sid)
      .verificationChecks
      .create({to: `+91${mobile}`, code: otp})
      .then((verification_check) =>{ console.log(verification_check.status)
      resolve(verification_check)
    });
    }).catch((verification_check) =>{ console.log(verification_check.status)
        resolve(verification_check)})
}
  


module.exports={sentOtp,verifyOtp}

