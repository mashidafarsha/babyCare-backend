const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4000/doctor/doctorLogin', {
      email: "sarah@truecare.com",
      password: "doctor123"
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log('Error Data:', err.response.data);
    } else {
      console.log('Error:', err.message);
    }
  }
}
testLogin();
