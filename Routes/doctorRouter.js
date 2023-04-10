const router = require('express').Router()
const {doctorGetOtp,submitOtp,doctorLogin,doctorInfo}=require('../controller/doctorController')


router.get('/')
router.post('/doctorSignup',doctorGetOtp)
router.post('/doctorOtp',submitOtp)
router.post('/doctorLogin',doctorLogin)
router.post('/doctorInfo',doctorInfo)

module.exports=router